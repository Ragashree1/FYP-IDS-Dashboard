from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import VerifyIPRequest, LogRequest
from services.ip_verification_service import verify_and_store_ip, store_log

router = APIRouter(prefix="/ip-verification", tags=["IP Verification"])

@router.post("/verify-ip")
def verify_ip(request: Request, ip_request: VerifyIPRequest, db: Session = Depends(get_db)):
    request_ip = request.client.host
    result = verify_and_store_ip(ip_request.client_id, ip_request.ip, request_ip, db)
    if result["status"] == "error":
        raise HTTPException(status_code=403, detail=result["message"])
    return result

@router.post("/forward-log")
def forward_log(request: Request, log: LogRequest, db: Session = Depends(get_db)):
    request_ip = request.client.host  # Get actual client IP
    result = store_log(log.client_id, request_ip, log.log_data, db)

    if result["status"] == "error":
        raise HTTPException(status_code=403, detail=result["message"])

    return result

