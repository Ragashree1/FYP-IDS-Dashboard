import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.journal_controller import router as journal_router
from controllers.meeting_minutes_controller import router as meeting_minutes_router
from controllers.log_controller import router as logs_router

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:3006"  # put Frontend URL here
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
app.include_router(logs_router)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)