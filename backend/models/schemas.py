from pydantic import BaseModel,EmailStr, IPvAnyAddress
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

class SnortAlertsBase(BaseModel):
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
    signature_id: str
    host: str

class SnortAlertsOut(BaseModel):
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
    signature_id: str
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
    userRole :  Optional[int] = None
    userSuspend :  Optional[bool] = None   

    



class AccountLogin(BaseModel):
    userComName : str
    userRole: Optional[int] = None
    userid : str
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


class PermissionBase(BaseModel):
    id: int
    permissionName: str

    class Config:
        from_attributes = True


class RoleBase(BaseModel):
    id:int
    roleName: str

class RoleIn(RoleBase):
    id:Optional[int] = None
    roleName: Optional[str] = None
    permission_id: Optional[List[int]] = None

class RoleOut(RoleBase):
    id:Optional[int] = None
    roleName: Optional[str] = None
    permissions: Optional[List[PermissionBase]] = None  # Return permission details
    permission_id: Optional[List[int]] = None

    class Config:
        orm_mode = True


class AccountOut(AccountBase):
    role: RoleOut  # Return role details instead of just an ID

    class Config:
        orm_mode = True

class LogsBase(BaseModel):
    timestamp: str
    log_type: str
    source_ip: str
    host: str
    message: str
    event_data: dict
    http_method: str = None
    http_status: int = None
    url: str = None
    user_agent: str = None
    log_path: str = None

class LogsOut(BaseModel):
    id: int
    timestamp: str
    log_type: str
    source_ip: str
    host: str
    message: str
    event_data: dict
    http_method: str = None
    http_status: int = None
    url: str = None
    user_agent: str = None
    log_path: str = None

    class Config:
        orm_mode = True
class IPAddressSchema(BaseModel):
    ip: str
    reason : str
