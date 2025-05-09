from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Account

router = APIRouter()

class UserStatusCheck(BaseModel):
    username: str
    userComName: str

@router.post("/user-management/check-status")
async def check_user_status(user_data: UserStatusCheck, db: Session = Depends(get_db)):
    """
    Check if a user account exists and return its status.
    This endpoint is used during login to verify if an account is approved.
    """
    # Query the database for the user
    user = db.query(Account).filter(
        Account.username == user_data.username,
        Account.userComName == user_data.userComName
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Return the user's status information
    return {
        "userSuspend": user.userSuspend,
        "userRejected": getattr(user, "userRejected", False)  # Handle case where userRejected might not exist
    }