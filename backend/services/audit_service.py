from sqlalchemy.orm import Session
from models.models import ActivityLog, Account
from models.schemas import ActivityLogBase
from typing import List
from datetime import datetime

def add_activity_log(db: Session, log_data: ActivityLogBase, user_company: str) -> ActivityLog:
    """
    Add a new activity log entry to the database
    """
    try:
        # Create new activity log object
        new_log = ActivityLog(
            timestamp=datetime.now(),
            user=log_data.user,
            targetUser=log_data.targetUser,
            action=log_data.action,
            description=log_data.description,
            ipAddress=log_data.ipAddress,
            userComName=user_company
        )
        
        # Add to database
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        return new_log
    except Exception as e:
        db.rollback()
        raise e

def get_all_activity_logs(db: Session) -> List[ActivityLog]:
    """
    Get all activity logs from the database
    """
    return db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).all()

def get_company_activity_logs(db: Session, company_name: str) -> List[ActivityLog]:
    """
    Get activity logs for a specific company
    """
    # Debug print to check the company name being used for filtering
    print(f"Filtering logs for company: {company_name}")
    
    # Get logs for the specified company
    logs = db.query(ActivityLog).filter(
        ActivityLog.userComName == company_name
    ).order_by(ActivityLog.timestamp.desc()).all()
    
    # Debug print to check how many logs were found
    print(f"Found {len(logs)} logs for company {company_name}")
    
    return logs

def delete_activity_log(db: Session, log_id: int) -> bool:
    """
    Delete an activity log entry from the database
    
    Args:
        db: Database session
        log_id: ID of the log to delete
        
    Returns:
        bool: True if the log was deleted, False if the log was not found
    """
    try:
        log = db.query(ActivityLog).filter(ActivityLog.id == log_id).first()
        
        if not log:
            return False
            
        db.delete(log)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise e