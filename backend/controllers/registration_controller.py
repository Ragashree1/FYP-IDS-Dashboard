from fastapi import APIRouter, HTTPException, Depends, Request, Response
from starlette import status
from models.schemas import AccountBase
from services import registration_service
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter(prefix="/register", tags=["register"])

@router.post("/", response_model=AccountBase)
<<<<<<< Updated upstream
def add_user(user: AccountBase):
    new_user = registration_service.add_user(user_particulars=user)
    return new_user
=======
async def add_user(request: Request, user: AccountBase, response: Response = None):
    try:
        # Set CORS headers
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            
        # Log the request body for debugging
        body = await request.json()
        print(f"Received registration request: {body}")
        
        # Remove id if it's empty string
        if hasattr(user, 'id') and (user.id is None or user.id == ""):
            user.id = None
        
        # Ensure new users are suspended by default (pending approval)
        user.userSuspend = True
        user.userRejected = False
        
        # Set default role to Organisation Admin (role ID 1) if not provided
        if not hasattr(user, 'userRole') or user.userRole is None:
            user.userRole = 1
        
        # Add the user
        new_user = registration_service.add_user(user_particulars=user)
        return new_user
    except HTTPException as e:
        print(f"HTTP Exception in add_user controller: {e.detail}")
        raise e
    except ValueError as e:
        print(f"Value Error in add_user controller: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        # Add more detailed error logging
        print(f"Error in add_user controller: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# Add OPTIONS method handler for CORS preflight requests
@router.options("/")
async def options_handler(response: Response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return {}
>>>>>>> Stashed changes

