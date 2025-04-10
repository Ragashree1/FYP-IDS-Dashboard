from database import SessionLocal
from models.models import Playbook
from models.schemas import PlaybookBase, PlaybookOut
from typing import List, Optional
from fastapi import HTTPException
import uuid

def get_all_playbooks(company_name: str = None) -> List[PlaybookOut]:
    """Get all playbooks, optionally filtered by company name"""
    with SessionLocal() as db:
        query = db.query(Playbook)
        if company_name:
            # Check if company_name column exists in the Playbook model
            if hasattr(Playbook, 'company_name'):
                query = query.filter(Playbook.company_name == company_name)
            # If not, try to filter by organization_id using a join
            elif hasattr(Playbook, 'organization_id'):
                # This assumes there's a relationship between Playbook and Organization
                # If not, you'll need to modify this to use a join
                from models.models import Organization
                query = query.join(Organization, Playbook.organization_id == Organization.id)
                query = query.filter(Organization.name == company_name)
        
        playbooks = query.all()
        return [PlaybookOut.model_validate(playbook) for playbook in playbooks]

def get_playbook_by_id(playbook_id: int, company_name: str = None) -> Optional[PlaybookOut]:
    """Get a playbook by its ID"""
    with SessionLocal() as db:
        query = db.query(Playbook).filter(Playbook.id == playbook_id)
        if company_name:
            # Check if company_name column exists in the Playbook model
            if hasattr(Playbook, 'company_name'):
                query = query.filter(Playbook.company_name == company_name)
            # If not, try to filter by organization_id using a join
            elif hasattr(Playbook, 'organization_id'):
                # This assumes there's a relationship between Playbook and Organization
                # If not, you'll need to modify this to use a join
                from models.models import Organization
                query = query.join(Organization, Playbook.organization_id == Organization.id)
                query = query.filter(Organization.name == company_name)
                
        playbook = query.first()
        if playbook:
            return PlaybookOut.model_validate(playbook)
        return None

def add_playbook(playbook_data: PlaybookBase, company_name: str = None) -> PlaybookOut:
    with SessionLocal() as db:
        # Check if playbook with same name exists for this company
        query = db.query(Playbook).filter(Playbook.name == playbook_data.name)
        if company_name:
            # Check if company_name column exists in the Playbook model
            if hasattr(Playbook, 'company_name'):
                query = query.filter(Playbook.company_name == company_name)
            # If not, try to filter by organization_id using a join
            elif hasattr(Playbook, 'organization_id'):
                # This assumes there's a relationship between Playbook and Organization
                # If not, you'll need to modify this to use a join
                from models.models import Organization
                query = query.join(Organization, Playbook.organization_id == Organization.id)
                query = query.filter(Organization.name == company_name)
                
        existing = query.first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Playbook with this name already exists")

        # Create a dictionary from the playbook_data
        playbook_dict = playbook_data.model_dump()
        
        # Add company_name to the dictionary if it exists in the model
        db_playbook = None
        if hasattr(Playbook, 'company_name') and company_name:
            db_playbook = Playbook(
                company_name=company_name,
                **playbook_dict
            )
        elif hasattr(Playbook, 'organization_id') and company_name:
            # Get organization_id from company_name
            from models.models import Organization
            organization = db.query(Organization).filter(Organization.name == company_name).first()
            
            if not organization:
                # Create organization if it doesn't exist
                organization_id = uuid.uuid4()
                organization = Organization(
                    id=organization_id,
                    name=company_name
                )
                db.add(organization)
                db.commit()
                db.refresh(organization)
                
            db_playbook = Playbook(
                organization_id=organization.id,
                **playbook_dict
            )
        else:
            # If neither company_name nor organization_id exists, just create the playbook
            db_playbook = Playbook(**playbook_dict)
            
        db.add(db_playbook)
        db.commit()
        db.refresh(db_playbook)
        return PlaybookOut.model_validate(db_playbook)

