import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { FlashcardResponse, KeyTopicsResponse } from '../types';

interface StudyMaterialProps {
  examType: string;
  modelName: string;
  onBack: () => void;
}

export const StudyMaterial: React.FC<StudyMaterialProps> = ({ examType, modelName, onBack }) => {
  const [currentView, setCurrentView] = useState<'selection' | 'flashcards' | 'key-topics'>('selection');
  const [topic, setTopic] = useState('');
  const [useLiteRAG, setUseLiteRAG] = useState(true);
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
        model_name: modelName,
        exam_type: examType,
        lite_rag: useLiteRAG
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
        model_name: modelName,
        exam_type: examType,
        lite_rag: useLiteRAG
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
        model_name: modelName,
        exam_type: examType,
        lite_rag: useLiteRAG
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
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>

      <div className="selection-content">
        <h1>Study Material Generator</h1>
        <p>Generate flashcards and key topics for effective studying</p>

        <div className="input-section">
          <label htmlFor="topic">Study Topic:</label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic to study (e.g., World War II, Calculus, Photosynthesis)"
            className="topic-input"
            disabled={isLoadingFlashcard || isLoadingKeyTopics}
          />
        </div>

        <div className="rag-option-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={useLiteRAG}
              onChange={(e) => setUseLiteRAG(e.target.checked)}
              disabled={isLoadingFlashcard || isLoadingKeyTopics}
            />
            <span className="checkbox-text">
              Use Lite RAG (Enhanced content retrieval for better study materials)
            </span>
          </label>
        </div>

        <div className="action-buttons">
          <button
            className="generate-button flashcard-button"
            onClick={handleGenerateFlashcard}
            disabled={isLoadingFlashcard || isLoadingKeyTopics || !topic.trim()}
          >
            {isLoadingFlashcard ? 'Generating...' : 'Generate Flashcard'}
          </button>

          <button
            className="generate-button topics-button"
            onClick={handleGenerateKeyTopics}
            disabled={isLoadingFlashcard || isLoadingKeyTopics || !topic.trim()}
          >
            {isLoadingKeyTopics ? 'Generating...' : 'Generate Key Topics'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
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
