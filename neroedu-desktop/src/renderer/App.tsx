import React, { useState, useEffect } from 'react';
import './App.css';
import { Onboarding } from './components/Onboarding';
import { ModelSetup } from './components/ModelSetup';
import { StudyMaterial } from './components/StudyMaterial';
import { PracticeTest } from './components/PracticeTest';
import { EssayReview } from './components/EssayReview';
import ExamSelection from './components/ExamSelection';

type Step = 'onboarding' | 'model-setup' | 'exam-selection' | 'main-app';
type View = 'home' | 'study-material' | 'practice-test' | 'essay-review';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('onboarding');
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [onboardingPage, setOnboardingPage] = useState(0);

  const handleOnboardingComplete = () => {
    setCurrentStep('model-setup');
  };

  const handleOnboardingNext = () => {
    if (onboardingPage < 3) {
      setOnboardingPage(onboardingPage + 1);
    }
  };

  const handleModelSetupComplete = (model: string) => {
    setSelectedModel(model);
    setCurrentStep('exam-selection');
  };

  const handleExamSelected = (examType: string) => {
    setSelectedExamType(examType);
    setCurrentStep('main-app');
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'study-material':
        return <StudyMaterial examType={selectedExamType} modelName={selectedModel} onBack={() => setCurrentView('home')} />;
      case 'practice-test':
        return <PracticeTest examType={selectedExamType} modelName={selectedModel} onBack={() => setCurrentView('home')} />;
      case 'essay-review':
        return <EssayReview examType={selectedExamType} modelName={selectedModel} onBack={() => setCurrentView('home')} />;
      default:
        return (
          <>
            <div className="welcome-section">
              <div className="welcome-visual">
                <div className="floating-brain">🧠</div>
              </div>
              <div className="welcome-text">
                <h1>Welcome back!</h1>
                <p>Ready to continue your learning journey with AI-powered study tools</p>
              </div>
            </div>

            <div className="quick-actions">
              <div className="action-card study-card" onClick={() => setCurrentView('study-material')}>
                <div className="card-visual">📚</div>
                <div className="card-content">
                  <h3>Study Material</h3>
                  <p>Generate flashcards and key topics for effective learning</p>
                </div>
              </div>

              <div className="action-card practice-card" onClick={() => setCurrentView('practice-test')}>
                <div className="card-visual">🎯</div>
                <div className="card-content">
                  <h3>Practice Test</h3>
                  <p>Take practice questions with instant feedback and explanations</p>
                </div>
              </div>

              <div className="action-card essay-card" onClick={() => setCurrentView('essay-review')}>
                <div className="card-visual">✍️</div>
                <div className="card-content">
                  <h3>Essay Review</h3>
                  <p>Get detailed feedback on your essays with AI evaluation</p>
                </div>
              </div>
            </div>
          </>
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

  if (currentStep === 'model-setup') {
    return <ModelSetup onComplete={handleModelSetupComplete} />;
  }

  if (currentStep === 'exam-selection') {
    return <ExamSelection onExamSelected={handleExamSelected} />;
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
          <div className="menu-item" onClick={() => setCurrentView('home')}>
            <span className="menu-icon">🏠</span>
            <span>Home</span>
          </div>
          <div className="menu-item" onClick={() => setCurrentView('study-material')}>
            <span className="menu-icon">📚</span>
            <span>Study Material</span>
          </div>
          <div className="menu-item" onClick={() => setCurrentView('practice-test')}>
            <span className="menu-icon">🎯</span>
            <span>Practice Test</span>
          </div>
          <div className="menu-item" onClick={() => setCurrentView('essay-review')}>
            <span className="menu-icon">✍️</span>
            <span>Essay Review</span>
          </div>
        </nav>
      </div>
      <div className="main-content">
        {renderMainContent()}
      </div>
    </div>
  );
};

export default App;

