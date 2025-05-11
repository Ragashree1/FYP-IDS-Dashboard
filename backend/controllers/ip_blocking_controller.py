from fastapi import APIRouter, Request
from models.schemas import IPAddressSchema
from services import ip_blocking_service

router = APIRouter(prefix="/ip-blocking", tags=["ip-blocking"])

@router.post("/block-ip/")
def block_ip_api(ip_data: IPAddressSchema):
    return ip_blocking_service.block_ip(ip_data.ip, ip_data.reason, ip_data.organization_id)

@router.get("/check-my-ip/")
def check_my_ip(request: Request):
    client_ip = ip_blocking_service.get_client_ip(request)
    return ip_blocking_service.check_ip_blocked(client_ip)

@router.get("/blocked-ips/")
def get_blocked_ips_with_reasons_api():
    return ip_blocking_service.get_blocked_ips_with_reasons()

@router.get("/blocked-ips-list/")
def get_blocked_ips_list_api():
    return ip_blocking_service.get_blocked_ips_list()

@router.delete("/unblock-ip/{ip}")
def unblock_ip_api(ip: str, org_id: int):
    return ip_blocking_service.unblock_ip(ip, org_id)

@router.get("/{org_id}/blocked-ips")
def get_blocked_ips_by_org(org_id: int):
    return ip_blocking_service.get_org_blocked_ips(org_id)

@router.get("/blocked-ips/{org_name}")
def get_blocked_ips_by_org_name(org_name: str):
    return ip_blocking_service.get_org_name_blocked_ips(org_name)

