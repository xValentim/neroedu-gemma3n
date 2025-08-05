import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { ModelSetup } from './components/ModelSetup';
import { StudyMaterial } from './components/StudyMaterial';
import { apiService } from './services/api';
import { ModelInfo } from './types';
import './App.css';

type AppStep = 'onboarding' | 'model-setup' | 'ready';
type MainView = 'home' | 'study-material';

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('onboarding');
  const [onboardingPage, setOnboardingPage] = useState(0);
  const [currentView, setCurrentView] = useState<MainView>('home');
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);

  useEffect(() => {
    if (currentStep === 'ready') {
      loadAvailableModels();
    }
  }, [currentStep]);

  const loadAvailableModels = async () => {
    try {
      const response = await apiService.listModels();
      setAvailableModels(response.models);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const handleOnboardingNext = () => {
    if (onboardingPage < 3) {
      setOnboardingPage(onboardingPage + 1);
    }
  };

  const handleOnboardingComplete = () => {
    setCurrentStep('model-setup');
  };

  const handleModelSetupComplete = () => {
    setCurrentStep('ready');
  };

    const renderMainApp = () => {
    if (currentView === 'study-material') {
      return (
        <StudyMaterial
          availableModels={availableModels}
          onBack={() => setCurrentView('home')}
        />
      );
    }

    return (
      <div className="main-app">
        <div className="app-header">
          <h1>NeroEdu</h1>
          <p>Your AI-powered learning companion is ready!</p>
        </div>

        <div className="features-grid">
          <div className="feature-card" onClick={() => setCurrentView('study-material')}>
            <div className="feature-icon">📚</div>
            <h3>Study Material</h3>
            <p>Generate personalized flashcards and key topics with AI</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Practice Tests</h3>
            <p>Take realistic practice exams with instant feedback</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✍️</div>
            <h3>Essay Review</h3>
            <p>Get AI-powered feedback on your writing</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Progress Tracking</h3>
            <p>Monitor your improvement over time</p>
          </div>
        </div>
      </div>
    );
  };

        return (
    <div className="app">
      {currentStep === 'onboarding' && (
        <Onboarding
          currentPage={onboardingPage}
          onNext={handleOnboardingNext}
          onComplete={handleOnboardingComplete}
        />
      )}

      {currentStep === 'model-setup' && (
        <ModelSetup onSetupComplete={handleModelSetupComplete} />
      )}

      {currentStep === 'ready' && renderMainApp()}
    </div>
  );
}

