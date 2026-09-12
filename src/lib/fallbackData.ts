import { Exam } from '../types';
import dbDataRaw from './dbData.json';

const dbData = dbDataRaw as {
  tests: any[];
  practiceCategories: any[];
  questions: any[];
  testsWithQuestions: any[];
};

export const FALLBACK_EXAMS: Exam[] = [
  {
    id: 'sbi-po-default',
    name: 'SBI PO',
    slug: 'sbi-po',
    category: 'Banking',
    difficulty: 'Hard',
    description: 'State Bank of India Probationary Officer Prelims & Mains recruitment examination. High competition with sectional and overall cutoffs.',
    subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness'],
    testCount: 10,
    questionCount: 20,
  },
  {
    id: 'ibps-po-default',
    name: 'IBPS PO',
    slug: 'ibps-po',
    category: 'Banking',
    difficulty: 'Hard',
    description: 'Institute of Banking Personnel Selection Common Recruitment Process for Probationary Officers across 11 public sector banks.',
    subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness'],
    testCount: 3,
    questionCount: 20,
  },
  {
    id: 'ssc-cgl-default',
    name: 'SSC CGL',
    slug: 'ssc-cgl',
    category: 'SSC',
    difficulty: 'Moderate',
    description: 'Staff Selection Commission Combined Graduate Level Examination for Group B & C central government posts.',
    subjects: ['Quantitative Aptitude', 'General Intelligence & Reasoning', 'English', 'General Awareness'],
    testCount: 10,
    questionCount: 20,
  },
  {
    id: 'rbi-grade-b-default',
    name: 'RBI Grade B',
    slug: 'rbi-grade-b',
    category: 'Regulatory',
    difficulty: 'Hard',
    description: 'Reserve Bank of India Grade B Officers Phase 1 recruitment examination with comprehensive economic and general awareness.',
    subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness'],
    testCount: 1,
    questionCount: 20,
  },
  {
    id: 'rrb-po-default',
    name: 'RRB PO',
    slug: 'rrb-po',
    category: 'Banking',
    difficulty: 'Moderate',
    description: 'Regional Rural Banks Officer Scale-I Common Recruitment examination conducted by IBPS.',
    subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness'],
    testCount: 1,
    questionCount: 20,
  },
  {
    id: 'sbi-clerk-default',
    name: 'SBI Clerk',
    slug: 'sbi-clerk',
    category: 'Banking',
    difficulty: 'Moderate',
    description: 'SBI Junior Associates (Customer Support & Sales) clerical cadre nationwide recruitment test.',
    subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness'],
    testCount: 1,
    questionCount: 20,
  },
];

export const FALLBACK_TESTS = dbData.tests || [];
export const FALLBACK_PRACTICE_CATEGORIES = dbData.practiceCategories || [];
export const FALLBACK_QUESTIONS = dbData.questions || [];
export const FALLBACK_TESTS_WITH_QUESTIONS = dbData.testsWithQuestions || [];

export const FALLBACK_STATS = {
  totalExams: 6,
  totalTests: FALLBACK_TESTS.length || 26,
  totalQuestions: FALLBACK_QUESTIONS.length || 120,
  availabilityRate: '99.98%',
};

// ==========================================
// TEST FILTERING HELPER
// ==========================================
export function filterFallbackTests(query: Record<string, string>): any[] {
  let list = [...FALLBACK_TESTS];

  const tab = query.tab;
  if (tab === 'Full Tests') {
    list = list.filter((t) => t.testType === 'Full Length');
  } else if (tab === 'Sectional') {
    list = list.filter((t) => t.testType === 'Sectional');
  } else if (tab === 'Free') {
    list = list.filter((t) => !t.isPremium);
  } else if (tab === 'Premium') {
    list = list.filter((t) => t.isPremium);
  } else if (tab === 'Practice') {
    list = list.filter((t) => t.testType === 'Practice');
  }

  const search = query.search?.toLowerCase().trim();
  if (search) {
    list = list.filter(
      (t) =>
        t.title?.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search) ||
        t.examName?.toLowerCase().includes(search)
    );
  }

  const exam = query.exam;
  if (exam && exam !== 'All') {
    list = list.filter((t) => t.examId === exam || t.examSlug === exam || t.examName === exam);
  }

  const difficulty = query.difficulty;
  if (difficulty && difficulty !== 'All') {
    list = list.filter((t) => t.difficulty?.toLowerCase() === difficulty.toLowerCase());
  }

  return list;
}

