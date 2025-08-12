import {
  OllamaStatusResponse,
  ListModelsResponse,
  CheckModelResponse,
  DeleteModelResponse,
  FlashcardRequest,
  FlashcardResponse,
  KeyTopicsRequest,
  KeyTopicsResponse,
  SimuladoRequest,
  SimuladoResponse,
  QuestionResponse,
  EssayRequest,
  EssayResponse,
  EssayEvaluation,
  GeneralEssayRequest,
  GeneralEssayResponse,
  Essay,
  InputEssay,
} from '../types';

const BASE_URL = 'http://127.0.0.1:8000';

class ApiService {
  // Robust JSON extraction utility
  private extractJsonFromResponse<T>(response: string): T {
    // Method 1: Try to find JSON within ```json``` code blocks
    const jsonCodeBlockMatch = response.match(/```json\s*\n(.*?)\n```/s);
    if (jsonCodeBlockMatch) {
      try {
        return JSON.parse(jsonCodeBlockMatch[1]);
      } catch (e) {
        console.warn('Failed to parse JSON from code block:', e);
      }
    }

    // Method 2: Try to find JSON within ``` code blocks (without json specification)
    const codeBlockMatch = response.match(/```\s*\n(.*?)\n```/s);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1]);
      } catch (e) {
        console.warn('Failed to parse JSON from generic code block:', e);
      }
    }

    // Method 3: Try to find JSON object within curly braces (improved version)
    const jsonStartIndex = response.indexOf('{');
    if (jsonStartIndex !== -1) {
      // Find the matching closing brace by counting braces
      let braceCount = 0;
      let inString = false;
      let escaped = false;

      for (let i = jsonStartIndex; i < response.length; i++) {
        const char = response[i];

        if (escaped) {
          escaped = false;
          continue;
        }

        if (char === '\\') {
          escaped = true;
          continue;
        }

        if (char === '"' && !escaped) {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (char === '{') {
            braceCount++;
          } else if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              const jsonStr = response.substring(jsonStartIndex, i + 1);
              try {
                return JSON.parse(jsonStr);
              } catch (e) {
                console.warn('Failed to parse extracted JSON object:', e);
                break;
              }
            }
          }
        }
      }
    }

    // Method 4: Try to find JSON array within square brackets
    const jsonArrayMatch = response.match(/\[[\s\S]*\]/);
    if (jsonArrayMatch) {
      try {
        return JSON.parse(jsonArrayMatch[0]);
      } catch (e) {
        console.warn('Failed to parse JSON array:', e);
      }
    }

    // Method 5: Try to parse the entire response as JSON (fallback)
    try {
      return JSON.parse(response);
    } catch (e) {
      console.error('Failed to extract JSON from response:', response);
      throw new Error(`Unable to extract valid JSON from response: ${response.substring(0, 100)}...`);
    }
  }

  private async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      console.log(`Making API request to: ${BASE_URL}${url}`);
      const response = await fetch(`${BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, response.headers);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      const data = await response.json();
      console.log(`Response data:`, data);
      return data;
    } catch (error: any) {
      console.error(`API call failed for ${url}:`, error);
      console.error(`Error details:`, {
        message: error.message,
        stack: error.stack,
        url: `${BASE_URL}${url}`,
        options
      });
      throw error;
    }
  }

  async checkOllamaStatus(): Promise<OllamaStatusResponse> {
    return this.fetchJson<OllamaStatusResponse>('/status-ollama');
  }

  async listModels(): Promise<ListModelsResponse> {
    return this.fetchJson<ListModelsResponse>('/list-models');
  }

  async checkModel(modelName: string): Promise<CheckModelResponse> {
    return this.fetchJson<CheckModelResponse>(`/check-model/${modelName}`, {
      method: 'POST',
    });
  }

  async deleteModel(modelName: string): Promise<DeleteModelResponse> {
    return this.fetchJson<DeleteModelResponse>(`/delete-model/${modelName}`, {
      method: 'DELETE',
    });
  }

  async pullModel(
    modelName: string,
    onProgress: (data: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      console.log(`Pulling model: ${modelName}`);
      const response = await fetch(`${BASE_URL}/pull-model/${modelName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              onProgress(data);
            } catch (e) {
              // If not JSON, treat as plain text
              onProgress(line);
            }
          }
        }
      }

      onComplete();
    } catch (error) {
      onError(error as Error);
    }
  }

  async generateFlashcard(request: FlashcardRequest): Promise<FlashcardResponse> {
    const response = await this.fetchJson<string>('/call-flashcard', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return this.extractJsonFromResponse(response);
  }

  async generateKeyTopics(request: KeyTopicsRequest): Promise<KeyTopicsResponse> {
    const response = await this.fetchJson<string>('/call-key-topics', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return this.extractJsonFromResponse(response);
  }

  async generateQuestion(request: SimuladoRequest): Promise<QuestionResponse> {
    const response = await this.fetchJson<SimuladoResponse>('/call-simulado-questao', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return this.extractJsonFromResponse(response.response);
  }

  async evaluateEssay(request: EssayRequest): Promise<EssayEvaluation> {
    const response = await this.fetchJson<EssayResponse>('/call-model-competencia', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return this.extractJsonFromResponse(response.response);
  }

  async evaluateGeneralEssay(request: GeneralEssayRequest): Promise<GeneralEssayResponse> {
    console.log('Evaluating general essay:', request);
    const response = await this.fetchJson<GeneralEssayResponse>('/call-essay', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return response;
  }

  // CRUD Essay Methods
  async getEssays(): Promise<Essay[]> {
    return this.fetchJson<Essay[]>('/essays/');
  }

  async getEssay(essayId: number): Promise<Essay> {
    return this.fetchJson<Essay>(`/essays/${essayId}`);
  }

  async createEssay(essay: InputEssay): Promise<Essay> {
    return this.fetchJson<Essay>('/essays/', {
      method: 'POST',
      body: JSON.stringify(essay),
    });
  }

  async updateEssay(essayId: number, essay: Partial<Essay>): Promise<Essay> {
    return this.fetchJson<Essay>(`/essays/${essayId}`, {
      method: 'PUT',
      body: JSON.stringify(essay),
    });
  }

  async deleteEssay(essayId: number): Promise<{ message: string }> {
    return this.fetchJson<{ message: string }>(`/essays/${essayId}`, {
      method: 'DELETE',
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing API connection...');
      const response = await fetch(`${BASE_URL}/status-ollama`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Test response status:', response.status);
      console.log('Test response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Test response data:', data);
        return true;
      } else {
        console.error('Test failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Test connection failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
