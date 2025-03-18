from fastapi import APIRouter, HTTPException
from starlette import status
from models.schemas import RoleIn,RoleOut,RoleBase,PermissionBase
from services import role_permission_service
from typing import List

router = APIRouter(prefix="/roles-permission", tags=["roles-permission"])

@router.post("/", response_model=RoleIn)
def add_roles(role: RoleIn):
    new_role = role_permission_service.add_role(role=role)
    return new_role

@router.get("/", response_model=List[RoleOut])
def fetch_roles():# -> Any:
    roles = role_permission_service.get_all_roles()
    return roles

@router.get("/permission", response_model=List[PermissionBase])
def fetch_permission():# -> Any:
    permi = role_permission_service.get_all_permissions()
    return permi

@router.delete("/{role_id}")
def remove_role(role_id: int):
    success = role_permission_service.delete_role(role_id=role_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"User deleted successfully"}

@router.put("/{role_id}", response_model=RoleIn)
def update_role(role_id: int, update_data: RoleIn):
    updated_account = role_permission_service.update_role(role_id=role_id, update_data=update_data)
    if not updated_account:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_account
