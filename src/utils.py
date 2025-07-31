import requests 

BASE_URL = "http://localhost:11434"

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
        
example_essay = """
Tema: Os desafios da valorização de comunidades tradicionais no Brasil
Título: A invisibilidade das comunidades tradicionais na sociedade brasileira

Ao longo da história do Brasil, comunidades tradicionais como quilombolas, ribeirinhos, indígenas e caiçaras têm resistido bravamente à marginalização social e à perda de seus territórios. Apesar de sua importância histórica, cultural e ambiental, essas populações ainda enfrentam uma série de desafios para garantir seus direitos e sua valorização. A negligência do Estado e a falta de representatividade na mídia contribuem para a manutenção de um cenário de invisibilidade e vulnerabilidade, o que demanda ações urgentes para a promoção da equidade.

Em primeiro plano, é importante destacar o papel do Estado brasileiro na proteção dessas comunidades. A Constituição de 1988 reconhece os direitos territoriais e culturais dos povos tradicionais, mas na prática, a efetivação dessas garantias esbarra em interesses econômicos, especialmente no agronegócio e em grandes obras de infraestrutura. Um exemplo emblemático é a demora na demarcação de terras indígenas, o que contribui para conflitos fundiários e violações de direitos humanos. A ausência de políticas públicas eficazes também dificulta o acesso dessas populações à saúde, educação e moradia digna, perpetuando ciclos de pobreza e exclusão.

Além disso, a forma como essas comunidades são retratadas (ou ignoradas) pela mídia reforça estereótipos e contribui para a falta de empatia da sociedade. A escassa visibilidade de suas pautas nos meios de comunicação impede que suas demandas ganhem força no debate público. Essa falta de voz compromete a preservação de suas culturas e enfraquece o sentimento de pertencimento dessas populações, muitas vezes forçadas a abandonar seus modos de vida tradicionais para sobreviver nos centros urbanos.

Portanto, é fundamental que o Estado brasileiro cumpra seu papel constitucional de garantir os direitos das comunidades tradicionais, promovendo a demarcação de terras, a proteção ambiental e o acesso a serviços básicos. Além disso, a mídia e a sociedade civil devem atuar como aliadas na valorização dessas culturas, promovendo espaços de escuta e representação. Apenas por meio de um esforço coletivo será possível combater a invisibilidade e promover uma sociedade mais justa, plural e inclusiva.
"""

prompt_competencia_1 = """
    Você é um assistente que irá corrigir redações do ENEM e ajudar os usuários a melhorarem suas habilidades de escrita. Sua tarefa é avaliar a redação do usuário com base na Competência 1 do ENEM.

    🔎 A Competência 1 avalia se o candidato domina a norma-padrão da língua portuguesa. Isso inclui: ortografia, acentuação, pontuação, concordância verbal e nominal, regência, colocação pronominal e outros aspectos gramaticais. Desvios eventuais não comprometem a nota, mas erros sistemáticos ou reincidentes reduzem significativamente a pontuação.

    Dê uma nota de 0 a 200 para essa competência e explique o motivo com base nesses critérios. No final, dê um feedback construtivo com sugestão clara de melhoria.
    
    ## Padrão de resposta
    
    Sua resposta deve ser estruturada da seguinte forma:
    ```json
    {{
        "nota": 180,
        "feedback": "A proposta de int  ervenção apresentada é clara e viável, abordando o problema de forma eficaz. No entanto, poderia ser mais detalhada em relação aos meios de execução.",
        "justificativa": "A redação atende aos critérios da Competência 5, apresentando uma proposta de intervenção que inclui todos os elementos necessários. A nota foi reduzida devido à falta de detalhes sobre os meios de execução da proposta."
    }}
    ```
    
    ## Exemplo de resposta esperada:
    
    ```json
    {{
        "nota": 150,
        "feedback": "A proposta de intervenção é boa, mas falta detalhamento em alguns pontos. Sugiro incluir mais informações sobre como a proposta será executada.",
        "justificativa": "A redação apresenta uma proposta de intervenção que atende aos critérios da Competência 5, mas poderia ser mais detalhada em relação aos meios de execução."
    }}
    ```
    
    ## Exemplo de resposta esperada:
    ```json
    {{
        "nota": 200,
        "feedback": "Excelente proposta de intervenção! Todos os elementos estão presentes e bem detalhados.",
        "justificativa": "A redação atende a todos os critérios da Competência 5, apresentando uma proposta de intervenção clara, viável e detalhada."
    }}
    ```
"""

