from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models.models import BlockedIP
from models.schemas import IPAddressSchema
import re

router = APIRouter(prefix="/ip-blocking", tags=["ip-blocking"])

def get_client_ip(request: Request) -> str:
    """Extracts the actual client IP from request headers."""
    forwarded_for = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP", "").strip()

    if forwarded_for and not forwarded_for.startswith(("127.", "10.", "192.168.", "172.")):
        return forwarded_for  # First external IP
    elif real_ip and not real_ip.startswith(("127.", "10.", "192.168.", "172.")):
        return real_ip
    elif request.client.host:
        return request.client.host  # Last fallback

    return "UNKNOWN"  # Default fallback

def validate_ip(ip: str):
    """Validates IP format (IPv4 or IPv6)."""
    ip_pattern = re.compile(
        r"^(?:\d{1,3}\.){3}\d{1,3}$"  # IPv4
        r"|"
        r"^([a-f0-9:]+:+)+[a-f0-9]+$"  # IPv6
    )
    if not ip_pattern.match(ip):
        raise HTTPException(status_code=400, detail="Invalid IP format")

@router.post("/block-ip/")
def block_ip_api(ip_data: IPAddressSchema, db: Session = Depends(get_db)):
    ip = ip_data.ip.strip().lower()
    validate_ip(ip)  # Ensure it's a valid IP

    existing_ip = db.query(BlockedIP).filter_by(ip=ip).first()
    if existing_ip:
        raise HTTPException(status_code=400, detail="IP is already blocked.")

    new_ip = BlockedIP(ip=ip, reason=ip_data.reason)
    db.add(new_ip)
    db.commit()
    db.refresh(new_ip)

    return {"message": "IP Blocked Successfully", "ip": new_ip.ip, "reason": new_ip.reason}

@router.get("/check-my-ip/")
def check_my_ip(request: Request, db: Session = Depends(get_db)):
    client_ip = get_client_ip(request)

    print(f"Detected Client IP: {client_ip}")  # Debugging Output

    blocked_ip = db.query(BlockedIP).filter(BlockedIP.ip == client_ip.lower()).first()
    if blocked_ip:
        print(f"Blocked IP Detected: {client_ip}")  # Debugging Output
        raise HTTPException(status_code=403, detail="Your IP is blocked.")

    return {"message": "Your IP is not blocked", "ip": client_ip}

@router.get("/blocked-ips/")
def get_blocked_ips_with_reasons(db: Session = Depends(get_db)):
    """Returns blocked IPs with their reasons for the frontend"""
    blocked_ips = db.query(BlockedIP.ip, BlockedIP.reason).all()
    return {"blocked_ips": [{"ip": ip, "reason": reason} for ip, reason in blocked_ips]}

@router.get("/blocked-ips-list/")
def get_blocked_ips_list(db: Session = Depends(get_db)):
    """Returns only a list of blocked IPs for the cron job"""
    blocked_ips = db.query(BlockedIP.ip).all()
    return {"blocked_ips": [ip[0] for ip in blocked_ips]}

@router.delete("/unblock-ip/{ip}")
def unblock_ip_api(ip: str, db: Session = Depends(get_db)):
    ip = ip.strip().lower()  # Normalize input
    blocked_ip = db.query(BlockedIP).filter_by(ip=ip).first()

    if not blocked_ip:
        raise HTTPException(status_code=404, detail="IP not found")

    db.delete(blocked_ip)
    db.commit()
    return {"message": "IP Unblocked Successfully", "ip": ip}
