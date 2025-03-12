from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.schemas import IPAddressSchema
from services.ip_blocking_service import block_ip, get_blocked_ips
from fastapi.security import APIKeyHeader
import os

router = APIRouter(prefix="/ip-blocking", tags=["ip-blocking"])
api_key_header = APIKeyHeader(name="X-API-KEY")
API_KEY = os.getenv("API_KEY", "default-api-key")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/block-ip/")
def block_ip_api(ip_data: IPAddressSchema, db: Session = Depends(get_db), api_key: str = Depends(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    return block_ip(db, ip_data)

@router.get("/blocked-ips/")
def get_blocked_ips_api(db: Session = Depends(get_db), api_key: str = Depends(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    return get_blocked_ips(db)
