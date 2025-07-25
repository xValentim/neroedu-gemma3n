from fastapi import APIRouter
from app.routers.schemas import User, UserUpdate

from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query
from app.database import *

router = APIRouter(
    prefix="/users",
    tags=["Users"])

# Create database and tables on startup
@router.on_event("startup")
def on_startup():
    print("Creating database and tables...")
    create_db_and_tables()

# Create a new user
@router.post("/")
def create_user(user: User, session: SessionDep) -> User:
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

# Read all users
@router.get("/")
def read_users(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[User]:
    users = session.exec(select(User).offset(offset).limit(limit)).all()
    return users

# Read a single user
@router.get("/{user_id}")
def read_user(user_id: int, session: SessionDep) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Update a user
@router.patch("/{user_id}")
def update_user(user_id: int, 
                user: UserUpdate,
                session: SessionDep):
    user_db = session.get(User, user_id)
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")
    user_data = user.model_dump(exclude_unset=True)
    user_db.sqlmodel_update(user_data)
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    return user_db

# Delete a user
@router.delete("/{user_id}")
def delete_user(user_id: int, session: SessionDep):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return {"ok": True}