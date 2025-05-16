from database import SessionLocal
from models.models import Role, Permission, role_permission_association, Account
from models.schemas import RoleBase,RoleIn,RoleOut,PermissionBase
from typing import List
from sqlalchemy.orm import joinedload

def get_role_for_check(username: str) -> str:

    with SessionLocal() as db: 
        user = db.query(Account).filter(Account.username == username).first()

        if not user:
            raise ValueError(f"User '{username}' not found")

        if not user.role:
            raise ValueError(f"User '{username}' has no role assigned")

        return user.role.roleName


def get_permissions_for_check(username: str) -> List[PermissionBase]:
     
     with SessionLocal() as db: 
        user = db.query(Account).filter(Account.username == username).first()

        if not user:
            raise ValueError(f"User '{username}' not found")

        permissions = user.role.permissions  # list of Permission objects
        
        return [perm.permissionName for perm in permissions]