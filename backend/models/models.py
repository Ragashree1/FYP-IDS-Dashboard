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
