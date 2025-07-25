import numpy as np

from fastapi import APIRouter, Depends, HTTPException

from ..dependencies import get_token_header
from app.routers.schemas import User, UserUpdate, DocumentInput, DocumentOutput, OutputSummary, Item
from app.routers.users import read_user, update_user
from app.routers.items import create_item
from app.routers.credits import get_credits, add_credits, remove_credits
from app.database import *

router = APIRouter(
    prefix="/services",
    tags=["services"],
    dependencies=[Depends(get_token_header)],
    responses={404: {"description": "Not found"}},
)

def fake_llm(document: DocumentInput) -> DocumentOutput:
    return DocumentOutput(
        document=document,
        summary="This is a fake summary",
    )
    
def trigger_create_item(title: str, 
                        content: str,
                        cost_credits: int,
                        tokens: int,
                        user_id: int,
                        session: SessionDep):
    item_data = Item(
        title=title,
        content=content,
        cost_credits=cost_credits,
        tokens=tokens,
        user_id=user_id
    )
    item = create_item(item_data, session)
    return item

@router.get("/summary/{user_id}")
async def to_summary(user_id: int,
                     session: SessionDep,
                     document: DocumentInput) -> OutputSummary:
    user = read_user(user_id, session)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="User is not active")
    
    current_credit = user.current_credit
    credits = 1.0 # 1 credit per service request
    is_ok = (current_credit >= credits) or (current_credit == -1.0) 
    if not is_ok:
        raise HTTPException(status_code=400, detail="Not enough credits")
    
    # Request do serviço
    response = fake_llm(document)
    tokens_random = np.random.randint(1_000, 5_000)
    request = 1
    # -------------------
    
    # Faz update do usuário
    user.tokens += tokens_random
    user.requests += request
    user.current_credit -= credits if current_credit != -1.0 else 0.0

    user = update_user(user_id, user, session)
    
    TRIGGER = True
    if TRIGGER:
        item = trigger_create_item(
            title=document.title,
            content=document.content,
            cost_credits=credits,
            tokens=tokens_random,
            user_id=user_id,
            session=session
        )
    
    return OutputSummary(
        user=user,
        document=document,
        summary=response.summary
    )