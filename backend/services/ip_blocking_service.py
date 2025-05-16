from database import SessionLocal
from sqlalchemy.orm import Session
from models.models import BlockedIP, Playbook, SnortAlerts, Organisation, VerifiedIP
from fastapi import HTTPException, Request
import re
from datetime import datetime, timedelta


def get_org_name_blocked_ips(org_name: str):
    with SessionLocal() as db:
        organisation = db.query(Organisation).filter(Organisation.name == org_name).first()
        if not organisation:
            return {"blocked_ips": []}

        blocked_ips = (
            db.query(BlockedIP.ip, BlockedIP.reason)
            .filter(BlockedIP.organization_id == organization.id)
            .all()
        )
        return {"blocked_ips": [ip for ip, _ in blocked_ips]}


def get_org_blocked_ips(org_id: int):
    with SessionLocal() as db:
        blocked_ips = db.query(BlockedIP.ip, BlockedIP.reason).filter(
            BlockedIP.organization_id == org_id
        ).all()
        return {"blocked_ips": [{"ip": ip, "reason": reason} for ip, reason in blocked_ips]}


def get_client_ip(request: Request) -> str:
    """Extracts the actual client IP from request headers."""
    forwarded_for = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP", "").strip()

    def is_valid_ip(ip):
        return ip and not ip.startswith(("127.", "10.", "192.168.", "172."))

    if is_valid_ip(forwarded_for):
        return forwarded_for  # First external IP
    elif is_valid_ip(real_ip):
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


def block_ip(ip: str, reason: str, organization_id: int):
    """
    Blocks an IP and stores it in the database.
    Checks if IP is verified before blocking.
    """
    ip = ip.strip().lower()
    validate_ip(ip)
    
    with SessionLocal() as db:
        # Check if IP is verified for this organization
        verified_ip = db.query(VerifiedIP).filter(
            VerifiedIP.ip == ip,
            VerifiedIP.organization_id == organization_id,
            VerifiedIP.is_verified == True
        ).first()
        
        if verified_ip:
            return {
                "message": "IP not blocked - verified IP address", 
                "ip": ip, 
                "reason": "IP is in verified list"
            }

        # Check if IP is already blocked
        existing_ip = db.query(BlockedIP).filter_by(
            ip=ip, 
            organization_id=organization_id
        ).first()
        
        if existing_ip:
            return {
                "message": "IP is already blocked", 
                "ip": existing_ip.ip, 
                "reason": existing_ip.reason
            }

        # Block the IP if not verified and not already blocked
        new_ip = BlockedIP(
            ip=ip, 
            reason=reason, 
            organization_id=organization_id
        )
        db.add(new_ip)

        try:
            db.commit()
            db.refresh(new_ip)
            return {
                "message": "IP Blocked Successfully", 
                "ip": new_ip.ip, 
                "reason": new_ip.reason
            }
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to block IP: {str(e)}"
            )

def unblock_ip(ip: str, orgId: int):
    """Removes an IP from the blocklist."""
    ip = ip.strip().lower()
    with SessionLocal() as db:
        blocked_ip = db.query(BlockedIP).filter_by(ip=ip, organization_id=orgId).first()
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
    with SessionLocal() as db:
        blocked_ips = db.query(BlockedIP).all()
        return [{"ip": ip.ip, "reason": ip.reason} for ip in blocked_ips] if blocked_ips else []


def get_blocked_ips_with_reasons():
    """Returns blocked IPs with their reasons for the frontend"""
    with SessionLocal() as db:
        blocked_ips = db.query(BlockedIP.ip, BlockedIP.reason).all()
        return {"blocked_ips": [{"ip": ip, "reason": reason} for ip, reason in blocked_ips]}


def get_blocked_ips_list():
    """Returns only a list of blocked IPs for the cron job"""
    with SessionLocal() as db:
        blocked_ips = db.query(BlockedIP.ip).all()
        return {"blocked_ips": [ip[0] for ip in blocked_ips]}


def get_blocked_ip(ip: str):
    with SessionLocal() as db:
        return db.query(BlockedIP).filter_by(ip=ip).first()


def evaluate_and_block_ips():
    now = datetime.utcnow()
    with SessionLocal() as db:
        playbooks = db.query(Playbook).filter(Playbook.is_active == True).all()
        recent_logs = db.query(SnortAlerts).filter(
            SnortAlerts.timestamp >= (now - timedelta(hours=24))
        ).all()
        current_blocked = db.query(BlockedIP.ip).all()
        blocked_ips = {ip[0] for ip in current_blocked}

        for playbook in playbooks:
            ips_to_block = playbook.evaluate_conditions(recent_logs, blocked_ips)
            for ip in ips_to_block:
                # Avoid re-blocking
                if ip not in blocked_ips:
                    block_ip(ip, f"Blocked by playbook: {playbook.name}", playbook.organization_id)