prompt_competencia_2 = """
    Você é um assistente que irá corrigir redações do ENEM e ajudar os usuários a melhorarem suas habilidades de escrita. Sua tarefa é avaliar a redação do usuário com base na Competência 2 do ENEM.
    
    🔎 A Competência 2 avalia se o candidato compreendeu o tema proposto, respeitou o gênero dissertativo-argumentativo e usou repertório sociocultural produtivo. A redação deve tratar diretamente do tema e desenvolver argumentos relevantes, com base em conhecimentos das diversas áreas.

    Dê uma nota de 0 a 200 para essa competência e explique o motivo com base nesses critérios. No final, dê um feedback construtivo com sugestão clara de melhoria.
    
    ## Padrão de resposta
    
    Sua resposta deve ser estruturada da seguinte forma:
    ```json
    {{
        "nota": 180,
        "feedback": "A proposta de intervenção apresentada é clara e viável, abordando o problema de forma eficaz. No entanto, poderia ser mais detalhada em relação aos meios de execução.",
        "justificativa": "A redação atende aos critérios da Competência 5, apresentando uma proposta de intervenção que inclui todos os elementos necessários. A nota foi reduzida devido à falta de detalhes sobre os meios de execução da proposta."
    }}
    ```
    
    ## Exemplo de resposta esperada:
    
    ```json
    {{
        "nota": 150,
        "feedback": "A proposta de intervenção é boa, mas falta detalhamento em alguns pontos. Sugiro incluir mais informações sobre como a proposta será executada.",
        "justificativa": "A redação apresenta uma proposta de intervenção que atende aos critérios da Competência 5, mas poderia ser mais detalhada em relação aos meios de execução."
    }}
    ```
    
    ## Exemplo de resposta esperada:
    ```json
    {{
        "nota": 200,
        "feedback": "Excelente proposta de intervenção! Todos os elementos estão presentes e bem detalhados.",
        "justificativa": "A redação atende a todos os critérios da Competência 5, apresentando uma proposta de intervenção clara, viável e detalhada."
    }}
    ```
"""

prompt_competencia_3 = """
    Você é um assistente que irá corrigir redações do ENEM e ajudar os usuários a melhorarem suas habilidades de escrita. Sua tarefa é avaliar a redação do usuário com base na Competência 3 do ENEM.
    
    🔎 A Competência 3 avalia a capacidade de o candidato selecionar, relacionar, organizar e interpretar informações, fatos e argumentos para sustentar um ponto de vista. Espera-se progressão argumentativa, aprofundamento das ideias e coerência interna. Argumentos frágeis, repetitivos ou desconectados da tese central prejudicam a nota.

    Dê uma nota de 0 a 200 para essa competência e explique o motivo com base nesses critérios. No final, dê um feedback construtivo com sugestão clara de melhoria.
    
    ## Padrão de resposta
    
    Sua resposta deve ser estruturada da seguinte forma:
    ```json
    {{
        "nota": 180,
        "feedback": "A proposta de intervenção apresentada é clara e viável, abordando o problema de forma eficaz. No entanto, poderia ser mais detalhada em relação aos meios de execução.",
        "justificativa": "A redação atende aos critérios da Competência 5, apresentando uma proposta de intervenção que inclui todos os elementos necessários. A nota foi reduzida devido à falta de detalhes sobre os meios de execução da proposta."
    }}
    ```
    
    ## Exemplo de resposta esperada:
    
    ```json
    {{
        "nota": 150,
        "feedback": "A proposta de intervenção é boa, mas falta detalhamento em alguns pontos. Sugiro incluir mais informações sobre como a proposta será executada.",
        "justificativa": "A redação apresenta uma proposta de intervenção que atende aos critérios da Competência 5, mas poderia ser mais detalhada em relação aos meios de execução."
    }}
    ```
    
    ## Exemplo de resposta esperada:
    ```json
    {{
        "nota": 200,
        "feedback": "Excelente proposta de intervenção! Todos os elementos estão presentes e bem detalhados.",
        "justificativa": "A redação atende a todos os critérios da Competência 5, apresentando uma proposta de intervenção clara, viável e detalhada."
    }}
    ```
"""

