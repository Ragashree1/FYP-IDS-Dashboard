from database import SessionLocal
from models.models import Account, Role
from models.schemas import AccountBase
from typing import List, Optional, Annotated
from passlib.context import CryptContext
from datetime import timedelta, timezone, datetime
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import APIRouter, Depends, HTTPException


SECRET_KEY = 'IWannaShootMyself'  #Could be anything
ALGORITHM = 'HS256'

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto') 
# ^Where most password hashing and unhashing is done

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/token')

def add_user(user_particulars: AccountBase):
<<<<<<< Updated upstream
    with SessionLocal() as db: 
        hashed_password = bcrypt_context.hash(user_particulars.passwd)
        user_data = user_particulars.model_dump()
        user_data.pop("passwd", None)
        user_data.pop("userRole", None)
        user_data.pop("userSuspend", None)
        create_user = Account(**user_data,passwd=hashed_password,userRole = 1,userSuspend = False)# Ragashree asked for default value as 'organizational-admin', putting system-admin, if wrong rmb to change
        db.add(create_user)
        db.commit()
        db.refresh(create_user)
        return create_user
=======
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
            
            # Convert Pydantic model to dict, excluding id if it's empty
            user_data = {}
            if user_particulars.id is None or user_particulars.id == "":
                # Exclude id when it's empty
                for key, value in user_particulars.model_dump().items():
                    if key != "id" and key != "passwd":
                        user_data[key] = value
            else:
                # Include all fields except password
                for key, value in user_particulars.model_dump().items():
                    if key != "passwd":
                        user_data[key] = value
            
            # Ensure userSuspend and userRejected are set correctly
            user_data["userSuspend"] = True  # Account pending approval
            user_data["userRejected"] = False
            
            # Create user object with hashed password
            create_user = Account(**user_data, passwd=hashed_password)
            
            db.add(create_user)
            db.commit()
            db.refresh(create_user)
                
            return create_user
        except HTTPException as e:
            db.rollback()
            raise e
        except Exception as e:
            db.rollback()
            print(f"Error in add_user: {str(e)}")  # Add logging
            raise HTTPException(status_code=422, detail=str(e))
>>>>>>> Stashed changes


def create_access_token(username: str, user_id: str, expires_delta: timedelta):
    encode = {'sub': username, 'id': user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    #encode.update({'exp':expires})
    encode = {**encode, 'exp': expires}
    return jwt.encode(encode, SECRET_KEY, algorithm= ALGORITHM)


async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('sub', '')
        user_id: int = payload.get('id', '-1')
        if username is None or user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return {'username': username, 'id': user_id}    
    except JWTError:  # JWTError is the error raised for when the payload= jwt.decode line fails to decode
        raise HTTPException(status_code=401, detail="Invalid token")