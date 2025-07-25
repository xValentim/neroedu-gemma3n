from fastapi import Depends, FastAPI
import subprocess
import requests

# from apscheduler.schedulers.background import BackgroundScheduler
# from apscheduler.triggers.interval import IntervalTrigger
from contextlib import asynccontextmanager 
from fastapi.middleware.cors import CORSMiddleware
import time

# from .dependencies import get_query_token, get_token_header
# from app.internal import admin
# from app.routers import credits, users, services, items

BASE_URL = "http://localhost:11434"

def get_models_info():
    response = requests.get(f"{BASE_URL}/api/tags")
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to fetch models info"}

def debug():
    print("Debugging...")

# Cron job/Background task
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        print("Init Ollama Serve...")
        # Inicia o ollama serve em background
        ollama_process = subprocess.Popen(["ollama", "serve"])

        # Aguarda um tempo para garantir que o Ollama subiu
        time.sleep(5)
        print("Ollama Serve started!")
    except Exception as e:
        print(f"Error starting Ollama Serve: {e}")
        
    yield
    try:
        print("Shutting down Ollama Serve...")
        # Encerra o processo do ollama serve
        ollama_process.terminate()
        ollama_process.wait()
    except Exception as e:
        print(f"Error shutting down Ollama Serve: {e}")
    finally:
        print("Ollama Serve shutdown!")

# app = FastAPI(dependencies=[Depends(get_query_token)],
#               lifespan=lifespan)

app = FastAPI(lifespan=lifespan)

# Allow all origins (Cors)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(users.router)
# app.include_router(items.router)
# app.include_router(services.router)
# app.include_router(credits.router)
# app.include_router(
#     admin.router,
#     prefix="/admin",
#     tags=["admin"],
#     dependencies=[Depends(get_token_header)],
#     responses={418: {"description": "I'm a teapot"}},
# )


@app.get("/")
async def root():
    return {"Status": "Ok!"}

@app.get("/list-models")
async def list_models():
    return get_models_info()
