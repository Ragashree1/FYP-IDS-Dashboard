from fastapi import APIRouter, HTTPException
from models.schemas import AccountBase
from services import account_service

router = APIRouter(prefix="/accounts", tags=["accounts"])

@router.post("/")
async def create_account(account: AccountBase):
    try:
        return await account_service.create_account(account)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
