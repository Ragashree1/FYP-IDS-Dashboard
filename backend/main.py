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
from controllers.log_controller import router as logs_router
from controllers.ip_blocking_controller import router as ip_blocking_router
from controllers.ip_verification_controller import router as ip_verification_router
from controllers.client_controller import router as client_router

load_dotenv()

app = FastAPI()

@app.middleware("http")
async def block_ip_middleware(request: Request, call_next):
    def get_client_ip(request: Request):
        """Extracts the real client IP address from headers or request client."""
        forwarded_for = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
        real_ip = request.headers.get("X-Real-IP", "").strip()

        if forwarded_for and forwarded_for not in ["127.0.0.1", "localhost"]:
            return forwarded_for
        elif real_ip and real_ip not in ["127.0.0.1", "localhost"]:
            return real_ip
        elif request.client.host:  # Use direct client IP if headers are not present
            return request.client.host

        return "UNKNOWN"  # Default in case no IP is found

    client_ip = get_client_ip(request)
    
    # ** Print Client IP and Headers for Debugging**
    print(f"Middleware detected client IP: {client_ip}")
    print(f"Request Headers: {request.headers}")  

    # Fetch blocked IPs from database
    with SessionLocal() as db:
        blocked_ips = db.query(BlockedIP.ip).all()
        blocked_ip_list = [str(ip[0]).strip().lower() for ip in blocked_ips]  # Normalize IPs

    print(f"Blocked IPs list: {blocked_ip_list}")

    # Block the IP if it exists in the blocked list
    if client_ip.lower() in blocked_ip_list:
        print(f"Blocking IP: {client_ip}")
        return JSONResponse(status_code=403, content={"detail": "Your IP is blocked."})

    return await call_next(request)

# CORS settings
origins = [
    "http://localhost:3000",
    "http://localhost:3006",  # put Frontend URL here
    "http://localhost:9600"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["X-Requested-With", "Content-Type"],  # Allow Authorization header
)

Base.metadata.create_all(bind=engine)

# Include the routers
app.include_router(journal_router)
app.include_router(meeting_minutes_router)
app.include_router(logs_router)
app.include_router(ip_blocking_router)
app.include_router(ip_verification_router)
app.include_router(client_router)

@app.get("/")
def root():
    return {"message": "Log Forwarding System Running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)