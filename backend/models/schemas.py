import uuid
from datetime import datetime
from pydantic import BaseModel,EmailStr, IPvAnyAddress, validator, constr
from typing import List, Optional
import re

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
    id: Optional[int] = None  # Changed to make it truly optional
    username: str
    userFirstName: str
    userLastName: str
    passwd: str
    userComName: str
    userEmail: EmailStr  # Changed to use EmailStr for better validation
    userPhoneNum: str
    userRole: Optional[int] = 1  # Set default value
    userSuspend: bool = False

    @validator('id', pre=True)
    def handle_empty_id(cls, v):
        if v == "":
            return None
        return v

    @validator('userPhoneNum')
    def validate_phone(cls, v):
        # Validate phone number format
        phone_regex = re.compile(r'^\+[1-9]\d{0,2}\d{6,14}$')
        if not phone_regex.match(v):
            raise ValueError('Phone number must follow format: +[country code][number]')
        
        # Check for minimum length (country code + 7 digits)
        if len(v) < 9:  # +[1-3 digits] + 7 digits minimum
            raise ValueError('Phone number too short')
            
        # Check for maximum length (country code + 15 digits)
        if len(v) > 16:  # + + 15 digits maximum
            raise ValueError('Phone number too long')
            
        return v

    @validator('userEmail')
    def validate_email(cls, v):
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', v):
            raise ValueError('Invalid email format')
        return v

    @validator('passwd')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain number')
        if not re.search(r'[!@#$%^&*]', v):
            raise ValueError('Password must contain special character')
        return v

    class Config:
        orm_mode = True

class AccountLogin(BaseModel):
    userComName : str
    userRole: Optional[int] = None
    username : str
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

class PlaybookBase(BaseModel):
    name: str
    description: str | None = None
    conditions: list
    actions: dict
    is_active: bool = True

    class Config:
        from_attributes = True

class PlaybookOut(PlaybookBase):
    id: int
    description: str = None  
    conditions: list  # JSON field
    actions: dict  # JSON field
    organization_id: uuid.UUID  # Foreign key to Organizations table
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


