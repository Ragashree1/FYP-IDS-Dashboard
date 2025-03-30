from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.schemas import VerifyIPRequest, LogRequest, LogEntryOut
from services.ip_verification_service import (
    verify_and_store_ip,
    store_log,
    get_logs_for_organization,
    delete_verified_ip,
    delete_logs_for_organization
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ip-verification", tags=["IP Verification"])

@router.post("/verify-ip")
def verify_ip(request: Request, ip_request: VerifyIPRequest, db: Session = Depends(get_db)):
    request_ip = request.client.host  # Get actual client IP
    result = verify_and_store_ip(ip_request.organization_id, ip_request.ip, request_ip, db)
    if result["status"] == "error":
        logger.error(f"IP verification failed: {result['message']}")
        raise HTTPException(status_code=403, detail="IP verification failed. Please contact support.")
    return result

@router.post("/forward-log")
def forward_log(request: Request, log: LogRequest, db: Session = Depends(get_db)):
    request_ip = request.client.host  # Get actual client IP
    result = store_log(log.organization_id, request_ip, log.log_data, db)

    if result["status"] == "error":
        logger.error(f"Log forwarding failed: {result['message']}")
        raise HTTPException(status_code=403, detail="Log forwarding failed. Please contact support.")

    return result

@router.get("/verified-ips/{organization_id}")
def get_verified_ips(organization_id: int, db: Session = Depends(get_db)):
    from models.models import VerifiedIP  # ensure import at the top or here explicitly

    if organization_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid organization_id")

    verified_ips = db.query(VerifiedIP).filter(
        VerifiedIP.organization_id == organization_id,
        VerifiedIP.is_verified == True
    ).all()

    return {
        "verified_ips": [{"id": ip.id, "ip": ip.ip} for ip in verified_ips]
    }

@router.get("/logs/{organization_id}", response_model=List[LogEntryOut])
def fetch_client_logs(organization_id: int, db: Session = Depends(get_db)):
    if organization_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid organization_id")
    logger.info(f"Fetching logs for organization_id={organization_id}")
    return get_logs_for_organization(organization_id, db)

@router.delete("/remove-ip/{ip_id}")
def remove_verified_ip_api(ip_id: int, db: Session = Depends(get_db)):
    try:
        delete_verified_ip(ip_id, db)
        return {"message": "Verified IP deleted successfully"}
    except HTTPException as e:
        logger.error(f"Failed to delete verified IP with id={ip_id}: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error while deleting verified IP with id={ip_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete verified IP. Please contact support.")

@router.delete("/logs/organization/{organization_id}")
def delete_logs_api(organization_id: int, db: Session = Depends(get_db)):
    try:
        delete_logs_for_organization(organization_id, db)
        return {"message": f"Logs deleted for organization {organization_id}"}
    except HTTPException as e:
        logger.error(f"Failed to delete logs for organization_id={organization_id}: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error while deleting logs for organization_id={organization_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete logs. Please contact support.")


