import React from 'react';
import { OnboardingPage } from '../types';

interface OnboardingProps {
  currentPage: number;
  onNext: () => void;
  onComplete: () => void;
}

const onboardingPages: OnboardingPage[] = [
  {
    title: 'Welcome to NeroEdu',
    subtitle: 'Your AI-powered learning companion',
    description: 'Your AI-powered companion for acing any standardized exam. Get personalized study plans and real-time feedback.',
    icon: '🎓'
  },
  {
    title: 'AI-Powered Learning',
    subtitle: 'Personalized for your success',
    description: 'Advanced machine learning analyzes your strengths and weaknesses to create a tailored study experience just for you.',
    icon: '🧠'
  },
  {
    title: 'Smart Practice Tests',
    subtitle: 'Realistic exam preparation',
    description: 'Take realistic practice exams with instant scoring and detailed explanations for every question.',
    icon: '📝'
  },
  {
    title: 'Essay Review & Feedback',
    subtitle: 'Improve your writing skills',
    description: 'Upload your essays and get instant AI feedback on structure, grammar, and content to improve your writing.',
    icon: '✍️'
  }
];

export const Onboarding: React.FC<OnboardingProps> = ({ currentPage, onNext, onComplete }) => {
  const page = onboardingPages[currentPage];
  const isLastPage = currentPage === onboardingPages.length - 1;

  // Safety check to prevent undefined errors
  if (!page) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-content">
          <div className="error-message">
            <h1>Error</h1>
            <p>Invalid onboarding page. Please refresh the application.</p>
            <button className="primary-button" onClick={onComplete}>
              Skip to Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <div className="page-indicator">
          {onboardingPages.map((_, index) => (
            <div
              key={index}
              className={`indicator-dot ${index === currentPage ? 'active' : ''} ${index < currentPage ? 'completed' : ''}`}
            />
          ))}
        </div>

        <div className="onboarding-page">
          <div className="icon-container">
            <span className="page-icon">{page.icon}</span>
          </div>

          <h1 className="page-title">{page.title}</h1>
          <h2 className="page-subtitle">{page.subtitle}</h2>
          <p className="page-description">{page.description}</p>
        </div>

        <div className="onboarding-controls">
          <button
            className="primary-button"
            onClick={isLastPage ? onComplete : onNext}
          >
            {isLastPage ? 'Get Started' : 'Continue'}
            <span className="button-icon">→</span>
          </button>

          {!isLastPage && (
            <button
              className="skip-button"
              onClick={onComplete}
            >
              Skip Introduction
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
