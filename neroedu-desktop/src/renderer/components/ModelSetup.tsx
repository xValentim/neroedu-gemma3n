import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { OllamaStatusResponse, ModelInfo } from '../types';

interface ModelSetupProps {
  onComplete: (model: string) => void;
}

export const ModelSetup: React.FC<ModelSetupProps> = ({ onComplete }) => {
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'running' | 'not-running' | 'error'>('checking');
  const [selectedModel, setSelectedModel] = useState('gemma3n:e2b');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const modelOptions = [
    { value: 'gemma3n:e2b', label: 'Gemma3n E2B (2B parameters)' },
    { value: 'gemma3n:e4b', label: 'Gemma3n E4B (4B parameters)' },
    { value: 'gemma3n:1b', label: 'Gemma3n 1B (1B parameters)' },
    { value: 'gemma3n:4b', label: 'Gemma3n 4B (4B parameters)' },
    { value: 'gemma3n:12b', label: 'Gemma3n 12B (12B parameters)' },
    { value: 'gemma3n:27b', label: 'Gemma3n 27B (27B parameters)' }
  ];

  useEffect(() => {
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      console.log('Checking Ollama status...');
      // First test basic connection
      const connectionTest = await apiService.testConnection();
      console.log('Connection test result:', connectionTest);
      if (!connectionTest) {
        console.error('Basic connection test failed');
        setOllamaStatus('error');
        return;
      }
      const response: OllamaStatusResponse = await apiService.checkOllamaStatus();
      console.log('Ollama status response:', response);
      if (response.status === 'Ollama is running') {
        setOllamaStatus('running');
        loadAvailableModels();
      } else {
        console.log('Ollama not running, status:', response.status);
        setOllamaStatus('not-running');
      }
    } catch (error: any) {
      console.error('Failed to check Ollama status:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      setOllamaStatus('error');
    }
  };

  const loadAvailableModels = async () => {
    try {
      const response = await apiService.listModels();
      setAvailableModels(response.models);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const handleDownloadModel = async () => {
    setIsDownloading(true);
    setError(null);
    setDownloadProgress('');

    try {
      const response = await fetch('http://127.0.0.1:8000/pull-model/' + selectedModel);
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error('Failed to get response reader');
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
              if (data.status) {
                setDownloadProgress(data.status);
              }
            } catch (e) {
              // Ignore parsing errors for non-JSON lines
            }
          }
        }
      }

      // Reload available models after download
      await loadAvailableModels();
      setIsDownloading(false);
    } catch (error: any) {
      console.error('Download failed:', error);
      setError('Failed to download model. Please try again.');
      setIsDownloading(false);
    }
  };

  const handleListModels = async () => {
    try {
      console.log('Loading available models...');
      await loadAvailableModels();
      console.log('Available models loaded:', availableModels);
    } catch (error) {
      console.error('Failed to list models:', error);
      setError('Failed to load models. Please try again.');
    }
  };

  const handleDeleteModel = async () => {
    if (!selectedModel) return;

    try {
      await apiService.deleteModel(selectedModel);
      await loadAvailableModels();
    } catch (error) {
      console.error('Failed to delete model:', error);
    }
  };

  const handleGetStarted = () => {
    onComplete(selectedModel);
  };

  const isModelAvailable = availableModels.some(model => model.model === selectedModel);

  if (ollamaStatus === 'checking') {
    return (
      <div className="model-setup-container">
        <div className="loading-card">
          <div className="loading-icon">⏳</div>
          <div className="loading-text">Checking AI service...</div>
        </div>
      </div>
    );
  }

  if (ollamaStatus === 'error') {
    return (
      <div className="model-setup-container">
        <div className="status-card error">
          <div className="status-icon">⚠️</div>
          <h3>Connection Error</h3>
          <p>Unable to connect to the AI service at http://127.0.0.1:8000</p>
          <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
            Make sure the FastAPI server is running on port 8000
          </p>
          <button className="secondary-button" onClick={checkOllamaStatus}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (ollamaStatus === 'not-running') {
    return (
      <div className="model-setup-container">
        <div className="status-card error">
          <div className="status-icon">⚠️</div>
          <h3>Ollama Not Running</h3>
          <p>Please start Ollama to use the AI features</p>
          <button className="secondary-button" onClick={checkOllamaStatus}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="model-setup-container">
      <div className="setup-content">
        <h1>AI Model Setup</h1>
        <p>Select and download an AI model for personalized learning</p>

        <div className="model-selection">
          <label htmlFor="model-select">Choose Model:</label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isDownloading}
            className="model-select"
          >
            {modelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="model-actions">
          <button
            className="primary-button"
            onClick={handleDownloadModel}
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download Model'}
          </button>

          <button
            className="secondary-button"
            onClick={handleListModels}
            disabled={isDownloading}
          >
            List Models
          </button>

          <button
            className="secondary-button"
            onClick={handleDeleteModel}
            disabled={isDownloading || !isModelAvailable}
          >
            Delete Model
          </button>
        </div>

        {isDownloading && (
          <div className="download-progress">
            <div className="progress-text">{downloadProgress}</div>
          </div>
        )}

        {availableModels.length > 0 && (
          <div className="available-models">
            <h3>Available Models:</h3>
            <div className="models-list">
              {availableModels.map((model) => (
                <div key={model.model} className="model-item">
                  <span className="model-name">{model.model}</span>
                  <span className="model-size">{model.size}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isModelAvailable && (
          <div className="get-started-section">
            <button
              className="get-started-btn"
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};
