import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.journal_controller import router as journal_router
from controllers.meeting_minutes_controller import router as meeting_minutes_router
from controllers.log_controller import router as logs_router
from apscheduler.schedulers.background import BackgroundScheduler
from services.log_service import update_and_fetch_logs

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:3006",  # put Frontend URL here
    "http://localhost:9600",

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
app.include_router(logs_router)

def fetch_logs_job():
    update_and_fetch_logs()

if __name__ == "__main__":
    scheduler = BackgroundScheduler()
    scheduler.add_job(fetch_logs_job, 'interval', minutes=5)
    scheduler.start()

    try:
        # Keep the main thread alive
        while True:
            pass
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)