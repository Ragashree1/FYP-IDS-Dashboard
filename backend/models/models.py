import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, ForeignKey, Integer, String, ARRAY, TIMESTAMP, JSON, DateTime, func, Boolean, Table, UniqueConstraint, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import validates, relationship
from database import Base
from datetime import datetime
import json

class MeetingMinutes(Base):
    __tablename__= 'Meeting'
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String)
    startTime = Column(String)
    endTime = Column(String)
    pplpresent = Column(ARRAY(String))
    agenda = Column(String)
    discussion = Column(String)
    actions = Column(String)

    class Config:
        from_attributes = True  # Updated from orm_mode = True

class Journal(Base):
    __tablename__= 'Journal'
    id = Column(Integer, primary_key=True, index=True)
    jName = Column(String, index=True)
    jDescription = Column(String)
    jWeek = Column(String)

    class Config:
        from_attributes = True  # Updated from orm_mode = True

class Organization(Base):
    __tablename__ = "Organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)

class BlockedIP(Base):
    __tablename__ = "blocked_ips"

    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    company = Column(String, nullable=False, default="default")  # Added company field
    created_at = Column(DateTime, server_default=func.now())
    
    # Add a unique constraint for ip + company combination
    __table_args__ = (
        UniqueConstraint('ip', 'company', name='uix_ip_company'),
    )

class SnortAlerts(Base):
    __tablename__ = 'SnortAlerts'
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(String)
    priority = Column(Integer)
    protocol = Column(String)
    raw = Column(String)
    length = Column(Integer)
    direction = Column(String)
    src_ip = Column(String)
    src_port = Column(Integer)
    dest_ip = Column(String)
    dest_port = Column(Integer)
    classification = Column(String)
    action = Column(String)
    message = Column(String)
    signature_id = Column(String)
    host = Column(String)

    class Config:
        from_attributes = True  # Updated from orm_mode = True


class Account(Base):
    __tablename__= 'Account'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    userFirstName = Column(String)
    userLastName = Column(String)
    passwd = Column(String)
    userComName = Column(String)
    userEmail = Column(String)
    userPhoneNum = Column(String)
    userRole = Column(Integer, ForeignKey("role.id"))
    userSuspend = Column(Boolean)
    userRejected = Column(Boolean, default=False)  # Added userRejected field
    fromOrgRequestsPage = Column(Boolean, default=False)
    role = relationship("Role", back_populates="accounts")
    
    __table_args__ = (
        UniqueConstraint('username', 'userComName', name='unique_username_company'),
    )
    
    class Config:
        from_attributes = True  # Updated from orm_mode = True

class CreditCard(Base):
    __tablename__= 'creditcard'
    id = Column(Integer,primary_key=True, index=True)
    creditFirstName = Column(String) #Maybe later make it so that it retreives the userFirstName
    creditLastName = Column(String) #Maybe later make it so that it retreives the userLastName
    creditNum = Column(String)
    creditDate= Column(String)
    creditCVV = Column(Integer)
    subscription = Column(String)
    total = Column(String)
    userid = Column(String, ForeignKey('Account.id')) #Encountered error while trying to import username as a foreign key, remember to come back when free and try solve this issue


    class Config:
        from_attributes = True  # Updated from orm_mode = True

role_permission_association = Table(
    'role_permission_association', Base.metadata,
    Column('role_id', Integer, ForeignKey('role.id')),
    Column('permission_id', Integer, ForeignKey('permission.id'))
)


class Role(Base):
    __tablename__ = 'role'
    id = Column(Integer, primary_key=True, index=True)
    roleName = Column(String)

    # Back reference to Account
    accounts = relationship("Account", back_populates="role")

    # Many-to-many relationship
    permissions = relationship('Permission', secondary=role_permission_association, back_populates='roles')

    class Config:
        from_attributes = True  # Updated from orm_mode = True

class Permission(Base):
    __tablename__ = 'permission'
    id = Column(Integer, primary_key=True, index=True)
    permissionName = Column(String)

    # Many-to-many relationship
    roles = relationship('Role', secondary=role_permission_association, back_populates='permissions')

    class Config:
        from_attributes = True  # Updated from orm_mode = True


class Report(Base):
    __tablename__= 'report'
    id = Column(Integer,primary_key=True, index=True)
    reportName = Column(String)
    reportFormat = Column(String)
    reportType = Column(String)

    class Config:
        from_attributes = True  # Updated from orm_mode = True

class TokenTable(Base):
    __tablename__ = "token"
    id = Column(Integer,primary_key=True, index=True)
    access_token = Column(String)
    refresh_token = Column(String,nullable=False)
    status = Column(Boolean)
    created_date = Column(DateTime, default=datetime.now)

class Logs(Base):
    __tablename__ = "Logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(TIMESTAMP, default=datetime.utcnow)  
    log_type = Column(String, index=True)
    source_ip = Column(String)
    host = Column(String)
    message = Column(String)
    event_data = Column(JSON)
    http_method = Column(String, nullable=True)
    http_status = Column(Integer, nullable=True)
    url = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    log_path = Column(String, nullable=True)

    class Config:
        from_attributes = True  # Updated from orm_mode = True

class Playbook(Base):
    __tablename__ = "Playbooks"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("Organizations.id", ondelete="SET NULL"), nullable=True, index=True)  # Foreign key to an Organization table
    name = Column(String, nullable=False)  # Name of the playbook
    description = Column(String, nullable=True)  # Optional description of what the playbook does
    conditions = Column(JSON, nullable=False)  # JSON structure to define rules (e.g., {"log_type": "alert", "priority": ">3"})
    actions = Column(JSON, nullable=False)  # JSON array to store multiple actions (e.g., ["block_ip", "alert"])
    is_active = Column(Boolean, default=True)  
    created_at = Column(TIMESTAMP, server_default=func.now())  
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())  # Timestamp of last update

    class Config:
        from_attributes = True  # Updated from orm_mode = True

# New ActivityLog model for tracking user management activities
class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(TIMESTAMP, server_default=func.now())
    user = Column(String, nullable=False)  # Username of the user who performed the action
    targetUser = Column(String, nullable=False)  # Username of the user who was affected
    action = Column(String, nullable=False)  # Type of action (user_created, user_updated, etc.)
    description = Column(String, nullable=False)  # Description of the action
    ipAddress = Column(String)  # IP address of the user who performed the action
    userComName = Column(String, nullable=False)  # Company name for filtering logs by company
    
    class Config:
        from_attributes = True

# New SystemLog model for tracking system activities (playbooks, etc.)
class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(TIMESTAMP, server_default=func.now())
    user = Column(String, nullable=False)  # Username of the user who performed the action
    component = Column(String, nullable=False)  # System component affected (e.g., "Playbook", "Firewall", etc.)
    action = Column(String, nullable=False)  # Type of action (playbook_created, rule_added, etc.)
    description = Column(String, nullable=False)  # Description of the action
    ipAddress = Column(String)  # IP address of the user who performed the action
    resourceId = Column(String, nullable=True)  # ID of the affected resource (e.g., playbook ID)
    resourceName = Column(String, nullable=True)  # Name of the affected resource (e.g., playbook name)
    userComName = Column(String, nullable=True)
	
    class Config:
        from_attributes = True

# New Review model for storing customer reviews
class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    company = Column(String, nullable=True)
    rating = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    class Config:
        from_attributes = True