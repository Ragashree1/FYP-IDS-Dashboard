from fastapi import APIRouter, Depends, Request, Header
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import IPAddressSchema
from services.ip_blocking_service import (
    get_client_ip, block_ip, check_ip_blocked, get_blocked_ips_with_reasons,
    get_blocked_ips_list, unblock_ip, get_org_blocked_ips
)

router = APIRouter(prefix="/ip-blocking", tags=["ip-blocking"])

@router.post("/block-ip/")
def block_ip_api(ip_data: IPAddressSchema, db: Session = Depends(get_db)):
    return block_ip(ip_data.ip, ip_data.reason, db)

@router.get("/check-my-ip/")
def check_my_ip(request: Request, db: Session = Depends(get_db)):
    client_ip = get_client_ip(request)
    return check_ip_blocked(client_ip, db)

@router.get("/blocked-ips/")
def get_blocked_ips_with_reasons_api(db: Session = Depends(get_db)):
    return get_blocked_ips_with_reasons(db)

@router.get("/blocked-ips-list/")
def get_blocked_ips_list_api(db: Session = Depends(get_db)):
    return get_blocked_ips_list(db)

@router.delete("/unblock-ip/{ip}")
def unblock_ip_api(ip: str, db: Session = Depends(get_db)):
    return unblock_ip(ip, db)

@router.get("/{org_id}/blocked-ips")
def get_blocked_ips_by_org(org_id: int,
                           db: Session = Depends(get_db),
                           x_client_email: str = Header(...)):
    return get_org_blocked_ips(org_id, x_client_email, db)