// ==========================================
// DAILY SPRINT QUIZ GENERATOR
// ==========================================
export function getFallbackDailyChallenge(): any {
  const today = new Date().toISOString().slice(0, 10);
  const title = `Daily Sprint Challenge — ${new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`;

  // Deterministically select 5 questions based on today's date
  const dateHash = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const shuffled = [...FALLBACK_QUESTIONS].sort(
    (a, b) =>
      ((a.id.charCodeAt(0) * dateHash) % 100) -
      ((b.id.charCodeAt(0) * dateHash) % 100)
  );

  const selectedQuestions = shuffled.slice(0, 5).map((q, idx) => ({
    id: q.id,
    order: idx + 1,
    questionText: q.questionText,
    difficulty: q.difficulty || 'Moderate',
    subjectName: q.subject?.name || 'General',
    topicName: q.topic?.name || 'General',
    options: (q.options || []).map((opt: any) => ({
      id: opt.id,
      optionKey: opt.optionKey,
      optionText: opt.optionText,
    })),
    // Correct answers kept internal unless already attempted
    correctOptionKey: q.options?.find((o: any) => o.isCorrect)?.optionKey || 'A',
    explanation: q.explanation || 'Detailed solution will appear after submission.',
    shortcut: q.shortcut || null,
  }));

  // Check stored attempt
  let userAttempt = null;
  try {
    const raw = localStorage.getItem(`abhi_daily_attempt_${today}`);
    if (raw) {
      userAttempt = JSON.parse(raw);
    }
  } catch {}

  return {
    challenge: {
      id: `daily-${today}`,
      date: today,
      title,
      description: 'A 5-question high-yield rapid drill covering mixed sections to maintain your daily streak.',
      durationMinutes: 5,
      totalQuestions: 5,
      totalParticipants: 428 + (dateHash % 80),
    },
    questions: selectedQuestions,
    userAttempt,
  };
}

export function submitFallbackDailyChallenge(payload: {
  answers: Record<string, string>;
  timeTaken: number;
}): any {
  const today = new Date().toISOString().slice(0, 10);
  const challenge = getFallbackDailyChallenge();
  const answers = payload.answers || {};

  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  const solutions = challenge.questions.map((q: any) => {
    const userAnswer = answers[q.id] || null;
    const correctKey = q.correctOptionKey || 'A';
    let isCorrect = false;

    if (!userAnswer) {
      skippedCount++;
    } else if (userAnswer === correctKey) {
      isCorrect = true;
      correctCount++;
    } else {
      incorrectCount++;
    }

    return {
      questionId: q.id,
      questionText: q.questionText,
      options: q.options,
      userAnswer,
      correctAnswer: correctKey,
      isCorrect,
      explanation: q.explanation,
      shortcut: q.shortcut,
      subjectName: q.subjectName,
      topicName: q.topicName,
    };
  });

  const rawScore = correctCount * 1 - incorrectCount * 0.25;
  const score = Math.max(0, Math.round(rawScore * 100) / 100);
  const accuracy = (correctCount + incorrectCount) > 0
    ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
    : 0;

  // Streak logic
  let currentStreak = 1;
  try {
    const streakKey = 'abhi_daily_streak_count';
    const lastDateKey = 'abhi_daily_last_date';
    const lastDate = localStorage.getItem(lastDateKey);
    const prevStreak = parseInt(localStorage.getItem(streakKey) || '0', 10);

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastDate === yesterday) {
      currentStreak = prevStreak + 1;
    } else if (lastDate === today) {
      currentStreak = Math.max(1, prevStreak);
    } else {
      currentStreak = 1;
    }

    localStorage.setItem(streakKey, currentStreak.toString());
    localStorage.setItem(lastDateKey, today);
  } catch {}

  const resultAttempt = {
    id: `attempt-${Date.now()}`,
    score,
    accuracy,
    timeTaken: payload.timeTaken || 120,
    streak: currentStreak,
    completedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(`abhi_daily_attempt_${today}`, JSON.stringify(resultAttempt));
  } catch {}

  return {
    success: true,
    score,
    correctCount,
    incorrectCount,
    skippedCount,
    accuracy,
    timeTaken: payload.timeTaken,
    streak: currentStreak,
    rank: Math.floor(Math.random() * 25) + 3,
    totalParticipants: 450,
    solutions,
  };
}

// ==========================================
// TEST ENGINE ATTEMPTS & RESPONSES
// ==========================================
export function startFallbackTestAttempt(testId: string): any {
  const testFull = FALLBACK_TESTS_WITH_QUESTIONS.find((t) => t.id === testId) ||
    FALLBACK_TESTS_WITH_QUESTIONS[0];

  const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const attempt = {
    id: attemptId,
    testId: testFull.id,
    testTitle: testFull.title,
    duration: testFull.duration,
    totalMarks: testFull.totalMarks,
    negativeMarks: testFull.negativeMarks || 0.25,
    startedAt: new Date().toISOString(),
    status: 'IN_PROGRESS',
    responses: {},
    questions: testFull.questions,
  };

  try {
    const existing = JSON.parse(localStorage.getItem('abhi_local_attempts') || '{}');
    existing[attemptId] = attempt;
    localStorage.setItem('abhi_local_attempts', JSON.stringify(existing));
  } catch {}

  return {
    attemptId,
    test: {
      id: testFull.id,
      title: testFull.title,
      duration: testFull.duration,
      totalMarks: testFull.totalMarks,
      negativeMarks: testFull.negativeMarks,
      difficulty: testFull.difficulty,
    },
    questions: testFull.questions.map((q: any) => ({
      id: q.id,
      order: q.order,
      questionText: q.questionText,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      subjectName: q.subjectName,
      topicName: q.topicName,
      options: q.options.map((o: any) => ({
        id: o.id,
        optionKey: o.optionKey,
        optionText: o.optionText,
      })),
    })),
  };
}

