from typing import List, Annotated
from database import SessionLocal
from models.models import Account
from fastapi import APIRouter, HTTPException, Depends
from starlette import status
from passlib.context import CryptContext
from jose import jwt, JWTError

from models.schemas import AccountBase, AccountLogin
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from services import login_service
from datetime import timedelta, datetime

SECRET_KEY = 'IWannaShootMyself'  #Could be anything
ALGORITHM = 'HS256'

bcrypt_context = CryptContext (schemes = ['bcrypt'], deprecated = 'auto') 
# ^Where most password hashing and unhashing is done

oauth2_bearer = OAuth2PasswordBearer(tokenUrl="login/token")

#change the default value of userRole to "organizational dmin"

router = APIRouter(prefix="/login", tags=["login"])

@router.get("/", response_model=AccountLogin)
def fetch_user(userRole:str, username: str, password: str):
    user = login_service.authenticate_user(userRole, username, password)
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    
    return {
        "id": user.id,
        "userRole": user.userRole,
        #"passwd": user.passwd  # You probably don’t want to return this for security reasons
    }


@router.post("/token")
async def login_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    with SessionLocal() as db:
        user = db.query(Account).filter(Account.userid == form_data.username).first()
        if not user or not bcrypt_context.verify(form_data.password, user.passwd):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

    token = login_service.create_access_token(
        userRole=user.userRole,  # Ensure userRole is passed correctly
        username=user.userid,
        user_id=user.id,
        expires_delta=timedelta(minutes=20),
    )

    return {"access_token": token, "token_type": "bearer"}

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
        
        # If everything is valid, return a success message
        return {"message": "Token is valid", "user": user.userid}

    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")