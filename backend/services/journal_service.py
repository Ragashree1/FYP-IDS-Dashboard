from database import SessionLocal
from models.models import Journal
from models.schemas import JournalBase, JournalOut
from typing import List, Optional

def get_all_journals() -> List[JournalOut]:
    with SessionLocal() as db:  
        journals = db.query(Journal).all()
        return [JournalOut.model_validate(journal) for journal in journals]

def add_journal(journal_data: JournalBase) -> JournalOut:
    with SessionLocal() as db: 
        db_journal = Journal(**journal_data.model_dump())
        db.add(db_journal)
        db.commit()
        db.refresh(db_journal)
        return JournalOut.model_validate(db_journal)

def delete_journal(journal_id: int) -> bool:
    with SessionLocal() as db: 
        journal = db.query(Journal).filter(Journal.id == journal_id).first()
        if journal:
            db.delete(journal)
            db.commit()
            return True
        return False

def update_journal(journal_id: int, update_data: JournalBase) -> Optional[JournalOut]:
    with SessionLocal() as db:  
        journal = db.query(Journal).filter(Journal.id == journal_id).first()
        if not journal:
            return None

        for key, value in update_data.model_dump().items():
            setattr(journal, key, value)

        db.commit()
        db.refresh(journal)
        return JournalOut.model_validate(journal)
