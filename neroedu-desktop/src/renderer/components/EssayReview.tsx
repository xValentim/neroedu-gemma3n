import React, { useState } from 'react';
import { apiService } from '../services/api';
import { EssayResponse } from '../types';

interface EssayReviewProps {
  selectedModel: string;
  onBack: () => void;
}

export const EssayReview: React.FC<EssayReviewProps> = ({ selectedModel, onBack }) => {
  const [currentView, setCurrentView] = useState<'input' | 'results'>('input');
  const [essay, setEssay] = useState('');
  const [results, setResults] = useState<EssayResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const competencias = [
    { id: 1, name: 'Competência 1', description: 'Demonstrar domínio da norma culta da língua escrita' },
    { id: 2, name: 'Competência 2', description: 'Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento' },
    { id: 3, name: 'Competência 3', description: 'Selecionar, relacionar, organizar e interpretar informações' },
    { id: 4, name: 'Competência 4', description: 'Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação' },
    { id: 5, name: 'Competência 5', description: 'Elaborar proposta de solução para o problema abordado' }
  ];

  const handleEvaluateEssay = async () => {
    if (!essay.trim()) return;

    setIsLoading(true);
    const evaluationResults: EssayResponse[] = [];
    let total = 0;

    try {
      for (const competencia of competencias) {
        const result = await apiService.evaluateEssay({
          essay: essay,
          model_name: selectedModel,
          competencia: competencia.id
        });
        
        evaluationResults.push(result);
        total += result.result.nota;
      }

      setResults(evaluationResults);
      setTotalScore(total);
      setCurrentView('results');
    } catch (error) {
      console.error('Error evaluating essay:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToInput = () => {
    setCurrentView('input');
    setEssay('');
    setResults([]);
    setTotalScore(0);
  };

  if (currentView === 'results') {
    return (
      <div className="essay-review-results">
        <button className="back-button" onClick={resetToInput}>
          ← Back to Input
        </button>
        
        <div className="results-header">
          <h2>Essay Evaluation Results</h2>
          <div className="total-score">
            <h3>Total Score: {totalScore}/1000</h3>
            <p>Average: {Math.round(totalScore / 5)}/200 per competency</p>
          </div>
        </div>

        <div className="competencies-results">
          {results.map((result, index) => (
            <div key={result.competencia} className="competency-result">
              <div className="competency-header">
                <h3>{competencias[index].name}</h3>
                <div className="competency-score">
                  <span className="score">{result.result.nota}/200</span>
                </div>
              </div>
              
              <div className="competency-description">
                <p>{competencias[index].description}</p>
              </div>
              
              <div className="feedback-section">
                <h4>Feedback</h4>
                <p>{result.result.feedback}</p>
              </div>
              
              <div className="justification-section">
                <h4>Justification</h4>
                <p>{result.result.justificativa}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="essay-review-container">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>
      
      <div className="essay-review-input">
        <h2>Essay Review & Feedback</h2>
        <p>Get detailed feedback on your essay based on ENEM competencies.</p>
        
        <div className="competencies-info">
          <h3>ENEM Competencies</h3>
          <div className="competencies-grid">
            {competencias.map((comp) => (
              <div key={comp.id} className="competency-card">
                <h4>{comp.name}</h4>
                <p>{comp.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="essay-input-section">
          <label htmlFor="essay">Your Essay</label>
          <textarea
            id="essay"
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Paste your essay here..."
            className="essay-textarea"
            rows={15}
          />
        </div>
        
        <div className="action-buttons">
          <button
            onClick={handleEvaluateEssay}
            disabled={!essay.trim() || isLoading}
            className="evaluate-button"
          >
            {isLoading ? (
              <div className="inline-loading">
                <div className="inline-loading-spinner"></div>
                Evaluating essay...
              </div>
            ) : (
              'Evaluate Essay'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
