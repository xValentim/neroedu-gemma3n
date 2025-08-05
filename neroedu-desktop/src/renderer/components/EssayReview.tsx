import React, { useState } from 'react';
import { apiService } from '../services/api';
import { EssayResponse, CompetenciaResult } from '../types';

interface EssayReviewProps {
  modelName: string;
  onBack: () => void;
}

export const EssayReview: React.FC<EssayReviewProps> = ({ modelName, onBack }) => {
  const [currentView, setCurrentView] = useState<'input' | 'results'>('input');
  const [essay, setEssay] = useState('');
  const [results, setResults] = useState<CompetenciaResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState<number>(0);

  const competencias = [
    { id: 1, name: 'Competência 1', description: 'Demonstrar domínio da norma culta da língua escrita' },
    { id: 2, name: 'Competência 2', description: 'Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento' },
    { id: 3, name: 'Competência 3', description: 'Selecionar, relacionar, organizar e interpretar informações' },
    { id: 4, name: 'Competência 4', description: 'Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação' },
    { id: 5, name: 'Competência 5', description: 'Elaborar proposta de solução para o problema abordado' }
  ];

  const handleEvaluateEssay = async () => {
    if (!essay.trim()) {
      setError('Please enter your essay');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const evaluationResults: CompetenciaResult[] = [];
      let totalPoints = 0;

      for (const competencia of competencias) {
        const response = await apiService.evaluateEssay({
          essay: essay.trim(),
          model_name: modelName,
          competencia: competencia.id
        });

        const result: CompetenciaResult = {
          competencia: competencia.id,
          nota: response.nota,
          feedback: response.feedback,
          justificativa: response.justificativa
        };

        evaluationResults.push(result);
        totalPoints += response.nota;
      }

      setResults(evaluationResults);
      setTotalScore(Math.round(totalPoints / 5)); // Average score
      setCurrentView('results');
    } catch (err) {
      setError('Error evaluating essay. Please try again.');
      console.error('Error evaluating essay:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetEvaluation = () => {
    setEssay('');
    setResults([]);
    setTotalScore(0);
    setCurrentView('input');
  };

  const renderInput = () => (
    <div className="essay-review-input">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>

      <div className="input-content">
        <h1>Essay Review</h1>
        <p>Get detailed feedback on your essay based on ENEM competencies</p>

        <div className="essay-input-section">
          <label htmlFor="essay">Your Essay:</label>
          <textarea
            id="essay"
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Paste your essay here..."
            className="essay-textarea"
            disabled={isLoading}
            rows={15}
          />
        </div>

        <div className="competencias-info">
          <h3>ENEM Competencies</h3>
          <div className="competencias-grid">
            {competencias.map((comp) => (
              <div key={comp.id} className="competencia-card">
                <h4>{comp.name}</h4>
                <p>{comp.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="evaluate-button"
            onClick={handleEvaluateEssay}
            disabled={isLoading || !essay.trim()}
          >
            {isLoading ? 'Evaluating...' : 'Evaluate Essay'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="essay-review-results">
      <button className="back-button" onClick={resetEvaluation}>
        ← New Essay
      </button>

      <div className="results-content">
        <h2>Essay Evaluation Results</h2>
        <p>Detailed feedback based on ENEM competencies</p>

        <div className="total-score-card">
          <h3>Total Score</h3>
          <div className="score-display">
            {totalScore}/200
          </div>
          <div className="score-percentage">
            {Math.round((totalScore / 200) * 100)}%
          </div>
        </div>

        <div className="competencias-results">
          {results.map((result) => {
            const competencia = competencias.find(c => c.id === result.competencia);
            return (
              <div key={result.competencia} className="competencia-result">
                <div className="competencia-header">
                  <h4>{competencia?.name}</h4>
                  <div className="competencia-score">
                    {result.nota}/40
                  </div>
                </div>

                <div className="feedback-section">
                  <h5>Feedback:</h5>
                  <p>{result.feedback}</p>
                </div>

                <div className="justification-section">
                  <h5>Justification:</h5>
                  <p>{result.justificativa}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="primary-button"
          onClick={resetEvaluation}
        >
          Evaluate Another Essay
        </button>
      </div>
    </div>
  );

  return (
    <div className="essay-review-container">
      {currentView === 'input' && renderInput()}
      {currentView === 'results' && renderResults()}
    </div>
  );
};
