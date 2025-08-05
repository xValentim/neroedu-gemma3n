import React, { useState } from 'react';
import { ModelInfo, CompetenciaResult } from '../types';
import { apiService } from '../services/api';

interface EssayReviewProps {
  availableModels: ModelInfo[];
  onBack: () => void;
}

const competenciasInfo = [
  {
    id: 1,
    title: 'Demonstrar domínio da modalidade escrita formal da Língua Portuguesa',
    description: 'Avalia gramática, ortografia, acentuação, pontuação e concordância.'
  },
  {
    id: 2,
    title: 'Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento',
    description: 'Verifica se o tema foi desenvolvido de forma adequada e pertinente.'
  },
  {
    id: 3,
    title: 'Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos',
    description: 'Analisa a capacidade de argumentação e organização das ideias.'
  },
  {
    id: 4,
    title: 'Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação',
    description: 'Avalia o uso de conectivos e a coesão textual.'
  },
  {
    id: 5,
    title: 'Elaborar proposta de intervenção para o problema abordado',
    description: 'Verifica se a solução proposta é viável, específica e respeita os direitos humanos.'
  }
];

export const EssayReview: React.FC<EssayReviewProps> = ({ availableModels, onBack }) => {
  const [currentView, setCurrentView] = useState<'input' | 'results'>('input');
  const [essay, setEssay] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [competencias, setCompetencias] = useState<CompetenciaResult[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeCompetencias = (): CompetenciaResult[] => {
    return competenciasInfo.map(comp => ({
      competencia: comp.id,
      evaluation: { nota: 0, feedback: '', justificativa: '' },
      isLoading: false,
      error: null
    }));
  };

  const handleStartEvaluation = async () => {
    if (!essay.trim() || !selectedModel) {
      setError('Please enter an essay and select a model');
      return;
    }

    setIsEvaluating(true);
    setError(null);

    const initialCompetencias = initializeCompetencias();
    setCompetencias(initialCompetencias);
    setCurrentView('results');

    // Evaluate each competencia sequentially
    for (let i = 1; i <= 5; i++) {
      try {
        // Update loading state for current competencia
        setCompetencias(prev => prev.map(comp =>
          comp.competencia === i
            ? { ...comp, isLoading: true, error: null }
            : comp
        ));

        const evaluation = await apiService.evaluateEssay({
          essay,
          model_name: selectedModel,
          competencia: i
        });

        // Update with results
        setCompetencias(prev => prev.map(comp =>
          comp.competencia === i
            ? { ...comp, evaluation, isLoading: false }
            : comp
        ));

      } catch (error) {
        console.error(`Error evaluating competencia ${i}:`, error);

        // Update with error
        setCompetencias(prev => prev.map(comp =>
          comp.competencia === i
            ? { ...comp, isLoading: false, error: 'Failed to evaluate this competencia' }
            : comp
        ));
      }
    }

    setIsEvaluating(false);
  };

  const calculateTotalScore = () => {
    return competencias.reduce((total, comp) => {
      if (!comp.isLoading && !comp.error) {
        return total + comp.evaluation.nota;
      }
      return total;
    }, 0);
  };

  const getScoreColor = (nota: number) => {
    if (nota >= 160) return '#4ecdc4'; // Excellent
    if (nota >= 120) return '#45b7d1'; // Good
    if (nota >= 80) return '#f39c12';  // Average
    if (nota >= 40) return '#e67e22';  // Below average
    return '#e74c3c'; // Poor
  };

  const renderInput = () => (
    <div className="study-material-container">
      <div className="header-section">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2>Essay Review & Feedback</h2>
        <p>Get AI-powered evaluation based on ENEM criteria</p>
      </div>

      <div className="essay-input-section">
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
          <label htmlFor="essay">Your Essay</label>
          <textarea
            id="essay"
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Paste your essay here for AI evaluation...

Example:
Tema: Os desafios da valorização de comunidades tradicionais no Brasil
Título: A invisibilidade das comunidades tradicionais na sociedade brasileira

[Your essay content...]"
            className="essay-textarea"
            rows={15}
          />
        </div>

        <div className="competencias-info">
          <h3>ENEM Evaluation Criteria</h3>
          <div className="competencias-list">
            {competenciasInfo.map((comp) => (
              <div key={comp.id} className="competencia-info-card">
                <div className="competencia-number">C{comp.id}</div>
                <div className="competencia-content">
                  <h4>{comp.title}</h4>
                  <p>{comp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          className="generate-button primary-button"
          onClick={handleStartEvaluation}
          disabled={isEvaluating || !essay.trim() || !selectedModel}
        >
          {isEvaluating ? 'Evaluating Essay...' : 'Start Evaluation'}
        </button>
      </div>
    </div>
  );

  const renderResults = () => {
    const totalScore = calculateTotalScore();
    const completedEvaluations = competencias.filter(c => !c.isLoading && !c.error).length;

    return (
      <div className="study-material-container">
        <div className="header-section">
          <button className="back-button" onClick={() => setCurrentView('input')}>
            ← New Essay
          </button>
          <h2>Essay Evaluation Results</h2>
          <p>ENEM-style feedback across 5 competências</p>
        </div>

        <div className="essay-results-section">
          <div className="score-summary">
            <div className="total-score-card">
              <h3>Total Score</h3>
              <div className="total-score-display" style={{ color: getScoreColor(totalScore) }}>
                {totalScore}<span>/1000</span>
              </div>
              <div className="evaluation-progress">
                {completedEvaluations}/5 competências evaluated
              </div>
            </div>
          </div>

          <div className="competencias-results">
            {competencias.map((comp) => {
              const competenciaInfo = competenciasInfo.find(c => c.id === comp.competencia);

              return (
                <div key={comp.competencia} className="competencia-result-card">
                  <div className="competencia-header">
                    <div className="competencia-badge">
                      Competência {comp.competencia}
                    </div>
                    {comp.isLoading ? (
                      <div className="competencia-score loading">
                        <div className="loading-spinner"></div>
                        Evaluating...
                      </div>
                    ) : comp.error ? (
                      <div className="competencia-score error">
                        Error
                      </div>
                    ) : (
                      <div
                        className="competencia-score"
                        style={{ color: getScoreColor(comp.evaluation.nota) }}
                      >
                        {comp.evaluation.nota}/200
                      </div>
                    )}
                  </div>

                  <div className="competencia-title">
                    {competenciaInfo?.title}
                  </div>

                  {!comp.isLoading && !comp.error && (
                    <div className="competencia-evaluation">
                      <div className="feedback-section">
                        <h4>Feedback</h4>
                        <p>{comp.evaluation.feedback}</p>
                      </div>

                      <div className="justification-section">
                        <h4>Justification</h4>
                        <p>{comp.evaluation.justificativa}</p>
                      </div>
                    </div>
                  )}

                  {comp.error && (
                    <div className="error-section">
                      <p>{comp.error}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            className="primary-button"
            onClick={() => setCurrentView('input')}
          >
            Evaluate Another Essay
          </button>
        </div>
      </div>
    );
  };

  return currentView === 'input' ? renderInput() : renderResults();
};
