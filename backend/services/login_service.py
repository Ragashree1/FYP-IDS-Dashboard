from database import SessionLocal
from sqlalchemy.orm import Session
from models.models import Account, Role
from models.schemas import AccountBase, RoleBase, RoleIn, RoleOut
from typing import List, Optional, Annotated
from passlib.context import CryptContext
from datetime import timedelta, timezone, datetime
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import APIRouter, Depends, HTTPException


SECRET_KEY = 'your_secret_key'
ALGORITHM = 'HS256'

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto') 
# ^Where most password hashing and unhashing is done

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/login/token')

def authenticate_user(userComName: str, username: str, password: str):
    with SessionLocal() as db:
        user = db.query(Account).filter(Account.userid == username, Account.userComName == userComName).first()

        if not user:
            return False
        
        # We'll check suspension status in the controller to provide better error messages
        if not bcrypt_context.verify(password, user.passwd):
            return False
        return user
    

def create_access_token(userComName: str,userRole:int, username: str, user_id: int,userSuspend :bool, expires_delta: Optional[timedelta] = None):
    encode = {'com':userComName,'role':userRole, 'sub': username, 'id': user_id,'suspend':userSuspend}
    if expires_delta:
        expires = datetime.now(timezone.utc) + expires_delta
    else:
        expires = datetime.now(timezone.utc) + timedelta(minutes=15)
    encode.update({'exp':expires})
    return jwt.encode(encode, SECRET_KEY, algorithm= ALGORITHM)

def get_user_by_username(username: str):
<<<<<<< Updated upstream
    with SessionLocal() as db:
        return db.query(Account).filter(Account.userid == username).first()
=======
    with SessionLocal() as db:   
        return db.query(Account).filter(Account.username == username).first()
>>>>>>> Stashed changes
