from fastapi import APIRouter
from app.routers.schemas import User, UserUpdate, Item

from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query
from app.database import *

router = APIRouter(
    prefix="/items",
    tags=["Items"])

# Create database and tables on startup
@router.on_event("startup")
def on_startup():
    print("Creating database and tables...")
    create_db_and_tables()

# Create a new item
@router.post("/")
def create_item(item: Item, session: SessionDep) -> Item:
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

# Read all items
@router.get("/")
def read_items(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Item]:
    items = session.exec(select(Item).offset(offset).limit(limit)).all()
    return items

# Read a single item
@router.get("/{item_id}")
def read_item(item_id: int, session: SessionDep) -> Item:
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

# Update a item
@router.patch("/{item_id}")
def update_item(item_id: int, 
                item: UserUpdate,
                session: SessionDep):
    item_db = session.get(Item, item_id)
    if not item_db:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = item.model_dump(exclude_unset=True)
    item_db.sqlmodel_update(item_data)
    session.add(item_db)
    session.commit()
    session.refresh(item_db)
    return item_db

# Delete a item
@router.delete("/{item_id}")
def delete_item(item_id: int, session: SessionDep):
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    session.delete(item)
    session.commit()
    return {"ok": True}