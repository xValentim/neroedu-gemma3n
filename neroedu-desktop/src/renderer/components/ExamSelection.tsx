import React, { useState } from 'react';
import { ExamType } from '../types';

interface ExamSelectionProps {
  onExamSelected: (examType: ExamType) => void;
}

const examTypes: { type: ExamType; name: string; description: string; icon: string }[] = [
  {
    type: 'enem',
    name: 'ENEM',
    description: 'Exame Nacional do Ensino Médio - Brazil\'s main university entrance exam',
    icon: '🎓'
  },
  {
    type: 'icfes',
    name: 'ICFES',
    description: 'Instituto Colombiano para la Evaluación de la Educación - Colombian education assessment',
    icon: '📚'
  },
  {
    type: 'exani',
    name: 'EXANI',
    description: 'Examen Nacional de Ingreso - Mexican university entrance exam',
    icon: '🏛️'
  },
  {
    type: 'sat',
    name: 'SAT',
    description: 'Scholastic Assessment Test - US college admissions test',
    icon: '🇺🇸'
  },
  {
    type: 'cuet',
    name: 'CUET',
    description: 'Common University Entrance Test - Indian university entrance exam',
    icon: '🇮🇳'
  },
  {
    type: 'exames_nacionais',
    name: 'Exames Nacionais',
    description: 'National Exams - General standardized testing',
    icon: '🌍'
  }
];

const ExamSelection: React.FC<ExamSelectionProps> = ({ onExamSelected }) => {
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);

  const handleExamSelect = (examType: ExamType) => {
    setSelectedExam(examType);
  };

  const handleContinue = () => {
    if (selectedExam) {
      onExamSelected(selectedExam);
    }
  };

  return (
    <div className="exam-selection-container">
      <div className="exam-selection-content">
        <div className="exam-selection-header">
          <h1>Choose Your Exam Type</h1>
          <p>Select the exam you're preparing for to get personalized study materials and practice questions.</p>
        </div>

        <div className="exam-grid">
          {examTypes.map((exam) => (
            <div
              key={exam.type}
              className={`exam-card ${selectedExam === exam.type ? 'selected' : ''}`}
              onClick={() => handleExamSelect(exam.type)}
            >
              <div className="exam-icon">{exam.icon}</div>
              <div className="exam-info">
                <h3>{exam.name}</h3>
                <p>{exam.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="exam-selection-actions">
          <button
            className={`continue-button ${selectedExam ? 'active' : 'disabled'}`}
            onClick={handleContinue}
            disabled={!selectedExam}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamSelection; 