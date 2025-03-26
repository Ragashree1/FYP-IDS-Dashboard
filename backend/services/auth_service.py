from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from models.schemas import AccountBase
import os

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")
SECRET_KEY = os.getenv("SECRET_KEY", "s3cr3tk3y")  # Default for safety
ALGORITHM = os.getenv("ALGORITHM", "HS256")

def get_current_user(token: str = Depends(oauth2_scheme)) -> AccountBase:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_data = payload.get("user")
        if not user_data:
            raise HTTPException(status_code=401, detail="Invalid token")
        return AccountBase(**user_data)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_company_name_from_token(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        company_name = payload.get("company")
        if not company_name:
            raise HTTPException(status_code=401, detail="Invalid token: Company name not found")
        return company_name
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
