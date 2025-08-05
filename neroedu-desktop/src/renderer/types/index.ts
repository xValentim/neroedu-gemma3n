// API Response Types
export interface OllamaStatusResponse {
  status: string;
  version?: string;
  error?: string;
}

export interface ModelInfo {
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface ListModelsResponse {
  models: ModelInfo[];
}

export interface CheckModelResponse {
  model: string;
  available: boolean;
}

export interface DeleteModelResponse {
  message: string;
  success: boolean;
}

// App State Types
export interface AppState {
  currentStep: 'onboarding' | 'model-setup' | 'ready';
  onboardingStep: number;
  ollamaStatus: 'checking' | 'running' | 'not-running' | 'error';
  selectedModel: string | null;
  isDownloading: boolean;
  downloadProgress: string;
  availableModels: ModelInfo[];
}

// Study Material Types
export type ExamType = 'enem' | 'icfes' | 'exani' | 'sat' | 'cuet' | 'exames_nacionais';

export interface FlashcardRequest {
  tema: string;
  flashcards_existentes?: string[];
  model_name: string;
  exam_type: ExamType;
}

export interface FlashcardResponse {
  question: string;
  answer: string;
}

export interface KeyTopicsRequest {
  tema: string;
  model_name: string;
  exam_type: ExamType;
}

export interface KeyTopicsResponse {
  explanation: string;
  key_topics: string[];
}

export interface StudyMaterialState {
  currentView: 'selection' | 'flashcards' | 'key-topics';
  flashcards: FlashcardResponse[];
  currentFlashcardIndex: number;
  keyTopics: KeyTopicsResponse | null;
  isLoadingFlashcard: boolean;
  isLoadingKeyTopics: boolean;
  selectedExamType: ExamType | null;
}

// Practice Test Types
export interface SimuladoRequest {
  tema: string;
  model_name: string;
  lite_rag?: boolean;
  exam_type: ExamType;
}

export interface QuestionResponse {
  question: string;
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
  correct_answer: string;
  explanation: string;
}

export interface SimuladoResponse {
  response: string;
  temperature: number;
  seed: number;
}

export interface PracticeTestState {
  currentView: 'selection' | 'questions' | 'results';
  questions: QuestionResponse[];
  currentQuestionIndex: number;
  selectedAnswers: string[];
  isLoading: boolean;
  score: number;
  selectedExamType: ExamType | null;
}

// Essay Review Types
export interface EssayRequest {
  essay: string;
  model_name: string;
  competencia: number;
}

export interface CompetenciaResult {
  nota: number;
  feedback: string;
  justificativa: string;
}

export interface EssayResponse {
  competencia: number;
  result: CompetenciaResult;
}

export interface EssayReviewState {
  currentView: 'input' | 'results';
  essay: string;
  results: EssayResponse[];
  isLoading: boolean;
  totalScore: number;
}

// Onboarding Page Data
export interface OnboardingPage {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}