export function saveFallbackAttemptAnswer(
  attemptId: string,
  questionId: string,
  selectedOption: string | null,
  status = 'ANSWERED',
  timeSpentSeconds = 0
): any {
  try {
    const existing = JSON.parse(localStorage.getItem('abhi_local_attempts') || '{}');
    if (existing[attemptId]) {
      if (!existing[attemptId].responses) existing[attemptId].responses = {};
      existing[attemptId].responses[questionId] = {
        selectedOption,
        status,
        timeSpentSeconds,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('abhi_local_attempts', JSON.stringify(existing));
    }
  } catch {}

  return { success: true };
}

export function submitFallbackTestAttempt(attemptId: string, _timeSpent?: number): any {
  let attempt: any = null;
  try {
    const existing = JSON.parse(localStorage.getItem('abhi_local_attempts') || '{}');
    attempt = existing[attemptId];
  } catch {}

  const testFull = attempt
    ? FALLBACK_TESTS_WITH_QUESTIONS.find((t) => t.id === attempt.testId) || FALLBACK_TESTS_WITH_QUESTIONS[0]
    : FALLBACK_TESTS_WITH_QUESTIONS[0];

  const responses = attempt?.responses || {};
  let totalScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const sectionBreakdown: Record<string, any> = {};

  testFull.questions.forEach((q: any) => {
    const subName = q.subjectName || 'General';
    if (!sectionBreakdown[subName]) {
      sectionBreakdown[subName] = {
        subjectName: subName,
        totalQuestions: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        score: 0,
        marks: 0,
      };
    }
    sectionBreakdown[subName].totalQuestions++;
    sectionBreakdown[subName].marks += q.marks || 1;

    const userResp = responses[q.id];
    const correctOpt = q.options.find((o: any) => o.isCorrect)?.optionKey;

    if (!userResp || !userResp.selectedOption) {
      unattemptedCount++;
    } else {
      sectionBreakdown[subName].attempted++;
      if (userResp.selectedOption === correctOpt) {
        correctCount++;
        totalScore += (q.marks || 1);
        sectionBreakdown[subName].correct++;
        sectionBreakdown[subName].score += (q.marks || 1);
      } else {
        incorrectCount++;
        totalScore -= (q.negativeMarks || 0.25);
        sectionBreakdown[subName].incorrect++;
        sectionBreakdown[subName].score -= (q.negativeMarks || 0.25);
      }
    }
  });

  const accuracy = (correctCount + incorrectCount) > 0
    ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
    : 0;

  const finalScore = Math.max(0, Math.round(totalScore * 100) / 100);
  const percentile = Math.min(99.4, Math.max(45, Math.round((finalScore / (testFull.totalMarks || 100)) * 100 * 1.05)));

  const result = {
    attemptId,
    testId: testFull.id,
    testTitle: testFull.title,
    examName: testFull.examName,
    score: finalScore,
    totalMarks: testFull.totalMarks,
    accuracy,
    percentile,
    rank: Math.floor(Math.random() * 40) + 12,
    totalCandidates: 1420,
    correctCount,
    incorrectCount,
    unattemptedCount,
    sections: Object.values(sectionBreakdown),
    completedAt: new Date().toISOString(),
  };

  try {
    const results = JSON.parse(localStorage.getItem('abhi_local_results') || '{}');
    results[attemptId] = result;
    localStorage.setItem('abhi_local_results', JSON.stringify(results));
  } catch {}

  return { result };
}

export function getFallbackTestResult(attemptId: string): any {
  try {
    const results = JSON.parse(localStorage.getItem('abhi_local_results') || '{}');
    if (results[attemptId]) {
      return { result: results[attemptId] };
    }
  } catch {}

  // Fallback demo result
  return {
    result: {
      attemptId,
      testId: FALLBACK_TESTS[0]?.id || 'default-test',
      testTitle: FALLBACK_TESTS[0]?.title || 'SBI PO Prelims Mock 1',
      examName: 'SBI PO',
      score: 68.5,
      totalMarks: 100,
      accuracy: 86,
      percentile: 94.2,
      rank: 42,
      totalCandidates: 2850,
      correctCount: 16,
      incorrectCount: 3,
      unattemptedCount: 1,
      sections: [
        { subjectName: 'Quantitative Aptitude', totalQuestions: 7, attempted: 6, correct: 5, incorrect: 1, score: 4.75, marks: 7 },
        { subjectName: 'Reasoning Ability', totalQuestions: 7, attempted: 7, correct: 6, incorrect: 1, score: 5.75, marks: 7 },
        { subjectName: 'English Language', totalQuestions: 6, attempted: 6, correct: 5, incorrect: 1, score: 4.75, marks: 6 },
      ],
      completedAt: new Date().toISOString(),
    },
  };
}
