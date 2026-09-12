export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  photoURL?: string | null;
  firebaseUid?: string | null;
  createdAt?: string;
}

export interface Exam {
  id: string;
  name: string;
  slug: string;
  category: string;
  difficulty: string;
  description: string;
  subjects: string[];
  testCount: number;
  questionCount: number;
}

export interface SubjectDetail {
  id: string;
  name: string;
  questionCount: number;
  topics: string[];
}

export interface ExamDetail {
  id: string;
  name: string;
  slug: string;
  category: string;
  difficulty: string;
  description: string;
  questionCount: number;
  subjects: SubjectDetail[];
  testsGrouped: {
    'Full Length': TestSummary[];
    'Sectional': TestSummary[];
    'Practice': TestSummary[];
    'Previous Year': TestSummary[];
  };
}

export interface TestSummary {
  id: string;
  title: string;
  description: string;
  examId?: string;
  examName?: string;
  examSlug?: string;
  subjectId?: string | null;
  subjectName: string;
  testType: string;
  duration: number; // in minutes
  totalMarks: number;
  negativeMarks: number;
  difficulty: string;
  isPremium: boolean;
  questionCount: number;
  attemptCount: number;
}

export interface TestInstruction {
  id: string;
  title: string;
  description: string;
  examId: string;
  examName: string;
  subjectId?: string | null;
  subjectName: string;
  testType: string;
  duration: number;
  totalMarks: number;
  negativeMarks: number;
  difficulty: string;
  isPremium: boolean;
  questionCount: number;
  language: string;
  activeAttemptId: string | null;
  instructions: string[];
}

export interface QuestionOption {
  id?: string;
  optionKey: string;
  optionText: string;
  isCorrect?: boolean;
}

export interface ActiveQuestion {
  questionId: string;
  order: number;
  questionText: string;
  questionType: string;
  difficulty: string;
  marks: number;
  negativeMarks: number;
  subjectName: string;
  topicName: string;
  isBookmarked: boolean;
  options: QuestionOption[];
  selectedOption: string | null;
  isMarked: boolean;
  timeSpent: number;
}

export interface LiveAttemptState {
  attempt: {
    id: string;
    testId: string;
    testTitle: string;
    examName: string;
    subjectName: string;
    durationMinutes: number;
    totalDurationSeconds: number;
    remainingSeconds: number;
    elapsedSeconds: number;
    status: string;
    startedAt: string;
    negativeMarks: number;
    totalMarks: number;
    isPracticeMode: boolean;
  };
  questions: ActiveQuestion[];
}

export interface SubjectAnalysisItem {
  subjectName: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  unanswered: number;
  score: number;
  timeSpent: number;
  accuracy: number;
}

export interface QuestionReviewItem {
  questionId: string;
  index: number;
  questionText: string;
  subjectName: string;
  topicName: string;
  difficulty: string;
  marks: number;
  negativeMarks: number;
  selectedOption: string | null;
  correctOptionKey: string;
  correctOptionText: string;
  isCorrect: boolean | null;
  status: 'CORRECT' | 'WRONG' | 'UNANSWERED';
  explanation: string;
  timeSpent: number;
  isMarked: boolean;
  isBookmarked: boolean;
  options: QuestionOption[];
}

export interface ResultData {
  result: {
    attemptId: string;
    testId: string;
    testTitle: string;
    examName: string;
    examSlug: string;
    subjectName: string;
    durationMinutes: number;
    totalMarks: number;
    negativeMarks: number;
    startedAt: string;
    submittedAt: string;
    timeTaken: number;
    score: number;
    percentage: number;
    accuracy: number;
    correctCount: number;
    wrongCount: number;
    unansweredCount: number;
    totalQuestions: number;
    rank: number;
    percentile: number;
    totalTakers: number;
    highestScore: number;
    avgScore: number;
  };
  subjectAnalysis: SubjectAnalysisItem[];
  questions: QuestionReviewItem[];
}

export interface AttemptHistoryItem {
  id: string;
  testId: string;
  testTitle: string;
  examName: string;
  subjectName: string;
  testType: string;
  duration: number;
  totalMarks: number;
  questionCount: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  startedAt: string;
  submittedAt: string | null;
  timeTaken: number;
  score: number;
  percentage: number;
  accuracy: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
}
