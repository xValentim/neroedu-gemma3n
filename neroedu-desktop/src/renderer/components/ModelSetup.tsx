import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { OllamaStatusResponse, ModelInfo } from '../types';

interface ModelSetupProps {
  onComplete: (model: string) => void;
}

interface ModelCard {
  id: string;
  name: string;
  description: string;
  size: string;
  icon: string;
}

export const ModelSetup: React.FC<ModelSetupProps> = ({ onComplete }) => {
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'running' | 'not-running' | 'error'>('checking');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const modelCards: ModelCard[] = [
    {
      id: 'gemma3n:e2b',
      name: 'Gemma3n E2B',
      description: '2B parameters - Fast and efficient for quick responses',
      size: '~1.2GB',
      icon: '⚡'
    },
    {
      id: 'gemma3n:e4b',
      name: 'Gemma3n E4B',
      description: '4B parameters - Balanced performance and quality',
      size: '~2.4GB',
      icon: '🎯'
    }
  ];

  useEffect(() => {
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      console.log('Checking Ollama status...');
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
      setOllamaStatus('error');
    }
  };

  const loadAvailableModels = async () => {
    try {
      const response = await apiService.listModels();
      setAvailableModels(response.models);

      // Auto-select first available model
      const firstAvailable = response.models.find(model =>
        modelCards.some(card => card.id === model.model)
      );
      if (firstAvailable) {
        setSelectedModel(firstAvailable.model);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const isModelAvailable = (modelId: string) => {
    return availableModels.some(model => model.model === modelId);
  };

  const handleDownloadModel = async (modelId: string) => {
    setIsDownloading(modelId);
    setError(null);
    setDownloadProgress('');

    try {
      await apiService.pullModel(
        modelId,
        (data: any) => {
          if (typeof data === 'string') {
            setDownloadProgress(data);
          } else if (data && data.status) {
            setDownloadProgress(data.status);
          }
        },
        () => {
          setIsDownloading(null);
          loadAvailableModels();
        },
        (error) => {
          console.error('Download failed:', error);
          setError('Failed to download model. Please try again.');
          setIsDownloading(null);
        }
      );
    } catch (error: any) {
      console.error('Download failed:', error);
      setError('Failed to download model. Please try again.');
      setIsDownloading(null);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    try {
      await apiService.deleteModel(modelId);
      await loadAvailableModels();
      if (selectedModel === modelId) {
        setSelectedModel('');
      }
    } catch (error) {
      console.error('Failed to delete model:', error);
      setError('Failed to delete model. Please try again.');
    }
  };

  const handleGetStarted = () => {
    if (selectedModel) {
      onComplete(selectedModel);
    }
  };

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
          <div className="ollama-help">
            <p>Need help setting up Ollama?</p>
            <a
              href="https://ollama.com/download"
              target="_blank"
              rel="noopener noreferrer"
              className="download-link"
            >
              📥 Download Ollama
            </a>
          </div>
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
          <div className="ollama-help">
            <p>Don't have Ollama installed?</p>
            <a
              href="https://ollama.com/download"
              target="_blank"
              rel="noopener noreferrer"
              className="download-link"
            >
              📥 Download Ollama
            </a>
          </div>
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
        <div className="setup-header">
          <h1>AI Model Setup</h1>
          <p>Select and download an AI model for personalized learning</p>
        </div>

        <div className="model-cards-grid">
          {modelCards.map((model) => {
            const isAvailable = isModelAvailable(model.id);
            const isModelDownloading = isDownloading === model.id;
            const isSelected = selectedModel === model.id;

            return (
              <div
                key={model.id}
                className={`model-card ${isAvailable ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''}`}
                onClick={() => isAvailable && setSelectedModel(model.id)}
              >
                <div className="model-card-header">
                  <div className="model-icon">{model.icon}</div>
                  <div className="model-info">
                    <h3>{model.name}</h3>
                    <p className="model-size">{model.size}</p>
                  </div>
                  <div className="model-status">
                    {isAvailable ? (
                      <span className="status-badge available">✓ Available</span>
                    ) : (
                      <span className="status-badge unavailable">Not Downloaded</span>
                    )}
                  </div>
                </div>

                <div className="model-description">
                  <p>{model.description}</p>
                </div>

                <div className="model-actions">
                  {isAvailable ? (
                    <>
                                             <button
                         className="select-button"
                         onClick={(e) => {
                           e.stopPropagation();
                           setSelectedModel(model.id);
                         }}
                         disabled={isSelected}
                       >
                         {isSelected ? 'Selected' : 'Select'}
                       </button>
                       <button
                         className="delete-button"
                         onClick={(e) => {
                           e.stopPropagation();
                           handleDeleteModel(model.id);
                         }}
                         disabled={isModelDownloading}
                       >
                         🗑️ Delete
                       </button>
                    </>
                  ) : (
                                         <button
                       className="download-button"
                       onClick={(e) => {
                         e.stopPropagation();
                         handleDownloadModel(model.id);
                       }}
                       disabled={isModelDownloading}
                     >
                       {isModelDownloading ? '⏳ Downloading...' : '⬇️ Download'}
                     </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isDownloading && (
          <div className="download-progress">
            <div className="progress-text">{downloadProgress}</div>
          </div>
        )}

        {selectedModel && (
          <div className="get-started-section">
            <button
              className="get-started-btn"
              onClick={handleGetStarted}
            >
              Get Started with {modelCards.find(m => m.id === selectedModel)?.name}
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};
