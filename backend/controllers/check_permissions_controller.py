from fastapi import APIRouter, HTTPException
from starlette import status
from models.schemas import RoleIn,RoleOut,RoleBase,PermissionBase
from services import check_permissions_service
from typing import List

router = APIRouter(prefix="/check-permissions", tags=["check-permissions"])


@router.get("/{username}")
def get_permissions(username: str):
    try:
        permissions = check_permissions_service.get_permissions_for_check(username)
        if permissions is None:
            raise HTTPException(status_code=404, detail="Permissions:User not found")
        return permissions

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))



@router.get("/userrole/{username}")
def get_role(username: str):
    try:
        role = check_permissions_service.get_role_for_check(username)
        if role is None:
            raise HTTPException(status_code=404, detail="Roles:User not found")
        return role

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))