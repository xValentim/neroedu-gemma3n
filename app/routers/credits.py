import numpy as np

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import get_token_header
from app.routers.schemas import User, UserUpdate, DocumentInput, DocumentOutput, OutputSummary, CreditsRequest
from app.routers.users import *
from app.database import *

router = APIRouter(
    prefix="/credits",
    tags=["credits"],
    dependencies=[Depends(get_token_header)],
    responses={404: {"description": "Not found"}},
)

# Get credits
@router.get("/{user_id}")
async def get_credits(user_id: int,
                      session: SessionDep):
    user = read_user(user_id, session)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user.id
    current_credit = user.current_credit
    is_active = user.is_active
    
    return {"user_id": user_id, 
            "current_credit": current_credit, 
            "is_active": is_active}
    
# Add credits
@router.post("/add/{user_id}")
async def add_credits(user_id: int,
                      data: CreditsRequest,
                      session: SessionDep):
    user = read_user(user_id, session)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.current_credit += data.credits
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return {"user_id": user.id, 
            "current_credit": user.current_credit, 
            "is_active": user.is_active}
    
# Remove credits
@router.post("/remove/{user_id}")
async def remove_credits(user_id: int,
                         data: CreditsRequest,
                         session: SessionDep):
    user = read_user(user_id, session)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.current_credit -= data.credits
    if user.current_credit < 0 and user.is_active:
        user.current_credit = 0.0
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return {"user_id": user.id, 
            "current_credit": user.current_credit, 
            "is_active": user.is_active}