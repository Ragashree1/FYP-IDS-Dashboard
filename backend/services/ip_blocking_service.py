from sqlalchemy.orm import Session
from models.models import BlockedIP, Client
from fastapi import HTTPException, Request
import re

def get_org_blocked_ips(org_id: int, requester_email: str, db: Session):
    client = db.query(Client).filter(Client.email == requester_email).first()

    if not client:
        raise HTTPException(status_code=401, detail="Unauthorized client")

    if client.organization_id != org_id:
        raise HTTPException(status_code=403, detail="You do not belong to this organization")

    blocked_ips = db.query(BlockedIP.ip, BlockedIP.reason).filter(
        BlockedIP.organization_id == org_id
    ).all()

    return {"blocked_ips": [{"ip": ip, "reason": reason} for ip, reason in blocked_ips]}

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

def block_ip(ip: str, reason: str, db: Session):
    """Blocks an IP and stores it in the database"""
    ip = ip.strip().lower()
    validate_ip(ip)

    existing_ip = db.query(BlockedIP).filter_by(ip=ip).first()
    if existing_ip:
        raise HTTPException(status_code=400, detail="IP is already blocked.")

    new_ip = BlockedIP(ip=ip, reason=reason)
    db.add(new_ip)

    try:
        db.commit() 
        db.refresh(new_ip)
        return {"message": "IP Blocked Successfully", "ip": new_ip.ip, "reason": new_ip.reason}
    except:
        db.rollback()  
        raise HTTPException(status_code=500, detail="Database commit failed")

def unblock_ip(ip: str, db: Session):
    """Unblocks an IP by deleting it from the database"""
    ip = ip.strip().lower()
    blocked_ip = db.query(BlockedIP).filter_by(ip=ip).first()

    if not blocked_ip:
        raise HTTPException(status_code=404, detail="IP not found")

    db.delete(blocked_ip)

    try:
        db.commit()  
        return {"message": "IP Unblocked Successfully", "ip": ip}
    except:
        db.rollback()  
        raise HTTPException(status_code=500, detail="Database commit failed")

def check_ip(client_ip: str, db: Session):
    """Checks if the client IP is blocked"""
    blocked_ip = db.query(BlockedIP).filter(BlockedIP.ip == client_ip.lower()).first()
    if blocked_ip:
        raise HTTPException(status_code=403, detail="Your IP is blocked.")

    return {"message": "Your IP is not blocked", "ip": client_ip}

def get_blocked_ips_with_reasons(db: Session):
    """Returns blocked IPs with their reasons for the frontend"""
    blocked_ips = db.query(BlockedIP.ip, BlockedIP.reason).all()
    return {"blocked_ips": [{"ip": ip, "reason": reason} for ip, reason in blocked_ips]}

def get_blocked_ips_list(db: Session):
    """Returns only a list of blocked IPs for the cron job"""
    blocked_ips = db.query(BlockedIP.ip).all()
    return {"blocked_ips": [ip[0] for ip in blocked_ips]}
