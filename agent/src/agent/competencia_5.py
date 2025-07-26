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
    output: str = ""


async def call_model_competencia_5(state: State, config: RunnableConfig) -> Dict[str, Any]:
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

    return {
        "output": response,
    }


# Define the graph
graph = (
    StateGraph(State, config_schema=Configuration)
    .add_node(call_model_competencia_5)
    .add_edge("__start__", "call_model_competencia_5")
    .compile(name="ENEM Competência 5 Graph")
)
