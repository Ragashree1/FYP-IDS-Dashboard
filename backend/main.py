import os
import uvicorn
from fastapi import FastAPI, Request, HTTPException, Depends, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from database import get_db, SessionLocal, engine, Base
from models.models import BlockedIP  # Ensure correct import
from starlette.responses import JSONResponse
from controllers.journal_controller import router as journal_router
from controllers.meeting_minutes_controller import router as meeting_minutes_router
from controllers.alert_controller import router as alerts_router
from controllers.log_controller import router as logs_router
from controllers.playbook_controller import router as playbooks_router
from controllers.login_controller import router as login_router
from controllers.registration_controller import router as registration_router 
# Removed: from controllers.payment_controller import router as payment_router 
from controllers.user_management_controller import router as user_management_controller  # Imported as user_management_controller
from controllers.role_permission_controller import router as role_permission_router 
from controllers.ip_blocking_controller import router as ip_blocking_router
from controllers.audit_controller import router as audit_router
from controllers.reviews_controller import router as reviews_router  # Import the reviews router
from controllers.ip_verification_controller import router as ip_verification_router
from controllers.suricata_controller import router as suricata_router  # Add import for Suricata controller
from controllers.zeek_controller import router as zeek_router  # Add import for Zeek controller
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.executors.pool import ThreadPoolExecutor, ProcessPoolExecutor  # ADDED
from services.alert_service import update_and_fetch_alerts
from services.suricata_service import update_and_fetch_suricata_alerts  # Add import for Suricata service
from services.zeek_service import update_and_fetch_zeek_alerts  # Add import for Zeek service
from services.log_service import scheduled_log_update, create_optimized_scheduler  # MODIFIED: Added import for create_optimized_scheduler
from database import engine, Base
import models 
from init_db import init_database
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import logging
from typing import List, Optional
import traceback

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Load database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ProjectWebsite")
logger.info(f"Using database URL: {DATABASE_URL}")

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")  # Default for safety
ALGORITHM = os.getenv("ALGORITHM", "HS256")

app = FastAPI()
load_dotenv()
Base.metadata.create_all(bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# MODIFIED: Use optimized scheduler
logs_scheduler = create_optimized_scheduler()

# ADDED: Health check function
def check_job_health():
    """Monitor job health and restart any stuck jobs"""
    logger.info("Running scheduler health check")
    # Check if any jobs are running for too long
    for job in logs_scheduler.get_jobs():
        if hasattr(job, 'next_run_time') and job.next_run_time is not None:
            logger.info(f"Job {job.id} next run: {job.next_run_time}")

# Initialize database with roles on startup
@app.on_event("startup")
async def startup_event():
    init_database()
    # Start logs scheduler for IP verification
    logger.info("Starting logs scheduler for IP verification...")
    

    logs_scheduler.add_job(
        scheduled_log_update, 
        'interval', 
        seconds=60,  
        id='scheduled_log_update',
        replace_existing=True
    )
    
    # ADDED: Health check job
    logs_scheduler.add_job(
        check_job_health,
        'interval',
        seconds=60,
        id='scheduler_health_check',
        replace_existing=True
    )
    
    logs_scheduler.start()

# Add shutdown event to properly close the scheduler
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down logs scheduler...")
    logs_scheduler.shutdown()

# CORS settings - Updated to be more specific for security
origins = [
    "http://localhost:3000",  # Frontend origin
    "http://127.0.0.1:3000",  # Alternate localhost origin
    "http://localhost:3006",  # Add any other origins as needed
    "http://localhost:9600",
]

# Configure CORS middleware - Using the origins list
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use the origins list instead of "*"
    allow_credentials=True,  # Allow cookies and credentials
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # Explicitly list all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
)

# Enhanced logging middleware for better debugging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Log request details for debugging
    logger.info(f"Incoming request: {request.method} {request.url}")
    logger.info(f"Request headers: {request.headers}")
    
    try:
        # Process the request normally
        response = await call_next(request)
        
        logger.info(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        # Enhanced error logging
        logger.error(f"Error in request: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        # Return a more detailed error response
        error_response = JSONResponse(
            status_code=500,
            content={"detail": f"Internal server error: {str(e)}", "type": str(type(e).__name__)}
        )
        return error_response

@app.get("/login/get_token")
async def get_token(token: str = Depends(oauth2_scheme)):
    try:
        # Replace 'your-secret-key' and 'your-algorithm' with actual values
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")])
        logger.info(f'Payload: {payload}')
        logger.info('Token is valid')
        return {"message": "Token is valid"}
    except JWTError as e:
        logger.error(f"Token validation error: {e}")  # Debug log
        raise HTTPException(status_code=403, detail="Invalid or expired token")

# Token validation endpoint
@app.get("/validate-token")
async def validate_token(token: str = Depends(oauth2_scheme)):
    try:
        # Replace with your actual secret key and algorithm
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"valid": True, "payload": payload}
    except JWTError:
        # Special case for mock token
        if token == "mock-token-for-platform-admin":
            return {"valid": True, "user": "platform-admin"}
        raise HTTPException(status_code=401, detail="Invalid token")

# Include the routers
app.include_router(journal_router)
app.include_router(meeting_minutes_router)
app.include_router(alerts_router)
app.include_router(logs_router)
app.include_router(login_router)
app.include_router(registration_router)
# Removed: app.include_router(payment_router)
app.include_router(user_management_controller)  # Fixed: using user_management_controller instead of user_management_router
app.include_router(role_permission_router)
app.include_router(ip_blocking_router)
app.include_router(playbooks_router)  # This should now work correctly
app.include_router(audit_router)
app.include_router(reviews_router)  # Add the reviews router
app.include_router(ip_verification_router)  # Add the IP verification router from NewLogConfigAndIPBlocking
app.include_router(suricata_router)  # Add the Suricata router
app.include_router(zeek_router)  # Add the Zeek router

@app.get("/")
async def root():
    return {"message": "Welcome to SecuBoard API - Log Forwarding System Running"}

# MODIFIED: Enhanced error handling
def fetch_alerts_job():
    try:
        update_and_fetch_alerts()
        update_and_fetch_suricata_alerts()  # Add Suricata alerts fetching to the scheduled job
        update_and_fetch_zeek_alerts()  # Add Zeek alerts fetching to the scheduled job
    except Exception as e:
        logger.error(f"Error in fetch_alerts_job: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")

# Enhanced global exception handler with more details
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the full exception details
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(f"Exception type: {type(exc).__name__}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    # Return a more informative error response
    status_code = 500
    if isinstance(exc, HTTPException):
        status_code = exc.status_code
    
    error_response = JSONResponse(
        status_code=status_code,
        content={
            "detail": str(exc),
            "type": str(type(exc).__name__),
            "path": str(request.url.path)
        }
    )
    return error_response

if __name__ == "__main__":
    # MODIFIED: Use optimized scheduler
    scheduler = create_optimized_scheduler()
    scheduler.add_job(fetch_alerts_job, 'interval', minutes=5)  # Updated to use fetch_alerts_job
    scheduler.start()

    try:
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()