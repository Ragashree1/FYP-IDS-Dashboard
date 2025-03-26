from database import SessionLocal
from sqlalchemy.orm import Session
from models.models import Account,Role
from models.schemas import AccountBase,RoleBase,RoleIn,RoleOut
from typing import List, Optional, Annotated
from passlib.context import CryptContext
from datetime import timedelta, timezone, datetime
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import APIRouter, Depends, HTTPException


SECRET_KEY = 's3cr3tk3y'  # Ensure this matches the SECRET_KEY in main.py
ALGORITHM = 'HS256'  # Ensure this matches the ALGORITHM in main.py

bcrypt_context = CryptContext (schemes = ['bcrypt'], deprecated = 'auto') 
# ^Where most password hashing and unhashing is done

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/login/token')

def authenticate_user (userComName:str, username: str, password: str):
    with SessionLocal() as db:
        user = db.query(Account).filter(Account.username == username, Account.userComName == userComName).first()

        if not user:
            return False
        if not bcrypt_context.verify(password,user.passwd):
            return False
        return user
    

def create_access_token(username: str, user_id: str, userRole: str, userComName: str, userSuspend: bool, expires_delta: timedelta):
    payload = {
        "username": username,  # Username
        "id": user_id,  # User ID
        "role": userRole,  # User Role
        "company": userComName,  # Company Name
        "suspend": userSuspend,  # Suspension Status
        "exp": datetime.utcnow() + expires_delta  # Expiration Time
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_user_by_username(username: str):
    with SessionLocal() as db:   
        return db.query(Account).filter(Account.username == username).first()       