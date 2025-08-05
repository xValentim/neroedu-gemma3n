import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { ModelInfo, OllamaStatusResponse } from '../types';

interface ModelSetupProps {
  onSetupComplete: () => void;
}

const GEMMA_VERSIONS = ['e2b', 'e4b', '1b', '4b', '12b', '27b'];

export const ModelSetup: React.FC<ModelSetupProps> = ({ onSetupComplete }) => {
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'running' | 'not-running' | 'error'>('checking');
  const [selectedModel, setSelectedModel] = useState<string>('gemma3n:e2b');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [showModelList, setShowModelList] = useState(false);

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
    } catch (error) {
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
    setDownloadProgress('Starting download...');

    try {
      await apiService.pullModel(
        selectedModel,
        (data: any) => {
          if (typeof data === 'object' && data.status) {
            setDownloadProgress(data.status);
          } else {
            setDownloadProgress(data.toString());
          }
        },
        () => {
          setIsDownloading(false);
          setDownloadProgress('Download completed!');
          loadAvailableModels();
          // Don't auto-complete setup - let user click "Get Started"
        },
        (error: Error) => {
          setIsDownloading(false);
          setDownloadProgress(`Error: ${error.message}`);
        }
      );
    } catch (error) {
      setIsDownloading(false);
      setDownloadProgress(`Failed to start download: ${error}`);
    }
  };

  const canProceed = () => {
    return availableModels.length > 0 && !isDownloading;
  };

  const handleDeleteModel = async (modelName: string) => {
    try {
      await apiService.deleteModel(modelName);
      loadAvailableModels();
    } catch (error) {
      console.error('Failed to delete model:', error);
    }
  };

  const renderOllamaStatus = () => {
    switch (ollamaStatus) {
      case 'checking':
        return (
          <div className="status-card checking">
            <div className="status-icon">⏳</div>
            <h3>Checking AI Service</h3>
            <p>Verifying that the local AI service is running...</p>
          </div>
        );
      case 'not-running':
        return (
          <div className="status-card error">
            <div className="status-icon">❌</div>
            <h3>AI Service Not Running</h3>
            <p>Please start Ollama before continuing.</p>
            <button className="secondary-button" onClick={checkOllamaStatus}>
              Retry
            </button>
          </div>
        );
      case 'error':
        return (
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
        );
      case 'running':
        return (
          <div className="status-card success">
            <div className="status-icon">✅</div>
            <h3>AI Service Ready</h3>
            <p>Local AI service is running and ready to use.</p>
          </div>
        );
    }
  };

  const renderModelSelection = () => {
    if (ollamaStatus !== 'running') return null;

    return (
      <div className="model-setup-section">
        <h3>Select AI Model</h3>
        <p>Choose a Gemma3n model to download for local AI processing:</p>

        <div className="model-selector">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isDownloading}
            className="model-dropdown"
          >
            {GEMMA_VERSIONS.map((version) => (
              <option key={version} value={`gemma3n:${version}`}>
                gemma3n:{version}
              </option>
            ))}
          </select>

          <button
            className="primary-button"
            onClick={handleDownloadModel}
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download Model'}
          </button>
        </div>

        {isDownloading && (
          <div className="download-progress">
            <div className="progress-info">
              <span>📥</span>
              <span>{downloadProgress}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderModelManagement = () => {
    if (ollamaStatus !== 'running') return null;

    return (
      <div className="model-management">
        <div className="management-buttons">
          <button
            className="secondary-button"
            onClick={() => {
              loadAvailableModels();
              setShowModelList(!showModelList);
            }}
            disabled={isDownloading}
          >
            {showModelList ? 'Hide Models' : 'List Models'}
          </button>
        </div>

        {showModelList && (
          <div className="models-list">
            <h4>Available Models ({availableModels.length})</h4>
            {availableModels.length === 0 ? (
              <p className="no-models">No models downloaded yet.</p>
            ) : (
              <div className="models-grid">
                {availableModels.map((model) => (
                  <div key={model.model} className="model-card">
                    <div className="model-info">
                      <span className="model-name">{model.model}</span>
                      <span className="model-size">{(model.size / 1024 / 1024 / 1024).toFixed(1)} GB</span>
                    </div>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteModel(model.model)}
                      disabled={isDownloading}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="model-setup-container">
      <div className="setup-content">
        <div className="setup-header">
          <h1>Setup AI Models</h1>
          <p>Let's configure your local AI models for the best learning experience.</p>
        </div>

        {renderOllamaStatus()}
        {renderModelSelection()}
        {renderModelManagement()}

        {ollamaStatus === 'running' && (
          <div className="setup-completion">
            {availableModels.length === 0 ? (
              <div className="no-models-warning">
                <div className="warning-icon">⚠️</div>
                <h4>No Models Downloaded</h4>
                <p>You need to download at least one AI model to continue.</p>
              </div>
            ) : (
              <div className="ready-section">
                <div className="success-icon">✅</div>
                <h4>Setup Complete!</h4>
                <p>You have {availableModels.length} model{availableModels.length > 1 ? 's' : ''} ready to use.</p>
                <button
                  className="primary-button get-started-btn"
                  onClick={onSetupComplete}
                  disabled={!canProceed()}
                >
                  Get Started
                  <span className="button-icon">🚀</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
