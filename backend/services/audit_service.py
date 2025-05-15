from models.models import ActivityLog, Account
from models.schemas import ActivityLogBase
from typing import List
from datetime import datetime
from database import SessionLocal

def add_activity_log(log_data: ActivityLogBase) -> ActivityLog:
    """
    Add a new activity log entry to the database
    """
    try:
        with SessionLocal() as db:
            new_log = ActivityLog(
                timestamp=datetime.now(),
                user=log_data.user,
                targetUser=log_data.targetUser,
                action=log_data.action,
                description=log_data.description,
                organization_id=log_data.organization_id
            )
            db.add(new_log)
            db.commit()
            db.refresh(new_log)
            return new_log
    except Exception as e:
        raise e

def get_all_activity_logs() -> List[ActivityLog]:
    """
    Get all activity logs from the database
    """
    with SessionLocal() as db:
        return db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).all()

def get_company_activity_logs(organization_id: int) -> List[ActivityLog]:
    """
    Get activity logs for a specific organization
    """
    with SessionLocal() as db:
        logs = db.query(ActivityLog).filter(
            ActivityLog.organization_id == organization_id
        ).order_by(ActivityLog.timestamp.desc()).all()
        return logs

def delete_activity_log(log_id: int) -> bool:
    """
    Delete an activity log entry from the database
    """
    try:
        with SessionLocal() as db:
            log = db.query(ActivityLog).filter(ActivityLog.id == log_id).first()
            if not log:
                return False
            db.delete(log)
            db.commit()
            return True
    except Exception as e:
        raise e