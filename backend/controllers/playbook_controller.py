from fastapi import APIRouter, HTTPException
from services import playbook_service
from models.schemas import PlaybookBase, PlaybookOut
from typing import List
import uuid

router = APIRouter(prefix="/playbooks", tags=["playbooks"])

@router.get("/", response_model=List[PlaybookOut])
def fetch_playbooks():
    """Get all playbooks"""
    return playbook_service.get_all_playbooks()

@router.post("/", response_model=PlaybookOut)
def create_playbook(playbook: PlaybookBase):
    """Create a new playbook"""
    # Hardcoded organization_id for now - you might want to get this from auth context
    organization_id = uuid.UUID("12345678-1234-5678-1234-567812345678")
    return playbook_service.add_playbook(playbook_data=playbook, organization_id=organization_id)

@router.delete("/{playbook_id}")
def remove_playbook(playbook_id: int):
    """Delete a playbook"""
    success = playbook_service.delete_playbook(playbook_id=playbook_id)
    if not success:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return {"message": "Playbook deleted successfully"}

@router.put("/{playbook_id}", response_model=PlaybookOut)
def modify_playbook(playbook_id: int, update_data: PlaybookBase):
    """Update a playbook"""
    updated_playbook = playbook_service.update_playbook(
        playbook_id=playbook_id, 
        update_data=update_data
    )
    if not updated_playbook:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return updated_playbook

@router.post("/{playbook_id}/toggle", response_model=PlaybookOut)
def toggle_status(playbook_id: int):
    """Toggle playbook active status"""
    updated_playbook = playbook_service.toggle_playbook_status(playbook_id=playbook_id)
    if not updated_playbook:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return updated_playbook

@router.get("/active", response_model=List[PlaybookOut])
def get_active_playbooks():
    """Get all active playbooks"""
    return playbook_service.get_active_playbooks()
