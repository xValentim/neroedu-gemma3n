# main.py
from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List, Optional
import requests
import uvicorn
import json
import os
import sys

from src.utils import get_models_info, delete_model, example_essay, prompt_competencia_1, prompt_competencia_2, prompt_competencia_3, prompt_competencia_4, prompt_competencia_5, exams_types
from src.retriever import Retriever
from contextlib import asynccontextmanager 

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama.llms import OllamaLLM
from langchain_ollama.chat_models import ChatOllama
from src.schemas import InputDataEssayEnem, InputSimulado, InputFlashcard, InputDataKeyTopics, OutputDataEssayEnem, InputDataEssay, Essay, InputEssay

from pydantic import BaseModel
import random

# =========================
# 📁 Diretórios seguros
# =========================
if getattr(sys, 'frozen', False):
    base_dir = os.path.dirname(sys.executable)
else:
    base_dir = os.path.dirname(os.path.abspath(__file__))

# 🧠 Se o executável estiver dentro de uma pasta "bin", subir um nível
if os.path.basename(base_dir).lower() == "bin":
    BASE_DIR = os.path.dirname(base_dir)
else:
    BASE_DIR = base_dir

print("[INIT] BASE_DIR:", BASE_DIR)

STORAGE_DIR = os.path.join(BASE_DIR, "storage")
VECTORSTORE_DIR = os.path.join(BASE_DIR, "vectorstore")
DATABASE_PATH = os.path.join(STORAGE_DIR, "database.json")

# =========================
# 📦 Funções auxiliares
# =========================
def load_data():
    print("[LOAD] Carregando:", DATABASE_PATH)
    if not os.path.exists(DATABASE_PATH):
        print("[LOAD] Criando novo database.json")
        with open(DATABASE_PATH, "w") as f:
            json.dump([], f)
    with open(DATABASE_PATH, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATABASE_PATH, "w") as f:
        json.dump(data, f, indent=4)

# =========================
# 🔁 Inicialização do app
# =========================
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[LIFESPAN] Inicializando vectorstores...")

    global retrieve_enem, retrieve_cuet, retrieve_exames, retrieve_exani, retrieve_icfes, retrieve_sat

    def build_retriever(csv, model):
        return Retriever(
            path_csv=os.path.join(VECTORSTORE_DIR, csv),
            path_model=os.path.join(VECTORSTORE_DIR, model)
        )

    retrieve_enem = build_retriever("data_playlists_enem.csv", "tfidf_model_enem.pkl")
    # retrieve_cuet = build_retriever("cuet_edital.csv", "tfidf_model_cuet_edital.pkl")
    # retrieve_exames = build_retriever("exames_nacionais_edital.csv", "tfidf_model_exames_nacionais_edital.pkl")
    # retrieve_exani = build_retriever("exani_edital.csv", "tfidf_model_exani_edital.pkl")
    # retrieve_icfes = build_retriever("icfes_edital.csv", "tfidf_model_icfes_edital.pkl")
    # retrieve_sat = build_retriever("sat_edital.csv", "tfidf_model_sat_edital.pkl")

    print("[LIFESPAN] Vectorstores prontos.")
    yield
    print("[LIFESPAN] Encerrando servidor...")


# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# STORAGE_DIR = os.path.join(BASE_DIR, "storage")
# VECTORSTORE_DIR = os.path.join(BASE_DIR, "vectorstore")

# # Cron job/Background task
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     print("Init Vectorstores...")

#     global retrieve_enem
#     # retrieve_enem = Retriever(
#     #                     path_csv=os.path.join(VECTORSTORE_DIR, "release/build/resources/data_playlists_enem.csv"),
#     #                     path_model=os.path.join(VECTORSTORE_DIR, "release/build/resources/tfidf_model_enem.pkl")
#     #                 )

#     # retrieve_cuet = Retriever(path_csv="./vectorstore/cuet_edital.csv", 
#     #                         path_model='./vectorstore/tfidf_model_cuet_edital.pkl')

#     # retrieve_exames = Retriever(path_csv="./vectorstore/exames_nacionais_edital.csv", 
#     #                             path_model='./vectorstore/tfidf_model_exames_nacionais_edital.pkl')

