from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import ClientRequest
from services.client_service import register_client

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.post("/register")
def register_client_api(client: ClientRequest, db: Session = Depends(get_db)):
    new_client = register_client(client, db)
    return {"status": "success", "client_id": new_client.id, "message": "Client registered successfully!"}

