from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Depends, status
from sqlalchemy.orm import Session
from database import get_db
from models.models import Account
import os
from fastapi.security import OAuth2PasswordBearer
from models.schemas import AccountBase, AccountStatusCheck

# Secret key for JWT token
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")  # In production, use a secure key and store it in environment variables
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login/token")

def verify_password(plain_password, hashed_password):
    try:
        # First try with the standard verify method
        return pwd_context.verify(plain_password, hashed_password)
    except ValueError as e:
        # If there's an error, log it and return False
        print(f"Password verification error: {str(e)}")
        return False

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(db: Session, username: str, password: str, company_name: str):
    user = db.query(Account).filter(
        Account.username == username,
        Account.userComName == company_name
    ).first()
    
    if not user:
        return False
    
    # Check if the user is suspended or pending approval
    if user.userSuspend:
        # Check if the user has been rejected
        if hasattr(user, 'userRejected') and user.userRejected:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Your account request has been rejected. Please contact your administrator.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is pending approval. Please wait for administrator approval.",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    if not verify_password(password, user.passwd):
        return False
    
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)) -> AccountBase:
    # Check if it's the mock token for platform admin
    if token == "mock-token-for-platform-admin":
        # Return a mock platform admin user
        return AccountBase(
            id=0,
            username="test",
            userComName="secuboard",
            userRole=1,  # Assuming 1 is admin role
            userFirstName="Platform",
            userLastName="Admin",
            userEmail="admin@secuboard.com",
            userPhoneNum="",
            userSuspend=False,
            userRejected=False
        )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_data = payload.get("user")
        if not user_data:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Create user object from token data
        user = AccountBase(**user_data)
        
        # Check if user is suspended or rejected
        if user.userSuspend:
            if hasattr(user, 'userRejected') and user.userRejected:
                raise HTTPException(
                    status_code=401, 
                    detail="Your account request has been rejected. Please contact your administrator."
                )
            else:
                raise HTTPException(
                    status_code=401, 
                    detail="Account is pending approval. Please wait for administrator approval."
                )
                
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Add a function to check user status without logging in
def check_user_status(db: Session, username: str, company_name: str) -> AccountStatusCheck:
    user = db.query(Account).filter(
        Account.username == username,
        Account.userComName == company_name
    ).first()
    
    if not user:
        return AccountStatusCheck(
            exists=False,
            userSuspend=False,
            userRejected=False
        )
    
    # Check if userRejected attribute exists
    user_rejected = False
    if hasattr(user, 'userRejected'):
        user_rejected = user.userRejected
    
    return AccountStatusCheck(
        exists=True,
        userSuspend=user.userSuspend,
        userRejected=user_rejected
    )

def get_company_name_from_token(token: str = Depends(oauth2_scheme)) -> str:
    # Check if it's the mock token for platform admin
    if token == "mock-token-for-platform-admin":
        return "secuboard"
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        company_name = payload.get("company")
        if not company_name:
            raise HTTPException(status_code=401, detail="Invalid token: Company name not found")
        return company_name
    except JWTError:
        # Double check if it's our mock token (in case it was passed directly)
        if token == "mock-token-for-platform-admin":
            return "secuboard"
        raise HTTPException(status_code=401, detail="Invalid token")