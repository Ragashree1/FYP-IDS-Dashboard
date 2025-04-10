# ip_blocking_controller.py
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from models.models import BlockedIP
from models.schemas import IPAddressSchema
from services import ip_blocking_service
from services.auth_service import get_current_user, get_company_name_from_token
import re

router = APIRouter(prefix="/ip-blocking", tags=["ip-blocking"])

def get_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    return authorization.split("Bearer ")[1]  # Extract the token

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


@router.post("/block-ip/", response_model=IPAddressSchema)
def block_ip_api(ip_data: IPAddressSchema, token: str = Depends(get_token)):
    # Get user and company information from token
    current_user = get_current_user(token)
    company_name = get_company_name_from_token(token)
    
    # Pass user and company information to the service
    message = ip_blocking_service.block_ip(ip_data, current_user.username, company_name)
    
    if message.get("message") == "IP is already blocked":
        raise HTTPException(status_code=400, detail="IP is already blocked")

    return message

@router.get("/check-my-ip/")
def check_my_ip(request: Request):
    client_ip = ip_blocking_service.get_client_ip(request)

    print(f"Detected Client IP: {client_ip}")  # Debugging Output
    message = ip_blocking_service.check_ip_blocked(client_ip)
    if message.get("message") == "IP is blocked":
        raise HTTPException(status_code=403, detail="IP is blocked")

    return message

@router.get("/blocked-ips/")
def get_blocked_ips_with_reasons(token: str = Depends(get_token)):
    """Returns blocked IPs with their reasons for the frontend, filtered by company"""
    # Get company information from token
    company_name = get_company_name_from_token(token)
    
    # Get blocked IPs for this company only
    blocked_ips = ip_blocking_service.get_blocked_ips(company_name)
    return blocked_ips

@router.get("/blocked-ips-list/")
def get_blocked_ips_list(token: str = Depends(get_token)):
    """Returns only a list of blocked IPs for the cron job, filtered by company"""
    # Get company information from token
    company_name = get_company_name_from_token(token)
    
    # Get blocked IPs list for this company only
    blocked_ips_list = ip_blocking_service.get_blocked_ips_list(company_name)
    return blocked_ips_list

@router.delete("/unblock-ip/{ip}")
def unblock_ip_api(ip: str, token: str = Depends(get_token)):
    # Get user and company information from token
    current_user = get_current_user(token)
    company_name = get_company_name_from_token(token)
    
    # Pass user and company information to the service
    message = ip_blocking_service.unblock_ip(ip, current_user.username, company_name)
    
    if message.get("message") == "IP not found":
        raise HTTPException(status_code=400, detail="IP not found")
    
    return message