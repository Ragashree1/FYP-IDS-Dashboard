from fastapi import APIRouter, HTTPException
from starlette import status
from models.schemas import CreditCardBase
from services import payment_service

router = APIRouter(prefix="/payment", tags=["payment"])

@router.post("/", response_model=CreditCardBase)
def add_card(card: CreditCardBase):
    new_card = payment_service.add_creditcard(card_particulars = card)
    return new_card

