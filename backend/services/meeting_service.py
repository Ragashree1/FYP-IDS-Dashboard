from typing import List, Optional
from database import SessionLocal
from models.models import MeetingMinutes
from models.schemas import MeetingMinutesBase, MeetingMinutesOut

def get_all_meeting_minutes() -> List[MeetingMinutesOut]:
    with SessionLocal() as db:  
        return db.query(MeetingMinutes).all()

def add_meeting_minute(meeting: MeetingMinutesBase) -> MeetingMinutesOut:
    with SessionLocal() as db:  
        db_meeting = MeetingMinutes(**meeting.model_dump())
        db.add(db_meeting)
        db.commit()
        db.refresh(db_meeting)
        return db_meeting

def delete_meeting_minute( meeting_id: int) -> bool:
    with SessionLocal() as db:  
        meeting = db.query(MeetingMinutes).filter(MeetingMinutes.id == meeting_id).first()
        if meeting:
            db.delete(meeting)
            db.commit()
            return True
        return False

def update_meeting_minute(meeting_id: int, update_data: MeetingMinutesBase) -> Optional[MeetingMinutesOut]:
    with SessionLocal() as db:  
        meeting_minute = db.query(MeetingMinutes).filter(MeetingMinutes.id == meeting_id).first()
        if not meeting_minute:
            return None
        
        for key, value in update_data.model_dump().items():
            setattr(meeting_minute, key, value)
        
        db.commit()
        db.refresh(meeting_minute)
        return meeting_minute
    
    #