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
