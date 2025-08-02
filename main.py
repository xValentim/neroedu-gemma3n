# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import requests
import uvicorn
from src.utils import get_models_info, delete_model, example_essay, prompt_competencia_1, prompt_competencia_2, prompt_competencia_3, prompt_competencia_4, prompt_competencia_5

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama.llms import OllamaLLM
from langchain_ollama.chat_models import ChatOllama

from pydantic import BaseModel
import random

class InputDataEssayEnem(BaseModel):
    essay: str = example_essay
    model_name: str = "gemma3n:e2b"
    
    
class InputSimulado(BaseModel):
    tema: str
    model_name: str = "gemma3n:e2b"
    competencia: int = 1

class InputFlashcard(BaseModel):
    tema: str
    flashcards_existentes: Optional[List[str]] = []
    model_name: str = "gemma3n:e2b"

class InputDataKeyTopics(BaseModel):
    tema: str
    model_name: str = "gemma3n:e2b"

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
                "correct_answer": "A|B|C|D|E",
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


@app.post("/call-simulado-questao")
async def call_simulado(input_simulado: InputSimulado):
    tema = input_simulado.tema
    model_name = input_simulado.model_name
    template = [
        ('system', """Você irá gerar questões para compor um simulado do ENEM."""),
        ('system', "Não crie questões unicamente objetivas, como 'O que é?', 'Quem foi?', crie questões que exijam raciocínio."),
        ('system', """Siga a estrutura:
            {{
                "question": "string",
                "A": "string",
                "B": "string",
                "C": "string",
                "D": "string",
                "E": "string",
                "correct_answer": "A|B|C|D|E",
                "explanation": "string"
                }}
        """),
        ('system', """Gere a questão sobre o tema: {tema}\n"""),

    ]

    prompt = ChatPromptTemplate.from_messages(template)

    # Sortear um inteiro de 0 a 1000 para o seed e um float de 0 a 1 para a temperatura
    seed = random.randint(0, 1000)
    temperature = round(random.uniform(0, 1), 2)
    llm = ChatOllama(model=model_name, temperature=temperature, seed=seed)

    chain_simulado = (
        prompt
        | llm
        | StrOutputParser()
    )

    response = await chain_simulado.ainvoke({"tema": tema})
    return {"response": response, "temperature": temperature, "seed": seed}


@app.post("/call-flashcard")
async def call_flashcard(input_flashcard: InputFlashcard):
    tema = input_flashcard.tema
    model_name = input_flashcard.model_name
    flashcards_existentes = input_flashcard.flashcards_existentes

    if len(flashcards_existentes) == 0:
        template = [
            ('system', """Você irá gerar um flashcard educacional para estudo."""),
            ('system', """Crie o flashcard no formato pergunta-resposta."""),
            ('system', """Siga EXATAMENTE esta estrutura JSON:
                {{
                    "question": "Pergunta sobre o conceito...",
                    "answer": "Resposta clara e didática..."
                }}
            """),
            ('system', "Gere um flashcard sobre o tema: {tema}"),
            ('system', "A pergunta deve testar conhecimento essencial e a resposta deve ser completa."),
        ]
    else:
        template = [
            ('system', """Você irá gerar um flashcard educacional para estudo."""),
            ('system', """Crie o flashcard no formato pergunta-resposta."""),
            ('system', """Siga EXATAMENTE esta estrutura JSON:
                {{
                    "question": "Pergunta sobre o conceito...",
                    "answer": "Resposta clara e didática..."
                }}
            """),
            ('system', "Gere um flashcard sobre o tema: {tema}"),
            ('system', "Considere que já existe um (ou mais) flashcard(s) com essa(s) pergunta(s): {flashcards_existentes}. Não repita perguntas já existentes."),
            ('system', "A pergunta deve testar conhecimento essencial e a resposta deve ser completa."),
        ]

    prompt = ChatPromptTemplate.from_messages(template)

    # Aleatoriedade para o seed e temperatura
    seed = random.randint(0, 1000)
    temperature = round(random.uniform(0, 1), 2)
    llm = ChatOllama(model=model_name, temperature=temperature, seed=seed)

    chain_flashcard = (
        prompt
        | llm
        | StrOutputParser()
    )

    response = await chain_flashcard.ainvoke({"tema": tema, "flashcards_existentes": flashcards_existentes})
    return response


@app.post("/call-key-topics")
async def call_key_topics(input_data_key_topics: InputDataKeyTopics):
    tema = input_data_key_topics.tema
    model_name = input_data_key_topics.model_name
    
    template = [
        ('system', """Você irá gerar tópicos-chave sobre um tema educacional."""),
        ('system', """Crie uma explicação geral do tema e liste 3 pontos-chave mais importantes."""),
        ('system', """Siga EXATAMENTE esta estrutura JSON:
            {{
                "explanation": "Uma explicação abrangente e didática do tema...",
                "key_topics": [
                    "Primeiro ponto-chave mais importante...",
                    "Segundo ponto-chave mais importante...",
                    "Terceiro ponto-chave mais importante..."
                ]
            }}
        """),
        ('system', "Analise o tema: {tema}"),
        ('system', "A explicação geral deve ser completa mas acessível, e os 3 tópicos-chave devem cobrir os aspectos mais fundamentais."),
    ]

    prompt = ChatPromptTemplate.from_messages(template)

    # Aleatoriedade para temperatura e seed
    seed = random.randint(0, 1000)
    temperature = round(random.uniform(0, 1), 2)
    llm = ChatOllama(model=model_name, temperature=temperature, seed=seed)

    chain_key_topics = (
        prompt
        | llm
        | StrOutputParser()
    )

    response = await chain_key_topics.ainvoke({"tema": tema})
    return response


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
