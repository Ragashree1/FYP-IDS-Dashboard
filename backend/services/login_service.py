from database import SessionLocal
from sqlalchemy.orm import Session
from models.models import Account
from models.schemas import AccountBase
from typing import List, Optional, Annotated
from passlib.context import CryptContext
from datetime import timedelta, timezone, datetime
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import APIRouter, Depends, HTTPException


SECRET_KEY = 'IWannaShootMyself'  #Could be anything
ALGORITHM = 'HS256'

bcrypt_context = CryptContext (schemes = ['bcrypt'], deprecated = 'auto') 
# ^Where most password hashing and unhashing is done

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/login/token')

def authenticate_user (userRole:str, username: str, password: str):
    with SessionLocal() as db:
        user = db.query(Account).filter(Account.userid == username).first()
        if not user:
            return False
        if user.userRole != userRole:
            return False
        if not bcrypt_context.verify(password,user.passwd):
            return False
        return user

def create_access_token(userRole:str, username: str, user_id: int, expires_delta: timedelta):
    encode = {'role':userRole, 'sub': username, 'id': user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({'exp':expires})
    return jwt.encode(encode, SECRET_KEY, algorithm= ALGORITHM)

