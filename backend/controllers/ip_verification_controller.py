from fastapi import APIRouter, Request, HTTPException, Depends
from typing import List
from models.schemas import VerifyIPRequest
from services import ip_verification_service
from services.ip_verification_service import (
    verify_and_store_ip,
    delete_verified_ip,
    get_verified_ips,
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ip-verification", tags=["IP Verification"])

@router.post("/verify-ip")
def verify_ip(request: Request, ip_request: VerifyIPRequest):
    result = verify_and_store_ip(ip_request.organization_id, ip_request.ip)
    if result["status"] == "error":
        logger.error(f"IP verification failed: {result['message']}")
        raise HTTPException(status_code=403, detail=result["message"])
    return result

@router.get("/verified-ips/{organization_id}")
def get_verified_ips(organization_id: int):
    if organization_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid organization_id")
    verified_ips = ip_verification_service.get_verified_ips(organization_id),
    return verified_ips

@router.delete("/remove-ip/{ip_id}")
def remove_verified_ip_api(ip_id: int):
    try:
        delete_verified_ip(ip_id)
        return {"message": "Verified IP deleted successfully"}
    except HTTPException as e:
        logger.error(f"Failed to delete verified IP with id={ip_id}: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error while deleting verified IP with id={ip_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete verified IP. Please contact support.")