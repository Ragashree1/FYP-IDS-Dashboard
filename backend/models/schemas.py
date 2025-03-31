<<<<<<< Updated upstream
from pydantic import BaseModel,EmailStr
=======
import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, IPvAnyAddress, validator, constr
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
class SnortLogsBase(BaseModel):
=======
    class Config:
        from_attributes = True  # Updated from orm_mode = True

class SnortAlertsBase(BaseModel):
>>>>>>> Stashed changes
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
        from_attributes = True  # Updated from orm_mode = True
        
class AccountBase(BaseModel):
<<<<<<< Updated upstream
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

    
=======
    id: Optional[int] = None  # Changed to make it truly optional
    username: str
    userFirstName: Optional[str] = ""  # Made optional with default empty string
    userLastName: Optional[str] = ""   # Made optional with default empty string
    passwd: Optional[str] = None
    userComName: str
    userEmail: EmailStr  # Changed to use EmailStr for better validation
    userPhoneNum: str
    userRole: Optional[int] = 1  # Set default value
    userSuspend: bool = True     # Default to suspended (pending approval)
    userRejected: Optional[bool] = False  # Added field for rejected status

    @validator('id', pre=True)
    def handle_empty_id(cls, v):
        if v == "" or v is None:
            return None
        return v
>>>>>>> Stashed changes


<<<<<<< Updated upstream
=======
    @validator('userEmail')
    def validate_email(cls, v):
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', v):
            raise ValueError('Invalid email format')
        return v

    @validator('passwd')
    def validate_password(cls, v):
        if v is None:  # Skip validation if no password is provided
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
>>>>>>> Stashed changes

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
        from_attributes = True  # Updated from orm_mode = True


class AccountOut(AccountBase):
    role: RoleOut  # Return role details instead of just an ID

    class Config:
<<<<<<< Updated upstream
        orm_mode = True
=======
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
        from_attributes = True  # Updated from orm_mode = True
>>>>>>> Stashed changes
