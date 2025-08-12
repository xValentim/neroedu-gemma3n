import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { OllamaStatusResponse, ModelInfo } from '../types';
import ollamaImage from '../../assets/ollama.png';

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
      size: '~5.6GB',
      icon: '⚡'
    },
    {
      id: 'gemma3n:e4b',
      name: 'Gemma3n E4B',
      description: '4B parameters - Balanced performance and quality',
      size: '~7.5GB',
      icon: '🎯'
    }
  ];

  useEffect(() => {
    checkOllamaStatus();
  }, []);

  // Reload models when Ollama status changes to running
  useEffect(() => {
    if (ollamaStatus === 'running') {
      console.log('Ollama status changed to running, reloading models...');
      loadAvailableModels();
    }
  }, [ollamaStatus]);

  const checkOllamaStatus = async () => {
    try {
      console.log('Checking Ollama status...');
      setOllamaStatus('checking');

      const response: OllamaStatusResponse = await apiService.checkOllamaStatus();
      console.log('Ollama status response:', response);

      if (response.status === 'Ollama is running') {
        console.log('Ollama is running, loading available models...');
        setOllamaStatus('running');
        await loadAvailableModels();
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
      console.log('Loading available models...');
      const response = await apiService.listModels();
      console.log('Models response:', response);
      setAvailableModels(response.models || []);

      // Auto-select first available model (if any are downloaded)
      const firstAvailable = response.models?.find(model =>
        modelCards.some(card => card.id === model.model)
      );
      if (firstAvailable) {
        console.log('Auto-selecting downloaded model:', firstAvailable.model);
        setSelectedModel(firstAvailable.model);
      } else {
        console.log('No models downloaded yet - user needs to download one');
        setSelectedModel(''); // Clear selection if no models are downloaded
      }
    } catch (error) {
      console.error('Failed to load models:', error);
      setAvailableModels([]);
      setError('Failed to load available models. Please try again.');
    }
  };

  const isModelAvailable = (modelId: string) => {
    const isAvailable = availableModels.some(model => model.model === modelId);
    return isAvailable;
  };

  const handleDownloadModel = async (modelId: string) => {
    console.log(`Starting download for model: ${modelId}`);
    setIsDownloading(modelId);
    setError(null);
    setDownloadProgress('Starting download...');

    try {
      console.log('Calling apiService.pullModel...');
      await apiService.pullModel(
        modelId,
        (data: any) => {
          console.log('Progress data received:', data);
          if (typeof data === 'string') {
            setDownloadProgress(data);
          } else if (data && data.status) {
            setDownloadProgress(data.status);
          } else {
            setDownloadProgress(JSON.stringify(data));
          }
        },
        () => {
          console.log('Download completed successfully');
          setIsDownloading(null);
          setDownloadProgress('');
          loadAvailableModels();
        },
        (error) => {
          console.error('Download failed:', error);
          setError('Failed to download model. Please try again.');
          setIsDownloading(null);
          setDownloadProgress('');
        }
      );
    } catch (error: any) {
      console.error('Download failed:', error);
      setError('Failed to download model. Please try again.');
      setIsDownloading(null);
      setDownloadProgress('');
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
            <div className="ollama-branding">
              <img src={ollamaImage} alt="Ollama" className="ollama-logo" />
              <p>Need help setting up Ollama?</p>
            </div>
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
            <div className="ollama-branding">
              <img src={ollamaImage} alt="Ollama" className="ollama-logo" />
              <p>Don't have Ollama installed?</p>
            </div>
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
          <div className="setup-header-content">
            <div className="ollama-branding-header">
              <img src={ollamaImage} alt="Ollama" className="ollama-logo-header" />
            </div>
            <div>
              <h1>AI Model Setup</h1>
              <p>Select and download an AI model for personalized learning</p>
            </div>
          </div>
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
                      className="download-button primary-action-button"
                      onClick={(e) => {
                        console.log(`Download button clicked for model: ${model.id}`);
                        e.stopPropagation();
                        handleDownloadModel(model.id);
                      }}
                      disabled={isModelDownloading}
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        fontSize: '16px',
                        fontWeight: '600',
                        marginTop: '12px'
                      }}
                    >
                      {isModelDownloading ? '⏳ Downloading...' : '⬇️ Download Model'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isDownloading && (
          <div className="download-progress">
            <div className="progress-header">
              <h3>Downloading {modelCards.find(m => m.id === isDownloading)?.name}...</h3>
              <p>This may take a few minutes depending on your internet connection</p>
            </div>
            <div className="progress-text">{downloadProgress || 'Initializing download...'}</div>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        )}

        {ollamaStatus === 'running' && availableModels.length === 0 && !isDownloading && (
          <div className="no-models-message" style={{
            textAlign: 'center',
            padding: '20px',
            margin: '20px 0',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            <p>📥 No models downloaded yet. Please download a model to get started!</p>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>
              Choose between Gemma3n E2B (faster) or Gemma3n E4B (better quality)
            </p>
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
