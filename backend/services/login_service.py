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

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
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

def get_current_user(token: str = Depends(oauth2_bearer)):
    """Get the current user from a JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        
        # Get user data from payload
        user_data = payload.get("user", {})
        if not user_data:
            raise credentials_exception
        
        # Check if user is suspended
        if user_data.get("userSuspend", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is suspended",
            )
        
        return user_data
    except JWTError:
        raise credentials_exception

def check_user_status(db: Session, username: str, userComName: str) -> AccountStatusCheck:
    """Check if a user exists and get their status"""
    user = db.query(Account).filter(
        Account.username == username,
        Account.userComName == userComName
    ).first()
    
    if not user:
        return AccountStatusCheck(exists=False, userSuspend=False, userRejected=False)
    
    return AccountStatusCheck(
        exists=True,
        userSuspend=user.userSuspend,
        userRejected=getattr(user, 'userRejected', False)
    )

def get_user_by_username(db: Session, username: str, userComName: str):
    """Get a user by username and company name"""
    return db.query(Account).filter(
        Account.username == username,
        Account.userComName == userComName
    ).first()