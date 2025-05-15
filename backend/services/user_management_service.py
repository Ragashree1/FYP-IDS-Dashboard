# services/user_management_service.py
from models.schemas import AccountBase, RoleOut
from database import get_db
from sqlalchemy.orm import Session
from models.models import Account, Role
from typing import List, Optional
import bcrypt
from fastapi import HTTPException

def add_user(user_particulars: AccountBase) -> AccountBase:
    db = next(get_db())
    try:
        # Check if username already exists
        existing_user = db.query(Account).filter(Account.username == user_particulars.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Hash password if provided
        hashed_password = None
        if user_particulars.passwd:
            hashed_password = bcrypt.hashpw(user_particulars.passwd.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Log the organization_id before creating the user
        print(f"Creating user with organization_id: {user_particulars.organization_id}")
        
        # Create new user
        new_user = Account(
            username=user_particulars.username,
            userFirstName=user_particulars.userFirstName,
            userLastName=user_particulars.userLastName,
            userComName=user_particulars.userComName,
            userEmail=user_particulars.userEmail,
            userPhoneNum=user_particulars.userPhoneNum,
            userRole=user_particulars.userRole,
            userSuspend=user_particulars.userSuspend,
            userRejected=user_particulars.userRejected,
            passwd=hashed_password,
            organization_id=user_particulars.organization_id  # Ensure organization_id is included
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Log the created user's organization_id
        print(f"Created user with organization_id: {new_user.organization_id}")
        
        # Convert to Pydantic model
        result = AccountBase(
            id=new_user.id,
            username=new_user.username,
            userFirstName=new_user.userFirstName,
            userLastName=new_user.userLastName,
            userComName=new_user.userComName,
            userEmail=new_user.userEmail,
            userPhoneNum=new_user.userPhoneNum,
            userRole=new_user.userRole,
            userSuspend=new_user.userSuspend,
            userRejected=new_user.userRejected,
            organization_id=new_user.organization_id  # Include organization_id in the response
        )
        
        return result
    except Exception as e:
        db.rollback()
        print(f"Error in add_user: {str(e)}")
        raise e
    finally:
        db.close()

def get_all_users(company_name: str) -> List[AccountBase]:
    db = next(get_db())
    try:
        users = db.query(Account).filter(Account.userComName == company_name).all()
        
        # Convert to Pydantic models
        result = []
        for user in users:
            result.append(AccountBase(
                id=user.id,
                username=user.username,
                userFirstName=user.userFirstName,
                userLastName=user.userLastName,
                userComName=user.userComName,
                userEmail=user.userEmail,
                userPhoneNum=user.userPhoneNum,
                userRole=user.userRole,
                userSuspend=user.userSuspend,
                userRejected=user.userRejected,
                organization_id=user.organization_id  # Include organization_id
            ))
        
        return result
    except Exception as e:
        print(f"Error in get_all_users: {str(e)}")
        raise e
    finally:
        db.close()

def get_all_users_for_admin() -> List[AccountBase]:
    db = next(get_db())
    try:
        users = db.query(Account).all()
        
        # Convert to Pydantic models
        result = []
        for user in users:
            result.append(AccountBase(
                id=user.id,
                username=user.username,
                userFirstName=user.userFirstName,
                userLastName=user.userLastName,
                userComName=user.userComName,
                userEmail=user.userEmail,
                userPhoneNum=user.userPhoneNum,
                userRole=user.userRole,
                userSuspend=user.userSuspend,
                userRejected=user.userRejected,
                organization_id=user.organization_id  # Include organization_id
            ))
        
        return result
    except Exception as e:
        print(f"Error in get_all_users_for_admin: {str(e)}")
        raise e
    finally:
        db.close()

def get_user_by_id(user_id: int) -> Optional[AccountBase]:
    db = next(get_db())
    try:
        user = db.query(Account).filter(Account.id == user_id).first()
        if not user:
            return None
        
        # Convert to Pydantic model
        result = AccountBase(
            id=user.id,
            username=user.username,
            userFirstName=user.userFirstName,
            userLastName=user.userLastName,
            userComName=user.userComName,
            userEmail=user.userEmail,
            userPhoneNum=user.userPhoneNum,
            userRole=user.userRole,
            userSuspend=user.userSuspend,
            userRejected=user.userRejected,
            organization_id=user.organization_id  # Include organization_id
        )
        
        return result
    except Exception as e:
        print(f"Error in get_user_by_id: {str(e)}")
        raise e
    finally:
        db.close()

def update_account(account_id: int, update_data: AccountBase) -> Optional[AccountBase]:
    db = next(get_db())
    try:
        user = db.query(Account).filter(Account.id == account_id).first()
        if not user:
            return None
        
        # Update fields
        user.username = update_data.username
        user.userFirstName = update_data.userFirstName
        user.userLastName = update_data.userLastName
        user.userComName = update_data.userComName
        user.userEmail = update_data.userEmail
        user.userPhoneNum = update_data.userPhoneNum
        user.userRole = update_data.userRole
        user.userSuspend = update_data.userSuspend
        user.userRejected = update_data.userRejected
        
        # Update organization_id if provided
        if update_data.organization_id is not None:
            print(f"Updating organization_id from {user.organization_id} to {update_data.organization_id}")
            user.organization_id = update_data.organization_id
        
        # Update password if provided
        if update_data.passwd:
            user.passwd = bcrypt.hashpw(update_data.passwd.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        db.commit()
        db.refresh(user)
        
        # Convert to Pydantic model
        result = AccountBase(
            id=user.id,
            username=user.username,
            userFirstName=user.userFirstName,
            userLastName=user.userLastName,
            userComName=user.userComName,
            userEmail=user.userEmail,
            userPhoneNum=user.userPhoneNum,
            userRole=user.userRole,
            userSuspend=user.userSuspend,
            userRejected=user.userRejected,
            organization_id=user.organization_id  # Include organization_id
        )
        
        return result
    except Exception as e:
        db.rollback()
        print(f"Error in update_account: {str(e)}")
        raise e
    finally:
        db.close()

def delete_user(account_id: int) -> bool:
    db = next(get_db())
    try:
        user = db.query(Account).filter(Account.id == account_id).first()
        if not user:
            return False
        
        db.delete(user)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(f"Error in delete_user: {str(e)}")
        raise e
    finally:
        db.close()

def get_all_roles() -> List[RoleOut]:
    db = next(get_db())
    try:
        roles = db.query(Role).all()
        
        # Convert to Pydantic models
        result = []
        for role in roles:
            result.append(RoleOut(
                id=role.id,
                roleName=role.roleName
            ))
        
        return result
    except Exception as e:
        print(f"Error in get_all_roles: {str(e)}")
        raise e
    finally:
        db.close()

def get_users_by_org_id(org_id: int) -> List[AccountBase]:
    db = next(get_db())
    try:
        users = db.query(Account).filter(Account.organization_id == org_id).all()
        
        # Convert to Pydantic models
        result = []
        for user in users:
            result.append(AccountBase(
                id=user.id,
                username=user.username,
                userFirstName=user.userFirstName,
                userLastName=user.userLastName,
                userComName=user.userComName,
                userEmail=user.userEmail,
                userPhoneNum=user.userPhoneNum,
                userRole=user.userRole,
                userSuspend=user.userSuspend,
                userRejected=user.userRejected,
                organization_id=user.organization_id
            ))
        
        return result
    except Exception as e:
        print(f"Error in get_users_by_org_id: {str(e)}")
        raise e
    finally:
        db.close()