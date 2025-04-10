from fastapi import APIRouter, HTTPException, Depends, Header, Response, Request
from services import playbook_service, system_audit_service
from models.schemas import PlaybookBase, PlaybookOut, SystemLogBase
from typing import List
import uuid
from database import get_db
from sqlalchemy.orm import Session
from services.auth_service import get_current_user, get_company_name_from_token

router = APIRouter(prefix="/playbooks", tags=["playbooks"])

def get_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    return authorization.split("Bearer ")[1]  # Extract the token

@router.get("/", response_model=List[PlaybookOut])
def fetch_playbooks(
    response: Response = None,
    token: str = Depends(get_token)
):
    """Get all playbooks"""
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        
        # Get current user from token
        current_user = get_current_user(token)
        
        # Get company name from the user
        company_name = current_user.userComName if current_user else None
            
        return playbook_service.get_all_playbooks(company_name=company_name)
    except Exception as e:
        # Set CORS headers even on error
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=PlaybookOut)
def create_playbook(
    playbook: PlaybookBase, 
    response: Response = None, 
    request: Request = None,
    db: Session = Depends(get_db),
    token: str = Depends(get_token)
):
    """Create a new playbook"""
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            
        # Get current user from token
        current_user = get_current_user(token)
        
        # Get company name from the user
        company_name = current_user.userComName if current_user else None
        
        if not company_name:
            raise HTTPException(status_code=400, detail="Company name is required")
            
        # Create the playbook
        new_playbook = playbook_service.add_playbook(playbook_data=playbook, company_name=company_name)
        
        # Log the activity
        client_ip = "127.0.0.1"
        if request:
            client_ip = request.client.host
            
        # Create system log entry
        log_data = SystemLogBase(
            user=current_user.username if current_user else "system",
            component="Playbook",
            action="playbook_created",
            description=f"Created new playbook: {new_playbook.name}",
            ipAddress=client_ip,
            resourceId=str(new_playbook.id),
            resourceName=new_playbook.name
        )
        
        # Save to system audit log
        system_audit_service.add_system_log(db, log_data)
        
        return new_playbook
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
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{playbook_id}")
def remove_playbook(
    playbook_id: int, 
    response: Response = None,
    request: Request = None,
    db: Session = Depends(get_db),
    token: str = Depends(get_token)
):
    """Delete a playbook"""
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        
        # Get current user from token
        current_user = get_current_user(token)
        
        # Get company name from the user
        company_name = current_user.userComName if current_user else None
        
        # Get playbook details before deletion for logging
        playbook = playbook_service.get_playbook_by_id(playbook_id)
        if not playbook:
            raise HTTPException(status_code=404, detail="Playbook not found")
            
        # Check if the playbook belongs to the user's company
        if company_name and hasattr(playbook, 'company_name') and playbook.company_name != company_name:
            raise HTTPException(status_code=403, detail="You don't have permission to delete this playbook")
            
        # Delete the playbook
        success = playbook_service.delete_playbook(playbook_id=playbook_id, company_name=company_name)
        if not success:
            raise HTTPException(status_code=404, detail="Playbook not found")
        
        # Log the activity
        client_ip = "127.0.0.1"
        if request:
            client_ip = request.client.host
            
        # Create system log entry
        log_data = SystemLogBase(
            user=current_user.username if current_user else "system",
            component="Playbook",
            action="playbook_deleted",
            description=f"Deleted playbook: {playbook.name}",
            ipAddress=client_ip,
            resourceId=str(playbook_id),
            resourceName=playbook.name
        )
        
        # Save to system audit log
        system_audit_service.add_system_log(db, log_data)
        
        return {"message": "Playbook deleted successfully"}
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
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{playbook_id}", response_model=PlaybookOut)
def modify_playbook(
    playbook_id: int, 
    update_data: PlaybookBase, 
    response: Response = None,
    request: Request = None,
    db: Session = Depends(get_db),
    token: str = Depends(get_token)
):
    """Update a playbook"""
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        
        # Get current user from token
        current_user = get_current_user(token)
        
        # Get company name from the user
        company_name = current_user.userComName if current_user else None
        
        # Get original playbook data for comparison
        original_playbook = playbook_service.get_playbook_by_id(playbook_id)
        if not original_playbook:
            raise HTTPException(status_code=404, detail="Playbook not found")
            
        # Check if the playbook belongs to the user's company
        if company_name and hasattr(original_playbook, 'company_name') and original_playbook.company_name != company_name:
            raise HTTPException(status_code=403, detail="You don't have permission to update this playbook")
            
        # Update the playbook
        updated_playbook = playbook_service.update_playbook(
            playbook_id=playbook_id, 
            update_data=update_data,
            company_name=company_name
        )
        
        if not updated_playbook:
            raise HTTPException(status_code=404, detail="Playbook not found")
        
        # Determine what changed for the log description
        changes = []
        
        if original_playbook.name != updated_playbook.name:
            changes.append(f"name from '{original_playbook.name}' to '{updated_playbook.name}'")
            
        if original_playbook.description != updated_playbook.description:
            changes.append("description")
            
        if original_playbook.conditions != updated_playbook.conditions:
            changes.append("conditions")
            
        if original_playbook.actions != updated_playbook.actions:
            changes.append("actions")
            
        if original_playbook.is_active != updated_playbook.is_active:
            status_change = "activated" if updated_playbook.is_active else "deactivated"
            changes.append(f"status to {status_change}")
        
        # Log the activity
        client_ip = "127.0.0.1"
        if request:
            client_ip = request.client.host
            
        # Create system log entry
        log_data = SystemLogBase(
            user=current_user.username if current_user else "system",
            component="Playbook",
            action="playbook_updated",
            description=f"Updated playbook {updated_playbook.name}: {', '.join(changes)}",
            ipAddress=client_ip,
            resourceId=str(playbook_id),
            resourceName=updated_playbook.name
        )
        
        # Save to system audit log
        system_audit_service.add_system_log(db, log_data)
        
        return updated_playbook
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
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{playbook_id}/toggle", response_model=PlaybookOut)
def toggle_status(
    playbook_id: int, 
    response: Response = None,
    request: Request = None,
    db: Session = Depends(get_db),
    token: str = Depends(get_token)
):
    """Toggle playbook active status"""
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        
        # Get current user from token
        current_user = get_current_user(token)
        
        # Get company name from the user
        company_name = current_user.userComName if current_user else None
        
        # Get original playbook data for comparison
        original_playbook = playbook_service.get_playbook_by_id(playbook_id)
        if not original_playbook:
            raise HTTPException(status_code=404, detail="Playbook not found")
            
        # Check if the playbook belongs to the user's company
        if company_name and hasattr(original_playbook, 'company_name') and original_playbook.company_name != company_name:
            raise HTTPException(status_code=403, detail="You don't have permission to toggle this playbook")
            
        # Toggle the playbook status
        updated_playbook = playbook_service.toggle_playbook_status(playbook_id=playbook_id, company_name=company_name)
        
        if not updated_playbook:
            raise HTTPException(status_code=404, detail="Playbook not found")
        
        # Determine the status change
        status_change = "activated" if updated_playbook.is_active else "deactivated"
        
        # Log the activity
        client_ip = "127.0.0.1"
        if request:
            client_ip = request.client.host
            
        # Create system log entry
        log_data = SystemLogBase(
            user=current_user.username if current_user else "system",
            component="Playbook",
            action="playbook_status_changed",
            description=f"{status_change.capitalize()} playbook: {updated_playbook.name}",
            ipAddress=client_ip,
            resourceId=str(playbook_id),
            resourceName=updated_playbook.name
        )
        
        # Save to system audit log
        system_audit_service.add_system_log(db, log_data)
        
        return updated_playbook
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
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active", response_model=List[PlaybookOut])
def get_active_playbooks(response: Response = None, token: str = Depends(get_token)):
    """Get all active playbooks"""
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        
        # Get current user from token
        current_user = get_current_user(token)
        
        # Get company name from the user
        company_name = current_user.userComName if current_user else None
            
        return playbook_service.get_active_playbooks(company_name=company_name)
    except Exception as e:
        # Set CORS headers even on error
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        raise HTTPException(status_code=500, detail=str(e))

# Add OPTIONS method handlers for CORS preflight requests
@router.options("/")
@router.options("/{playbook_id}")
@router.options("/{playbook_id}/toggle")
@router.options("/active")
async def options_handler(response: Response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return {}