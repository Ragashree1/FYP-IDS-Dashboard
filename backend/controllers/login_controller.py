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
        
        # Here, you'd fetch the user from the database to ensure the token is valid
        user = login_service.get_user_by_username(username)
        if user is None:
            raise HTTPException(status_code=403, detail="User not found")
        
        if user.userSuspend :
            raise HTTPException(status_code=403, detail="User is suspended")

        # If everything is valid, return a success message
        return {"message": "Token is valid", "user": user.userid}

    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")