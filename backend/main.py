import os
import uvicorn
from fastapi import FastAPI, Request, HTTPException, Depends, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from database import get_db, SessionLocal, engine, Base
from models.models import BlockedIP
from starlette.responses import JSONResponse
from controllers.journal_controller import router as journal_router
from controllers.meeting_minutes_controller import router as meeting_minutes_router
from controllers.alert_controller import router as alerts_router
from controllers.log_controller import router as logs_router
from controllers.threat_detector_controller import router as threat_detector_router
from fastapi.security import OAuth2PasswordBearer
from services.log_service import fetch_logs
from controllers.playbook_controller import router as playbooks_router
from controllers.login_controller import router as login_router
from controllers.registration_controller import router as registration_router
from controllers.user_management_controller import router as user_management_router
from controllers.role_permission_controller import router as role_permission_router
from controllers.ip_blocking_controller import router as ip_blocking_router
from controllers.audit_controller import router as audit_router
from controllers.reviews_controller import router as reviews_router
from controllers.ip_verification_controller import router as ip_verification_router
from controllers.suricata_controller import router as suricata_router
from controllers.zeek_controller import router as zeek_router
from controllers.ml_model_controller import router as ml_model_router
from services.alert_service import update_and_fetch_alerts
from services.log_service import fetch_cicflow_logs_for_all_orgs
from services.suricata_service import import_suricata_alerts_for_all_orgs
from services.zeek_service import import_zeek_alerts_for_all_orgs
from services.ip_blocking_service import evaluate_and_block_ips
from services.playbook_service import execute_playbook_rules
from apscheduler.schedulers.background import BackgroundScheduler
import logging
from typing import List, Optional
import traceback
from jose import JWTError, jwt
from init_db import init_database
from services.threat_detector_service import predict_recent_logs

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

app = FastAPI()
Base.metadata.create_all(bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Use optimized scheduler
logs_scheduler = BackgroundScheduler()
# Health check function
def check_job_health():
    """Monitor job health and restart any stuck jobs."""
    logger.info("Running scheduler health check")
    for job in logs_scheduler.get_jobs():
        if hasattr(job, 'next_run_time') and job.next_run_time is not None:
            logger.info(f"Job {job.id} next run: {job.next_run_time}")

def predict_recent_logs_job():
    """Periodically predict threats for recent logs."""
    logger.info("Running threat prediction for recent logs...")
    try:
        results = predict_recent_logs()
        logger.info(f"Predicted threats for {len(results)} recent logs.")
    except Exception as e:
        logger.error(f"Error in predict_recent_logs_job: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")

# Define periodic jobs
def fetch_alerts_job():
    try:
        update_and_fetch_alerts()
        import_suricata_alerts_for_all_orgs()  # Add Suricata alerts fetching
        import_zeek_alerts_for_all_orgs()  # Add Zeek alerts fetching
        fetch_cicflow_logs_for_all_orgs()
    except Exception as e:
        logger.error(f"Error in fetch_alerts_job: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")

def fetch_logs_job():
    try:
        fetch_logs()
        fetch_cicflow_logs_for_all_orgs()
    except Exception as e:
        logger.error(f"Error in fetch logs job: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")

def execute_playbook_rules_job():
    """Periodically execute playbook rules."""
    logger.info("Executing playbook rules...")
    execute_playbook_rules()

# Initialize database with roles on startup
@app.on_event("startup")
async def startup_event():
    init_database()
    logger.info("Starting logs scheduler for IP verification...")

    # Schedule periodic jobs
   
    # logs_scheduler.add_job(
    #     fetch_alerts_job, 
    #     "interval", 
    #     minutes=1,  # Fetch alerts every 3 minutes
    #     id="fetch_alerts_job",
    #     coalesce=True,
    #     max_instances=1
    # )
    # logs_scheduler.add_job(execute_playbook_rules_job, "interval", minutes=1, id="execute_playbook_rules_job",  # Good practice to add an ID
    #     coalesce=True,                   # Prevent overlapping runs
    #     max_instances=1                  # Allow only one instance at a time
    # )  # Execute playbook rules every 1 minute
    # logs_scheduler.add_job(
    #         predict_recent_logs_job,
    #         "interval",
    #         minutes=3,
    #         id="predict_recent_logs_job",
    #         replace_existing=True,
    #         coalesce=True,
    #         max_instances=1
    #     )


    logs_scheduler.start()

# Add shutdown event to properly close the scheduler
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down logs scheduler...")
    logs_scheduler.shutdown()

# CORS settings
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3006",
    "http://localhost:9600",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "X-Requested-With", "Content-Type"],
)

# Enhanced logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Error in request: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal server error: {str(e)}", "type": str(type(e).__name__)}
        )

@app.get("/login/get_token")
async def get_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        logger.info(f'Payload: {payload}')
        return {"message": "Token is valid"}
    except JWTError as e:
        logger.error(f"Token validation error: {e}")
        raise HTTPException(status_code=403, detail="Invalid or expired token")

@app.get("/validate-token")
async def validate_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"valid": True, "payload": payload}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Include the routers
app.include_router(journal_router)
app.include_router(meeting_minutes_router)
app.include_router(alerts_router)
app.include_router(logs_router)
app.include_router(login_router)
app.include_router(registration_router)
app.include_router(user_management_router)
app.include_router(role_permission_router)
app.include_router(ip_blocking_router)
app.include_router(playbooks_router)
app.include_router(threat_detector_router)
app.include_router(audit_router)
app.include_router(reviews_router)
app.include_router(ip_verification_router)
app.include_router(suricata_router)
app.include_router(zeek_router)
app.include_router(ml_model_router)

@app.get("/")
async def root():
    return {"message": "Welcome to SecuBoard API - Log Forwarding System Running"}

# Enhanced global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    status_code = 500
    if isinstance(exc, HTTPException):
        status_code = exc.status_code
    return JSONResponse(
        status_code=status_code,
        content={"detail": str(exc), "type": str(type(exc).__name__), "path": str(request.url.path)}
    )

if __name__ == "__main__":
    try:
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    except (KeyboardInterrupt, SystemExit):
        logs_scheduler.shutdown()