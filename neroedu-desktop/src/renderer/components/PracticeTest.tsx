import React, { useState } from 'react';
import { apiService } from '../services/api';
import { QuestionResponse } from '../types';

interface PracticeTestProps {
  examType: string;
  modelName: string;
  onBack: () => void;
}

export const PracticeTest: React.FC<PracticeTestProps> = ({ examType, modelName, onBack }) => {
  const [currentView, setCurrentView] = useState<'selection' | 'questions' | 'results'>('selection');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const maxQuestions = 5;

  const handleGenerateQuestion = async () => {
    if (!topic.trim()) {
      setError('Please enter a study topic');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.generateQuestion({
        tema: topic.trim(),
        model_name: modelName,
        exam_type: examType,
        lite_rag: true
      });

      setQuestions([response]);
      setSelectedAnswers([]);
      setCurrentQuestionIndex(0);
      setCurrentView('questions');
    } catch (err) {
      setError('Error generating question. Please try again.');
      console.error('Error generating question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (questions.length < maxQuestions) {
      // Generate new question
      setIsLoading(true);
      try {
        const response = await apiService.generateQuestion({
          tema: topic.trim(),
          model_name: modelName,
          exam_type: examType,
          lite_rag: true
        });

        setQuestions(prev => [...prev, response]);
        setCurrentQuestionIndex(questions.length);
        setSelectedAnswers(prev => [...prev, '']);
      } catch (err) {
        setError('Error generating new question. Please try again.');
        console.error('Error generating question:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Calculate results
      calculateResults();
    }
  };

  const calculateResults = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++;
      }
    });
    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
    setCurrentView('results');
  };

  const handleFinish = () => {
    calculateResults();
  };

  const resetTest = () => {
    setQuestions([]);
    setSelectedAnswers([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    setCurrentView('selection');
  };

  const renderSelection = () => (
    <div className="practice-test-selection">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>

      <div className="selection-content">
        <h1>Practice Test Generator</h1>
        <p>Generate practice questions with instant feedback and explanations</p>

        <div className="input-section">
          <label htmlFor="topic">Study Topic:</label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic to practice (e.g., World War II, Calculus, Photosynthesis)"
            className="topic-input"
            disabled={isLoading}
          />
        </div>

        <div className="action-buttons">
          <button
            className="generate-button"
            onClick={handleGenerateQuestion}
            disabled={isLoading || !topic.trim()}
          >
            {isLoading ? 'Generating...' : 'Start Practice Test'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );

  const renderQuestions = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    const selectedAnswer = selectedAnswers[currentQuestionIndex];

    return (
      <div className="practice-test-questions">
        <button className="back-button" onClick={() => setCurrentView('selection')}>
          ← Back to Selection
        </button>

        <div className="question-header">
          <h2>Practice Test</h2>
          <p>Question {currentQuestionIndex + 1} of {Math.min(questions.length + (isLoading ? 1 : 0), maxQuestions)}</p>
        </div>

        <div className="question-card">
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
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                className="nav-button primary-button"
                onClick={handleNextQuestion}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Next Question'}
              </button>
            ) : questions.length < maxQuestions ? (
              <button
                className="nav-button primary-button"
                onClick={handleNextQuestion}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Next Question'}
              </button>
            ) : (
              <button
                className="nav-button primary-button"
                onClick={handleFinish}
              >
                Finish Test
              </button>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    );
  };

  const renderResults = () => (
    <div className="practice-test-results">
      <button className="back-button" onClick={resetTest}>
        ← New Test
      </button>

      <div className="results-content">
        <h2>Test Results</h2>
        <p>Your performance summary</p>

        <div className="score-card">
          <h3>Final Score</h3>
          <div className="score-display">
            {score}/{questions.length}
          </div>
          <div className="score-percentage">
            {score}%
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
          onClick={resetTest}
        >
          Take Another Test
        </button>
      </div>
    </div>
  );

  return (
    <div className="practice-test-container">
      {currentView === 'selection' && renderSelection()}
      {currentView === 'questions' && renderQuestions()}
      {currentView === 'results' && renderResults()}
    </div>
  );
};
