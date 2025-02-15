from fastapi import APIRouter, HTTPException, Depends
from services import journal_service
from models.schemas import JournalBase, JournalOut
from typing import List

router = APIRouter(prefix="/journals", tags=["journals"])

@router.get("/", response_model=List[JournalOut])
def fetch_journals():
    journals = journal_service.get_all_journals()
    return journals

@router.post("/", response_model=JournalOut)
def create_journal(journal: JournalBase):
    new_journal = journal_service.add_journal(journal_data=journal)
    return new_journal

@router.delete("/{journal_id}")
def remove_journal(journal_id: int):
    success = journal_service.delete_journal(journal_id=journal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Journal not found.")
    return {"message": "Journal deleted successfully"}


@router.put("/{journal_id}", response_model=JournalOut)
def modify_journal(journal_id: int, update_data: JournalBase):
    updated_journal = journal_service.update_journal(journal_id=journal_id, update_data=update_data)
    if not updated_journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    return updated_journal
