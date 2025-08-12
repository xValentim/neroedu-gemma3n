import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { EssayResponse, CompetenciaResult, GeneralEssayResponse, Essay } from '../types';
import { EssayAnalysisRenderer } from './EssayAnalysisRenderer';
import ollamaImage from '../../assets/ollama.png';

interface EssayReviewProps {
  examType: string;
  modelName: string;
  onBack: () => void;
}

export const EssayReview: React.FC<EssayReviewProps> = ({ examType, modelName, onBack }) => {
  const [currentView, setCurrentView] = useState<'list' | 'input' | 'results'>('list');
  const [essay, setEssay] = useState('');
  const [essays, setEssays] = useState<Essay[]>([]);
  const [results, setResults] = useState<CompetenciaResult[]>([]);
  const [generalResult, setGeneralResult] = useState<GeneralEssayResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEssays, setIsLoadingEssays] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState<number>(0);

  const competencies = [
    { id: 1, name: 'Competency 1', description: 'Demonstrate command of the standard written form of the language' },
    { id: 2, name: 'Competency 2', description: 'Understand the writing prompt and apply concepts from various fields of knowledge' },
    { id: 3, name: 'Competency 3', description: 'Select, relate, organize, and interpret information' },
    { id: 4, name: 'Competency 4', description: 'Demonstrate knowledge of linguistic mechanisms necessary for constructing an argument' },
    { id: 5, name: 'Competency 5', description: 'Propose a solution to the issue addressed in the prompt' }
  ];

  const examTypes = [
    { value: 'enem', label: 'ENEM', description: 'Brazilian National High School Exam' },
    { value: 'sat', label: 'SAT', description: 'Scholastic Assessment Test' },
    { value: 'exames_nacionais', label: 'Exames Nacionais', description: 'Portuguese National Exams' },
    { value: 'gaokao', label: 'Gaokao', description: 'Chinese National College Entrance Exam' },
    { value: 'ielts', label: 'IELTS', description: 'International English Language Testing System' }
  ];

  useEffect(() => {
    loadEssays();
  }, []);

  const loadEssays = async () => {
    setIsLoadingEssays(true);
    try {
      const essaysData = await apiService.getEssays();
      setEssays(essaysData);
    } catch (err) {
      console.error('Error loading essays:', err);
      setError('Error loading essays. Please try again.');
    } finally {
      setIsLoadingEssays(false);
    }
  };

  const handleEvaluateEssay = async () => {
    if (!essay.trim()) {
      setError('Please enter your essay');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (examType === 'enem') {
        // Use ENEM competencies evaluation
        const evaluationResults: CompetenciaResult[] = [];
        let totalPoints = 0;

        for (const competencia of competencies) {
          const response = await apiService.evaluateEssay({
            essay: essay.trim(),
            model_name: modelName,
            competencia: competencia.id
          });

          const result: CompetenciaResult = {
            competencia: competencia.id,
            evaluation: {
              nota: response.nota,
              feedback: response.feedback,
              justificativa: response.justificativa
            },
            isLoading: false,
            error: null
          };

          evaluationResults.push(result);
          totalPoints += response.nota;
        }

        setResults(evaluationResults);
        setTotalScore(Math.round(totalPoints / 5)); // Average score
        setGeneralResult(null);

        // Auto-save essay with feedback for ENEM
        const calculatedGrade = calculateGradeFromEnem(evaluationResults);
        const extractedFeedback = extractFeedback(evaluationResults, null);
        await autoSaveEssayWithFeedback(calculatedGrade, extractedFeedback);
      } else {
        // Use general essay evaluation for other exam types
        const response = await apiService.evaluateGeneralEssay({
          essay: essay.trim(),
          model_name: modelName,
          exam_type: examType
        });

        setGeneralResult(response);
        setResults([]);
        setTotalScore(0);

        // Auto-save essay with feedback for other exam types
        // For non-ENEM exams, we'll extract a score from the feedback if possible
        const extractedFeedback = extractFeedback([], response);
        const calculatedGrade = extractGradeFromGeneralFeedback(extractedFeedback);
        await autoSaveEssayWithFeedback(calculatedGrade, extractedFeedback);
      }

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
    setGeneralResult(null);
    setTotalScore(0);
    setCurrentView('list');
  };

  // Helper function to calculate grade from ENEM competency results
  const calculateGradeFromEnem = (results: CompetenciaResult[]): number => {
    if (results.length === 0) return 0;
    const totalPoints = results.reduce((sum, result) => sum + result.evaluation.nota, 0);
    return Math.round(totalPoints / results.length); // Average score
  };

  // Helper function to extract feedback from evaluation results
  const extractFeedback = (results: CompetenciaResult[], generalResult: GeneralEssayResponse | null): string => {
    if (examType === 'enem' && results.length > 0) {
      // For ENEM, combine all competency feedback
      return results.map((result, index) =>
        `Competência ${result.competencia}: ${result.evaluation.feedback}\n\nJustificativa: ${result.evaluation.justificativa}`
      ).join('\n\n---\n\n');
    } else if (generalResult) {
      // For other exam types, use general feedback
      return generalResult.response;
    }
    return '';
  };

    // Helper function to extract grade from general feedback
  const extractGradeFromGeneralFeedback = (feedback: string): number => {
    if (!feedback || typeof feedback !== 'string') {
      console.warn('Invalid feedback provided to extractGradeFromGeneralFeedback:', feedback);
      return 75; // Default grade
    }

    console.log('🔢 Extracting grade from feedback:', feedback.substring(0, 200) + '...');

    // Method 1: Try to extract from JSON structure first
    try {
      const jsonMatch = feedback.match(/```json\s*\n(.*?)\n```/s) || feedback.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonStr);

        // Calculate average from reading, analysis, writing scores
        if (parsed.reading !== undefined || parsed.analysis !== undefined || parsed.writing !== undefined) {
          const scores = [parsed.reading, parsed.analysis, parsed.writing].filter(s => s !== undefined);
          if (scores.length > 0) {
            const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            // Convert from 4-point scale to 100-point scale
            const grade = Math.round((averageScore / 4) * 100);
            console.log('✅ Extracted grade from JSON:', grade, 'from scores:', scores);
            return grade;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse JSON for grade extraction:', e);
    }

    // Method 2: Try to find numeric scores in the text
    const scorePatterns = [
      /score[:\s]+(\d+)/i,
      /grade[:\s]+(\d+)/i,
      /rating[:\s]+(\d+)/i,
      /(\d+)\/100/i,
      /(\d+)%/i,
      /(\d+)\s*out\s*of\s*100/i
    ];

    for (const pattern of scorePatterns) {
      const match = feedback.match(pattern);
      if (match) {
        const score = parseInt(match[1]);
        if (score >= 0 && score <= 100) {
          console.log('✅ Extracted grade from text pattern:', score);
          return score;
        }
      }
    }

    // Method 3: Analyze sentiment/quality keywords
    const positiveWords = ['excellent', 'good', 'strong', 'clear', 'well', 'effective'];
    const negativeWords = ['poor', 'weak', 'unclear', 'needs improvement', 'lacking'];

    const lowerFeedback = feedback.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerFeedback.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerFeedback.includes(word)).length;

    let sentimentGrade;
    if (positiveCount > negativeCount) {
      sentimentGrade = 85; // Good essay
    } else if (negativeCount > positiveCount) {
      sentimentGrade = 65; // Needs improvement
    } else {
      sentimentGrade = 75; // Average essay
    }

    console.log('✅ Calculated grade from sentiment analysis:', sentimentGrade, '(positive:', positiveCount, 'negative:', negativeCount, ')');
    return sentimentGrade;
  };

  // Function to automatically save essay after evaluation
  const autoSaveEssayWithFeedback = async (grade: number, feedback: string) => {
    try {
      await apiService.createEssay({
        essay: essay.trim(),
        grade,
        exam_type: examType,
        feedback
      });
      await loadEssays(); // Reload the list to show the new essay
    } catch (err) {
      console.error('Error auto-saving essay:', err);
      // Don't show error to user for auto-save failure, as it's not critical
    }
  };

  const handleNewEssay = () => {
    setCurrentView('input');
  };

  const handleDeleteEssay = async (essayId: number) => {
    try {
      await apiService.deleteEssay(essayId);
      await loadEssays(); // Reload the list
    } catch (err) {
      console.error('Error deleting essay:', err);
      setError('Error deleting essay. Please try again.');
    }
  };

  const handleSaveEssay = async () => {
    if (!essay.trim()) {
      setError('Please enter your essay');
      return;
    }

    try {
      await apiService.createEssay({
        essay: essay.trim(),
        grade: 0, // No grade for manually saved essays
        exam_type: examType,
        feedback: '' // No feedback for manually saved essays
      });
      await loadEssays(); // Reload the list
      setCurrentView('list');
    } catch (err) {
      console.error('Error saving essay:', err);
      setError('Error saving essay. Please try again.');
    }
  };

  const renderList = () => (
    <div className="essay-review-list">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>

      <div className="list-content">
        <div className="essay-header-content">
          <div className="ollama-branding-header">
            <img src={ollamaImage} alt="Ollama" className="ollama-logo-header" />
          </div>
          <div>
            <h1>Essay Review</h1>
            <p>Manage and evaluate your essays</p>
          </div>
        </div>

        {isLoadingEssays ? (
          <div className="loading-essays">
            <div className="loading-icon">⏳</div>
            <div className="loading-text">Loading essays...</div>
          </div>
        ) : essays.length === 0 ? (
          <div className="no-essays">
            <div className="no-essays-icon">📝</div>
            <h3>No essays yet</h3>
            <p>Start by submitting your first essay for evaluation</p>
            <button
              className="primary-button"
              onClick={handleNewEssay}
            >
              Submit Your First Essay
            </button>
          </div>
        ) : (
          <div className="essays-grid">
            {essays.map((essayItem) => (
              <div key={essayItem.essay_id} className="essay-card">
                <div className="essay-card-header">
                  <h3>Essay #{essayItem.essay_id}</h3>
                  <div className="essay-card-actions">
                    {essayItem.feedback && (
                      <button
                        className="feedback-button small"
                        onClick={() => {
                          alert(essayItem.feedback);
                        }}
                        title="View Feedback"
                      >
                        📝
                      </button>
                    )}
                    <button
                      className="evaluate-button small"
                      onClick={() => {
                        setEssay(essayItem.essay);
                        handleEvaluateEssay();
                      }}
                    >
                      Evaluate
                    </button>
                    <button
                      className="delete-button small"
                      onClick={() => handleDeleteEssay(essayItem.essay_id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="essay-preview">
                  <p>{essayItem.essay.substring(0, 200)}...</p>
                </div>
                <div className="essay-meta">
                  <span className="exam-type">{examTypes.find(t => t.value === essayItem.exam_type)?.label}</span>
                  {essayItem.grade > 0 && (
                    <span className="essay-grade">Grade: {essayItem.grade}</span>
                  )}
                  {essayItem.feedback && (
                    <span className="has-feedback">📝 Has Feedback</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );

  const renderInput = () => (
    <div className="essay-review-input">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>

              <div className="input-content">
          <div className="essay-header-content">
            <div className="ollama-branding-header">
              <img src={ollamaImage} alt="Ollama" className="ollama-logo-header" />
            </div>
            <div>
              <h1>Essay Review</h1>
              <p>Get detailed feedback on your essay based on {examTypes.find(t => t.value === examType)?.label} standards</p>
            </div>
          </div>

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

        {examType === 'enem' && (
          <div className="competencias-info">
            <h3>ENEM Competencies</h3>
            <div className="competencias-grid">
              {competencies.map((comp) => (
                <div key={comp.id} className="competencia-card">
                  <h4>{comp.name}</h4>
                  <p>{comp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

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
        <p>Detailed feedback based on {examTypes.find(t => t.value === examType)?.label} standards</p>

        {examType === 'enem' ? (
          <>
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
                const competencia = competencies.find(c => c.id === result.competencia);
                return (
                  <div key={result.competencia} className="competencia-result">
                    <div className="competencia-header">
                      <h4>{competencia?.name}</h4>
                      <div className="competencia-score">
                        {result.evaluation.nota}/200
                      </div>
                    </div>

                    <div className="feedback-section">
                      <h5>Feedback:</h5>
                      <p>{result.evaluation.feedback}</p>
                    </div>

                    <div className="justification-section">
                      <h5>Justification:</h5>
                      <p>{result.evaluation.justificativa}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="general-essay-result">
            <div className="essay-feedback">
              <h3>Essay Analysis</h3>
              <EssayAnalysisRenderer response={generalResult?.response || ''} />
            </div>
          </div>
        )}

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
      {currentView === 'list' && renderList()}
      {currentView === 'input' && renderInput()}
      {currentView === 'results' && renderResults()}
    </div>
  );
};
