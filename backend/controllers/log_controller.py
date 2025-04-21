from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.schemas import CombinedLogResponse
from services.ip_verification_service import get_logs_for_organization, fetch_snort_logs_for_ips
from models.models import VerifiedIP

router = APIRouter(tags=["Logs"])

@router.get("/logs/{organization_id}", response_model=List[CombinedLogResponse])
def fetch_all_logs(organization_id: int, db: Session = Depends(get_db)):
    if organization_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid organization_id")
    return get_logs_for_organization(organization_id, db, include_snort_logs=True)

@router.get("/logs/client-only/{organization_id}", response_model=List[CombinedLogResponse])
def fetch_client_logs(organization_id: int, db: Session = Depends(get_db)):
    if organization_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid organization_id")
    return get_logs_for_organization(organization_id, db, include_snort_logs=False)

@router.get("/logs/snort-only/{organization_id}", response_model=List[CombinedLogResponse])
def fetch_snort_logs(organization_id: int, db: Session = Depends(get_db)):
    verified_ips = db.query(VerifiedIP.ip).filter(
        VerifiedIP.organization_id == organization_id,
        VerifiedIP.is_verified == True
    ).all()
    ip_list = [ip[0] for ip in verified_ips]

    if not ip_list:
        return []

    return fetch_snort_logs_for_ips(ip_list)
