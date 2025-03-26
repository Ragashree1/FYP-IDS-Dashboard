from fastapi import APIRouter, HTTPException
from starlette import status
from models.schemas import RoleIn,RoleOut,RoleBase,PermissionBase
from services import check_permissions_service
from typing import List

router = APIRouter(prefix="/check-permissions", tags=["check-permissions"])


@router.get("/{username}")
def get_permissions(username: str):
    permissions = check_permissions_service.get_permissions_for_check(username)
    if permissions is None:
        raise HTTPException(status_code=404, detail="User not found")
    return permissions