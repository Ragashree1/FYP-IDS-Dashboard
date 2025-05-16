# services/user_management_service.py
from models.schemas import AccountBase, RoleOut,RoleBase
from database import get_db,SessionLocal
from sqlalchemy.orm import Session
from models.models import Account,Role,Organisation
from typing import List, Optional, Annotated
import bcrypt
from passlib.context import CryptContext
from datetime import timedelta, timezone, datetime
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import HTTPException, APIRouter, Depends
from sqlalchemy.orm import joinedload
import os

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")  
ALGORITHM = os.getenv("ALGORITHM", "HS256")

bcrypt_context = CryptContext (schemes = ['bcrypt'], deprecated = 'auto') 
# ^Where most password hashing and unhashing is done

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/token')

def add_user(user_particulars: AccountBase):
    with SessionLocal() as db:

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
                detail=f"User with username '{user_particulars.username}' already exists in company '{user_particulars.org}'"
            )

        # If no existing user found, proceed with creation
        hashed_password = bcrypt_context.hash(user_particulars.passwd)
        user_data = user_particulars.model_dump()
        user_data.pop("passwd", None)
        user_data.pop("organisation", None)
        create_user = Account(**user_data, passwd=hashed_password,organisation_id=org.id)
        db.add(create_user)
        db.commit()
        db.refresh(create_user)

        user_with_org = db.query(Account).options(joinedload(Account.organisation)).filter_by(id=create_user.id).first()
        return user_with_org

        def delete_user(account_id: int) -> bool:
            with SessionLocal() as db: 
                user = db.query(Account).filter(Account.id == account_id).first()
                if user:
                    db.delete(user)
                    db.commit()
                    return True
                return False
    
def get_all_users(company_name: str) -> List[AccountBase]:
    print("DATABASE_URL:", os.getenv("DATABASE_URL"))

    with SessionLocal() as db:  
        # users = db.query(Account).filter(Account.organisation.name == company_name).all() #Old code
        users = (db.query(Account).join(Organisation).options(joinedload(Account.organisation)).filter(Organisation.name == company_name).all())
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
        if update_data.organisation.name:
            account.organisation.name = update_data.organisation.name
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