import React, { useState } from 'react';

interface ExamSelectionProps {
  onExamSelected: (examType: string) => void;
}

const examTypes = [
  {
    id: 'enem',
    name: 'ENEM',
    description: 'Exame Nacional do Ensino Médio (Brazil)',
    icon: '📚'
  },
  {
    id: 'icfes',
    name: 'ICFES',
    description: 'Instituto Colombiano para la Evaluación de la Educación',
    icon: '🎓'
  },
  {
    id: 'exani',
    name: 'EXANI',
    description: 'Examen Nacional de Ingreso (Mexico)',
    icon: '📝'
  },
  {
    id: 'sat',
    name: 'SAT',
    description: 'Scholastic Assessment Test (United States)',
    icon: '🇺🇸'
  },
  {
    id: 'cuet',
    name: 'CUET',
    description: 'Common University Entrance Test (India)',
    icon: '🎯'
  },
  {
    id: 'exames_nacionais',
    name: 'Exames Nacionais',
    description: 'National Exams (Portugal)',
    icon: '🇵🇹'
  },
  {
    id: 'gaokao',
    name: 'GAOKAO',
    description: 'National College Entrance Examination (China)',
    icon: '🇨🇳'
  },
  {
    id: 'ielts',
    name: 'IELTS',
    description: 'International English Language Testing System',
    icon: '🇬🇧'
  },
];

const ExamSelection: React.FC<ExamSelectionProps> = ({ onExamSelected }) => {
  const [selectedExam, setSelectedExam] = useState<string>('');

  const handleExamSelect = (examId: string) => {
    setSelectedExam(examId);
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
          <p>Select the standardized exam you're preparing for to get personalized content</p>
        </div>

        <div className="exam-grid">
          {examTypes.map((exam) => (
            <div
              key={exam.id}
              className={`exam-card ${selectedExam === exam.id ? 'selected' : ''}`}
              onClick={() => handleExamSelect(exam.id)}
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
