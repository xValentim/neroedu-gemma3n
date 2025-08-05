import { FlashcardRequest, FlashcardResponse, KeyTopicsRequest, KeyTopicsResponse, SimuladoRequest, QuestionResponse, EssayRequest, EssayResponse } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

class ApiService {
  private async fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making API request to: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error: ${response.status}`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Response data:`, data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async checkOllamaStatus(): Promise<any> {
    return this.fetchJson('/status-ollama');
  }

  async listModels(): Promise<any> {
    return this.fetchJson('/list-models');
  }

  async deleteModel(modelName: string): Promise<any> {
    return this.fetchJson(`/delete-model/${modelName}`, {
      method: 'DELETE',
    });
  }

  async pullModel(modelName: string): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(`${API_BASE_URL}/pull-model/${modelName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.body!;
  }

  async generateFlashcard(request: FlashcardRequest): Promise<FlashcardResponse> {
    const response = await this.fetchJson<string>('/call-flashcard', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    // Parse JSON from markdown code block if needed
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(response);
  }

  async generateKeyTopics(request: KeyTopicsRequest): Promise<KeyTopicsResponse> {
    const response = await this.fetchJson<string>('/call-key-topics', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    // Parse JSON from markdown code block if needed
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(response);
  }

  async generateQuestion(request: SimuladoRequest): Promise<QuestionResponse> {
    const response = await this.fetchJson<{ response: string; temperature: number; seed: number }>('/call-simulado-questao', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    // Parse JSON from markdown code block if needed
    const jsonMatch = response.response.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(response.response);
  }

  async evaluateEssay(request: EssayRequest): Promise<EssayResponse> {
    const response = await this.fetchJson<{ response: string; model: string; competencia: number }>('/call-model-competencia', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    // Parse JSON from markdown code block if needed
    const jsonMatch = response.response.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      return {
        competencia: response.competencia,
        result: parsed
      };
    }

    const parsed = JSON.parse(response.response);
    return {
      competencia: response.competencia,
      result: parsed
    };
  }

  async testConnection(): Promise<any> {
    return this.fetchJson('/status-ollama');
  }
}

export const apiService = new ApiService();