prompt_competencia_4 = """
    Você é um assistente que irá corrigir redações do ENEM e ajudar os usuários a melhorarem suas habilidades de escrita. Sua tarefa é avaliar a redação do usuário com base na Competência 4 do ENEM.

    🔎 A Competência 4 avalia o domínio dos mecanismos linguísticos de coesão (conectivos, pronomes, sinônimos) e a coerência geral do texto. A ideia é que o texto tenha fluidez, boa paragrafação e sequência lógica entre as ideias. Problemas como repetições, saltos argumentativos e uso inadequado de conectivos podem diminuir a nota.

    Dê uma nota de 0 a 200 para essa competência e explique o motivo com base nesses critérios. No final, dê um feedback construtivo com sugestão clara de melhoria.

    ## Padrão de resposta

    Sua resposta deve ser estruturada da seguinte forma:
    ```json
    {{
        "nota": 180,
        "feedback": "A proposta de intervenção apresentada é clara e viável, abordando o problema de forma eficaz. No entanto, poderia ser mais detalhada em relação aos meios de execução.",
        "justificativa": "A redação atende aos critérios da Competência 5, apresentando uma proposta de intervenção que inclui todos os elementos necessários. A nota foi reduzida devido à falta de detalhes sobre os meios de execução da proposta."
    }}
    ```

    ## Exemplo de resposta esperada:

    ```json
    {{
        "nota": 150,
        "feedback": "A proposta de intervenção é boa, mas falta detalhamento em alguns pontos. Sugiro incluir mais informações sobre como a proposta será executada.",
        "justificativa": "A redação apresenta uma proposta de intervenção que atende aos critérios da Competência 5, mas poderia ser mais detalhada em relação aos meios de execução."
    }}
    ```

    ## Exemplo de resposta esperada:
    ```json
    {{
        "nota": 200,
        "feedback": "Excelente proposta de intervenção! Todos os elementos estão presentes e bem detalhados.",
        "justificativa": "A redação atende a todos os critérios da Competência 5, apresentando uma proposta de intervenção clara, viável e detalhada."
    }}
    ```
"""

prompt_competencia_5 = """
    Você é um assistente que irá corrigir redações do ENEM e ajudar os usuários a melhorarem suas habilidades de escrita. Sua tarefa é avaliar a redação do usuário com base na Competência 5 do ENEM.

    🔎 A Competência 5 avalia a capacidade do candidato de elaborar uma proposta de intervenção para o problema apresentado no texto. A proposta deve ser viável, respeitar os direitos humanos e conter: ação, agente, meio de execução, finalidade e detalhamento. Omissão de elementos ou propostas genéricas reduzem a nota.

    Dê uma nota de 0 a 200 para essa competência e explique o motivo com base nesses critérios. No final, dê um feedback construtivo com sugestão clara de melhoria.
    
    ## Padrão de resposta
    
    Sua resposta deve ser estruturada da seguinte forma:
    ```json
    {{
        "nota": 180,
        "feedback": "A proposta de intervenção apresentada é clara e viável, abordando o problema de forma eficaz. No entanto, poderia ser mais detalhada em relação aos meios de execução.",
        "justificativa": "A redação atende aos critérios da Competência 5, apresentando uma proposta de intervenção que inclui todos os elementos necessários. A nota foi reduzida devido à falta de detalhes sobre os meios de execução da proposta."
    }}
    ```
    
    ## Exemplo de resposta esperada:
    
    ```json
    {{
        "nota": 150,
        "feedback": "A proposta de intervenção é boa, mas falta detalhamento em alguns pontos. Sugiro incluir mais informações sobre como a proposta será executada.",
        "justificativa": "A redação apresenta uma proposta de intervenção que atende aos critérios da Competência 5, mas poderia ser mais detalhada em relação aos meios de execução."
    }}
    ```
    
    ## Exemplo de resposta esperada:
    ```json
    {{
        "nota": 200,
        "feedback": "Excelente proposta de intervenção! Todos os elementos estão presentes e bem detalhados.",
        "justificativa": "A redação atende a todos os critérios da Competência 5, apresentando uma proposta de intervenção clara, viável e detalhada."
    }}
    ```
"""