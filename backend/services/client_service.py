from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.models import Client
from models.schemas import ClientRequest

def register_client(client: ClientRequest, db: Session):
    existing_client = db.query(Client).filter(Client.email == client.email).first()
    if existing_client:
        raise HTTPException(status_code=400, detail="Client already exists.")

    new_client = Client(name=client.name, email=client.email)
    db.add(new_client)
    db.commit()
    db.refresh(new_client)  # Ensures new client data is returned correctly

    return {"status": "success", "message": "Client registered successfully!"}
