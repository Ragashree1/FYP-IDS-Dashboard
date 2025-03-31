from fastapi import APIRouter, HTTPException, Depends, Header, Response
from starlette import status
from models.schemas import AccountBase, RoleOut, AccountStatusCheck
from services import user_management_service
from typing import List, Dict, Any
from services.auth_service import get_company_name_from_token, check_user_status
from database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/user-management", tags=["user-management"])

# Role IDs
ORG_ADMIN_ROLE_ID = 1
NETWORK_ADMIN_ROLE_ID = 2

def get_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    return authorization.split("Bearer ")[1]  # Extract the token

@router.post("/", response_model=AccountBase)
def add_user(
    user: AccountBase,
    token: str = Depends(get_token),
    response: Response = None,
):
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            
        comp = get_company_name_from_token(token)  
        
        # Set the company name from the token
        user.userComName = comp
        
        # Note: We're not forcing userSuspend to be True here anymore
        # The frontend will set the appropriate value
        # For users created in user management page, userSuspend will be False
        # For users created in registration page, userSuspend will be True
        
        # Add the user with the role they were assigned
        new_user = user_management_service.add_user(user_particulars=user)
        return new_user
    except HTTPException as e:
        raise e
    except Exception as e:
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
            
        # Check if the request is from the platform admin
        if company_name == "secuboard":
            # If it's the platform admin, return all users
            users = user_management_service.get_all_users_for_admin()
        else:
            # Otherwise, filter by company name
            users = user_management_service.get_all_users(company_name=company_name)
                    
        return users
    except Exception as e:
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
            
        roles = user_management_service.get_all_roles()
        
        # Ensure we have at least the basic roles
        has_org_admin = False
        has_network_admin = False
        
        for role in roles:
            if role.id == ORG_ADMIN_ROLE_ID:
                role.roleName = "Organisation Admin"
                has_org_admin = True
            elif role.id == NETWORK_ADMIN_ROLE_ID:
                role.roleName = "Network Admin"
                has_network_admin = True
        
        # Add missing roles if needed
        if not has_org_admin:
            roles.append(RoleOut(id=ORG_ADMIN_ROLE_ID, roleName="Organisation Admin"))
        if not has_network_admin:
            roles.append(RoleOut(id=NETWORK_ADMIN_ROLE_ID, roleName="Network Admin"))
            
        return roles
    except Exception as e:
        # Return default roles if there's an error
        return [
            RoleOut(id=ORG_ADMIN_ROLE_ID, roleName="Organisation Admin"),
            RoleOut(id=NETWORK_ADMIN_ROLE_ID, roleName="Network Admin")
        ]

@router.delete("/{account_id}")
def remove_user(account_id: int, response: Response = None):
    # Set CORS headers
    if response:
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        
    success = user_management_service.delete_user(account_id=account_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"message": "User deleted successfully"}

@router.put("/{account_id}", response_model=AccountBase)
def modify_account(account_id: int, update_data: AccountBase, response: Response = None):
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            
        # Ensure the account ID matches the one in the request body
        if update_data.id != account_id:
            raise HTTPException(status_code=400, detail="Account ID mismatch")
            
        # Get the company name from the user data
        company_name = update_data.userComName
        
        # No need to force a specific role - let the UI handle role selection
        updated_account = user_management_service.update_account(account_id=account_id, update_data=update_data)
        if not updated_account:
            raise HTTPException(status_code=404, detail="User not found")
        return updated_account
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add a new endpoint to check user status before login
@router.post("/check-status", response_model=AccountStatusCheck)
def check_status(user_data: Dict[str, Any], db: Session = Depends(get_db), response: Response = None):
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            
        # Extract username and company name from request
        username = user_data.get("username")
        company_name = user_data.get("userComName")
        
        if not username or not company_name:
            raise HTTPException(status_code=400, detail="Username and company name are required")
        
        # Check user status in the database
        status_data = check_user_status(db, username, company_name)
        return status_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add OPTIONS method handlers for CORS preflight requests
@router.options("/")
@router.options("/{account_id}")
@router.options("/roles")
@router.options("/check-status")
async def options_handler(response: Response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return {}