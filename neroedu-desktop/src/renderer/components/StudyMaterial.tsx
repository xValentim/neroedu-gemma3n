import React, { useState } from 'react';
import { apiService } from '../services/api';
import { FlashcardResponse, KeyTopicsResponse, ExamType } from '../types';

interface StudyMaterialProps {
  selectedModel: string;
  selectedExamType: ExamType;
  onBack: () => void;
}

export const StudyMaterial: React.FC<StudyMaterialProps> = ({ selectedModel, selectedExamType, onBack }) => {
  const [currentView, setCurrentView] = useState<'selection' | 'flashcards' | 'key-topics'>('selection');
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardResponse[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [keyTopics, setKeyTopics] = useState<KeyTopicsResponse | null>(null);
  const [isLoadingFlashcard, setIsLoadingFlashcard] = useState(false);
  const [isLoadingKeyTopics, setIsLoadingKeyTopics] = useState(false);

  const handleGenerateFlashcard = async () => {
    if (!topic.trim()) return;

    setIsLoadingFlashcard(true);
    try {
      const existingQuestions = flashcards.map(fc => fc.question);
      const flashcard = await apiService.generateFlashcard({
        tema: topic,
        flashcards_existentes: existingQuestions,
        model_name: selectedModel,
        exam_type: selectedExamType
      });

      setFlashcards(prev => [...prev, flashcard]);
      setCurrentFlashcardIndex(flashcards.length);
      setCurrentView('flashcards');
    } catch (error) {
      console.error('Error generating flashcard:', error);
    } finally {
      setIsLoadingFlashcard(false);
    }
  };

  const handleGenerateKeyTopics = async () => {
    if (!topic.trim()) return;

    setIsLoadingKeyTopics(true);
    try {
      const topics = await apiService.generateKeyTopics({
        tema: topic,
        model_name: selectedModel,
        exam_type: selectedExamType
      });

      setKeyTopics(topics);
      setCurrentView('key-topics');
    } catch (error) {
      console.error('Error generating key topics:', error);
    } finally {
      setIsLoadingKeyTopics(false);
    }
  };

  const nextFlashcard = () => {
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
    } else if (flashcards.length < 5) {
      // Generate new flashcard if we haven't reached the limit
      handleGenerateFlashcard();
    }
  };

  const previousFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
    }
  };

  const resetToSelection = () => {
    setCurrentView('selection');
    setFlashcards([]);
    setCurrentFlashcardIndex(0);
    setKeyTopics(null);
    setTopic('');
  };

  if (currentView === 'flashcards') {
    const currentFlashcard = flashcards[currentFlashcardIndex];
    return (
      <div className="flashcards-view">
        <button className="back-button" onClick={resetToSelection}>
          ← Back to Selection
        </button>

        <div className="flashcard-container">
          <div className="flashcard">
            <div className="card-front">
              <h3>Question {currentFlashcardIndex + 1}</h3>
              <p>{currentFlashcard.question}</p>
            </div>
            <div className="card-back">
              <h3>Answer</h3>
              <p>{currentFlashcard.answer}</p>
            </div>
          </div>
        </div>

        <div className="flashcard-navigation">
          <button
            onClick={previousFlashcard}
            disabled={currentFlashcardIndex === 0}
            className="nav-button"
          >
            Previous
          </button>

          <span className="flashcard-counter">
            {currentFlashcardIndex + 1} / {flashcards.length}
          </span>

          <button
            onClick={nextFlashcard}
            disabled={currentFlashcardIndex === flashcards.length - 1 && flashcards.length >= 5}
            className="nav-button"
          >
            {currentFlashcardIndex === flashcards.length - 1 && flashcards.length < 5 ? 'Next Question' : 'Next'}
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'key-topics') {
    return (
      <div className="key-topics-view">
        <button className="back-button" onClick={resetToSelection}>
          ← Back to Selection
        </button>

        <div className="topics-content">
          <h2>Key Topics: {topic}</h2>

          <div className="explanation-section">
            <h3>General Explanation</h3>
            <p>{keyTopics?.explanation}</p>
          </div>

          <div className="topics-list">
            <h3>Key Points</h3>
            <ul>
              {keyTopics?.key_topics.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="study-material-container">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>

      <div className="study-material-selection">
        <h2>Study Material Generator</h2>
        <p>Enter a topic to generate study materials for {selectedExamType.toUpperCase()} exam preparation.</p>

        <div className="input-section">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic (e.g., World War II, Photosynthesis, Calculus)"
            className="topic-input"
          />
        </div>

        <div className="action-buttons">
          <button
            onClick={handleGenerateFlashcard}
            disabled={!topic.trim() || isLoadingFlashcard}
            className="generate-button"
          >
            {isLoadingFlashcard ? (
              <div className="inline-loading">
                <div className="inline-loading-spinner"></div>
                Generating flashcard...
              </div>
            ) : (
              'Generate Flashcard'
            )}
          </button>

          <button
            onClick={handleGenerateKeyTopics}
            disabled={!topic.trim() || isLoadingKeyTopics}
            className="generate-button"
          >
            {isLoadingKeyTopics ? (
              <div className="inline-loading">
                <div className="inline-loading-spinner"></div>
                Generating key topics...
              </div>
            ) : (
              'Generate Key Topics'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
