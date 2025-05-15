from database import SessionLocal
from sqlalchemy.orm import Session
from models.models import VerifiedIP, Organization
from fastapi import Request, HTTPException
import ipaddress
import logging
import requests
from datetime import datetime
from typing import Dict, Any, List
from services import system_audit_service
from models.schemas import SystemLogBase

logger = logging.getLogger(__name__)

def normalize_ip(ip_str: str) -> str:
    try:
        return str(ipaddress.ip_address(ip_str.strip()))
    except ValueError:
        return ip_str.strip().lower()

def verify_and_store_ip(organization_id: int, ip: str, current_user: str = "system") -> Dict[str, Any]:
    """Verify and store an IP address"""
    with SessionLocal() as db:
        # Check if IP already exists
        existing_ip = db.query(VerifiedIP).filter(VerifiedIP.ip == ip).first()
        if existing_ip:
            return {"status": "error", "message": "IP already verified"}

        # Add new IP
        new_ip = VerifiedIP(
            ip=ip,
            is_verified=True,
            organization_id=organization_id
        )
        try:
            db.add(new_ip)
            db.commit()
            db.refresh(new_ip)

            # Log the IP verification in system logs
            log_data = SystemLogBase(
                user=current_user,
                component="IP Verification",
                action="created_ip_verified",
                description=f"Created Verified IP address: {ip}",
                resourceId=str(new_ip.id),
                resourceName=ip,
                organization_id=organization_id
            )
            system_audit_service.add_system_log(log_data)

            return {
                "status": "success",
                "message": "IP verified successfully",
                "ip_id": new_ip.id
            }
        except Exception as e:
            db.rollback()
            return {"status": "error", "message": str(e)}

def get_verified_ips(organization_id: int) -> List[VerifiedIP]:
    """Get all verified IPs for an organization"""
    with SessionLocal() as db:
        verified_ips = db.query(VerifiedIP).filter(
            VerifiedIP.organization_id == organization_id
        ).all()
        return verified_ips

def delete_verified_ip(ip_id: int, current_user: str = "system") -> bool:
    """Delete a verified IP"""
    with SessionLocal() as db:
        ip = db.query(VerifiedIP).filter(VerifiedIP.id == ip_id).first()
        if not ip:
            raise HTTPException(status_code=404, detail="Verified IP not found")

        # Store IP details before deletion for logging
        ip_address = ip.ip
        organization_id = ip.organization_id

        try:
            db.delete(ip)
            db.commit()

            # Log the IP removal in system logs
            log_data = SystemLogBase(
                user=current_user,
                component="IP Verification",
                action="ip_verification_removed",
                description=f"Removed verified IP: {ip_address}",
                resourceId=str(ip_id),
                resourceName=ip_address,
                organization_id=organization_id
            )
            system_audit_service.add_system_log(log_data)

            return True
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
