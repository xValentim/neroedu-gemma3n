from typing import Annotated
from fastapi import Header, HTTPException
from dotenv import load_dotenv
import os

load_dotenv()

X_TOKEN_SECRET = os.getenv("X_TOKEN_SECRET")
QUERY_TOKEN = os.getenv("QUERY_TOKEN")

async def get_token_header(x_token: Annotated[str, Header()]):
    if x_token != X_TOKEN_SECRET:
        raise HTTPException(status_code=400,                            detail="X-Token header invalid")

async def get_query_token(token: str):
    if token != QUERY_TOKEN:
        raise HTTPException(status_code=400, detail="No QUERY_TOKEN token provided")