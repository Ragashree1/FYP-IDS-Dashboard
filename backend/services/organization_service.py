import uuid
from database import SessionLocal
from models.models import Organization

DEFAULT_ORG_ID = uuid.UUID("12345678-1234-5678-1234-567812345678")

def ensure_default_organization():
    with SessionLocal() as db:
        org = db.query(Organization).filter(Organization.id == DEFAULT_ORG_ID).first()
        if not org:
            org = Organization(
                id=DEFAULT_ORG_ID,
                name="Default Organization"
            )
            db.add(org)
            db.commit()
            db.refresh(org)
        return org
