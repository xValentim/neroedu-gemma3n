import React, { useState } from 'react';
import { ModelInfo, QuestionResponse } from '../types';
import { apiService } from '../services/api';

interface PracticeTestProps {
  availableModels: ModelInfo[];
  onBack: () => void;
}

export const PracticeTest: React.FC<PracticeTestProps> = ({ availableModels, onBack }) => {
  const [currentView, setCurrentView] = useState<'selection' | 'questions'>('selection');
  const [topic, setTopic] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [useRAG, setUseRAG] = useState(true);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxQuestions = 5;

  const handleGenerateQuestion = async () => {
    if (!topic.trim() || !selectedModel) {
      setError('Please enter a topic and select a model');
      return;
    }

    setIsLoadingQuestion(true);
    setError(null);

    try {
      const response = await apiService.generateQuestion({
        tema: topic,
        model_name: selectedModel,
        lite_rag: useRAG
      });

      setQuestions([response]);
      setCurrentQuestionIndex(0);
      setCurrentView('questions');
      setShowResults(false);
      setSelectedAnswers({});
    } catch (error) {
      console.error('Error generating question:', error);
      setError('Failed to generate question. Please try again.');
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const generateNewQuestion = async () => {
    if (questions.length >= maxQuestions) {
      return;
    }

    setIsLoadingQuestion(true);
    setError(null);

    try {
      const response = await apiService.generateQuestion({
        tema: topic,
        model_name: selectedModel,
        lite_rag: useRAG
      });

      setQuestions(prev => [...prev, response]);
    } catch (error) {
      console.error('Error generating new question:', error);
      setError('Failed to generate new question. Please try again.');
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (questions.length < maxQuestions && !isLoadingQuestion) {
      generateNewQuestion();
      setCurrentQuestionIndex(questions.length);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const finishTest = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++;
      }
    });
    return { correct, total: questions.length };
  };

  const renderSelection = () => (
    <div className="study-material-container">
      <div className="header-section">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2>Practice Test</h2>
        <p>Generate realistic exam questions with AI assistance</p>
      </div>

      <div className="input-section">
        <div className="input-group">
          <label htmlFor="topic">Topic</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter study topic (e.g., World War II, Photosynthesis, Algebra)"
            className="topic-input"
          />
        </div>

        <div className="input-group">
          <label htmlFor="model">AI Model</label>
          <select
            id="model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-select"
          >
            <option value="">Select a model</option>
            {availableModels.map((model) => (
              <option key={model.model} value={model.model}>
                {model.model}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={useRAG}
              onChange={(e) => setUseRAG(e.target.checked)}
              className="checkbox-input"
            />
            <span className="checkbox-text">
              Use Enhanced Context (RAG)
              <small>Provides more accurate and detailed questions</small>
            </span>
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          className="generate-button primary-button"
          onClick={handleGenerateQuestion}
          disabled={isLoadingQuestion || !topic.trim() || !selectedModel}
        >
          {isLoadingQuestion ? 'Generating Question...' : 'Start Practice Test'}
        </button>
      </div>
    </div>
  );

  const renderQuestions = () => {
    if (showResults) {
      const score = calculateScore();
      return (
        <div className="study-material-container">
          <div className="header-section">
            <button className="back-button" onClick={() => setCurrentView('selection')}>
              ← New Test
            </button>
            <h2>Test Results</h2>
            <p>Your performance summary</p>
          </div>

          <div className="results-section">
            <div className="score-card">
              <h3>Final Score</h3>
              <div className="score-display">
                {score.correct}/{score.total}
              </div>
              <div className="score-percentage">
                {Math.round((score.correct / score.total) * 100)}%
              </div>
            </div>

            <div className="questions-review">
              {questions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correct_answer;

                return (
                  <div key={index} className={`question-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="question-number">Question {index + 1}</div>
                    <div className="question-text">{question.question}</div>

                    <div className="answer-review">
                      <div className="user-answer">
                        Your answer: <span className={isCorrect ? 'correct' : 'incorrect'}>
                          {userAnswer || 'Not answered'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="correct-answer">
                          Correct answer: <span className="correct">{question.correct_answer}</span>
                        </div>
                      )}
                    </div>

                    <div className="explanation">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="primary-button"
              onClick={() => setCurrentView('selection')}
            >
              Take Another Test
            </button>
          </div>
        </div>
      );
    }

    if (isLoadingQuestion && currentQuestionIndex >= questions.length) {
      return (
        <div className="study-material-container">
          <div className="header-section">
            <button className="back-button" onClick={() => setCurrentView('selection')}>
              ← Back
            </button>
            <h2>Practice Test</h2>
            <p>Question {currentQuestionIndex + 1} of {maxQuestions}</p>
          </div>

          <div className="inline-loading">
            <div className="inline-loading-spinner"></div>
            <span>Generating question...</span>
          </div>
        </div>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    const selectedAnswer = selectedAnswers[currentQuestionIndex];

    return (
      <div className="study-material-container">
        <div className="header-section">
          <button className="back-button" onClick={() => setCurrentView('selection')}>
            ← Back
          </button>
          <h2>Practice Test</h2>
          <p>Question {currentQuestionIndex + 1} of {Math.min(questions.length + (isLoadingQuestion ? 1 : 0), maxQuestions)}</p>
        </div>

        <div className="question-container">
          <div className="question-card">
            <div className="question-header">
              <span className="question-number">Question {currentQuestionIndex + 1}</span>
            </div>

            <div className="question-text">
              {currentQuestion.question}
            </div>

            <div className="answers-grid">
              {(['A', 'B', 'C', 'D', 'E'] as const).map((option) => (
                <button
                  key={option}
                  className={`answer-option ${selectedAnswer === option ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(option)}
                >
                  <span className="option-letter">{option}</span>
                  <span className="option-text">{currentQuestion[option]}</span>
                </button>
              ))}
            </div>

            <div className="question-navigation">
              <button
                className="nav-button secondary-button"
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  className="nav-button primary-button"
                  onClick={nextQuestion}
                >
                  Next Question
                </button>
              ) : questions.length < maxQuestions ? (
                <button
                  className="nav-button primary-button"
                  onClick={nextQuestion}
                  disabled={isLoadingQuestion}
                >
                  {isLoadingQuestion ? 'Generating...' : 'Next Question'}
                </button>
              ) : (
                <button
                  className="nav-button primary-button"
                  onClick={finishTest}
                >
                  Finish Test
                </button>
              )}
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    );
  };

  return currentView === 'selection' ? renderSelection() : renderQuestions();
};
