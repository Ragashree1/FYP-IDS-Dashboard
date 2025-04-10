from fastapi import APIRouter, HTTPException, Depends, Header, Response, Request
from starlette import status
from models.schemas import ActivityLogBase, ActivityLog, SystemLog, SystemLogBase
from services import audit_service, system_audit_service
from typing import List, Dict, Any
from services.auth_service import get_company_name_from_token, get_current_user
from database import get_db
from sqlalchemy.orm import Session
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
    db: Session = Depends(get_db),
    request: Request = None,
    response: Response = None,
):
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            
        # Get current user from token
        current_user = get_current_user(token)
        company_name = get_company_name_from_token(token)
        
        # Get client IP address
        client_ip = "127.0.0.1"
        if request:
            client_ip = request.client.host
            
        # Create activity log data
        log_data = ActivityLogBase(
            user=current_user.username,
            targetUser=activity_data.targetUser,
            action=activity_data.action,
            description=activity_data.description,
            ipAddress=client_ip,
            userComName=company_name
        )
        
        # Save to database
        saved_log = audit_service.add_activity_log(db, log_data, company_name)
        return saved_log
    except Exception as e:
        # Set CORS headers even on error
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        raise HTTPException(
            status_code=500,
            detail=f"Error logging activity: {str(e)}"
        )

@router.get("/account-logs", response_model=List[ActivityLog])
async def get_account_logs(
    token: str = Depends(get_token),
    db: Session = Depends(get_db),
    response: Response = None,
):
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            
        # Get current user from token
        current_user = get_current_user(token)
        company_name = get_company_name_from_token(token)
        
        # Debug print to check user role and company name
        print(f"User role: {current_user.userRole}, Company name: {company_name}")
        
        # Get logs - if IT Manager (role 3), get only logs for their company
        # Changed from get_all_activity_logs to get_company_activity_logs for IT Managers too
        logs = audit_service.get_company_activity_logs(db, company_name)
        print(f"User role {current_user.userRole}: returning {len(logs)} logs for company {company_name}")
            
        return logs
    except Exception as e:
        # Set CORS headers even on error
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        print(f"Error in get_account_logs: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching activity logs: {str(e)}"
        )

@router.delete("/delete-log/{log_id}")
async def delete_log(
    log_id: int,
    token: str = Depends(get_token),
    db: Session = Depends(get_db),
    response: Response = None,
):
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            
        # Get current user from token
        current_user = get_current_user(token)
        
        # Only IT Managers can delete logs
        if current_user.userRole != 3:  # IT Manager role
            raise HTTPException(
                status_code=403,
                detail="Only IT Managers can delete logs"
            )
            
        # Delete the log
        success = audit_service.delete_activity_log(db, log_id)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Log not found"
            )
            
        return {"message": "Log deleted successfully"}
    except HTTPException as e:
        # Set CORS headers even on error
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        raise e
    except Exception as e:
        # Set CORS headers even on error
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting log: {str(e)}"
        )

@router.get("/system-logs", response_model=List[SystemLog])
async def get_system_logs(
    token: str = Depends(get_token),
    db: Session = Depends(get_db),
    response: Response = None,
):
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            
        # Get current user from token
        current_user = get_current_user(token)
        company_name = get_company_name_from_token(token)
        
        # Debug print to check user role and company name
        print(f"User role: {current_user.userRole}, Company name: {company_name}")
        
        # Only IT Managers can view system logs
        if current_user.userRole != 3:  # IT Manager role
            raise HTTPException(
                status_code=403,
                detail="Only IT Managers can view system logs"
            )
            
        # Get system logs for the company
        logs = system_audit_service.get_company_system_logs(db, company_name)
        print(f"IT Manager: returning {len(logs)} system logs for company {company_name}")
        
        return logs
    except Exception as e:
        # Set CORS headers even on error
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        print(f"Error in get_system_logs: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching system logs: {str(e)}"
        )

@router.post("/log-system-activity", response_model=SystemLog)
async def log_system_activity(
    activity_data: SystemLogBase,
    token: str = Depends(get_token),
    db: Session = Depends(get_db),
    request: Request = None,
    response: Response = None,
):
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            
        # Get current user from token
        current_user = get_current_user(token)
        company_name = get_company_name_from_token(token)
        
        # Get client IP address
        client_ip = "127.0.0.1"
        if request:
            client_ip = request.client.host
            
        # Create system log data
        log_data = SystemLogBase(
            user=current_user.username,
            component=activity_data.component,
            action=activity_data.action,
            description=activity_data.description,
            ipAddress=client_ip,
            resourceId=activity_data.resourceId,
            resourceName=activity_data.resourceName,
            userComName=company_name  # Set the company name
        )
        
        # Save to database with company name
        saved_log = system_audit_service.add_system_log(db, log_data, company_name)
        return saved_log
    except Exception as e:
        # Set CORS headers even on error
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        raise HTTPException(
            status_code=500,
            detail=f"Error logging system activity: {str(e)}"
        )

@router.delete("/delete-system-log/{log_id}")
async def delete_system_log(
    log_id: int,
    token: str = Depends(get_token),
    db: Session = Depends(get_db),
    response: Response = None,
):
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            
        # Get current user from token
        current_user = get_current_user(token)
        
        # Only IT Managers can delete logs
        if current_user.userRole != 3:  # IT Manager role
            raise HTTPException(
                status_code=403,
                detail="Only IT Managers can delete system logs"
            )
            
        # Delete the log
        success = system_audit_service.delete_system_log(db, log_id)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="System log not found"
            )
            
        return {"message": "System log deleted successfully"}
    except HTTPException as e:
        # Set CORS headers even on error
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        raise e
    except Exception as e:
        # Set CORS headers even on error
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting system log: {str(e)}"
        )

# Add OPTIONS method handlers for CORS preflight requests
@router.options("/log-activity")
@router.options("/account-logs")
@router.options("/delete-log/{log_id}")
@router.options("/system-logs")
@router.options("/log-system-activity")
@router.options("/delete-system-log/{log_id}")
async def options_handler(response: Response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return {}