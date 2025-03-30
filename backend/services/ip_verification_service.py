from sqlalchemy.orm import Session
from models.models import VerifiedIP, LogEntry, Client, Organization
from fastapi import Request, HTTPException
import ipaddress
import logging

logger = logging.getLogger(__name__)

def normalize_ip(ip_str: str) -> str:
    try:
        return str(ipaddress.ip_address(ip_str.strip()))
    except ValueError:
        return ip_str.strip().lower()

def verify_and_store_ip(organization_id: int, submitted_ip: str, request_ip: str, db: Session):
    # Check if the organization exists
    organization_exists = db.query(Organization).filter(Organization.id == organization_id).first()
    if not organization_exists:
        return {"status": "error", "message": "Organization ID does not exist."}

    # Normalize IPs
    normalized_submitted_ip = normalize_ip(submitted_ip)
    normalized_request_ip = normalize_ip(request_ip)

    # Log the IP comparison
    logger.debug(f"Normalized comparison:\n  Submitted: {normalized_submitted_ip}\n  Request IP: {normalized_request_ip}")

    # Check if the submitted IP matches the request IP
    if normalized_submitted_ip != normalized_request_ip:
        return {"status": "error", "message": "IP verification failed. Your request IP does not match the submitted IP."}

    # Check if the IP is already verified for the organization
    existing_ip = db.query(VerifiedIP).filter(
        VerifiedIP.organization_id == organization_id, 
        VerifiedIP.ip == normalized_submitted_ip
    ).first()

    if existing_ip:
        return {"status": "error", "message": "This IP is already verified for the organization."}

    # Store the verified IP for the organization
    new_verified_ip = VerifiedIP(organization_id=organization_id, ip=normalized_submitted_ip, is_verified=True)
    db.add(new_verified_ip)
    db.commit()
    db.refresh(new_verified_ip)

    return {"status": "success", "message": "IP verified successfully!", "verified_ip": normalized_submitted_ip}

def store_log(organization_id: int, request_ip: str, log_data: str, db: Session):
    try:
        if not organization_id:
            print("[ERROR] organization_id is missing")
            return {"status": "error", "message": "organization_id is required"}

        # Verify the IP is verified for the given organization
        is_verified = db.query(VerifiedIP).filter(
            VerifiedIP.ip == request_ip,
            VerifiedIP.organization_id == organization_id,
            VerifiedIP.is_verified == True
        ).first()

        if not is_verified:
            return {"status": "error", "message": "Unauthorized IP. You cannot forward logs."}

        # Store the log
        new_log = LogEntry(organization_id=organization_id, ip=request_ip, log_data=log_data)
        db.add(new_log)
        db.commit()

        return {"status": "success", "message": "Log stored successfully."}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": f"Failed to store log: {str(e)}"}

def get_logs_for_organization(organization_id: int, db: Session):
    verified_ips = db.query(VerifiedIP.ip).filter(
        VerifiedIP.organization_id == organization_id,
        VerifiedIP.is_verified == True
    ).all()
    ip_list = [ip[0] for ip in verified_ips]

    logs = db.query(LogEntry).filter(
        LogEntry.organization_id == organization_id,
        LogEntry.ip.in_(ip_list)
    ).order_by(LogEntry.timestamp.desc()).all()

    return logs

def delete_verified_ip(ip_id: int, db: Session):
    try:
        ip_entry = db.query(VerifiedIP).filter(VerifiedIP.id == ip_id).first()
        if not ip_entry:
            raise HTTPException(status_code=404, detail="Verified IP not found")

        db.delete(ip_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting verified IP with id={ip_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete verified IP: {str(e)}")

def delete_logs_for_organization(organization_id: int, db: Session):
    try:
        logs = db.query(LogEntry).filter(LogEntry.organization_id == organization_id).all()
        for log in logs:
            db.delete(log)
        db.commit()
        return {"status": "success", "message": f"Logs deleted for organization {organization_id}"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting logs for organization_id={organization_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete logs: {str(e)}")
