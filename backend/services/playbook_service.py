from database import SessionLocal
from models.models import Playbook
from models.schemas import PlaybookBase, PlaybookOut
from typing import List, Optional
from fastapi import HTTPException
import uuid
from services.organization_service import ensure_default_organization, DEFAULT_ORG_ID

def get_all_playbooks() -> List[PlaybookOut]:
    with SessionLocal() as db:
        playbooks = db.query(Playbook).all()
        return [PlaybookOut.model_validate(playbook) for playbook in playbooks]

def add_playbook(playbook_data: PlaybookBase, organization_id: uuid.UUID = DEFAULT_ORG_ID) -> PlaybookOut:
    with SessionLocal() as db:
        # Ensure default organization exists
        ensure_default_organization()
        
        # Check if playbook with same name exists
        existing = db.query(Playbook).filter(Playbook.name == playbook_data.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Playbook with this name already exists")

        db_playbook = Playbook(
            organization_id=organization_id,
            **playbook_data.model_dump()
        )
        db.add(db_playbook)
        db.commit()
        db.refresh(db_playbook)
        return PlaybookOut.model_validate(db_playbook)

def delete_playbook(playbook_id: int) -> bool:
    with SessionLocal() as db:
        playbook = db.query(Playbook).filter(Playbook.id == playbook_id).first()
        if playbook:
            db.delete(playbook)
            db.commit()
            return True
        return False

def update_playbook(playbook_id: int, update_data: PlaybookBase) -> Optional[PlaybookOut]:
    with SessionLocal() as db:
        playbook = db.query(Playbook).filter(Playbook.id == playbook_id).first()
        if not playbook:
            return None

        # Check if updated name conflicts with existing playbook
        if update_data.name != playbook.name:
            existing = db.query(Playbook).filter(Playbook.name == update_data.name).first()
            if existing:
                raise HTTPException(status_code=400, detail="Playbook with this name already exists")

        for key, value in update_data.model_dump().items():
            setattr(playbook, key, value)

        db.commit()
        db.refresh(playbook)
        return PlaybookOut.model_validate(playbook)

def toggle_playbook_status(playbook_id: int) -> Optional[PlaybookOut]:
    with SessionLocal() as db:
        playbook = db.query(Playbook).filter(Playbook.id == playbook_id).first()
        if not playbook:
            return None

        playbook.is_active = not playbook.is_active
        db.commit()
        db.refresh(playbook)
        return PlaybookOut.model_validate(playbook)

def get_active_playbooks() -> List[PlaybookOut]:
    with SessionLocal() as db:
        playbooks = db.query(Playbook).filter(Playbook.is_active == True).all()
        return [PlaybookOut.model_validate(playbook) for playbook in playbooks]
