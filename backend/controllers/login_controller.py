<<<<<<< Updated upstream
from typing import List, Annotated
from database import SessionLocal
from models.models import Account
from fastapi import APIRouter, HTTPException, Depends
from starlette import status
from passlib.context import CryptContext
from jose import jwt, JWTError

from models.schemas import AccountBase, AccountLogin, RoleBase
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from services import login_service
from datetime import timedelta, datetime

SECRET_KEY = 'IWannaShootMyself'  #Could be anything
ALGORITHM = 'HS256'

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="login/token")

router = APIRouter(prefix="/login", tags=["login"])

@router.post("/token")
async def login_access_token(user: AccountLogin):

    user = login_service.authenticate_user(user.userComName, user.userid, user.passwd)
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Credentials")
    
    token = login_service.create_access_token(
        user_id=user.id,
        userRole=user.userRole,
        username=user.userid,
        userComName=user.userComName,
        userSuspend=user.userSuspend,
        expires_delta=timedelta(minutes=15),
    )

    return {"access_token": token, "token_type": "bearer","userRole": user.userRole,"userSuspend":user.userSuspend}

@router.get("/get_token")
async def get_token(token: str = Depends(oauth2_bearer)):
    """
    Protected route to validate the user's access token.
    """
    try:
        # Decode the token using the secret key and algorithm
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=403, detail="Invalid token")
=======
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
>>>>>>> Stashed changes
        
        # If user exists and is suspended, prevent login with appropriate message
        if status_data.exists and status_data.userSuspend:
            if status_data.userRejected:
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
        
<<<<<<< Updated upstream
        if user.userSuspend :
            raise HTTPException(status_code=403, detail="User is suspended")

        # If everything is valid, return a success message
        return {"message": "Token is valid", "user": user.userid}

    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")
=======
        # If user is not suspended or doesn't exist, proceed with authentication
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
>>>>>>> Stashed changes
