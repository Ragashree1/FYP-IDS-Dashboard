from fastapi import APIRouter, HTTPException, Depends, Header
from starlette import status
from models.schemas import AccountBase, RoleOut
from services import user_management_service
from typing import List
from services.auth_service import get_company_name_from_token  # Assuming you have a function to get the company name from the token

router = APIRouter(prefix="/user-management", tags=["user-management"])

def get_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    return authorization.split("Bearer ")[1]  # Extract the token

@router.post("/", response_model=AccountBase)
def add_user(
    user: AccountBase,
    token: str = Depends(get_token),
):
    try:
        comp = get_company_name_from_token(token)  
        
        # Set the company name from the token
        user.userComName = comp
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
def fetch_user(company_name: str = Depends(get_company_name_from_token)):
    users = user_management_service.get_all_users(company_name=company_name)
    return users

@router.get("/roles", response_model=List[RoleOut])
def fetch_roles():# -> Any:
    roles = user_management_service.get_all_roles()
    return roles

@router.delete("/{account_id}")
def remove_user(account_id: int):
    success = user_management_service.delete_user(account_id=account_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"message": "User deleted successfully"}

@router.put("/{account_id}", response_model=AccountBase)
def modify_account(account_id: int, update_data: AccountBase):
    try:
        # Ensure the account ID matches the one in the request body
        if update_data.id != account_id:
            raise HTTPException(status_code=400, detail="Account ID mismatch")

        updated_account = user_management_service.update_account(account_id=account_id, update_data=update_data)
        if not updated_account:
            raise HTTPException(status_code=404, detail="User not found")
        return updated_account
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
