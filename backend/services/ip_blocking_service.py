# ip_blocking_service.py
import re
from sqlalchemy.orm import Session
from fastapi import HTTPException, Request
from models.models import BlockedIP, SystemLog
from models.schemas import IPAddressSchema, SystemLogBase
from database import SessionLocal
from datetime import datetime

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

def log_ip_action(db: Session, user: str, action: str, ip: str, reason: str, company_name: str):
    """Log IP blocking/unblocking actions to system logs"""
    try:
        # Create system log entry
        log_data = SystemLogBase(
            user=user,
            component="IP Blocklist",
            action=action,
            description=f"{action.capitalize()} IP {ip}: {reason}",
            ipAddress="127.0.0.1",  # This could be replaced with actual admin IP
            resourceId=ip,
            resourceName=ip,
            userComName=company_name
        )
        
        # Create new system log entry
        new_log = SystemLog(
            user=log_data.user,
            component=log_data.component,
            action=log_data.action,
            description=log_data.description,
            ipAddress=log_data.ipAddress,
            resourceId=log_data.resourceId,
            resourceName=log_data.resourceName,
            userComName=company_name,
            timestamp=datetime.now()
        )
        
        db.add(new_log)
        db.commit()
        
        print(f"Added system log for IP {action}: {ip}, company: {company_name}")
        
    except Exception as e:
        print(f"Error logging IP {action}: {str(e)}")
        # Don't raise the exception - we don't want to fail the main operation
        # if logging fails

def block_ip(ip_data: IPAddressSchema, user: str = "admin", company_name: str = "default"):
    """Adds an IP to the blocklist in the database."""
    with SessionLocal() as db: 
        ip = ip_data.ip.strip().lower()
        validate_ip(ip)  # Ensure valid IP

        # Check if IP is already blocked for this company
        existing_ip = db.query(BlockedIP).filter_by(ip=ip, company=company_name).first()
        if existing_ip:
            return {"message": "IP is already blocked", "ip": existing_ip.ip, "reason": existing_ip.reason}

        # Create new blocked IP with company information
        new_ip = BlockedIP(ip=ip, reason=ip_data.reason, company=company_name)
        db.add(new_ip)
        db.commit()
        db.refresh(new_ip)
        
        # Log the action to system logs
        log_ip_action(db, user, "ip_blocked", ip, ip_data.reason, company_name)

        return {"message": "IP Blocked Successfully", "ip": new_ip.ip, "reason": new_ip.reason}

def unblock_ip(ip: str, user: str = "admin", company_name: str = "default"):
    """Removes an IP from the blocklist."""
    with SessionLocal() as db: 
        ip = ip.strip().lower()

        # Only find and remove IPs that belong to this company
        blocked_ip = db.query(BlockedIP).filter_by(ip=ip, company=company_name).first()
        if not blocked_ip:
            return {"message": "IP not found", "ip": ip}

        reason = blocked_ip.reason  # Save reason before deleting for the log
        
        db.delete(blocked_ip)
        db.commit()
        
        # Log the action to system logs
        log_ip_action(db, user, "ip_unblocked", ip, reason, company_name)
        
        return {"message": "IP Unblocked Successfully", "ip": ip}

def check_ip_blocked(client_ip: str):
    """Checks if an IP is blocked in any company (for security purposes)"""
    with SessionLocal() as db: 
        blocked_ip = db.query(BlockedIP).filter(BlockedIP.ip == client_ip.lower()).first()
        if blocked_ip:
            return {"message": "IP is blocked", "ip": client_ip, "reason": blocked_ip.reason}

        return {"message": "IP is not blocked", "ip": client_ip}

def get_blocked_ips(company_name: str = None):
    """Retrieves blocked IPs from the database, filtered by company if provided."""
    with SessionLocal() as db:
        query = db.query(BlockedIP)
        
        # Filter by company if provided
        if company_name:
            query = query.filter(BlockedIP.company == company_name)
            
        blocked_ips = query.all()
        return [{"ip": ip.ip, "reason": ip.reason} for ip in blocked_ips] if blocked_ips else []

def get_blocked_ips_list(company_name: str = None):
    """Retrieves only a list of blocked IPs for the cron job, optionally filtered by company."""
    with SessionLocal() as db:
        query = db.query(BlockedIP.ip)
        
        # Filter by company if provided
        if company_name:
            query = query.filter(BlockedIP.company == company_name)
            
        blocked_ips = query.all()
        return {"blocked_ips": [ip[0] for ip in blocked_ips]} if blocked_ips else {"blocked_ips": []}

def get_blocked_ip(ip: str, company_name: str = None):
    """Gets a specific blocked IP, optionally filtered by company."""
    with SessionLocal() as db:
        query = db.query(BlockedIP).filter_by(ip=ip)
        
        # Filter by company if provided
        if company_name:
            query = query.filter(BlockedIP.company == company_name)
            
        return query.first()