#     # retrieve_exani = Retriever(path_csv="./vectorstore/exani_edital.csv", 
#     #                         path_model='./vectorstore/tfidf_model_exani_edital.pkl')

#     # retrieve_icfes = Retriever(path_csv="./vectorstore/icfes_edital.csv", 
#     #                         path_model='./vectorstore/tfidf_model_icfes_edital.pkl')

#     # retrieve_sat = Retriever(path_csv="./vectorstore/sat_edital.csv", 
#     #                         path_model='./vectorstore/tfidf_model_sat_edital.pkl')
#     print("Vectorstores initialized!")
#     yield
#     print("Shutdown Server...")

# Helpers para manipular o JSON
def load_data():
    database_file = os.path.join(STORAGE_DIR, "release/build/resources/storage/database.json")
    if not os.path.exists(database_file):
        with open(database_file, "w") as f:
            json.dump([], f)
    with open(database_file, "r") as f:
        return json.load(f)

def save_data(data):
    database_file = os.path.join(STORAGE_DIR, "release/build/resources/storage/database.json")
    with open(database_file, "w") as f:
        json.dump(data, f, indent=4)

app = FastAPI(lifespan=lifespan)

BASE_URL = "http://localhost:11434"
BASEDIR_STORAGE = "./storage"

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
    lite_rag = input_simulado.lite_rag
    exam_type = input_simulado.exam_type.strip().lower()
    
    if exam_type not in ['enem', 'icfes', 'exani', 'sat', 'cuet', 'exames_nacionais',
                         'gaokao', 'ielts']:
        raise HTTPException(status_code=400, detail="Invalid exam type. Must be one of: 'enem', 'icfes', 'exani', 'sat', 'cuet', 'exames_nacionais', 'gaokao', 'ielts'.")

    language = {
        "enem": "portuguese",
        "icfes": "spanish",
        "exani": "spanish",
        "sat": "english",
        "cuet": "english",
        "exames_nacionais": "portuguese",
        "gaokao": "chinese",
        "ielts": "english"
    }
    
    template = [
        ('system', f"""You will generate questions to compose an {exam_type} practice test."""),
        ('system', f"""The language of the exam is {language[exam_type]}."""),
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
    
    if lite_rag:
        chain_translate = (
            ChatPromptTemplate.from_messages([
                ('system', "Traduza para o português (se possível, escreva 1 frase que descreva o tema): {tema}"),
            ])
            | ChatOllama(model="gemma3n:e2b", temperature=0.6, seed=random.randint(0, 1000))
            | StrOutputParser()
        )
        tema_translated = await chain_translate.ainvoke({"tema": tema})
        print(f"Translated theme: {tema_translated}")
        retrieved_content = random.choice(retrieve_enem.query(tema_translated, k=4)).content
        print(f"Retrieved content: {retrieved_content}")
        template.append(('system', f"""Use the following content to support the questions (if the content is not relevant, ignore it):\n""" + retrieved_content))

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
    exam_type = input_simulado.exam_type.strip().lower()
    questions = input_simulado.questions

    if exam_type not in ['enem', 'icfes', 'exani', 'sat', 'cuet', 'exames_nacionais',
                         'gaokao', 'ielts']:
        raise HTTPException(status_code=400, detail="Invalid exam type. Must be one of: 'enem', 'icfes', 'exani', 'sat', 'cuet', 'exames_nacionais', 'gaokao', 'ielts'.")
    
    language = {
        "enem": "portuguese-Brasil",
        "icfes": "spanish",
        "exani": "spanish",
        "sat": "english",
        "cuet": "english",
        "exames_nacionais": "portuguese-Portugal",
        "gaokao": "chinese",
        "ielts": "english"
    }
    
    template = [
        ('system', f"""You will generate questions to compose an {exam_type} practice test."""),
        ('system', f"""The language of the exam is {language[exam_type]}."""),
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
        ('system', "Do not repeat existing questions. Consider that there is already one (or more) question(s) with this/these content: {questions}."),
        ('system', """Generate only one question about the theme: {tema}\n"""),
    ]
    
    if lite_rag:
        chain_translate = (
            ChatPromptTemplate.from_messages([
                ('system', "Traduza para o português (se possível, escreva 1 frase que descreva o tema): {tema}"),
            ])
            | ChatOllama(model="gemma3n:e2b", temperature=0.6, seed=random.randint(0, 1000))
            | StrOutputParser()
        )
        tema_translated = await chain_translate.ainvoke({"tema": tema})
        print(f"Translated theme: {tema_translated}")
        retrieved_content = random.choice(retrieve_enem.query(tema_translated, k=4)).content
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

    response = await chain_simulado.ainvoke({"tema": tema, "questions": "\n--\n".join(questions)})
    return {"response": response, "temperature": temperature, "seed": seed}

@app.post("/call-flashcard")
async def call_flashcard(input_flashcard: InputFlashcard):
    tema = input_flashcard.tema
    model_name = input_flashcard.model_name
    flashcards_existentes = input_flashcard.flashcards_existentes
    exam_type = input_flashcard.exam_type
    lite_rag = input_flashcard.lite_rag
    
    print(input_flashcard.flashcards_existentes)
    
    if exam_type not in ['enem', 'icfes', 'exani', 'sat', 'cuet', 'exames_nacionais',
                         'gaokao', 'ielts']:
        raise HTTPException(status_code=400, detail="Invalid exam type. Must be one of: 'enem', 'icfes', 'exani', 'sat', 'cuet', 'exames_nacionais', 'gaokao', 'ielts'.")
    
    language = {
        "enem": "portuguese-Brasil",
        "icfes": "spanish",
        "exani": "spanish",
        "sat": "english",
        "cuet": "english",
        "exames_nacionais": "portuguese-Portugal",
        "gaokao": "chinese",
        "ielts": "english"
    }

    if len(flashcards_existentes) == 0:
        template = [
            ('system', """You will generate an educational flashcard for studying."""),
            ('system', f"""The language of the exam is {language[exam_type]}."""),
            ('system', f"""Consider that the flashcard should be relevant for the {exam_type} exam."""),
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
            ('system', f"""The language of the exam is {language[exam_type]}."""),
            ('system', f"""Consider that the flashcard should be relevant for the {exam_type} exam."""),
            ('system', """Create the flashcard in question-answer format."""),
            ('system', """Follow EXACTLY this JSON structure:
                {{
                    "question": "Question about the concept...",
                    "answer": "Clear and didactic answer..."
                }}
            """),
            ('system', "Generate a flashcard about the theme: {tema}"),
            ('system', "Do not repeat existing questions. Consider that there is already one (or more) flashcard(s) with this/these question(s): {flashcards_existentes}."),
            ('system', "The question should test essential knowledge and the answer should be complete."),
        ]

    if lite_rag:
        chain_translate = (
            ChatPromptTemplate.from_messages([
                ('system', "Traduza para o português (se possível, escreva 1 frase que descreva o tema): {tema}"),
            ])
            | ChatOllama(model="gemma3n:e2b", temperature=0.6, seed=random.randint(0, 1000))
            | StrOutputParser()
        )
        tema_translated = await chain_translate.ainvoke({"tema": tema})
        print(f"Translated theme: {tema_translated}")
        retrieved_content = random.choice(retrieve_enem.query(tema_translated, k=4)).content
        print(f"Retrieved content: {retrieved_content}")
        template.insert(6, ('system', f"""Use the following content to support the question (if the content is not relevant, ignore it):\n""" + retrieved_content))

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

    response = await chain_flashcard.ainvoke({"tema": tema, "flashcards_existentes": "\n--\n".join(flashcards_existentes)})
    return response

@app.post("/call-key-topics")
async def call_key_topics(input_data_key_topics: InputDataKeyTopics):
    tema = input_data_key_topics.tema
    model_name = input_data_key_topics.model_name
    exam_type = input_data_key_topics.exam_type
    lite_rag = input_data_key_topics.lite_rag
    
    if exam_type not in ['enem', 'icfes', 'exani', 'sat', 'cuet', 'exames_nacionais',
                         'gaokao', 'ielts']:
        raise HTTPException(status_code=400, detail="Invalid exam type. Must be one of: 'enem', 'icfes', 'exani', 'sat', 'cuet', 'exames_nacionais', 'gaokao', 'ielts'.")
    
    language = {
        "enem": "portuguese-Brasil",
        "icfes": "spanish",
        "exani": "spanish",
        "sat": "english",
        "cuet": "english",
        "exames_nacionais": "portuguese-Portugal",
        "gaokao": "chinese",
        "ielts": "english"
    }

    template = [
        ('system', """You will generate key topics about an educational theme."""),
        ('system', f"""The language of the exam is {language[exam_type]}."""),
        ('system', f"""Consider that the key topics should be relevant for the {exam_type} exam."""),
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

    if lite_rag:
        chain_translate = (
            ChatPromptTemplate.from_messages([
                ('system', "Traduza para o português (se possível, escreva 1 frase que descreva o tema): {tema}"),
            ])
            | ChatOllama(model="gemma3n:e2b", temperature=0.6, seed=random.randint(0, 1000))
            | StrOutputParser()
        )
        tema_translated = await chain_translate.ainvoke({"tema": tema})
        print(f"Translated theme: {tema_translated}")
        retrieved_content = random.choice(retrieve_enem.query(tema_translated, k=4)).content
        print(f"Retrieved content: {retrieved_content}")
        template.insert(6, ('system', f"""Use the following content to support the explanation (if the content is not relevant, ignore it):\n""" + retrieved_content))

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


@app.post("/call-essay")
async def call_essay(input_data: InputDataEssay):
    essay = input_data.essay
    model_name = input_data.model_name
    exam_type = input_data.exam_type.strip().lower()
    
    llm = ChatOllama(model=model_name, temperature=0.0)
    if exam_type not in ['enem', 'sat','exames_nacionais', 'gaokao', 'ielts',
                         'icfes', 'cuet', 'exani']:
        raise HTTPException(status_code=400, detail="Invalid exam type. Must be one of: 'enem', 'sat', 'exames_nacionais', 'gaokao', 'ielts', 'icfes', 'cuet', 'exani'.")
    
    system_prompt = exams_types[exam_type]
    promt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", "Redação do usuário: {essay}")
        ]
    )
    chain  = promt | llm | StrOutputParser()
    response = await chain.ainvoke({"essay": essay})
    
    return {"response": response, "model": model_name, "exam_type": exam_type}

