from fastapi import APIRouter, HTTPException, Depends, Header, Response, Request
from starlette import status
from models.schemas import ActivityLogBase, ActivityLog, SystemLog, SystemLogBase
from services import audit_service, system_audit_service
from typing import List, Dict, Any
from services.auth_service import get_company_name_from_token, get_current_user
import datetime

router = APIRouter(prefix="/audit", tags=["audit"])

def get_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    return authorization.split("Bearer ")[1]  # Extract the token

@router.post("/log-activity", response_model=ActivityLog)
async def log_activity(
    activity_data: ActivityLogBase,
    token: str = Depends(get_token),
):
    try:
        current_user = get_current_user(token)
        organization_id = current_user.organization_id
        log_data = ActivityLogBase(
            user=current_user.username,
            targetUser=activity_data.targetUser,
            action=activity_data.action,
            description=activity_data.description,
            organization_id=organization_id
        )
        saved_log = audit_service.add_activity_log(log_data)
        return saved_log
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error logging activity: {str(e)}"
        )

@router.get("/account-logs/", response_model=List[ActivityLog])
async def get_account_logs(
    organization_id: int,  # This becomes a query parameter
):
    try:
        logs = audit_service.get_company_activity_logs(organization_id)
        return logs
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching activity logs: {str(e)}"
        )

@router.delete("/delete-log/{log_id}")
async def delete_log(
    log_id: int,
):
    try:
        success = audit_service.delete_activity_log(log_id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Log not found"
            )
        return {"message": "Log deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting log: {str(e)}"
        )

@router.get("/system-logs", response_model=List[SystemLog])
async def get_system_logs(
    token: str = Depends(get_token),
    response: Response = None,
):
    try:
        current_user = get_current_user(token)
        organization_id = current_user.organization_id
        logs = system_audit_service.get_company_system_logs(organization_id)
        return logs
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching system logs: {str(e)}"
        )

@router.post("/log-system-activity", response_model=SystemLog)
async def log_system_activity(
    activity_data: SystemLogBase,
    token: str = Depends(get_token),
    request: Request = None,
):
    try:
        current_user = get_current_user(token)
        organization_id = current_user.organization_id
        log_data = SystemLogBase(
            user=current_user.username,
            component=activity_data.component,
            action=activity_data.action,
            description=activity_data.description,
            resourceId=activity_data.resourceId,
            resourceName=activity_data.resourceName,
            organization_id=organization_id
        )
        saved_log = system_audit_service.add_system_log(log_data)
        return saved_log
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error logging system activity: {str(e)}"
        )

@router.delete("/delete-system-log/{log_id}")
async def delete_system_log(
    log_id: int,
    token: str = Depends(get_token),
    response: Response = None,
):
    try:
        current_user = get_current_user(token)
        success = system_audit_service.delete_system_log(log_id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail="System log not found"
            )
        return {"message": "System log deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting system log: {str(e)}"
        )