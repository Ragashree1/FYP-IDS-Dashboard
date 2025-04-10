import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, IPvAnyAddress, validator, constr
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

    class Config:
        from_attributes = True  # Updated from orm_mode = True

class MeetingMinutesOut(BaseModel):
    id: int
    date: str
    startTime: str
    endTime: str
    pplpresent: List[str]
    agenda: str
    discussion: str
    actions: str

    class Config:
        from_attributes = True  # Updated from orm_mode = True

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
        from_attributes = True  # Updated from orm_mode = True

class AccountBase(BaseModel):
    id: Optional[int] = None
    username: str
    userFirstName: Optional[str] = ""
    userLastName: Optional[str] = ""
    passwd: Optional[str] = None
    userComName: str
    userEmail: EmailStr
    userPhoneNum: str
    userRole: Optional[int] = 1
    userSuspend: bool = True
    userRejected: Optional[bool] = False
    fromOrgRequestsPage: Optional[bool] = False  # Ensure consistent naming

    @validator('id', pre=True)
    def handle_empty_id(cls, v):
        if v == "" or v is None:
            return None
        return v

    @validator('userPhoneNum')
    def validate_phone(cls, v):
        if not v or v.strip() == "":
            return "+65123456789"
        phone_regex = re.compile(r'^\+[1-9]\d{0,2}\d{6,14}$')
        if not phone_regex.match(v):
            raise ValueError('Phone number must follow format: +[country code][number]')
        if len(v) < 9:
            raise ValueError('Phone number too short')
        if len(v) > 16:
            raise ValueError('Phone number too long')
        return v

    @validator('userEmail')
    def validate_email(cls, v):
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', v):
            raise ValueError('Invalid email format')
        return v

    @validator('passwd')
    def validate_password(cls, v):
        if v is None:
            return v
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
        from_attributes = True  # Updated from orm_mode = True

class AccountStatusCheck(BaseModel):
    exists: bool
    userSuspend: bool
    userRejected: bool

class AccountLogin(BaseModel):
    userComName: str
    userRole: Optional[int] = None
    username: str
    passwd: str

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
    id: int
    roleName: str

class RoleIn(RoleBase):
    id: Optional[int] = None
    roleName: Optional[str] = None
    permission_id: Optional[List[int]] = None

class RoleOut(RoleBase):
    id: Optional[int] = None
    roleName: Optional[str] = None
    permissions: Optional[List[PermissionBase]] = None
    permission_id: Optional[List[int]] = None

    class Config:
        from_attributes = True  # Updated from orm_mode = True

class AccountOut(AccountBase):
    role: RoleOut

    class Config:
        from_attributes = True  # Updated from orm_mode = True

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
        from_attributes = True  # Updated from orm_mode = True

class IPAddressSchema(BaseModel):
    ip: str
    reason: str

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
    conditions: list
    actions: dict
    organization_id: uuid.UUID = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Updated from orm_mode = True

class ActivityLogBase(BaseModel):
    user: str
    targetUser: str
    action: str
    description: str
    ipAddress: Optional[str] = "127.0.0.1"
    userComName: Optional[str] = None

class ActivityLog(ActivityLogBase):
    id: Optional[int] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# New SystemLogBase model for tracking system activities
class SystemLogBase(BaseModel):
    user: str
    component: str
    action: str
    description: str
    ipAddress: Optional[str] = "127.0.0.1"
    resourceId: Optional[str] = None
    resourceName: Optional[str] = None
    userComName: Optional[str] = None

class SystemLog(SystemLogBase):
    id: Optional[int] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# New ReviewBase model for customer reviews
class ReviewBase(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    rating: int
    review_text: str
    
    @validator('rating')
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v
    
    @validator('review_text')
    def validate_review_text(cls, v):
        if len(v) < 5:
            raise ValueError('Review text must be at least 5 characters long')
        return v

# New ReviewOut model for returning reviews
class ReviewOut(ReviewBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True