"""LangGraph single-node graph template.

Returns a predefined response. Replace logic and configuration as needed.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, TypedDict

from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama.llms import OllamaLLM
from langchain_ollama.chat_models import ChatOllama


class Configuration(TypedDict):
    """Configurable parameters for the agent.

    Set these when creating assistants OR when invoking the graph.
    See: https://langchain-ai.github.io/langgraph/cloud/how-tos/configuration_cloud/
    """

    my_configurable_param: str


@dataclass
class State:
    """Input state for the agent.

    Defines the initial structure of incoming data.
    See: https://langchain-ai.github.io/langgraph/concepts/low_level/#state
    """

    essay: str = "example"
    output_1: str = ""
    output_2: str = ""
    output_3: str = ""
    output_4: str = ""
    output_5: str = ""


async def call_model_competencia_1(state: State, config: RunnableConfig) -> State:
    """Process input and returns output.

    Can use runtime configuration to alter behavior.
    """
    configuration = config["configurable"]
    essay = state.essay
    
    model_name_gemma3n_4b = "gemma3n:e2b"

    llm = ChatOllama(model=model_name_gemma3n_4b, 
                    temperature=0.0)
                    #  num_gpu=1)

    system_prompt = """
    Você é um assistente que irá corrigir redações do ENEM e ajudar os usuários a melhorarem suas habilidades de escrita. Sua tarefa é avaliar a redação do usuário com base na Competência 1 do ENEM.

    🔎 A Competência 1 avalia se o candidato domina a norma-padrão da língua portuguesa. Isso inclui: ortografia, acentuação, pontuação, concordância verbal e nominal, regência, colocação pronominal e outros aspectos gramaticais. Desvios eventuais não comprometem a nota, mas erros sistemáticos ou reincidentes reduzem significativamente a pontuação.

    Dê uma nota de 0 a 200 para essa competência e explique o motivo com base nesses critérios. No final, dê um feedback construtivo com sugestão clara de melhoria.
    """

    prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt), 
                ("human", "Redação do usuário: \n\n {essay}")
            ]
    )
    
    chain = prompt | llm | StrOutputParser()

    response = await chain.ainvoke({"essay": essay})

    state.output_1 = response

    return state

async def call_model_competencia_2(state: State, config: RunnableConfig) -> State:
    """Process input and returns output.

    Can use runtime configuration to alter behavior.
    """
    configuration = config["configurable"]
    essay = state.essay
    
    model_name_gemma3n_4b = "gemma3n:e2b"

    llm = ChatOllama(model=model_name_gemma3n_4b, 
                    temperature=0.0)
                    #  num_gpu=1)

    system_prompt = """
    Você é um assistente que irá corrigir redações do ENEM e ajudar os usuários a melhorarem suas habilidades de escrita. Sua tarefa é avaliar a redação do usuário com base na Competência 2 do ENEM.
    
    🔎 A Competência 2 avalia se o candidato compreendeu o tema proposto, respeitou o gênero dissertativo-argumentativo e usou repertório sociocultural produtivo. A redação deve tratar diretamente do tema e desenvolver argumentos relevantes, com base em conhecimentos das diversas áreas.

    Dê uma nota de 0 a 200 para essa competência e explique o motivo com base nesses critérios. No final, dê um feedback construtivo com sugestão clara de melhoria.
    """

    prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt), 
                ("human", "Redação do usuário: \n\n {essay}")
            ]
    )
    
    chain = prompt | llm | StrOutputParser()

    response = await chain.ainvoke({"essay": essay})

    state.output_2 = response

    return state

async def call_model_competencia_3(state: State, config: RunnableConfig) -> State:
    """Process input and returns output.

    Can use runtime configuration to alter behavior.
    """
    configuration = config["configurable"]
    essay = state.essay
    
    model_name_gemma3n_4b = "gemma3n:e2b"

    llm = ChatOllama(model=model_name_gemma3n_4b, 
                    temperature=0.0)
                    #  num_gpu=1)

    system_prompt = """
    Você é um assistente que irá corrigir redações do ENEM e ajudar os usuários a melhorarem suas habilidades de escrita. Sua tarefa é avaliar a redação do usuário com base na Competência 3 do ENEM.
    
    🔎 A Competência 3 avalia a capacidade de o candidato selecionar, relacionar, organizar e interpretar informações, fatos e argumentos para sustentar um ponto de vista. Espera-se progressão argumentativa, aprofundamento das ideias e coerência interna. Argumentos frágeis, repetitivos ou desconectados da tese central prejudicam a nota.

    Dê uma nota de 0 a 200 para essa competência e explique o motivo com base nesses critérios. No final, dê um feedback construtivo com sugestão clara de melhoria.
    """

    prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt), 
                ("human", "Redação do usuário: \n\n {essay}")
            ]
    )
    
    chain = prompt | llm | StrOutputParser()

    response = await chain.ainvoke({"essay": essay})

    state.output_3 = response
    return state
    
async def call_model_competencia_4(state: State, config: RunnableConfig) -> State:
    """Process input and returns output.

    Can use runtime configuration to alter behavior.
    """
    configuration = config["configurable"]
    essay = state.essay
    
    model_name_gemma3n_4b = "gemma3n:e2b"

    llm = ChatOllama(model=model_name_gemma3n_4b, 
                    temperature=0.0)
                    #  num_gpu=1)

    system_prompt = """
    Você é um assistente que irá corrigir redações do ENEM e ajudar os usuários a melhorarem suas habilidades de escrita. Sua tarefa é avaliar a redação do usuário com base na Competência 4 do ENEM.

    🔎 A Competência 4 avalia o domínio dos mecanismos linguísticos de coesão (conectivos, pronomes, sinônimos) e a coerência geral do texto. A ideia é que o texto tenha fluidez, boa paragrafação e sequência lógica entre as ideias. Problemas como repetições, saltos argumentativos e uso inadequado de conectivos podem diminuir a nota.

    Dê uma nota de 0 a 200 para essa competência e explique o motivo com base nesses critérios. No final, dê um feedback construtivo com sugestão clara de melhoria.
    """

    prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt), 
                ("human", "Redação do usuário: \n\n {essay}")
            ]
    )
    
    chain = prompt | llm | StrOutputParser()

    response = await chain.ainvoke({"essay": essay})

    state.output_4 = response
    return state

async def call_model_competencia_5(state: State, config: RunnableConfig) -> State:
    """Process input and returns output.

    Can use runtime configuration to alter behavior.
    """
    configuration = config["configurable"]
    essay = state.essay
    
    model_name_gemma3n_4b = "gemma3n:e2b"

    llm = ChatOllama(model=model_name_gemma3n_4b, 
                    temperature=0.0)
                    #  num_gpu=1)

    system_prompt = """
    Você é um assistente que irá corrigir redações do ENEM e ajudar os usuários a melhorarem suas habilidades de escrita. Sua tarefa é avaliar a redação do usuário com base na Competência 5 do ENEM.

    🔎 A Competência 5 avalia a capacidade do candidato de elaborar uma proposta de intervenção para o problema apresentado no texto. A proposta deve ser viável, respeitar os direitos humanos e conter: ação, agente, meio de execução, finalidade e detalhamento. Omissão de elementos ou propostas genéricas reduzem a nota.

    Dê uma nota de 0 a 200 para essa competência e explique o motivo com base nesses critérios. No final, dê um feedback construtivo com sugestão clara de melhoria.
    """

    prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt), 
                ("human", "Redação do usuário: \n\n {essay}")
            ]
    )
    
    chain = prompt | llm | StrOutputParser()

    response = await chain.ainvoke({"essay": essay})

    state.output_5 = response
    return state

# Define the graph
graph = (
    StateGraph(State, config_schema=Configuration)
    .add_node(call_model_competencia_1)
    .add_edge("__start__", "call_model_competencia_1")
    .add_node(call_model_competencia_2)
    .add_edge("call_model_competencia_1", "call_model_competencia_2")
    .add_node(call_model_competencia_3)
    .add_edge("call_model_competencia_2", "call_model_competencia_3")
    .add_node(call_model_competencia_4)
    .add_edge("call_model_competencia_3", "call_model_competencia_4")
    .add_node(call_model_competencia_5)
    .add_edge("call_model_competencia_4", "call_model_competencia_5")
    .compile(name="ENEM Competência all Graph")
)
