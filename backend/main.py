import os
import uvicorn
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from database import get_db, SessionLocal
from models.models import BlockedIP  
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
from apscheduler.schedulers.background import BackgroundScheduler
from services.alert_service import update_and_fetch_alerts
from database import engine, Base
import models 

app = FastAPI()
load_dotenv()
Base.metadata.create_all(bind=engine)

# CORS settings
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000", 
    "http://localhost:3006",  
    "http://localhost:9600"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["X-Requested-With", "Content-Type"],  # Allow Authorization header
)

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
app.include_router(playbooks_router)

def fetch_alerts_job():
    update_and_fetch_alerts()

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

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
