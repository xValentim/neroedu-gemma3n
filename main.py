# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import uvicorn
from src.utils import get_models_info, delete_model, example_essay, prompt_competencia_1, prompt_competencia_2, prompt_competencia_3, prompt_competencia_4, prompt_competencia_5

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama.llms import OllamaLLM
from langchain_ollama.chat_models import ChatOllama

from pydantic import BaseModel

class InputDataEssayEnem(BaseModel):
    essay: str = example_essay
    model_name: str = "gemma3n:e2b"
    competencia: int = 1

class OutputDataEssayEnem(BaseModel):
    response: str
    model: str
    competencia: int


app = FastAPI()

BASE_URL = "http://localhost:11434"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"Status": "Ok!"}

@app.get("/status-ollama")
async def check_status_ollama():
    try:
        response = requests.get(f"{BASE_URL}/api/version")
        if response.status_code == 200:
            version_ollama = response.json().get('version', 'unknown')
            print(f"Ollama version: {version_ollama}")
            return {"status": "Ollama is running", "version": version_ollama}
        else:
            return {"status": "Ollama is not running", "version": "unknown"}
    except requests.exceptions.RequestException as e:
        return {"status": "Ollama is not running", "error": str(e)}

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

# Enem
@app.post("/call-model-competencia")
async def call_model_competencia(input_data: InputDataEssayEnem):
    essay = input_data.essay
    model_name = input_data.model_name
    competencia = input_data.competencia

    llm = ChatOllama(model=model_name, 
                    temperature=0.0)
                    #  num_gpu=1)

    if competencia not in [1, 2, 3, 4, 5]:
        raise HTTPException(status_code=400, detail="Competência inválida. Deve ser um número entre 1 e 5.")
        
    values = [prompt_competencia_1, prompt_competencia_2, prompt_competencia_3, prompt_competencia_4, prompt_competencia_5]

    system_prompt = values[competencia - 1]

    prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt), 
                ("human", "Redação do usuário: \n\n {essay}")
            ]
    )
    
    chain = prompt | llm | StrOutputParser()

    response = await chain.ainvoke({"essay": essay})
    
    output = {"response": response,
            "model": model_name,
            "competencia": competencia}

    return OutputDataEssayEnem(**output)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
