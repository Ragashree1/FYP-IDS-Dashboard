from database import SessionLocal
from models.models import Account,Role
from models.schemas import AccountBase,RoleBase
from typing import List, Optional, Annotated
from passlib.context import CryptContext
from datetime import timedelta, timezone, datetime
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import APIRouter, Depends, HTTPException
import os

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")  
ALGORITHM = os.getenv("ALGORITHM", "HS256")

bcrypt_context = CryptContext (schemes = ['bcrypt'], deprecated = 'auto') 
# ^Where most password hashing and unhashing is done

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/token')

def add_user(user_particulars: AccountBase):
    with SessionLocal() as db:
        # Check if user with same username and company exists
        existing_user = db.query(Account).filter(
            Account.username == user_particulars.username,
            Account.userComName == user_particulars.userComName
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail=f"User with username '{user_particulars.username}' already exists in company '{user_particulars.userComName}'"
            )

        # If no existing user found, proceed with creation
        hashed_password = bcrypt_context.hash(user_particulars.passwd)
        user_data = user_particulars.model_dump()
        user_data.pop("passwd", None)
        create_user = Account(**user_data, passwd=hashed_password)
        db.add(create_user)
        db.commit()
        db.refresh(create_user)
        return create_user


def delete_user(account_id: int) -> bool:
    with SessionLocal() as db: 
        user = db.query(Account).filter(Account.id == account_id).first()
        if user:
            db.delete(user)
            db.commit()
            return True
        return False
    
def get_all_users(company_name: str) -> List[AccountBase]:
    with SessionLocal() as db:  
        users = db.query(Account).filter(Account.userComName == company_name).all()
        return [AccountBase.model_validate(user, from_attributes=True) for user in users]
    
def get_all_roles() -> List[RoleBase]:
    with SessionLocal() as db:  
        roles = db.query(Role).all()
        return [RoleBase.model_validate(role, from_attributes=True) for role in roles]
    

def update_account(account_id: int, update_data: AccountBase):
    with SessionLocal() as db:
        account = db.query(Account).filter(Account.id == account_id).first()
        if not account:
            return None

        # Update fields only if they are provided
        if update_data.passwd:  # Only update the password if provided
            account.passwd = bcrypt_context.hash(update_data.passwd)
        if update_data.userComName:
            account.userComName = update_data.userComName
        if update_data.userRole:
            account.userRole = update_data.userRole
        if update_data.userFirstName:
            account.userFirstName = update_data.userFirstName
        if update_data.userLastName:
            account.userLastName = update_data.userLastName
        if update_data.userEmail:
            account.userEmail = update_data.userEmail
        if update_data.userPhoneNum:
            account.userPhoneNum = update_data.userPhoneNum
        if update_data.userSuspend is not None:
            account.userSuspend = update_data.userSuspend

        db.add(account)
        db.commit()
        db.refresh(account)
        updated_account = AccountBase(**account.__dict__)
        return AccountBase.model_validate(updated_account)



