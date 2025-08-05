# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List, Optional
import requests
import uvicorn
from src.utils import get_models_info, delete_model, example_essay, prompt_competencia_1, prompt_competencia_2, prompt_competencia_3, prompt_competencia_4, prompt_competencia_5
from src.retriever import Retriever
from contextlib import asynccontextmanager 

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama.llms import OllamaLLM
from langchain_ollama.chat_models import ChatOllama

from pydantic import BaseModel
import random

class InputDataEssayEnem(BaseModel):
    essay: str = example_essay
    model_name: str = "gemma3n:e2b"
    competencia: int = 1
    
    
class InputSimulado(BaseModel):
    tema: str
    model_name: str = "gemma3n:e2b"
    lite_rag: None | bool = False

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


# Cron job/Background task
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Init Vectorstores...")

    global retrieve_enem
    retrieve_enem = Retriever(path_csv="./vectorstore/data_playlists_enem.csv", 
                          path_model='./vectorstore/tfidf_model_enem.pkl')

    retrieve_cuet = Retriever(path_csv="./vectorstore/cuet_edital.csv", 
                            path_model='./vectorstore/tfidf_model_cuet_edital.pkl')

    retrieve_exames = Retriever(path_csv="./vectorstore/exames_nacionais_edital.csv", 
                                path_model='./vectorstore/tfidf_model_exames_nacionais_edital.pkl')

    retrieve_exani = Retriever(path_csv="./vectorstore/exani_edital.csv", 
                            path_model='./vectorstore/tfidf_model_exani_edital.pkl')

    retrieve_icfes = Retriever(path_csv="./vectorstore/icfes_edital.csv", 
                            path_model='./vectorstore/tfidf_model_icfes_edital.pkl')

    retrieve_sat = Retriever(path_csv="./vectorstore/sat_edital.csv", 
                            path_model='./vectorstore/tfidf_model_sat_edital.pkl')
    print("Vectorstores initialized!")
    yield
    print("Shutdown Server...")

app = FastAPI(lifespan=lifespan)

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
        ('system', """You will generate questions to compose an ENEM practice test."""),
        ('system', "Don't create purely objective questions like 'What is?', 'Who was?', briefly contextualize the theme and create questions that require reasoning."),
        ('system', """Follow the structure:
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
        ('system', "Generate 5 questions about the theme: {tema}"),
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
    lite_rag = input_simulado.lite_rag
    
    template = [
        ('system', """You will generate questions to compose an ENEM practice test."""),
        ('system', "Don't create purely objective questions like 'What is?', 'Who was?', create questions that require reasoning."),
        ('system', """Follow the structure:
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
        ('system', """Generate the question about the theme: {tema}\n"""),
    ]
    
    if lite_rag:
        retrieved_content = retrieve_enem.query(tema, k=1)[0].content
        print(f"Retrieved content: {retrieved_content}")
        template.append(('system', f"""Use the following content to support the question (if the content is not relevant, ignore it):\n""" + retrieved_content))

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
            ('system', """You will generate an educational flashcard for studying."""),
            ('system', """Create the flashcard in question-answer format."""),
            ('system', """Follow EXACTLY this JSON structure:
                {{
                    "question": "Question about the concept...",
                    "answer": "Clear and didactic answer..."
                }}
            """),
            ('system', "Generate a flashcard about the theme: {tema}"),
            ('system', "The question should test essential knowledge and the answer should be complete."),
        ]
    else:
        template = [
            ('system', """You will generate an educational flashcard for studying."""),
            ('system', """Create the flashcard in question-answer format."""),
            ('system', """Follow EXACTLY this JSON structure:
                {{
                    "question": "Question about the concept...",
                    "answer": "Clear and didactic answer..."
                }}
            """),
            ('system', "Generate a flashcard about the theme: {tema}"),
            ('system', "Consider that there is already one (or more) flashcard(s) with this/these question(s): {flashcards_existentes}. Do not repeat existing questions."),
            ('system', "The question should test essential knowledge and the answer should be complete."),
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
        ('system', """You will generate key topics about an educational theme."""),
        ('system', """Create a general explanation of the theme and list the 3 most important key points."""),
        ('system', """Follow EXACTLY this JSON structure:
            {{
                "explanation": "A comprehensive and didactic explanation of the theme...",
                "key_topics": [
                    "First most important key point...",
                    "Second most important key point...",
                    "Third most important key point..."
                ]
            }}
        """),
        ('system', "Analyze the theme: {tema}"),
        ('system', "The general explanation should be complete but accessible, and the 3 key topics should cover the most fundamental aspects."),
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
    uvicorn.run(app, host="127.0.0.1", port=8000)