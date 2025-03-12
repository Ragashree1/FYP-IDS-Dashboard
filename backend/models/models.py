import json
from sqlalchemy import Column, ForeignKey, Integer, String, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import validates
from database import Base

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

class BlockedIP(Base):
    __tablename__ = "blocked_ips"
    ip = Column(String, primary_key=True)

    
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

