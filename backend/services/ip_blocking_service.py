import re
from sqlalchemy.orm import Session
from fastapi import HTTPException, Request
from models.models import BlockedIP
from models.schemas import IPAddressSchema
from database import SessionLocal

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

def block_ip(ip_data: IPAddressSchema):
    with SessionLocal() as db: 
        """Adds an IP to the blocklist in the database."""
        ip = ip_data.ip.strip().lower()
        validate_ip(ip)  # Ensure valid IP

        existing_ip = db.query(BlockedIP).filter_by(ip=ip).first()
        if existing_ip:
            return {"message": "IP is already blocked", "ip": existing_ip.ip, "reason": existing_ip.reason}

        new_ip = BlockedIP(ip=ip, reason=ip_data.reason)
        db.add(new_ip)
        db.commit()
        db.refresh(new_ip)

        return {"message": "IP Blocked Successfully", "ip": new_ip.ip, "reason": new_ip.reason}

def unblock_ip(ip: str):
    """Removes an IP from the blocklist."""
    with SessionLocal() as db: 
        ip = ip.strip().lower()

        blocked_ip = db.query(BlockedIP).filter_by(ip=ip).first()
        if not blocked_ip:
            return {"message": "IP not found", "ip": ip}

        db.delete(blocked_ip)
        db.commit()
        return {"message": "IP Unblocked Successfully", "ip": ip}

def check_ip_blocked(client_ip: str):
    with SessionLocal() as db: 
        blocked_ip = db.query(BlockedIP).filter(BlockedIP.ip == client_ip.lower()).first()
        if blocked_ip:
            return {"message": "Your IP is blocked", "ip": client_ip, "reason": blocked_ip.reason}

        return {"message": "Your IP is not blocked", "ip": client_ip}

def get_blocked_ips():
    """Retrieves all blocked IPs from the database."""
    with SessionLocal() as db: 
        blocked_ips = db.query(BlockedIP).all()
        return [{"ip": ip.ip, "reason": ip.reason} for ip in blocked_ips] if blocked_ips else []

def get_blocked_ips_list():
    """Retrieves all blocked IPs from the database."""
    with SessionLocal() as db: 
        blocked_ips = db.query(BlockedIP.ip).all()
        return {"blocked_ips": [ip[0] for ip in blocked_ips]} if blocked_ips else {"blocked_ips": []}

def get_blocked_ip(ip: str):
    with SessionLocal() as db: 
        return db.query(BlockedIP).filter_by(ip=ip).first()