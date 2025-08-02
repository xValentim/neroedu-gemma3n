from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama.chat_models import ChatOllama
from pydantic import BaseModel

class InputSimulado(BaseModel):
    tema: str
    model_name: str = "gemma3n:e2b"


def format_questoes(questoes):
    return "\n\n".join([tema for tema in questoes])


async def chain_simulado(input_simulado: InputSimulado):
    tema = input_simulado.tema
    model_name = input_simulado.model_name


    template = [
        ('system', """Você irá gerar questões para compor um simulado do ENEM."""),
        ('system', "Não crie questões unicamente objetivas, como 'O que é?', 'Quem foi?', contextualize breventemente o tema e crie questões que exijam raciocínio."),
        ('system', """Forneça essas perguntas alternativas separadas por novas linhas. \n:
            Siga a estrutura:
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


