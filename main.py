# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import uvicorn
from src.utils import get_models_info, delete_model, example_essay, prompt_competencia_1

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama.llms import OllamaLLM
from langchain_ollama.chat_models import ChatOllama

from pydantic import BaseModel

class InputData(BaseModel):
    essay: str = example_essay
    model_name: str = "gemma3n:e2b"
    
    
class InputSimulado(BaseModel):
    tema: str
    model_name: str = "gemma3n:e2b"

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

@app.post("/call-model-competencia-1")
async def call_model_competencia_1(input_data: InputData):
    essay = input_data.essay
    model_name = input_data.model_name

    llm = ChatOllama(model=model_name, 
                    temperature=0.0)
                    #  num_gpu=1)

    system_prompt = prompt_competencia_1

    prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt), 
                ("human", "Redação do usuário: \n\n {essay}")
            ]
    )
    
    chain = prompt | llm | StrOutputParser()

    response = await chain.ainvoke({"essay": essay})
    
    return {"response": response}


@app.post("/call-simulado")
async def call_simulado(input_simulado: InputSimulado):
    tema = input_simulado.tema
    model_name = input_simulado.model_name
    template = [
        ('system', """Você irá gerar questões para compor um simulado do ENEM."""),
        ('system', "Não crie questões unicamente objetivas, como 'O que é?', 'Quem foi?', contextualize breventemente o tema e crie questões que exijam raciocínio."),
        ('system', """Siga a estrutura:
            [
                {{
                "question": "string",
                "A": "string",
                "B": "string",
                "C": "string",
                "D": "string",
                "E": "string",
                "correct_answer": "A|B|C|D|E",
                "explanation": "string"
                }},
                {{
                "question": "string",
                "A": "string",
                "B": "string",
                "C": "string",
                "D": "string",
                "E": "string",
                "correct_answer": "A|B|C|   D|E",
                "explanation": "string"
                }},
                ...
            ]
        """),
        ('system', "Gere 5 questões sobre o tema: {tema}"),
    ]

    prompt = ChatPromptTemplate.from_messages(template)

    llm = ChatOllama(model=model_name,
                     temperature=0.0)

    chain_simulado = (
        prompt
        | llm
        | StrOutputParser()
    )

    response = await chain_simulado.ainvoke({"tema": tema})
    return response

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
