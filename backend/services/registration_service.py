from database import SessionLocal
from models.models import Account
from models.schemas import AccountBase
from typing import List, Optional, Annotated
from passlib.context import CryptContext
from datetime import timedelta, timezone, datetime
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import APIRouter, Depends, HTTPException


SECRET_KEY = 's3cr3tk3y'  #Could be anything
ALGORITHM = 'HS256'

bcrypt_context = CryptContext (schemes = ['bcrypt'], deprecated = 'auto') 
# ^Where most password hashing and unhashing is done

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/token')

def add_user(user_particulars: AccountBase):
    with SessionLocal() as db:
        try:
            # Remove empty id if present
            if hasattr(user_particulars, 'id'):
                delattr(user_particulars, 'id')
            
            # Create a dict of user particulars and hash the password
            hashed_password = bcrypt_context.hash(user_particulars.passwd)
            user_data = user_particulars.model_dump()
            user_data.pop("passwd", None)
            create_user = Account(**user_data,passwd=hashed_password)
            db.add(create_user)
            db.commit()
            db.refresh(create_user)
                
            return create_user
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=422, detail=str(e))
        finally:
            db.close()


def create_access_token(username: str, user_id: str, userRole: str, userComName: str, userSuspend: bool, expires_delta: timedelta):
    payload = {
        "sub": username,  # Username
        "id": user_id,  # User ID
        "role": userRole,  # User Role
        "company": userComName,  # Company Name
        "suspend": userSuspend,  # Suspension Status
        "exp": datetime.utcnow() + expires_delta  # Expiration Time
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: Annotated[str,Depends(oauth2_bearer)]):
   try:
       payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
       username: str = payload.get('sub','')
       user_id: int = payload.get('id','-1')
       if username is None or user_id is None:
        raise 
       
       return {'username':username,'id':user_id}    
   except JWTError: #JWTError is the error raised for when the payload= jwt.decode line fails to decode
      raise HTTPException(status_code=401, detail="Invalid token")