from database import SessionLocal
from models.models import Account, Role, Organization
from models.schemas import AccountBase
from typing import List, Optional  # Removed Annotated
from passlib.context import CryptContext
from datetime import timedelta, timezone, datetime
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import APIRouter, Depends, HTTPException
import os

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")


bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto') 
# ^Where most password hashing and unhashing is done

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/token')

def add_user(user_particulars: AccountBase):
    with SessionLocal() as db:
        try:
            # Check if username already exists for this company
            existing_user = db.query(Account).filter(
                Account.username == user_particulars.username,
                Account.userComName == user_particulars.userComName
            ).first()
            
            if existing_user:
                raise HTTPException(status_code=400, detail="Username already exists for this company")
            
            # Check if email already exists
            existing_email = db.query(Account).filter(
                Account.userEmail == user_particulars.userEmail
            ).first()
            
            if existing_email:
                raise HTTPException(status_code=400, detail="Email already registered")
            
            # Verify that the role exists
            role = db.query(Role).filter(Role.id == user_particulars.userRole).first()
            if not role:
                # If role doesn't exist, use a default role or create one
                default_role = db.query(Role).filter(Role.id == 1).first()
                if not default_role:
                    # Create a default role if it doesn't exist
                    default_role = Role(id=1, roleName="User")
                    db.add(default_role)
                    db.commit()
                user_particulars.userRole = 1
            
            # Create a dict of user particulars and hash the password
            hashed_password = bcrypt_context.hash(user_particulars.passwd)
            user_data = user_particulars.model_dump()
            user_data.pop("passwd", None)

            org = db.query(Organization).filter(Organization.name == user_particulars.userComName).first()

            if not org:
                print("FIRST")
                org = Organization(name=user_particulars.userComName)
                db.add(org)
                db.commit()
                db.refresh(org)
            
            
            user_data["organization_id"] = org.id

            create_user = Account(**user_data,passwd=hashed_password)
            db.add(create_user)
            db.commit()
            db.refresh(create_user)
            
            # Create a response object without the id field
            response_data = user_particulars.model_dump()
            if "id" in response_data:
                del response_data["id"]
                
            return create_user
        except HTTPException as e:
            db.rollback()
            raise e
        except Exception as e:
            db.rollback()
            print(f"Error in add_user: {str(e)}")  # Add logging
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


async def get_current_user(token: Depends(oauth2_bearer)): # type: ignore
   try:
       payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
       username: str = payload.get('sub','')
       user_id: int = payload.get('id','-1')
       if username is None or user_id is None:
        raise 
       
        with SessionLocal() as db:
            account = db.query(Account).filter(Account.id == user_id).first()
            if account is None:
                raise HTTPException(status_code=404, detail="User not found")
            organisation_id = account.organisation_id
       
       return {'username':username,'id':user_id}    
   except JWTError: #JWTError is the error raised for when the payload= jwt.decode line fails to decode
      raise HTTPException(status_code=401, detail="Invalid token")
