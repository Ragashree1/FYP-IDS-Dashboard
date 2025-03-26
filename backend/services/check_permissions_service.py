from database import SessionLocal
from models.models import Role, Permission, role_permission_association,Account
from typing import List, Optional, Annotated
from passlib.context import CryptContext
from datetime import timedelta, timezone, datetime
from jose import jwt, JWTError

from fastapi import APIRouter, Depends, HTTPException


def get_permissions_for_check(user_name: str):
    with SessionLocal() as db:  
        user = db.query(Account).filter(Account.username == user_name).first()
        if user and user.role:
            return [perm.permissionName for perm in user.role.permissions]
        return None  # Or return an empty list []