def delete_playbook(playbook_id: int, company_name: str = None) -> bool:
    with SessionLocal() as db:
        query = db.query(Playbook).filter(Playbook.id == playbook_id)
        if company_name:
            # Check if company_name column exists in the Playbook model
            if hasattr(Playbook, 'company_name'):
                query = query.filter(Playbook.company_name == company_name)
            # If not, try to filter by organization_id using a join
            elif hasattr(Playbook, 'organization_id'):
                # This assumes there's a relationship between Playbook and Organization
                # If not, you'll need to modify this to use a join
                from models.models import Organization
                query = query.join(Organization, Playbook.organization_id == Organization.id)
                query = query.filter(Organization.name == company_name)
                
        playbook = query.first()
        if playbook:
            db.delete(playbook)
            db.commit()
            return True
        return False

def update_playbook(playbook_id: int, update_data: PlaybookBase, company_name: str = None) -> Optional[PlaybookOut]:
    with SessionLocal() as db:
        query = db.query(Playbook).filter(Playbook.id == playbook_id)
        if company_name:
            # Check if company_name column exists in the Playbook model
            if hasattr(Playbook, 'company_name'):
                query = query.filter(Playbook.company_name == company_name)
            # If not, try to filter by organization_id using a join
            elif hasattr(Playbook, 'organization_id'):
                # This assumes there's a relationship between Playbook and Organization
                # If not, you'll need to modify this to use a join
                from models.models import Organization
                query = query.join(Organization, Playbook.organization_id == Organization.id)
                query = query.filter(Organization.name == company_name)
                
        playbook = query.first()
        if not playbook:
            return None

        # Check if updated name conflicts with existing playbook
        if update_data.name != playbook.name:
            name_query = db.query(Playbook).filter(Playbook.name == update_data.name)
            if company_name:
                # Check if company_name column exists in the Playbook model
                if hasattr(Playbook, 'company_name'):
                    name_query = name_query.filter(Playbook.company_name == company_name)
                # If not, try to filter by organization_id using a join
                elif hasattr(Playbook, 'organization_id'):
                    # This assumes there's a relationship between Playbook and Organization
                    # If not, you'll need to modify this to use a join
                    from models.models import Organization
                    name_query = name_query.join(Organization, Playbook.organization_id == Organization.id)
                    name_query = name_query.filter(Organization.name == company_name)
                    
            name_query = name_query.filter(Playbook.id != playbook_id)
            existing = name_query.first()
            if existing:
                raise HTTPException(status_code=400, detail="Playbook with this name already exists")

        # Update playbook fields
        update_dict = update_data.model_dump()
        for key, value in update_dict.items():
            setattr(playbook, key, value)

        db.commit()
        db.refresh(playbook)
        return PlaybookOut.model_validate(playbook)

def toggle_playbook_status(playbook_id: int, company_name: str = None) -> Optional[PlaybookOut]:
    with SessionLocal() as db:
        query = db.query(Playbook).filter(Playbook.id == playbook_id)
        if company_name:
            # Check if company_name column exists in the Playbook model
            if hasattr(Playbook, 'company_name'):
                query = query.filter(Playbook.company_name == company_name)
            # If not, try to filter by organization_id using a join
            elif hasattr(Playbook, 'organization_id'):
                # This assumes there's a relationship between Playbook and Organization
                # If not, you'll need to modify this to use a join
                from models.models import Organization
                query = query.join(Organization, Playbook.organization_id == Organization.id)
                query = query.filter(Organization.name == company_name)
                
        playbook = query.first()
        if not playbook:
            return None

        playbook.is_active = not playbook.is_active
        db.commit()
        db.refresh(playbook)
        return PlaybookOut.model_validate(playbook)

def get_active_playbooks(company_name: str = None) -> List[PlaybookOut]:
    with SessionLocal() as db:
        query = db.query(Playbook).filter(Playbook.is_active == True)
        if company_name:
            # Check if company_name column exists in the Playbook model
            if hasattr(Playbook, 'company_name'):
                query = query.filter(Playbook.company_name == company_name)
            # If not, try to filter by organization_id using a join
            elif hasattr(Playbook, 'organization_id'):
                # This assumes there's a relationship between Playbook and Organization
                # If not, you'll need to modify this to use a join
                from models.models import Organization
                query = query.join(Organization, Playbook.organization_id == Organization.id)
                query = query.filter(Organization.name == company_name)
                
        playbooks = query.all()
        return [PlaybookOut.model_validate(playbook) for playbook in playbooks]