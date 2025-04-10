# controllers/user_management_controller.py
from fastapi import APIRouter, HTTPException, Depends, Header, Response, Request
from starlette import status
from models.schemas import AccountBase, RoleOut, AccountStatusCheck, ActivityLogBase
from services import user_management_service, audit_service
from typing import List, Dict, Any
from services.auth_service import get_company_name_from_token, check_user_status, get_current_user
from database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/user-management", tags=["user-management"])

# Role IDs
ORG_ADMIN_ROLE_ID = 1
NETWORK_ADMIN_ROLE_ID = 2
IT_MANAGER_ROLE_ID = 3  # Added new role ID for IT Manager

def get_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    return authorization.split("Bearer ")[1]  # Extract the token

@router.post("/", response_model=AccountBase)
def add_user(
    user: AccountBase,
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
            
        comp = get_company_name_from_token(token)  
        current_user = get_current_user(token)
        
        # Set the company name from the token
        user.userComName = comp
        
        # Ensure phone number is valid
        if not user.userPhoneNum or user.userPhoneNum.strip() == "":
            user.userPhoneNum = "+65123456789"  # Set default phone number if empty
        
        # Add the user with the role they were assigned
        new_user = user_management_service.add_user(user_particulars=user)
        
        # Check if the request is from the organization requests page
        if not user.fromOrgRequestsPage:
            # Log the activity only if not from organization requests page
            client_ip = "127.0.0.1"
            if request:
                client_ip = request.client.host
                
            log_data = ActivityLogBase(
                user=current_user.username,
                targetUser=new_user.username,
                action="user_created",
                description=f"Created new user account: {new_user.username} with role ID {new_user.userRole}",
                ipAddress=client_ip,
                userComName=comp
            )
            
            # Save to audit log
            audit_service.add_activity_log(db, log_data, comp)
        
        return new_user
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
            detail=str(e)
        )

@router.get("/", response_model=List[AccountBase])
def fetch_user(
    company_name: str = Depends(get_company_name_from_token),
    response: Response = None,
):
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            
        # Check if the request is from the platform admin
        if company_name == "secuboard":
            # If it's the platform admin, return all users
            users = user_management_service.get_all_users_for_admin()
        else:
            # Otherwise, filter by company name
            users = user_management_service.get_all_users(company_name=company_name)
                    
        return users
    except Exception as e:
        # Set CORS headers even on error
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching users: {str(e)}"
        )

@router.get("/roles", response_model=List[RoleOut])
def fetch_roles(response: Response = None):
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            
        # Try to get roles from the database
        try:
            roles = user_management_service.get_all_roles()
        except Exception as db_error:
            print(f"Database error fetching roles: {str(db_error)}")
            # If database error, return default roles
            return [
                RoleOut(id=ORG_ADMIN_ROLE_ID, roleName="Organisation Admin"),
                RoleOut(id=NETWORK_ADMIN_ROLE_ID, roleName="Network Admin"),
                RoleOut(id=IT_MANAGER_ROLE_ID, roleName="IT Manager")
            ]
        
        # Ensure we have at least the basic roles
        has_org_admin = False
        has_network_admin = False
        has_it_manager = False  # Added flag for IT Manager role
        
        processed_roles = []
        for role in roles:
            if role.id == ORG_ADMIN_ROLE_ID:
                has_org_admin = True
                processed_roles.append(RoleOut(id=ORG_ADMIN_ROLE_ID, roleName="Organisation Admin"))
            elif role.id == NETWORK_ADMIN_ROLE_ID:
                has_network_admin = True
                processed_roles.append(RoleOut(id=NETWORK_ADMIN_ROLE_ID, roleName="Network Admin"))
            elif role.id == IT_MANAGER_ROLE_ID:  # Check for IT Manager role
                has_it_manager = True
                processed_roles.append(RoleOut(id=IT_MANAGER_ROLE_ID, roleName="IT Manager"))
            else:
                processed_roles.append(role)
        
        # Add missing roles if needed
        if not has_org_admin:
            processed_roles.append(RoleOut(id=ORG_ADMIN_ROLE_ID, roleName="Organisation Admin"))
        if not has_network_admin:
            processed_roles.append(RoleOut(id=NETWORK_ADMIN_ROLE_ID, roleName="Network Admin"))
        if not has_it_manager:  # Add IT Manager role if it doesn't exist
            processed_roles.append(RoleOut(id=IT_MANAGER_ROLE_ID, roleName="IT Manager"))
            
        return processed_roles
    except Exception as e:
        # Set CORS headers even on error
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            
        print(f"Error in fetch_roles: {str(e)}")
        # Return default roles if there's an error
        return [
            RoleOut(id=ORG_ADMIN_ROLE_ID, roleName="Organisation Admin"),
            RoleOut(id=NETWORK_ADMIN_ROLE_ID, roleName="Network Admin"),
            RoleOut(id=IT_MANAGER_ROLE_ID, roleName="IT Manager")  # Include IT Manager in default roles
        ]

