from pydantic import BaseModel,EmailStr
from typing import List, Optional
import datetime

class MeetingMinutesBase(BaseModel):
    date: str
    startTime: str
    endTime: str
    pplpresent: List[str]
    agenda: str
    discussion: str
    actions: str

class JournalBase(BaseModel):
    jName: str
    jDescription: str
    jWeek: str

class JournalOut(BaseModel):
    id: int
    jName: str
    jDescription: str
    jWeek: str

class MeetingMinutesOut(BaseModel):
    id: int
    date: str
    startTime: str
    endTime: str
    pplpresent: List[str]
    agenda: str
    discussion: str
    actions: str

class SnortLogsBase(BaseModel):
    timestamp: str
    priority: int
    protocol: str
    raw: str
    length: int
    direction: str
    src_ip: str
    src_port: int
    dest_ip: str
    dest_port: int
    classification: str
    action: str
    message: str
    description: str
    host: str

class SnortLogsOut(BaseModel):
    id: int
    timestamp: str
    priority: int
    protocol: str
    raw: str
    length: int
    direction: str
    src_ip: str
    src_port: int
    dest_ip: str
    dest_port: int
    classification: str
    action: str
    message: str
    description: str
    host: str

    class Config:
        orm_mode = True
        
class AccountBase(BaseModel):
    id: Optional[int] = None
    userid:  Optional[str] = None
    userFirstName:  Optional[str] = None
    userLastName:  Optional[str] = None
    passwd :  Optional[str] = None
    userComName :  Optional[str] = None
    userEmail :  Optional[str] = None
    userPhoneNum :  Optional[str] = None
    userRole :  Optional[str] = None
    userSuspend :  Optional[bool] = None   




class AccountLogin(BaseModel):
    userid : int
    userRole : str
    passwd : str

class CreditCardBase(BaseModel):
    creditFirstName: str
    creditLastName: str
    creditNum: str
    creditDate: str
    creditCVV: int
    subscription: str
    total: str


class Token(BaseModel):
    access_token: str
    token_type: str
