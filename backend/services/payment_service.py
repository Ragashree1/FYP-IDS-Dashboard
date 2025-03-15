from database import SessionLocal
from models.models import CreditCard
from models.schemas import CreditCardBase
from jose import jwt, JWTError

from fastapi import APIRouter, Depends, HTTPException


#Rmb to find a way to encrypt credit card details

def add_creditcard(card_particulars: CreditCardBase):
    with SessionLocal() as db: 
        create_card = CreditCard(**card_particulars.model_dump())
        db.add(create_card)
        db.commit()
        db.refresh(create_card)
        return create_card