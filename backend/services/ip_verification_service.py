from database import SessionLocal
from sqlalchemy.orm import Session
from models.models import VerifiedIP, Organization
from fastapi import Request, HTTPException
import ipaddress
import logging
import requests
from datetime import datetime

logger = logging.getLogger(__name__)

def normalize_ip(ip_str: str) -> str:
    try:
        return str(ipaddress.ip_address(ip_str.strip()))
    except ValueError:
        return ip_str.strip().lower()

def verify_and_store_ip(organization_id: int, submitted_ip: str):
    with SessionLocal() as db:
        organization_exists = db.query(Organization).filter(Organization.id == organization_id).first()
        if not organization_exists:
            return {"status": "error", "message": "Organization ID does not exist."}

        normalized_submitted_ip = normalize_ip(submitted_ip)

        existing_ip = db.query(VerifiedIP).filter(
            VerifiedIP.organization_id == organization_id, 
            VerifiedIP.ip == normalized_submitted_ip
        ).first()

        if existing_ip:
            return {"status": "error", "message": "This IP already exists for the organization."}

        new_verified_ip = VerifiedIP(organization_id=organization_id, ip=normalized_submitted_ip, is_verified=True)
        db.add(new_verified_ip)
        db.commit()
        db.refresh(new_verified_ip)

        return {"status": "success", "message": "IP verified successfully!", "verified_ip": normalized_submitted_ip}
def get_verified_ips(organization_id: int):
    with SessionLocal() as db:
        verified_ips = db.query(VerifiedIP).filter(
            VerifiedIP.organization_id == organization_id,
            VerifiedIP.is_verified == True
        ).all()
        return [{"id": ip.id, "ip": ip.ip} for ip in verified_ips]


def delete_verified_ip(ip_id: int):
    with SessionLocal() as db:
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