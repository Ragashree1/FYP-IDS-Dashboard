import os
import uvicorn
from fastapi import FastAPI, Request, HTTPException, Depends, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from database import SessionLocal
from models.models import BlockedIP  
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
from apscheduler.schedulers.background import BackgroundScheduler
from services.alert_service import update_and_fetch_alerts
from database import engine, Base
import models 
from init_db import init_database
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import logging
from typing import List, Optional

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

# Initialize database with roles on startup
@app.on_event("startup")
async def startup_event():
    init_database()

# CORS settings - Updated to be more permissive for development
origins = [
    "http://localhost:3000",  # Frontend origin
    "http://127.0.0.1:3000",  # Alternate localhost origin
    "http://localhost:3006",  # Add any other origins as needed
    "http://localhost:9600",
    "*"  # Allow all origins during development (remove in production)
]

# Configure CORS middleware - This is the only CORS configuration we need
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,  # Allow cookies and credentials
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # Explicitly list all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
)

# Log requests for debugging but don't interfere with normal routing
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Log request details for debugging
    print(f"Incoming request: {request.method} {request.url}")
    
    try:
        # Process the request normally
        response = await call_next(request)
        
        print(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        # Handle exceptions
        print(f"Error in request: {str(e)}")
        error_response = JSONResponse(
            status_code=500,
            content={"detail": f"Internal server error: {str(e)}"}
        )
        return error_response

@app.get("/login/get_token")
async def get_token(token: str = Depends(oauth2_scheme)):
    try:
        # Replace 'your-secret-key' and 'your-algorithm' with actual values
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")])
        print('Payload:', payload)
        print('valid')
        return {"message": "Token is valid"}
    except JWTError as e:
        print(f"Token validation error: {e}")  # Debug log
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

@app.get("/")
async def root():
    return {"message": "Welcome to SecuBoard API"}

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_response = JSONResponse(
        status_code=500 if not isinstance(exc, HTTPException) else exc.status_code,
        content={"detail": str(exc)}
    )
    return error_response

if __name__ == "__main__":
    scheduler = BackgroundScheduler()
    scheduler.add_job(update_and_fetch_alerts, 'interval', minutes=5)
    scheduler.start()

    try:
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()