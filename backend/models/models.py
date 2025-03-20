import json
from sqlalchemy import Column, ForeignKey, Integer, String, ARRAY, DateTime,Boolean, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import validates, relationship
from database import Base
import datetime

class MeetingMinutes(Base):
    __tablename__= 'Meeting'
    id = Column(Integer,primary_key=True, index=True)
    date = Column(String)
    startTime = Column(String)
    endTime = Column(String)
    pplpresent= Column(ARRAY(String))
    agenda =  Column(String)
    discussion = Column(String)
    actions = Column(String)

    class Config:
        orm_mode = True  


class Journal(Base):
    __tablename__= 'Journal'
    id = Column(Integer,primary_key=True, index=True)
    jName = Column(String, index=True)
    jDescription = Column(String)
    jWeek = Column(String)

    class Config:
        orm_mode = True

class SnortLogs(Base):
    __tablename__ = 'SnortLogs'
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
    description = Column(String)
    host = Column(String)

    class Config:
        orm_mode = True


class Account(Base):
    __tablename__= 'Account'
    id = Column(Integer,primary_key=True, index=True)
    userid = Column(String,unique=True)
    userFirstName = Column(String)
    userLastName = Column(String)
    passwd = Column(String)
    userComName = Column(String)
    userEmail = Column(String)
    userPhoneNum = Column(String)
    userRole = Column(Integer, ForeignKey("role.id"))
    userSuspend = Column(Boolean)
   
   
    role = relationship("Role", back_populates="accounts")
    
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
    userid = Column(String, ForeignKey('Account.userid')) #Encountered error while trying to import userid as a foreign key, remember to come back when free and try solve this issue


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

class Log(Base):
    __tablename__= 'log'
    id = Column(Integer,primary_key=True, index=True)
    logType = Column(String)
    logName = Column(String)
    logDateTime = Column(String)
    logSource = Column(String)
    logDestinationIP = Column(String)
    logEventCount = Column(String)

    class Config:
        orm_mode = True

class TokenTable(Base):
    __tablename__ = "token"
    id = Column(Integer,primary_key=True, index=True)
    access_token = Column(String)
    refresh_token = Column(String,nullable=False)
    status = Column(Boolean)
    created_date = Column(DateTime, default=datetime.datetime.now)
