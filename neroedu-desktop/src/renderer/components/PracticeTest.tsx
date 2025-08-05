import React, { useState } from 'react';
import { apiService } from '../services/api';
import { QuestionResponse, ExamType } from '../types';

interface PracticeTestProps {
  selectedModel: string;
  selectedExamType: ExamType;
  onBack: () => void;
}

export const PracticeTest: React.FC<PracticeTestProps> = ({ selectedModel, selectedExamType, onBack }) => {
  const [currentView, setCurrentView] = useState<'selection' | 'questions' | 'results'>('selection');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useRAG, setUseRAG] = useState(false);

  const handleGenerateQuestion = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    try {
      const question = await apiService.generateQuestion({
        tema: topic,
        model_name: selectedModel,
        lite_rag: useRAG,
        exam_type: selectedExamType
      });
      
      setQuestions(prev => [...prev, question]);
      setCurrentQuestionIndex(questions.length);
      setSelectedAnswers(prev => [...prev, '']);
      setCurrentView('questions');
    } catch (error) {
      console.error('Error generating question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newSelectedAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (questions.length < 5) {
      // Generate new question if we haven't reached the limit
      handleGenerateQuestion();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishTest = () => {
    const score = questions.reduce((total, question, index) => {
      return total + (selectedAnswers[index] === question.correct_answer ? 1 : 0);
    }, 0);
    
    setCurrentView('results');
  };

  const resetToSelection = () => {
    setCurrentView('selection');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setTopic('');
    setUseRAG(false);
  };

  if (currentView === 'questions') {
    const currentQuestion = questions[currentQuestionIndex];
    return (
      <div className="practice-test-view">
        <button className="back-button" onClick={resetToSelection}>
          ← Back to Selection
        </button>
        
        <div className="question-container">
          <div className="question-header">
            <h3>Question {currentQuestionIndex + 1} of {questions.length}</h3>
            <span className="topic-label">Topic: {topic}</span>
          </div>
          
          <div className="question-text">
            <p>{currentQuestion.question}</p>
          </div>
          
          <div className="options-container">
            {['A', 'B', 'C', 'D', 'E'].map((option) => (
              <button
                key={option}
                className={`option-button ${selectedAnswers[currentQuestionIndex] === option ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(option)}
              >
                <span className="option-label">{option}</span>
                <span className="option-text">{currentQuestion[option as keyof QuestionResponse]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="question-navigation">
          <button 
            onClick={previousQuestion} 
            disabled={currentQuestionIndex === 0}
            className="nav-button"
          >
            Previous
          </button>
          
          {currentQuestionIndex === questions.length - 1 && questions.length >= 5 ? (
            <button 
              onClick={finishTest}
              disabled={selectedAnswers[currentQuestionIndex] === ''}
              className="finish-button"
            >
              Finish Test
            </button>
          ) : (
            <button 
              onClick={nextQuestion} 
              disabled={selectedAnswers[currentQuestionIndex] === ''}
              className="nav-button"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Next Question' : 'Next'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'results') {
    const score = questions.reduce((total, question, index) => {
      return total + (selectedAnswers[index] === question.correct_answer ? 1 : 0);
    }, 0);
    
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="practice-test-results">
        <button className="back-button" onClick={resetToSelection}>
          ← Back to Selection
        </button>
        
        <div className="results-header">
          <h2>Test Results</h2>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/{questions.length}</span>
            </div>
            <div className="score-percentage">{percentage}%</div>
          </div>
        </div>

        <div className="results-list">
          {questions.map((question, index) => {
            const isCorrect = selectedAnswers[index] === question.correct_answer;
            return (
              <div key={index} className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="result-header">
                  <span className="question-number">Question {index + 1}</span>
                  <span className={`result-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>
                
                <div className="question-content">
                  <p className="question-text">{question.question}</p>
                  
                  <div className="answer-analysis">
                    <div className="your-answer">
                      <strong>Your answer:</strong> {selectedAnswers[index] || 'Not answered'}
                    </div>
                    <div className="correct-answer">
                      <strong>Correct answer:</strong> {question.correct_answer}
                    </div>
                  </div>
                  
                  <div className="explanation">
                    <strong>Explanation:</strong>
                    <p>{question.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="practice-test-container">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>
      
      <div className="practice-test-selection">
        <h2>Practice Test Generator</h2>
        <p>Generate practice questions for {selectedExamType.toUpperCase()} exam preparation.</p>
        
        <div className="input-section">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic (e.g., World War II, Photosynthesis, Calculus)"
            className="topic-input"
          />
        </div>
        
        <div className="rag-option">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={useRAG}
              onChange={(e) => setUseRAG(e.target.checked)}
              className="checkbox-input"
            />
            <span className="checkbox-text">Use RAG (Retrieval-Augmented Generation) for more contextual questions</span>
          </label>
        </div>
        
        <div className="action-buttons">
          <button
            onClick={handleGenerateQuestion}
            disabled={!topic.trim() || isLoading}
            className="generate-button"
          >
            {isLoading ? (
              <div className="inline-loading">
                <div className="inline-loading-spinner"></div>
                Generating question...
              </div>
            ) : (
              'Start Practice Test'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