# CRUD 

# Criar item
@app.post("/essays/", response_model=Essay)
def create_item(item: InputEssay):
    data = load_data()
    item_output = item.dict()
    item_output['essay_id'] = None
    item = Essay(**item_output)
    if not item.essay_id:
        max_id = max((existing_item["essay_id"] for existing_item in data if existing_item["essay_id"] is not None), default=0)
        item.essay_id = max_id + 1
    else:
        for existing_item in data:
            if existing_item["essay_id"] == item.essay_id:
                raise HTTPException(status_code=400, detail="Item with this ID already exists.")
    data.append(item.dict())
    save_data(data)
    return item

# Listar todos
@app.get("/essays/", response_model=List[Essay])
def read_items():
    return load_data()

# Obter item por ID
@app.get("/essays/{item_id}", response_model=Essay)
def read_item(item_id: int):
    data = load_data()
    for item in data:
        if item["essay_id"] == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")

# Atualizar item
@app.put("/essays/{item_id}", response_model=Essay)
def update_item(item_id: int, updated_item: Essay):
    data = load_data()
    for idx, item in enumerate(data):
        if item["essay_id"] == item_id:
            data[idx] = updated_item.dict()
            save_data(data)
            return updated_item
    raise HTTPException(status_code=404, detail="Item not found")

# Deletar item
@app.delete("/essays/{item_id}")
def delete_item(item_id: int):
    data = load_data()
    for idx, item in enumerate(data):
        if item["essay_id"] == item_id:
            del data[idx]
            save_data(data)
            return {"message": "Item deleted"}
    raise HTTPException(status_code=404, detail="Item not found")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)