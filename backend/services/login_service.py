# services/login_service.py
from database import SessionLocal
from sqlalchemy.orm import Session
from models.models import Account, Role
from models.schemas import AccountBase, RoleBase, RoleIn, RoleOut, AccountStatusCheck
from typing import List, Optional, Dict, Any
from passlib.context import CryptContext
from datetime import timedelta, timezone, datetime
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import APIRouter, Depends, HTTPException, status
import os

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")  
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

bcrypt_context = CryptContext (schemes = ['bcrypt'], deprecated = 'auto') 
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")
# ^Where most password hashing and unhashing is done

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/login/token')

def authenticate_user(db: Session, username: str, password: str, userComName: str):
    """Authenticate a user by username, password, and company name"""
    user = db.query(Account).filter(
        Account.username == username, 
        Account.userComName == userComName
    ).first()

    if not user:
        return False
    
    if not bcrypt_context.verify(password, user.passwd):
        return False

    return user

def create_access_token(data: Dict[str, Any], user: Account, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token with user data including organization_id"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add user data to token
    user_data = {
        "id": user.id,
        "username": user.username,
        "userComName": user.userComName,
        "userRole": user.userRole,
        "userFirstName": user.userFirstName,
        "userLastName": user.userLastName,
        "userEmail": user.userEmail,
        "userPhoneNum": user.userPhoneNum,
        "userSuspend": user.userSuspend,
        "organization_id": user.organization_id  # Include organization_id
    }
    
    # Add userRejected if it exists
    if hasattr(user, 'userRejected'):
        user_data["userRejected"] = user.userRejected
    
    to_encode.update({"user": user_data, "exp": expire})
    
    # Create and return the encoded token
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user_by_username(username: str):
    with SessionLocal() as db:   
        return db.query(Account).filter(Account.username == username).first()       

def get_current_user(token: str = Depends(oauth2_scheme)) -> Account:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Decoded payload: {payload}")
        username: str = payload.get("sub")
        user_id: str = payload.get("id")
        with SessionLocal() as db:
            user = db.query(Account).filter(Account.username == username).first()
            print(f"Fetched user: {username}")
            print(f"User ID: {user_id}")
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            return user
       
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
