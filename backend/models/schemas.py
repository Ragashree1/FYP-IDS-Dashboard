import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, IPvAnyAddress, validator, constr
from typing import List, Optional, Dict, Any
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
    alert_source: str = "snort"
    organization_id: Optional[int] = None

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
    alert_source: str
    organization_id: Optional[int] = None
    
    class Config:
        from_attributes = True  # Updated from orm_mode = True
        
class SuricataAlertsBase(BaseModel):
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
    alert_source: str = "suricata"
    organization_id: Optional[int] = None

class SuricataAlertsOut(BaseModel):
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
    alert_source: str
    organization_id: Optional[int] = None

    class Config:
        from_attributes = True

class ZeekAlertsBase(BaseModel):
    timestamp: str
    priority: int
    priority_name: Optional[str] = None  # Add this line
    protocol: str
    raw: str
    length: int = 0
    direction: str = "->"
    src_ip: str
    src_port: int
    dest_ip: str
    dest_port: int
    classification: str
    action: str = "ALERT"
    message: str
    signature_id: str = "0"
    host: str
    alert_source: str = "zeek"
    organization_id: Optional[int] = None
    conn_id: Optional[str] = None
    event_type: Optional[str] = None
    uid: Optional[str] = None
    service: Optional[str] = None

class ZeekAlertsOut(BaseModel):
    id: int
    timestamp: str
    priority: int
    priority_name: Optional[str] = None  # Add this line
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
    alert_source: str
    organization_id: Optional[int] = None
    conn_id: Optional[str] = None
    event_type: Optional[str] = None
    uid: Optional[str] = None
    service: Optional[str] = None

    class Config:
        from_attributes = True

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
    organization_id: Optional[int] = None
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
    organization_id: int

    class Config:
        from_attributes = True

class ClientSchema(BaseModel):
    name: str
    email: str

    class Config:
        from_attributes = True

class VerifyIPRequest(BaseModel):
    organization_id: int
    ip: str

class PlaybookBase(BaseModel):
    name: str
    description: Optional[str] = None
    conditions: list
    actions: dict
    is_active: bool = True

    class Config:
        from_attributes = True

class LogRequest(BaseModel):
    log_data: str

    class Config:
        from_attributes = True  

class ClientRequest(BaseModel):
    name: str
    email: str

    class Config:
        from_attributes = True

class LogEntryOut(BaseModel):
    timestamp: str
    ip: str
    log_data: str

    class Config:
        orm_mode = True

class PlaybookOut(PlaybookBase):
    id: int
    description: str = None  
    conditions: list  # JSON field
    actions: dict  # JSON field
    organization_id: int  # Foreign key to Organizations table
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Updated from orm_mode = True

class NetworkLogsBase(BaseModel):
    # timestamp: str
    dstport: int
    flow_duration: int
    total_fwd_packets: int
    total_bwd_packets: int
    total_length_fwd_packets: float
    total_length_bwd_packets: float
    fwd_packet_length_max: float
    fwd_packet_length_min: float
    fwd_packet_length_mean: float
    fwd_packet_length_std: float
    bwd_packet_length_max: float
    bwd_packet_length_min: float
    bwd_packet_length_mean: float
    bwd_packet_length_std: float
    flow_bytes_per_s: float
    flow_packets_per_s: float
    flow_iat_mean: float
    flow_iat_std: float
    flow_iat_max: float
    flow_iat_min: float
    fwd_iat_total: float
    fwd_iat_mean: float
    fwd_iat_std: float
    fwd_iat_max: float
    fwd_iat_min: float
    bwd_iat_total: float
    bwd_iat_mean: float
    bwd_iat_std: float
    bwd_iat_max: float
    bwd_iat_min: float
    fwd_psh_flags: int
    bwd_psh_flags: int
    fwd_urg_flags: int
    bwd_urg_flags: int
    fwd_header_length: int
    bwd_header_length: int
    fwd_packets_per_s: float
    bwd_packets_per_s: float
    min_packet_length: float
    max_packet_length: float
    packet_length_mean: float
    packet_length_std: float
    packet_length_variance: float
    fin_flag_count: int
    syn_flag_count: int
    rst_flag_count: int
    psh_flag_count: int
    ack_flag_count: int
    urg_flag_count: int
    cwe_flag_count: int
    ece_flag_count: int
    down_up_ratio: float
    average_packet_size: float
    avg_fwd_segment_size: float
    avg_bwd_segment_size: float
    fwd_avg_bytes_bulk: float
    fwd_avg_packets_bulk: float
    fwd_avg_bulk_rate: float
    bwd_avg_bytes_bulk: float
    bwd_avg_packets_bulk: float
    bwd_avg_bulk_rate: float
    subflow_fwd_packets: int
    subflow_fwd_bytes: int
    subflow_bwd_packets: int
    subflow_bwd_bytes: int
    init_win_bytes_forward: int
    init_win_bytes_backward: int
    act_data_pkt_fwd: int
    min_seg_size_forward: int
    active_mean: float
    active_std: float
    active_max: float
    active_min: float
    idle_mean: float
    idle_std: float
    idle_max: float
    idle_min: float

    class Config:
        orm_mode = True


class VerifyIPRequest(BaseModel):
    organization_id: int
    ip: str
class CombinedLogResponse(BaseModel):
    source: str
    timestamp: str
    message: str
    type: str
    additional_data: Optional[Dict[str, Any]] = None

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

class MLModelBase(BaseModel):
    model_name: str
    algorithm: str
    model_type: str  # 'anomaly' or 'multiclass'
    model_file_name: str
    model_file_path: str

    use_default_preprocessor: bool = False
    has_built_in_preprocessor: bool = False
    use_default_features: bool = False
    normal_class_name: Optional[str] = None

    preprocessor_file_name: Optional[str] = None
    preprocessor_file_path: Optional[str] = None
    label_mapping: Optional[Dict[str, str]] = None
    features_list: Optional[str] = None
    organization_id: int
    is_active: Optional[bool] = False

    @validator('model_type')
    def validate_model_type(cls, v):
        if v not in ['anomaly', 'multiclass']:
            raise ValueError('model_type must be either "anomaly" or "multiclass"')
        return v

    @validator('features_list')
    def validate_features_list(cls, v, values):
        # Skip validation if use_default_features is True
        if values.get('use_default_features', False):
            return v
        if not v or not v.strip():
            raise ValueError('features_list is required when not using default features')
        return v

    @validator('preprocessor_file_path')
    def validate_preprocessor(cls, v, values):
        # Skip validation if using default or built-in preprocessor
        if values.get('use_default_preprocessor', False) or values.get('has_built_in_preprocessor', False):
            return v
        if not v:
            raise ValueError('preprocessor file is required when not using default or built-in preprocessor')
        return v

class MLModelOut(BaseModel):
    id: int
    model_name: str
    algorithm: str
    model_type: str  # 'anomaly' or 'multiclass'
    model_file_name: str
    model_file_path: str
    preprocessor_file_name: Optional[str] = None
    preprocessor_file_path: Optional[str] = None
    use_default_preprocessor: bool = False
    use_default_preprocessor: bool = False
    has_built_in_preprocessor: bool = False
    normal_class_name: Optional[str] = None
    label_mapping: Optional[Dict[str, str]] = None
    features_list: Optional[str] = None
    use_default_features: bool = False
    organization_id: int
    is_active: bool = True

    class Config:
        from_attributes = True
