from fastapi import APIRouter, HTTPException
from starlette import status
from models.schemas import AccountBase, RoleOut
from services import user_management_service
from typing import List

router = APIRouter(prefix="/user-management", tags=["user-management"])

@router.post("/", response_model=AccountBase)
def add_user(user: AccountBase):
    new_user = user_management_service.add_user(user_particulars=user)
    return new_user

@router.get("/", response_model=List[AccountBase])
def fetch_user():# -> Any:
    users = user_management_service.get_all_users()
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
    updated_account = user_management_service.update_account(account_id=account_id, update_data=update_data)
    if not updated_account:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_account
