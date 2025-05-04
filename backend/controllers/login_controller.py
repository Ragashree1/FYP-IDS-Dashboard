# controllers/login_controller.py
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from database import get_db
from models.schemas import Token, AccountBase, AccountLogin, RoleBase, AccountStatusCheck
from services.login_service import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user
from jose import jwt, JWTError
import os
from models.models import Account

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")  
ALGORITHM = os.getenv("ALGORITHM", "HS256")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="login/token")

router = APIRouter(prefix="/login", tags=["login"])

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: AccountLogin, db: Session = Depends(get_db), response: Response = None):
    # Set CORS headers explicitly
    if response:
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    
    try:
        # Check if user exists and get status
        user_status = check_user_status(db, form_data.username, form_data.userComName)
        
        # Only check for rejected status, not suspended status
        if user_status.exists and user_status.userRejected:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Your account request has been rejected. Please contact your administrator.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # If user is not rejected or doesn't exist, proceed with authentication
        user = authenticate_user(db, form_data.username, form_data.passwd, form_data.userComName)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        # Create token with user data including organization_id
        access_token = create_access_token(
            data={"sub": user.username, "company": user.userComName, "organization_id": user.organization_id},
            user=user,
            expires_delta=access_token_expires
        )
        
        # Return token and user data including organization_id
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "userRole": user.userRole,
            "username": user.username,
            "userComName": user.userComName,
            "userEmail": user.userEmail,
            "orgId": user.organization_id  # Include organization_id in response
        }
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

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

@router.get("/get_token")
async def get_token():
    return {"message": "Token check skipped for testing"}

@router.get("/validate_token")
async def validate_token(token: str):
    """
    Protected route to validate the user's access token.
    """
    try:
        # Decode the token using the secret key and algorithm
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=403, detail="Invalid token")
        
        # Get user data from payload
        user_data = payload.get("user", {})
        if not user_data:
            raise HTTPException(status_code=403, detail="Invalid token")
            
        # Check if user is suspended
        if user_data.get("userSuspend", False):
            raise HTTPException(status_code=403, detail="User is suspended")
            
        # If everything is valid, return a success message
        return {"message": "Token is valid", "user": username}
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")

# Add OPTIONS method handler for CORS preflight requests
@router.options("/token")
async def options_token(response: Response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return {}