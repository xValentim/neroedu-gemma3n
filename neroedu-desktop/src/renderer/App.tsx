import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { ModelSetup } from './components/ModelSetup';
import { StudyMaterial } from './components/StudyMaterial';
import { PracticeTest } from './components/PracticeTest';
import { EssayReview } from './components/EssayReview';
import ExamSelection from './components/ExamSelection';
import { ExamType } from './types';
import './App.css';

type Step = 'onboarding' | 'exam-selection' | 'model-setup' | 'main-app';
type View = 'home' | 'study-material' | 'practice-test' | 'essay-review';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('onboarding');
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null);
  const [onboardingPage, setOnboardingPage] = useState(0);

  const handleOnboardingNext = () => {
    if (onboardingPage < 3) {
      setOnboardingPage(onboardingPage + 1);
    }
  };

  const handleOnboardingComplete = () => {
    setCurrentStep('exam-selection');
  };

  const handleExamSelected = (examType: ExamType) => {
    setSelectedExamType(examType);
    setCurrentStep('model-setup');
  };

  const handleModelSetupComplete = (modelName: string) => {
    setSelectedModel(modelName);
    setCurrentStep('main-app');
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'study-material':
        return (
          <StudyMaterial
            selectedModel={selectedModel}
            selectedExamType={selectedExamType!}
            onBack={() => setCurrentView('home')}
          />
        );
      case 'practice-test':
        return (
          <PracticeTest
            selectedModel={selectedModel}
            selectedExamType={selectedExamType!}
            onBack={() => setCurrentView('home')}
          />
        );
      case 'essay-review':
        return (
          <EssayReview
            selectedModel={selectedModel}
            onBack={() => setCurrentView('home')}
          />
        );
      default:
        return (
          <div className="main-content">
            <div className="welcome-section">
              <div className="welcome-visual">
                <div className="floating-brain">🧠</div>
              </div>
              <div className="welcome-text">
                <h1>Welcome back!</h1>
                <p>Ready to continue your exam preparation journey? Choose your next study session below.</p>
              </div>
            </div>

            <div className="quick-actions">
              <div
                className="action-card study-card"
                onClick={() => setCurrentView('study-material')}
              >
                <div className="card-visual">📚</div>
                <div className="card-content">
                  <h3>Study Material</h3>
                  <p>Generate flashcards and key topics for focused learning</p>
                </div>
              </div>

              <div
                className="action-card practice-card"
                onClick={() => setCurrentView('practice-test')}
              >
                <div className="card-visual">✍️</div>
                <div className="card-content">
                  <h3>Practice Test</h3>
                  <p>Take practice questions with instant feedback and explanations</p>
                </div>
              </div>

              <div
                className="action-card essay-card"
                onClick={() => setCurrentView('essay-review')}
              >
                <div className="card-visual">📝</div>
                <div className="card-content">
                  <h3>Essay Review</h3>
                  <p>Get detailed feedback on your essays with ENEM competency scoring</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (currentStep === 'onboarding') {
    return <Onboarding
      currentPage={onboardingPage}
      onNext={handleOnboardingNext}
      onComplete={handleOnboardingComplete}
    />;
  }

  if (currentStep === 'exam-selection') {
    return <ExamSelection onExamSelected={handleExamSelected} />;
  }

  if (currentStep === 'model-setup') {
    return <ModelSetup onComplete={handleModelSetupComplete} />;
  }

  return (
    <div className="main-app-container">
      <div className="app-sidebar">
        <div className="sidebar-header">
          <div className="app-logo">
            <div className="logo-icon">🧠</div>
            <div className="logo-text">NeroEdu</div>
          </div>
        </div>

        <nav className="sidebar-menu">
          <div
            className={`menu-item ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
          >
            <span className="menu-icon">🏠</span>
            <span>Home</span>
          </div>
          <div
            className={`menu-item ${currentView === 'study-material' ? 'active' : ''}`}
            onClick={() => setCurrentView('study-material')}
          >
            <span className="menu-icon">📚</span>
            <span>Study Material</span>
          </div>
          <div
            className={`menu-item ${currentView === 'practice-test' ? 'active' : ''}`}
            onClick={() => setCurrentView('practice-test')}
          >
            <span className="menu-icon">✍️</span>
            <span>Practice Test</span>
          </div>
          <div
            className={`menu-item ${currentView === 'essay-review' ? 'active' : ''}`}
            onClick={() => setCurrentView('essay-review')}
          >
            <span className="menu-icon">📝</span>
            <span>Essay Review</span>
          </div>
        </nav>
      </div>

      {renderMainContent()}
    </div>
  );
};

export default App;

