from pydantic import BaseModel, IPvAnyAddress
from typing import List

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

class IPAddressSchema(BaseModel):
    ip: str
    reason : str

    class Config:
        from_attributes = True

class ClientSchema(BaseModel):
    name: str
    email: str

    class Config:
        from_attributes = True

class VerifyIPRequest(BaseModel):
    client_id: int
    ip: str

    class Config:
        from_attributes = True

class LogRequest(BaseModel):
    client_id: int
    log_data: str

    class Config:
        from_attributes = True  

class ClientRequest(BaseModel):
    name: str
    email: str

    class Config:
        from_attributes = True