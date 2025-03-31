from fastapi import HTTPException
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
from models.models import Account, Role, Permission  # Updated import path
from models.schemas import AccountBase, RoleOut
from typing import List
from fastapi import Depends
from services.auth_service import get_password_hash

# Function to get all users for a specific company
def get_all_users(company_name: str):
    db = SessionLocal()
    try:
        users = db.query(Account).filter(Account.userComName == company_name).all()
        return users
    finally:
        db.close()

# Function to get all users for platform admin
def get_all_users_for_admin():
    db = SessionLocal()
    try:
        users = db.query(Account).all()
        return users
    finally:
        db.close()

# Function to get all roles
def get_all_roles():
    db = SessionLocal()
    try:
        roles = db.query(Role).all()
        return roles
    finally:
        db.close()

# Function to add a new user
def add_user(user_particulars: AccountBase):
    db = SessionLocal()
    try:
        # Check if username already exists for this company
        existing_user = db.query(Account).filter(
            Account.username == user_particulars.username,
            Account.userComName == user_particulars.userComName
        ).first()
        
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists for this company")
        
        # Hash the password if provided
        hashed_password = None
        if user_particulars.passwd:
            hashed_password = get_password_hash(user_particulars.passwd)
        
        # Create new user object with hashed password
        new_user = Account(
            username=user_particulars.username,
            userFirstName=user_particulars.userFirstName,
            userLastName=user_particulars.userLastName,
            passwd=hashed_password,  # Use the hashed password
            userComName=user_particulars.userComName,
            userEmail=user_particulars.userEmail,
            userPhoneNum=user_particulars.userPhoneNum,
            userRole=user_particulars.userRole,
            userSuspend=user_particulars.userSuspend,
            userRejected=user_particulars.userRejected
        )
        
        # Add to database
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    finally:
        db.close()

# Function to delete a user
def delete_user(account_id: int):
    db = SessionLocal()
    try:
        user = db.query(Account).filter(Account.id == account_id).first()
        if not user:
            return False
        
        db.delete(user)
        db.commit()
        return True
    finally:
        db.close()

# Function to update a user account
def update_account(account_id: int, update_data: AccountBase):
    db = SessionLocal()
    try:
        user = db.query(Account).filter(Account.id == account_id).first()
        if not user:
            return None
        
        # Update user fields
        user.username = update_data.username
        user.userFirstName = update_data.userFirstName
        user.userLastName = update_data.userLastName
        user.userComName = update_data.userComName
        user.userEmail = update_data.userEmail
        user.userPhoneNum = update_data.userPhoneNum
        user.userRole = update_data.userRole
        user.userSuspend = update_data.userSuspend
        user.userRejected = update_data.userRejected
        
        # Update password if provided
        if update_data.passwd:
            user.passwd = get_password_hash(update_data.passwd)
        
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()