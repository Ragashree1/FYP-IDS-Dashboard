from fastapi import APIRouter, HTTPException
from starlette import status
from models.schemas import AccountBase
from services import registration_service

router = APIRouter(prefix="/register", tags=["register"])

@router.post("/", response_model=AccountBase)
def add_user(user: AccountBase):
    try:
        new_user = registration_service.add_user(user_particulars=user)
        return new_user
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

