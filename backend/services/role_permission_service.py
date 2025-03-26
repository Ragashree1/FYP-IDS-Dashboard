from database import SessionLocal
from models.models import Role, Permission, role_permission_association,Account
from models.schemas import RoleBase,RoleIn,RoleOut,PermissionBase
from typing import List, Optional, Annotated
from passlib.context import CryptContext
from datetime import timedelta, timezone, datetime
from jose import jwt, JWTError

from fastapi import APIRouter, Depends, HTTPException



def add_role(role: RoleIn):
    with SessionLocal() as db: 
        create_role = Role(roleName=role.roleName)# Ragashree asked for default value as 'organizational-admin', putting system-admin, if wrong rmb to change
        for permission_id in role.permission_id:
            permission = db.query(Permission).filter(Permission.id == permission_id).first()
            if permission:
                create_role.permissions.append(permission)
        
        db.add(create_role)
        db.commit()
        db.refresh(create_role)
        return create_role
    
def get_all_roles() -> List[RoleOut]:
    with SessionLocal() as db:  
        roles = db.query(Role).all()
        return [RoleOut.model_validate(role, from_attributes=True) for role in roles]
    

def get_all_permissions() -> List[PermissionBase]:
    with SessionLocal() as db:  
        permissions = db.query(Permission).all()
        return [PermissionBase.model_validate(permission, from_attributes=True) for permission in permissions]
    
def delete_role(role_id: int) -> bool:
    with SessionLocal() as db: 
        role = db.query(Role).filter(Role.id == role_id).first()
        if role:
             # Remove the role reference from all users before deleting the role
            #db.query(Account).filter(Account.userRole == role_id).update({"userRole": None})
            role.permissions = []  # Remove associations first
            db.delete(role)
            db.commit()
            return True
        return False

def get_permissions_for_check(user_name: str):
    with SessionLocal() as db:  
        user = db.query(Account).filter(Account.username == user_name).first()
        if user and user.role:
            return [perm.permissionName for perm in user.role.permissions]
        return None  # Or return an empty list []


def update_role(role_id: int, update_data: RoleIn):
    with SessionLocal() as db:  
        role = db.query(Role).filter(Role.id == role_id).first()

        if update_data.roleName:
            role.roleName = update_data.roleName

        
        #if update_data.permission_id is not None:
         #   role.permissions = db.query(Permission).filter(Permission.id.in_(update_data.permission_id)).all()
        print(f"Current permissions for role ID {role_id}: {[permission.id for permission in role.permissions]}")
        print(f"Current permissions for role ID {role_id}: {update_data.permission_id}")
        
        if update_data.permission_id:
            # Ensure existing permissions are fully cleared
            role.permissions.clear()
            db.commit()  # Force the DB to update before adding new ones

            # Fetch new permissions based on IDs
            new_permissions = db.query(Permission).filter(Permission.id.in_(update_data.permission_id)).all()

            print(f"Fetched new permissions: {[p.id for p in new_permissions]}")

            # Assign new permissions
            role.permissions = new_permissions

        if not role:
                return None

        db.commit()
        db.refresh(role)

        print(f"Updated permissions for role ID {role_id}: {[permission.id for permission in role.permissions]}")
        updated_role = RoleIn(**role.__dict__)
        return RoleIn.model_validate(updated_role)


