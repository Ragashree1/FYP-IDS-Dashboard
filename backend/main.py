import os
import uvicorn
from fastapi import FastAPI, Request, HTTPException, Depends
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
from controllers.payment_controller import router as payment_router 
from controllers.user_management_controller import router as user_management_router 
from controllers.role_permission_controller import router as role_permission_router 
from controllers.ip_blocking_controller import router as ip_blocking_router
from controllers.ip_verification_controller import router as ip_verification_router
from apscheduler.schedulers.background import BackgroundScheduler
from services.alert_service import update_and_fetch_alerts
from database import engine, Base
import models 
from init_db import init_database
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from services.ip_blocking_service import evaluate_and_block_ips
import time

load_dotenv()

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

# CORS settings
origins = [
    "http://localhost:3000",  
    "http://127.0.0.1:3000",  
    "http://localhost:3006",  
    "http://localhost:9600"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow these origins
    allow_credentials=True,  # Allow cookies and credentials
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "X-Requested-With", "Content-Type"],  # Include Authorization header
)

Base.metadata.create_all(bind=engine)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    return response

@app.get("/login/get_token")
async def get_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")])
        print('Payload:', payload)
        print('valid')
        return {"message": "Token is valid"}
    except JWTError as e:
        print(f"Token validation error: {e}")  
        raise HTTPException(status_code=403, detail="Invalid or expired token")

# Include the routers
app.include_router(journal_router)
app.include_router(meeting_minutes_router)
app.include_router(alerts_router)
app.include_router(logs_router)
app.include_router(login_router)
app.include_router(registration_router)
app.include_router(payment_router)
app.include_router(user_management_router)
app.include_router(role_permission_router)
app.include_router(ip_blocking_router)
app.include_router(ip_verification_router)

@app.get("/")
def root():
    return {"message": "Log Forwarding System Running"}
app.include_router(playbooks_router)

def fetch_alerts_job():
    update_and_fetch_alerts()

def periodic_task(interval_minutes=5):
    """
    Run periodic tasks at the specified interval.
    """
    while True:
        evaluate_and_block_ips()
        time.sleep(interval_minutes * 60)

if __name__ == "__main__":
    scheduler = BackgroundScheduler()
    scheduler.add_job(fetch_alerts_job, 'interval', minutes=5)
    scheduler.start()

    try:
        # Keep the main thread alive
        while True:
            pass
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()

    # Start periodic task
    periodic_task()

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
