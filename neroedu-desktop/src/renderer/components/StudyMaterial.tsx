import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { FlashcardResponse, KeyTopicsResponse, ModelInfo } from '../types';

interface StudyMaterialProps {
  availableModels: ModelInfo[];
  onBack: () => void;
}

export const StudyMaterial: React.FC<StudyMaterialProps> = ({ availableModels, onBack }) => {
  const [currentView, setCurrentView] = useState<'selection' | 'flashcards' | 'key-topics'>('selection');
  const [topic, setTopic] = useState('');
  const [selectedModel, setSelectedModel] = useState(availableModels[0]?.model || 'gemma3n:e2b');
  const [isLoadingFlashcard, setIsLoadingFlashcard] = useState(false);
  const [isLoadingKeyTopics, setIsLoadingKeyTopics] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashcardResponse[]>([]);
  const [keyTopics, setKeyTopics] = useState<KeyTopicsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const maxFlashcards = 5;

  const handleGenerateFlashcard = async () => {
    if (!topic.trim()) {
      setError('Please enter a study topic');
      return;
    }

    setIsLoadingFlashcard(true);
    setError(null);

    try {
      const existingQuestions = flashcards.map(card => card.question);
      const response = await apiService.generateFlashcard({
        tema: topic.trim(),
        flashcards_existentes: existingQuestions,
        model_name: selectedModel,
      });

      setFlashcards(prev => [...prev, response]);
      setCurrentView('flashcards');
      setCurrentFlashcardIndex(flashcards.length); // Show the new card
      setShowAnswer(false);
    } catch (err) {
      setError('Error generating flashcard. Please try again.');
      console.error('Error generating flashcard:', err);
    } finally {
      setIsLoadingFlashcard(false);
    }
  };

  const handleGenerateKeyTopics = async () => {
    if (!topic.trim()) {
      setError('Please enter a study topic');
      return;
    }

    setIsLoadingKeyTopics(true);
    setError(null);

    try {
      const response = await apiService.generateKeyTopics({
        tema: topic.trim(),
        model_name: selectedModel,
      });

      setKeyTopics(response);
      setCurrentView('key-topics');
    } catch (err) {
      setError('Error generating key topics. Please try again.');
      console.error('Error generating key topics:', err);
    } finally {
      setIsLoadingKeyTopics(false);
    }
  };

  const generateNewFlashcard = async () => {
    if (flashcards.length >= maxFlashcards) return;

    setIsLoadingFlashcard(true);
    setError(null);

    try {
      const existingQuestions = flashcards.map(card => card.question);
      const response = await apiService.generateFlashcard({
        tema: topic.trim(),
        flashcards_existentes: existingQuestions,
        model_name: selectedModel,
      });

      setFlashcards(prev => [...prev, response]);
    } catch (err) {
      setError('Error generating new flashcard. Please try again.');
      console.error('Error generating flashcard:', err);
    } finally {
      setIsLoadingFlashcard(false);
    }
  };

  const nextFlashcard = async () => {
    const nextIndex = currentFlashcardIndex + 1;

    // If we're going to a flashcard that doesn't exist yet, generate it
    if (nextIndex >= flashcards.length && flashcards.length < maxFlashcards) {
      setCurrentFlashcardIndex(nextIndex);
      setShowAnswer(false);
      await generateNewFlashcard();
    } else if (nextIndex < flashcards.length) {
      setCurrentFlashcardIndex(nextIndex);
      setShowAnswer(false);
    }
  };

  const previousFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const renderSelection = () => (
    <div className="study-material-selection">
      <div className="study-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1>Study Material</h1>
        <p>Generate personalized flashcards and key topics with AI</p>
      </div>

      <div className="topic-input-section">
        <div className="input-group">
          <label htmlFor="topic">Study Topic</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., World War II, French Revolution..."
            className="topic-input"
            disabled={isLoadingFlashcard || isLoadingKeyTopics}
          />
        </div>

        <div className="model-select-group">
          <label htmlFor="model">AI Model</label>
          <select
            id="model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-select"
            disabled={isLoadingFlashcard || isLoadingKeyTopics}
          >
            {availableModels.map((model) => (
              <option key={model.model} value={model.model}>
                {model.model}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
      </div>

      <div className="study-options">
                <div className="study-option-card" onClick={handleGenerateFlashcard}>
          <div className="option-icon">🃏</div>
          <h3>Generate Flashcard</h3>
          <p>Create study cards with questions and answers about the topic</p>
          <button
            className="option-button"
            disabled={isLoadingFlashcard || isLoadingKeyTopics}
          >
            {isLoadingFlashcard ? 'Generating...' : 'Create Flashcard'}
          </button>
        </div>

        <div className="study-option-card" onClick={handleGenerateKeyTopics}>
          <div className="option-icon">🎯</div>
          <h3>Key Topics</h3>
          <p>Get a complete explanation and the most important points</p>
          <button
            className="option-button"
            disabled={isLoadingFlashcard || isLoadingKeyTopics}
          >
            {isLoadingKeyTopics ? 'Generating...' : 'Generate Topics'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderFlashcards = () => {
    const currentCard = flashcards[currentFlashcardIndex];

    // Show loading state if we're waiting for a new flashcard
    if (!currentCard && isLoadingFlashcard) {
      return (
        <div className="flashcards-view">
          <div className="flashcard-header">
            <button className="back-button" onClick={() => setCurrentView('selection')}>
              ← Back
            </button>
            <h2>Flashcards - {topic}</h2>
            <span className="card-counter">
              {currentFlashcardIndex + 1} of {Math.max(flashcards.length, currentFlashcardIndex + 1)} (max {maxFlashcards})
            </span>
          </div>

          <div className="flashcard-container">
            <div className="flashcard loading-card">
              <div className="loading-content">
                <div className="loading-icon">⏳</div>
                <div className="loading-text">Generating new flashcard...</div>
              </div>
            </div>
          </div>

          <div className="flashcard-controls">
            <button
              className="nav-button"
              onClick={previousFlashcard}
              disabled={currentFlashcardIndex === 0}
            >
              ← Previous
            </button>
            <button
              className="generate-more-button"
              disabled={true}
            >
              Generating...
            </button>
            <button
              className="nav-button"
              disabled={true}
            >
              Loading...
            </button>
          </div>
        </div>
      );
    }

    if (!currentCard) return null;

    return (
      <div className="flashcards-view">
        <div className="flashcard-header">
          <button className="back-button" onClick={() => setCurrentView('selection')}>
            ← Back
          </button>
          <h2>Flashcards - {topic}</h2>
          <span className="card-counter">
            {currentFlashcardIndex + 1} of {Math.max(flashcards.length, currentFlashcardIndex + 1)} (max {maxFlashcards})
          </span>
        </div>

        <div className="flashcard-container">
          <div className={`flashcard ${showAnswer ? 'flipped' : ''}`}>
                        <div className="flashcard-front">
              <div className="card-label">Question</div>
              <div className="card-content">
                {currentCard.question}
              </div>
              <button
                className="flip-button"
                onClick={() => setShowAnswer(true)}
              >
                Show Answer
              </button>
            </div>

            <div className="flashcard-back">
              <div className="card-label">Answer</div>
              <div className="card-content">
                {currentCard.answer}
              </div>
              <button
                className="flip-button"
                onClick={() => setShowAnswer(false)}
              >
                Show Question
              </button>
            </div>
          </div>
        </div>

                <div className="flashcard-controls">
          <button
            className="nav-button"
            onClick={previousFlashcard}
            disabled={currentFlashcardIndex === 0}
          >
            ← Previous
          </button>

          <button
            className="generate-more-button"
            onClick={generateNewFlashcard}
            disabled={isLoadingFlashcard || flashcards.length >= maxFlashcards}
          >
            {isLoadingFlashcard ? 'Generating...' : flashcards.length >= maxFlashcards ? 'Max Reached' : '+ New Flashcard'}
          </button>

          <button
            className="nav-button"
            onClick={nextFlashcard}
            disabled={isLoadingFlashcard || (currentFlashcardIndex >= flashcards.length - 1 && flashcards.length >= maxFlashcards)}
          >
            {isLoadingFlashcard && currentFlashcardIndex + 1 >= flashcards.length ? 'Loading...' : 'Next →'}
          </button>
        </div>
      </div>
    );
  };

  const renderKeyTopics = () => {
    if (!keyTopics) return null;

    return (
            <div className="key-topics-view">
        <div className="key-topics-header">
          <button className="back-button" onClick={() => setCurrentView('selection')}>
            ← Back
          </button>
          <h2>Key Topics - {topic}</h2>
        </div>

        <div className="key-topics-content">
          <div className="explanation-section">
            <h3>📚 General Explanation</h3>
            <div className="explanation-text">
              {keyTopics.explanation}
            </div>
          </div>

          <div className="topics-section">
            <h3>🎯 Key Points</h3>
            <div className="topics-list">
              {keyTopics.key_topics.map((topicItem, index) => (
                <div key={index} className="topic-item">
                  <span className="topic-number">{index + 1}</span>
                  <div className="topic-text">{topicItem}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="key-topics-actions">
            <button
              className="generate-more-button"
              onClick={handleGenerateKeyTopics}
              disabled={isLoadingKeyTopics}
            >
              {isLoadingKeyTopics ? 'Generating...' : '🔄 Regenerate Topics'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="study-material-container">
      {currentView === 'selection' && renderSelection()}
      {currentView === 'flashcards' && renderFlashcards()}
      {currentView === 'key-topics' && renderKeyTopics()}
    </div>
  );
};
