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

SECRET_KEY = 's3cr3tk3y'  #Could be anything
ALGORITHM = 'HS256'

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="login/token")

router = APIRouter(prefix="/login", tags=["login"])

@router.post("/token")
async def login_access_token(user: AccountLogin):
    user = login_service.authenticate_user(user.organisation.name, user.username, user.passwd)
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Credentials")
    
    token = login_service.create_access_token(
        user_id=user.id,
        userRole=user.userRole,
        username=user.username,
        org=user.organisation.name,
        userSuspend=user.userSuspend,
        expires_delta=timedelta(minutes=60),
    )

    login_service.store_token(token,user.id)

    # Return all necessary data for the frontend
    return {
        "access_token": token,
        "token_type": "bearer",
        "userRole": user.userRole,
        "userSuspend": user.userSuspend,
        "username": user.username,
        "org": user.organisation.name, 
    }

@router.post("/delete_token")
async def delete_token(token: str = Depends(oauth2_bearer)):
    delete = login_service.delete_token_in_db(token)

    return {"message": "Token deleted successfully"}

@router.get("/get_token")
async def get_token(token: str = Depends(oauth2_bearer)):

    is_valid = login_service.verify_token_in_db(token)

    if not is_valid:
        raise HTTPException(status_code=403, detail="Invalid token")

    return {"message": "Token is valid"}
     
    
@router.options("/get_token")
async def preflight():
    return {"message": "CORS preflight allowed"}