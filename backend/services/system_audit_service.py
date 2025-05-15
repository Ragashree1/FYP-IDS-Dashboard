from models.models import SystemLog
from models.schemas import SystemLogBase
from typing import List
from datetime import datetime
from database import SessionLocal

def add_system_log(log_data: SystemLogBase) -> SystemLog:
    """
    Add a new system activity log entry
    """
    try:
        with SessionLocal() as db:
            new_log = SystemLog(
                user=log_data.user,
                component=log_data.component,
                action=log_data.action,
                description=log_data.description,
                resourceId=log_data.resourceId,
                resourceName=log_data.resourceName,
                organization_id=log_data.organization_id,
                timestamp=datetime.now()
            )
            db.add(new_log)
            db.commit()
            db.refresh(new_log)
            return new_log
    except Exception as e:
        raise e

def get_all_system_logs() -> List[SystemLog]:
    """
    Get all system activity logs
    """
    with SessionLocal() as db:
        logs = db.query(SystemLog).order_by(SystemLog.timestamp.desc()).all()
        return logs

def get_company_system_logs(organization_id: int) -> List[SystemLog]:
    """
    Get system activity logs for a specific organization
    """
    with SessionLocal() as db:
        logs = db.query(SystemLog).filter(
            SystemLog.organization_id == organization_id
        ).order_by(SystemLog.timestamp.desc()).all()
        return logs

def get_system_logs_by_component(organization_id: int, component: str) -> List[SystemLog]:
    """
    Get system activity logs filtered by component for an organization
    """
    with SessionLocal() as db:
        logs = db.query(SystemLog).filter(
            SystemLog.organization_id == organization_id,
            SystemLog.component == component
        ).order_by(SystemLog.timestamp.desc()).all()
        return logs

def get_system_logs_by_action(organization_id: int, action: str) -> List[SystemLog]:
    """
    Get system activity logs filtered by action for an organization
    """
    with SessionLocal() as db:
        logs = db.query(SystemLog).filter(
            SystemLog.organization_id == organization_id,
            SystemLog.action == action
        ).order_by(SystemLog.timestamp.desc()).all()
        return logs

def get_system_logs_by_user(organization_id: int, user: str) -> List[SystemLog]:
    """
    Get system activity logs filtered by user for an organization
    """
    with SessionLocal() as db:
        logs = db.query(SystemLog).filter(
            SystemLog.organization_id == organization_id,
            SystemLog.user == user
        ).order_by(SystemLog.timestamp.desc()).all()
        return logs

def get_system_logs_by_resource(organization_id: int, resource_id: str) -> List[SystemLog]:
    """
    Get system activity logs filtered by resource ID for an organization
    """
    with SessionLocal() as db:
        logs = db.query(SystemLog).filter(
            SystemLog.organization_id == organization_id,
            SystemLog.resourceId == resource_id
        ).order_by(SystemLog.timestamp.desc()).all()
        return logs

def delete_system_log(log_id: int) -> bool:
    """
    Delete a system activity log entry
    """
    try:
        with SessionLocal() as db:
            log = db.query(SystemLog).filter(SystemLog.id == log_id).first()
            if not log:
                return False
            db.delete(log)
            db.commit()
            return True
    except Exception as e:
        raise e