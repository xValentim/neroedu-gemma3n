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
} from '../types';

const BASE_URL = 'http://127.0.0.1:8000';

class ApiService {
  private async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${url}:`, error);
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

    // Parse the JSON from the response string
    const jsonMatch = response.match(/```json\n(.*?)\n```/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    } else {
      // Fallback: try to parse the entire response as JSON
      return JSON.parse(response);
    }
  }

  async generateKeyTopics(request: KeyTopicsRequest): Promise<KeyTopicsResponse> {
    const response = await this.fetchJson<string>('/call-key-topics', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    // Parse the JSON from the response string
    const jsonMatch = response.match(/```json\n(.*?)\n```/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    } else {
      // Fallback: try to parse the entire response as JSON
      return JSON.parse(response);
    }
  }

  async generateQuestion(request: SimuladoRequest): Promise<QuestionResponse> {
    const response = await this.fetchJson<SimuladoResponse>('/call-simulado-questao', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    // Parse the JSON from the response string
    const jsonMatch = response.response.match(/```json\n(.*?)\n```/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    } else {
      // Fallback: try to parse the entire response as JSON
      return JSON.parse(response.response);
    }
  }

  async evaluateEssay(request: EssayRequest): Promise<EssayEvaluation> {
    const response = await this.fetchJson<EssayResponse>('/call-model-competencia', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    // Parse the JSON from the response string
    const jsonMatch = response.response.match(/```json\n(.*?)\n```/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    } else {
      // Fallback: try to parse the entire response as JSON
      return JSON.parse(response.response);
    }
  }
}

export const apiService = new ApiService();
