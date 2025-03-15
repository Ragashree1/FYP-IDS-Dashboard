from database import SessionLocal
from models.models import Account
from models.schemas import AccountBase,AccountEdit
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

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/token')

def add_user(user_particulars: AccountBase):
    with SessionLocal() as db: 
        hashed_password = bcrypt_context.hash(user_particulars.passwd)
        user_data = user_particulars.model_dump()
        user_data.pop("passwd", None)
        user_data.pop("userRole", None)
        create_user = Account(**user_data,passwd=hashed_password,userRole ="system-admin")# Ragashree asked for default value as 'organizational-admin', putting system-admin, if wrong rmb to change
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
    
def get_all_users() -> List[AccountBase]:
    with SessionLocal() as db:  
        users = db.query(Account).all()
        return [AccountBase.model_validate(user, from_attributes=True) for user in users]
    

def update_account(account_id: int, update_data: AccountEdit):
    with SessionLocal() as db:  
        account = db.query(Account).filter(Account.id == account_id).first()
     # Check if the password,user company name & user role is provided, if not, keep the existing ones
    if update_data.passwd:
        account.passwd = update_data.passwd

    if update_data.userComName:
        account.userComName = update_data.userComName

    
    if update_data.userRole:
        account.userRole = update_data.userRole
    
    # Update other fields
    account.userFirstName = update_data.userFirstName
    account.userLastName = update_data.userLastName
    account.userEmail = update_data.userEmail
    account.userPhoneNum = update_data.userPhoneNum
    account.userRole = update_data.userRole
    if not account:
            return None


    db.commit()
    db.refresh(account)
    return AccountEdit.model_validate(account)



