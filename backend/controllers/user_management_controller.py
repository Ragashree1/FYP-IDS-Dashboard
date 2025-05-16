from fastapi import APIRouter, Depends, HTTPException, Request, Response, Header
from typing import List, Optional, Dict, Any
from models.schemas import AccountBase, RoleOut, ActivityLogBase, AccountStatusCheck
from services import user_management_service, audit_service
from services.auth_service import get_company_name_from_token, check_user_status, get_current_user

router = APIRouter(prefix="/user-management", tags=["user-management"])

ORG_ADMIN_ROLE_ID = 1
NETWORK_ADMIN_ROLE_ID = 2
IT_MANAGER_ROLE_ID = 3
Data_Analyst_ROLE_ID = 4

def get_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    return authorization.split("Bearer ")[1]

async def get_org_id(token: str) -> int:
    """Get organization ID from user token"""
    try:
        current_user = get_current_user(token)
        return current_user.organization_id
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting organization ID: {str(e)}")

@router.post("/", response_model=AccountBase)
async def add_user(
    user: AccountBase,
    token: str = Depends(get_token)
):
    try:
        current_user = get_current_user(token)
        
        # Use the organization_id provided in the user object directly
        new_user = user_management_service.add_user(user_particulars=user)
        
        # Create activity log using the organization_id from the new user
        log_data = ActivityLogBase(
            user=current_user.username,
            targetUser=new_user.username,
            action="user_created",
            description=f"Created new user account: {new_user.username}",
            organization_id=new_user.organization_id
        )
        audit_service.add_activity_log(log_data)
        
        return new_user
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/", response_model=List[AccountBase])
def fetch_user(
    token: str = Depends(get_token),
):
    try:
        current_user = get_current_user(token)
        # Use organization_id instead of company_name
        if current_user.userRole == 1:  # Organization Admin
            users = user_management_service.get_users_by_org_id(current_user.organization_id)
        else:
            users = user_management_service.get_all_users_for_admin()
        return users
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching users: {str(e)}"
        )

@router.get("/roles", response_model=List[RoleOut])
def fetch_roles(
    token: str = Depends(get_token),
):
    try:
        try:
            roles = user_management_service.get_all_roles()
        except Exception as db_error:
            print(f"Database error fetching roles: {str(db_error)}")
            return [
                RoleOut(id=ORG_ADMIN_ROLE_ID, roleName="Organisation Admin"),
                RoleOut(id=NETWORK_ADMIN_ROLE_ID, roleName="Network Admin"),
                RoleOut(id=IT_MANAGER_ROLE_ID, roleName="IT Manager")
            ]
        has_org_admin = False
        has_network_admin = False
        has_it_manager = False
        processed_roles = []
        for role in roles:
            if role.id == ORG_ADMIN_ROLE_ID:
                has_org_admin = True
                processed_roles.append(RoleOut(id=ORG_ADMIN_ROLE_ID, roleName="Organisation Admin"))
            elif role.id == NETWORK_ADMIN_ROLE_ID:
                has_network_admin = True
                processed_roles.append(RoleOut(id=NETWORK_ADMIN_ROLE_ID, roleName="Network Admin"))
            elif role.id == IT_MANAGER_ROLE_ID:
                has_it_manager = True
                processed_roles.append(RoleOut(id=IT_MANAGER_ROLE_ID, roleName="IT Manager"))
            else:
                processed_roles.append(role)
        if not has_org_admin:
            processed_roles.append(RoleOut(id=ORG_ADMIN_ROLE_ID, roleName="Organisation Admin"))
        if not has_network_admin:
            processed_roles.append(RoleOut(id=NETWORK_ADMIN_ROLE_ID, roleName="Network Admin"))
        if not has_it_manager:
            processed_roles.append(RoleOut(id=IT_MANAGER_ROLE_ID, roleName="IT Manager"))
        return processed_roles
    except Exception as e:
        print(f"Error in fetch_roles: {str(e)}")
        return [
            RoleOut(id=ORG_ADMIN_ROLE_ID, roleName="Organisation Admin"),
            RoleOut(id=NETWORK_ADMIN_ROLE_ID, roleName="Network Admin"),
            RoleOut(id=IT_MANAGER_ROLE_ID, roleName="IT Manager")
        ]

@router.get("/{user_id}", response_model=AccountBase)
def get_user_by_id(
    user_id: int,
    token: str = Depends(get_token),
):
    try:
        user = user_management_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        print(f"Error in get_user_by_id endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.put("/{user_id}", response_model=AccountBase)
def modify_account(
    user_id: int, 
    update_data: AccountBase, 
    token: str = Depends(get_token),
):
    try:
        current_user = get_current_user(token)
        if update_data.id != user_id:
            raise HTTPException(status_code=400, detail="Account ID mismatch")
        original_user = user_management_service.get_user_by_id(user_id)
        if not original_user:
            raise HTTPException(status_code=404, detail="User not found")
        updated_account = user_management_service.update_account(account_id=user_id, update_data=update_data)
        if not updated_account:
            raise HTTPException(status_code=404, detail="User not found")
        # Only log the activity if not from org requests page
        from_org_requests_page = getattr(update_data, 'fromOrgRequestsPage', False)
        if not from_org_requests_page:
            changes = []
            action = "user_updated"
            if original_user.userRole != updated_account.userRole:
                changes.append(f"role from {original_user.userRole} to {updated_account.userRole}")
                action = "role_changed"
            if original_user.userEmail != updated_account.userEmail:
                changes.append(f"email to {updated_account.userEmail}")
            if original_user.userPhoneNum != updated_account.userPhoneNum:
                changes.append(f"phone number to {updated_account.userPhoneNum}")
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
            if changes:
                description = f"Updated user {updated_account.username}: {', '.join(changes)}"
                log_data = ActivityLogBase(
                    user=current_user.username,
                    targetUser=updated_account.username,
                    action=action,
                    description=description,
                    organization_id=updated_account.organization_id
                )
                audit_service.add_activity_log(log_data)
        return updated_account
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}")
def remove_user(
    user_id: int, 
    token: str = Depends(get_token)
):
    try:
        current_user = get_current_user(token)
        user_to_delete = user_management_service.get_user_by_id(user_id)
        if not user_to_delete:
            raise HTTPException(status_code=404, detail="User not found.")
        success = user_management_service.delete_user(account_id=user_id)
        if not success:
            raise HTTPException(status_code=404, detail="User not found.")
        log_data = ActivityLogBase(
            user=current_user.username,
            targetUser=user_to_delete.username,
            action="user_deleted",
            description=f"Deleted user account: {user_to_delete.username}",
            organization_id=user_to_delete.organization_id
        )
        audit_service.add_activity_log(log_data)
        return {"message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/check-status", response_model=AccountStatusCheck)
def check_status(user_data: Dict[str, Any]):
    try:
        username = user_data.get("username")
        company_name = user_data.get("userComName")
        if not username or not company_name:
            raise HTTPException(status_code=400, detail="Username and company name are required")
        status_data = check_user_status(username, company_name)
        return status_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))