import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { ModelSetup } from './components/ModelSetup';
import { StudyMaterial } from './components/StudyMaterial';
import { PracticeTest } from './components/PracticeTest';
import { EssayReview } from './components/EssayReview';
import { apiService } from './services/api';
import { ModelInfo } from './types';
import './App.css';

type AppStep = 'onboarding' | 'model-setup' | 'ready';
type MainView = 'home' | 'study-material' | 'practice-test' | 'essay-review';

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

  const renderMainContent = () => {
    if (currentView === 'study-material') {
      return (
        <StudyMaterial
          availableModels={availableModels}
          onBack={() => setCurrentView('home')}
        />
      );
    }

    if (currentView === 'practice-test') {
      return (
        <PracticeTest
          availableModels={availableModels}
          onBack={() => setCurrentView('home')}
        />
      );
    }

    if (currentView === 'essay-review') {
      return (
        <EssayReview
          availableModels={availableModels}
          onBack={() => setCurrentView('home')}
        />
      );
    }

    return (
      <div className="main-content">
        <div className="welcome-section">
          <div className="welcome-visual">
            <div className="floating-brain">🧠</div>
          </div>
          <div className="welcome-text">
            <h1>Welcome back!</h1>
            <p>Start with AI-powered learning and unlock your potential.</p>
          </div>
        </div>

        <div className="quick-actions">
          <div className="action-card study-card" onClick={() => setCurrentView('study-material')}>
            <div className="card-visual">📚</div>
            <div className="card-content">
              <h3>Study Material</h3>
              <p>Generate flashcards</p>
            </div>
          </div>

          <div className="action-card practice-card" onClick={() => setCurrentView('practice-test')}>
            <div className="card-visual">📝</div>
            <div className="card-content">
              <h3>Practice Tests</h3>
              <p>Take realistic exams</p>
            </div>
          </div>

          <div className="action-card essay-card" onClick={() => setCurrentView('essay-review')}>
            <div className="card-visual">✍️</div>
            <div className="card-content">
              <h3>Essay Review</h3>
              <p>Get AI feedback</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMainApp = () => {
    return (
      <div className="main-app-container">
        <div className="app-sidebar">
          <div className="sidebar-header">
            <div className="app-logo">
              <div className="logo-icon">🎓</div>
              <span className="logo-text">NeroEdu</span>
            </div>
          </div>

          <div className="sidebar-menu">
            <div
              className={`menu-item ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentView('home')}
            >
              <div className="menu-icon">🏠</div>
              <span>Home</span>
            </div>

            <div
              className={`menu-item ${currentView === 'study-material' ? 'active' : ''}`}
              onClick={() => setCurrentView('study-material')}
            >
              <div className="menu-icon">📚</div>
              <span>Study Material</span>
            </div>

            <div
              className={`menu-item ${currentView === 'practice-test' ? 'active' : ''}`}
              onClick={() => setCurrentView('practice-test')}
            >
              <div className="menu-icon">📝</div>
              <span>Practice Tests</span>
            </div>

            <div
              className={`menu-item ${currentView === 'essay-review' ? 'active' : ''}`}
              onClick={() => setCurrentView('essay-review')}
            >
              <div className="menu-icon">✍️</div>
              <span>Essay Review</span>
            </div>
          </div>
        </div>

        {renderMainContent()}
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

