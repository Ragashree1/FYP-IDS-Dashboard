from typing import List
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import MeetingMinutesBase, MeetingMinutesOut
from services import meeting_service

router = APIRouter(prefix="/meetingminutes", tags=["meetingminutes"])

@router.get("/", response_model=List[MeetingMinutesOut])
def fetch_meeting_minutes():
    return meeting_service.get_all_meeting_minutes()

@router.post("/", response_model=MeetingMinutesOut)
async def create_meeting(meeting: MeetingMinutesBase):
    return meeting_service.add_meeting_minute(meeting)

@router.delete("/{meeting_id}")
def remove_meeting(meeting_id: int):
    success = meeting_service.delete_meeting_minute(meeting_id)
    if not success:
        raise HTTPException(status_code=404, detail="Meeting Minutes not found.")

@router.put("/{meeting_id}", response_model=MeetingMinutesOut)
async def modify_meeting(meeting_id: int, update_data: MeetingMinutesBase):
    updated_meeting = meeting_service.update_meeting_minute(meeting_id, update_data)
    if not updated_meeting:
        raise HTTPException(status_code=404, detail="Meeting minute not found")
    return updated_meeting