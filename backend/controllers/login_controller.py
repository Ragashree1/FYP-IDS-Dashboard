from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from database import get_db
from models.schemas import Token, AccountBase, AccountLogin, RoleBase
from services.auth_service import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, check_user_status
from jose import jwt, JWTError
import os

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
        # First check if the user exists and their status
        status_data = check_user_status(db, form_data.username, form_data.userComName)
        
        # Only check for rejected status, not suspended status
        if status_data.exists and status_data.userRejected:
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
        
        # Create token with user data
        user_data = {
            "id": user.id,
            "username": user.username,
            "userComName": user.userComName,
            "userRole": user.userRole,
            "userFirstName": user.userFirstName,
            "userLastName": user.userLastName,
            "userEmail": user.userEmail,
            "userPhoneNum": user.userPhoneNum,
            "userSuspend": user.userSuspend
        }
        
        # Add userRejected if it exists
        if hasattr(user, 'userRejected'):
            user_data["userRejected"] = user.userRejected
        
        access_token = create_access_token(
            data={"user": user_data, "company": user.userComName},
            expires_delta=access_token_expires
        )
        
        # Return token and user data
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "userRole": user.userRole,
            "username": user.username,
            "userComName": user.userComName
        }
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.get("/get_token")
async def get_token(token: str = Depends(oauth2_bearer)):
    """
    Protected route to validate the user's access token.
    """
    try:
        print(f"Validating token with SECRET_KEY: {SECRET_KEY} and ALGORITHM: {ALGORITHM}")
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
            
        print('Payload:', payload)
        print('isvalid')
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