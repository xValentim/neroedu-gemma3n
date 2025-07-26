from fastapi import Depends, FastAPI
from fastapi.responses import StreamingResponse

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

model_names = [
    "gemma3n:e2b", # Text, Audio, Image
    "gemma3n:e4b", # Text, Audio, Image
    "gemma3:1b", # 800MB, bom pra testar os endpoints
    "gemma3:4b", # Text, Image
    "gemma3:12b",
    "gemma3:27b"
]

def get_models_info():
    response = requests.get(f"{BASE_URL}/api/tags")
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to fetch models info"}
    
def delete_model(model_name):
    url = f"{BASE_URL}/api/delete"
    payload = {"model": model_name}
    response = requests.delete(url, json=payload)
    
    if response.status_code == 200:
        return {"message": f"Model '{model_name}' deleted successfully"}
    else:
        return {
            "error": f"Failed to delete model '{model_name}'",
            "status_code": response.status_code,
            "response": response.text
        }

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

@app.post("/check-model/{model_name}")
async def check_model(model_name: str):
    my_local_models = get_models_info()
    list_model_name = [x['model'] for x in my_local_models['models']]
    if model_name in list_model_name:
        return {
            "model": model_name,
            "available": True,
            
        }
    return {
        "model": model_name,
        "available": False,
    }

@app.delete("/delete-model/{model_name}")
async def delete_model_endpoint(model_name: str):
    return delete_model(model_name)

@app.post("/pull-model/{model_name}")
async def pull_model(model_name: str):
    def stream_model_pull():
        url = f"{BASE_URL}/api/pull"
        payload = {"model": model_name}
        headers = {"Content-Type": "application/json"}

        with requests.post(url, json=payload, headers=headers, stream=True) as r:
            for line in r.iter_lines():
                if line:
                    # Retorna cada linha do JSON como texto
                    yield line.decode("utf-8") + "\n"

    return StreamingResponse(stream_model_pull(), media_type="text/plain")