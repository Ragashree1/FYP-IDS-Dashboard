from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
from models.schemas import Token, AccountLogin
from services.auth_service import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, check_user_status

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

# Add OPTIONS method handler for CORS preflight requests
@router.options("/token")
async def options_token(response: Response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return {}