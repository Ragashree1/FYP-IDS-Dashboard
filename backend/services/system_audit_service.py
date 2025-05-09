from models.models import SystemLog, Account
from models.schemas import SystemLogBase
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import sqlalchemy as sa

def add_system_log(db: Session, log_data: SystemLogBase, company_name: str = None) -> SystemLog:
    """Add a new system activity log entry"""
    try:
        print(f"Adding system log for company: {company_name}")
        
        # If company_name is not provided, try to get it from the user
        if not company_name:
            # Try to get the company name from the user's record
            user_record = db.query(Account).filter(Account.username == log_data.user).first()
            if user_record and user_record.userComName:
                company_name = user_record.userComName
            else:
                # Fallback to a default if we can't determine the company
                company_name = "unknown_company"
                
        print(f"Using company name: {company_name}")
        
        # Create new system log entry with userComName field
        new_log = SystemLog(
            user=log_data.user,
            component=log_data.component,
            action=log_data.action,
            description=log_data.description,
            ipAddress=log_data.ipAddress,
            resourceId=log_data.resourceId,
            resourceName=log_data.resourceName,
            userComName=company_name,  # Use the proper column
            timestamp=datetime.now()
        )
        
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        
        print(f"Successfully added system log for company: {company_name}, ID: {new_log.id}")
        return new_log
    except Exception as e:
        db.rollback()
        print(f"Error in add_system_log: {str(e)}")
        raise e

def get_all_system_logs(db: Session) -> List[SystemLog]:
    """Get all system activity logs"""
    try:
        logs = db.query(SystemLog).order_by(SystemLog.timestamp.desc()).all()
        print(f"Retrieved {len(logs)} logs in get_all_system_logs")
        return logs
    except Exception as e:
        print(f"Error in get_all_system_logs: {str(e)}")
        raise e

def get_company_system_logs(db: Session, company_name: str) -> List[SystemLog]:
    """Get system activity logs for a specific company"""
    try:
        # Debug print to check the company name being used for filtering
        print(f"Filtering system logs for company: {company_name}")
        
        if not company_name:
            print("No company name provided, returning empty list")
            return []
        
        # STRICT FILTERING: Only return logs that exactly match the company name (case-insensitive)
        logs = db.query(SystemLog).filter(
            sa.func.lower(SystemLog.userComName) == sa.func.lower(company_name)
        ).order_by(SystemLog.timestamp.desc()).all()
        
        print(f"Found {len(logs)} system logs for company {company_name}")
        
        # Do not return any logs if no exact match is found
        # This ensures strict separation between companies
        return logs
    except Exception as e:
        print(f"Error in get_company_system_logs: {str(e)}")
        # Return empty list on error to prevent showing logs from other companies
        return []

def get_system_logs_by_component(db: Session, component: str, company_name: str) -> List[SystemLog]:
    """Get system activity logs filtered by component"""
    try:
        # Add company filtering to component filter
        logs = db.query(SystemLog).filter(
            SystemLog.component == component,
            sa.func.lower(SystemLog.userComName) == sa.func.lower(company_name)
        ).order_by(SystemLog.timestamp.desc()).all()
        return logs
    except Exception as e:
        raise e

def get_system_logs_by_action(db: Session, action: str, company_name: str) -> List[SystemLog]:
    """Get system activity logs filtered by action"""
    try:
        # Add company filtering to action filter
        logs = db.query(SystemLog).filter(
            SystemLog.action == action,
            sa.func.lower(SystemLog.userComName) == sa.func.lower(company_name)
        ).order_by(SystemLog.timestamp.desc()).all()
        return logs
    except Exception as e:
        raise e

def get_system_logs_by_user(db: Session, user: str, company_name: str) -> List[SystemLog]:
    """Get system activity logs filtered by user"""
    try:
        # Add company filtering to user filter
        logs = db.query(SystemLog).filter(
            SystemLog.user == user,
            sa.func.lower(SystemLog.userComName) == sa.func.lower(company_name)
        ).order_by(SystemLog.timestamp.desc()).all()
        return logs
    except Exception as e:
        raise e

def get_system_logs_by_resource(db: Session, resource_id: str, company_name: str) -> List[SystemLog]:
    """Get system activity logs filtered by resource ID"""
    try:
        # Add company filtering to resource filter
        logs = db.query(SystemLog).filter(
            SystemLog.resourceId == resource_id,
            sa.func.lower(SystemLog.userComName) == sa.func.lower(company_name)
        ).order_by(SystemLog.timestamp.desc()).all()
        return logs
    except Exception as e:
        raise e

def delete_system_log(db: Session, log_id: int) -> bool:
    """Delete a system activity log entry"""
    try:
        log = db.query(SystemLog).filter(SystemLog.id == log_id).first()
        if not log:
            return False
            
        db.delete(log)
        db.commit()
        
        return True
    except Exception as e:
        db.rollback()
        raise e