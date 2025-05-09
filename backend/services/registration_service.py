from database import SessionLocal
from models.models import Account,Organisation
from models.schemas import AccountBase
from typing import List, Optional, Annotated
from passlib.context import CryptContext
from datetime import timedelta, timezone, datetime
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import joinedload


SECRET_KEY = 's3cr3tk3y'  #Could be anything
ALGORITHM = 'HS256'

bcrypt_context = CryptContext (schemes = ['bcrypt'], deprecated = 'auto') 
# ^Where most password hashing and unhashing is done

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/token')

def add_user(user_particulars: AccountBase):
    with SessionLocal() as db:
        try:
            # Access the nested organisation name correctly
            org_name = user_particulars.organisation.name.lower().strip()
            if not org_name:
                raise HTTPException(
                    status_code=400, 
                    detail="Organisation name cannot be empty."
                )
            
            org = db.query(Organisation).filter(Organisation.name == org_name).first()
            if not org:
                org = Organisation(name=org_name)
                db.add(org)
                db.commit()
                db.refresh(org)

            # Check if user with same username and company exists
            existing_user = db.query(Account).filter(Account.username == user_particulars.username,Account.organisation_id == org.id).first()
            if existing_user:
                raise HTTPException(
                status_code=400,
                detail=f"User with username '{user_particulars.username}' already exists in company '{user_particulars.userComName}'"
            )


            # Create a dict of user particulars and hash the password
            hashed_password = bcrypt_context.hash(user_particulars.passwd)
            user_data = user_particulars.model_dump()
            user_data.pop("passwd", None)
            user_data.pop("organisation", None)
            create_user = Account(**user_data,passwd=hashed_password,organisation_id=org.id)
            db.add(create_user)
            db.commit()
            db.refresh(create_user)
                
            user_with_org = db.query(Account).options(joinedload(Account.organisation)).filter_by(id=create_user.id).first()
            return user_with_org

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