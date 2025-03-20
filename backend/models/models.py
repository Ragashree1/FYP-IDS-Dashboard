import uuid  
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, ForeignKey, Integer, String, ARRAY, TIMESTAMP, JSON, DateTime, func, Boolean, Table, UniqueConstraint
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
        orm_mode = True  

class Journal(Base):
    __tablename__= 'Journal'
    id = Column(Integer, primary_key=True, index=True)
    jName = Column(String, index=True)
    jDescription = Column(String)
    jWeek = Column(String)

    class Config:
        orm_mode = True

class Organization(Base):
    __tablename__ = "Organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)

class BlockedIP(Base):
    __tablename__ = "blocked_ips"

    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String, unique=True, nullable=False)
    reason = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

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
        orm_mode = True


class Account(Base):
    __tablename__= 'Account'
    id = Column(Integer,primary_key=True, index=True)
    username = Column(String)
    userFirstName = Column(String)
    userLastName = Column(String)
    passwd = Column(String)
    userComName = Column(String)
    userEmail = Column(String)
    userPhoneNum = Column(String)
    userRole = Column(Integer, ForeignKey("role.id"))
    userSuspend = Column(Boolean)
   
    role = relationship("Role", back_populates="accounts")
    
    __table_args__ = (
        UniqueConstraint('username', 'userComName', name='unique_username_company'),
    )
    
    class Config:
        orm_mode = True

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
        orm_mode = True

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
        orm_mode = True

class Permission(Base):
    __tablename__ = 'permission'
    id = Column(Integer, primary_key=True, index=True)
    permissionName = Column(String)

    # Many-to-many relationship
    roles = relationship('Role', secondary=role_permission_association, back_populates='permissions')

    class Config:
        orm_mode = True


class Report(Base):
    __tablename__= 'report'
    id = Column(Integer,primary_key=True, index=True)
    reportName = Column(String)
    reportFormat = Column(String)
    reportType = Column(String)

    class Config:
        orm_mode = True

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
        orm_mode = True

class Playbook(Base):
    __tablename__ = "Playbooks"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("Organizations.id", ondelete="SET NULL"), nullable=True, index=True)  # Foreign key to an Organization table
    name = Column(String, unique=True, nullable=False)  # Name of the playbook
    description = Column(String, nullable=True)  # Optional description of what the playbook does
    conditions = Column(JSON, nullable=False)  # JSON structure to define rules (e.g., {"log_type": "alert", "priority": ">3"})
    actions = Column(JSON, nullable=False)  # JSON array to store multiple actions (e.g., ["block_ip", "alert"])
    is_active = Column(Boolean, default=True)  
    created_at = Column(TIMESTAMP, server_default=func.now())  
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())  # Timestamp of last update

    class Config:
        orm_mode = True