@router.delete("/{account_id}")
def remove_user(
    account_id: int, 
    token: str = Depends(get_token),
    db: Session = Depends(get_db),
    request: Request = None,
    response: Response = None
):
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            
        # Get current user and company name
        current_user = get_current_user(token)
        comp = get_company_name_from_token(token)
        
        # Get user details before deletion for logging
        user_to_delete = user_management_service.get_user_by_id(account_id)
        if not user_to_delete:
            raise HTTPException(status_code=404, detail="User not found.")
            
        # Delete the user
        success = user_management_service.delete_user(account_id=account_id)
        if not success:
            raise HTTPException(status_code=404, detail="User not found.")
            
        # Log the activity
        client_ip = "127.0.0.1"
        if request:
            client_ip = request.client.host
            
        log_data = ActivityLogBase(
            user=current_user.username,
            targetUser=user_to_delete.username,
            action="user_deleted",
            description=f"Deleted user account: {user_to_delete.username}",
            ipAddress=client_ip,
            userComName=comp
        )
        
        # Save to audit log
        audit_service.add_activity_log(db, log_data, comp)
        
        return {"message": "User deleted successfully"}
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
            detail=str(e)
        )

@router.put("/{account_id}", response_model=AccountBase)
def modify_account(
    account_id: int, 
    update_data: AccountBase, 
    token: str = Depends(get_token),
    db: Session = Depends(get_db),
    request: Request = None,
    response: Response = None
):
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            
        # Get current user and company name
        current_user = get_current_user(token)
        comp = get_company_name_from_token(token)
        
        # Ensure the account ID matches the one in the request body
        if update_data.id != account_id:
            raise HTTPException(status_code=400, detail="Account ID mismatch")
            
        # Get the company name from the user data
        company_name = update_data.userComName
        
        # Ensure phone number is valid
        if not update_data.userPhoneNum or update_data.userPhoneNum.strip() == "":
            update_data.userPhoneNum = "+65123456789"  # Set default phone number if empty
        
        # Get original user data for comparison
        original_user = user_management_service.get_user_by_id(account_id)
        if not original_user:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Update the user
        updated_account = user_management_service.update_account(account_id=account_id, update_data=update_data)
        if not updated_account:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Check if the request is from the organization requests page
        # by looking for the fromOrgRequestsPage flag in the update_data
        from_org_requests_page = update_data.fromOrgRequestsPage
        
        # Debug log to verify the flag is being received
        print(f"fromOrgRequestsPage flag: {from_org_requests_page}")
            
        # Only log the activity if the request is NOT from the organization requests page
        if not from_org_requests_page:
            # Determine what changed for the log description
            changes = []
            action = "user_updated"
            
            if original_user.userRole != updated_account.userRole:
                changes.append(f"role from {original_user.userRole} to {updated_account.userRole}")
                action = "role_changed"
                
            if original_user.userEmail != updated_account.userEmail:
                changes.append(f"email to {updated_account.userEmail}")
                
            if original_user.userPhoneNum != updated_account.userPhoneNum:
                changes.append(f"phone number to {updated_account.userPhoneNum}")
                
            # Check for name changes
            if original_user.userFirstName != updated_account.userFirstName or original_user.userLastName != updated_account.userLastName:
                original_name = f"{original_user.userFirstName} {original_user.userLastName}".strip()
                updated_name = f"{updated_account.userFirstName} {updated_account.userLastName}".strip()
                changes.append(f"name from '{original_name}' to '{updated_name}'")
                
            if update_data.passwd:
                changes.append("password")
                action = "password_changed"
                
            if original_user.userSuspend != updated_account.userSuspend:
                if updated_account.userSuspend:
                    action = "user_suspended"
                    changes.append("status to suspended")
                else:
                    action = "user_activated"
                    changes.append("status to active")
                    
            # Log the activity if there were changes
            if changes:
                client_ip = "127.0.0.1"
                if request:
                    client_ip = request.client.host
                    
                description = f"Updated user {updated_account.username}: {', '.join(changes)}"
                
                log_data = ActivityLogBase(
                    user=current_user.username,
                    targetUser=updated_account.username,
                    action=action,
                    description=description,
                    ipAddress=client_ip,
                    userComName=comp
                )
                
                # Save to audit log
                audit_service.add_activity_log(db, log_data, comp)
        else:
            print("Skipping activity logging for organization requests page update")
            
        return updated_account
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

# Add a new endpoint to check user status before login
@router.post("/check-status", response_model=AccountStatusCheck)
def check_status(user_data: Dict[str, Any], db: Session = Depends(get_db), response: Response = None):
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            
        # Extract username and company name from request
        username = user_data.get("username")
        company_name = user_data.get("userComName")
        
        if not username or not company_name:
            raise HTTPException(status_code=400, detail="Username and company name are required")
        
        # Check user status in the database
        status_data = check_user_status(db, username, company_name)
        return status_data
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

# Add OPTIONS method handlers for CORS preflight requests
@router.options("/")
@router.options("/{account_id}")
@router.options("/roles")
@router.options("/check-status")
async def options_handler(response: Response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return {}

