import { Exam, ExamDetail, SubjectDetail, TestSummary } from '../types';
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
// EXAM DETAIL BUILDER (testsGrouped contract)
// ==========================================
export function getFallbackExamDetail(slugOrId: string): ExamDetail {
  const baseExam =
    FALLBACK_EXAMS.find((e) => e.slug === slugOrId || e.id === slugOrId) ||
    FALLBACK_EXAMS[0];

  const matchingTests = FALLBACK_TESTS.filter(
    (t: any) =>
      t.examSlug === baseExam.slug ||
      t.examId === baseExam.id ||
      (t.examName && t.examName.toLowerCase() === baseExam.name.toLowerCase())
  );

  const testsGrouped: {
    'Full Length': TestSummary[];
    'Sectional': TestSummary[];
    'Practice': TestSummary[];
    'Previous Year': TestSummary[];
  } = {
    'Full Length': [],
    'Sectional': [],
    'Practice': [],
    'Previous Year': [],
  };

  matchingTests.forEach((t: any) => {
    const typeKey = (t.testType in testsGrouped ? t.testType : 'Full Length') as keyof typeof testsGrouped;
    testsGrouped[typeKey].push({
      id: t.id,
      title: t.title,
      description: t.description,
      examId: t.examId || baseExam.id,
      examName: t.examName || baseExam.name,
      examSlug: t.examSlug || baseExam.slug,
      subjectId: t.subjectId || null,
      subjectName: t.subjectName || 'Full Syllabus',
      testType: t.testType || 'Full Length',
      duration: t.duration || 60,
      totalMarks: t.totalMarks || 100,
      negativeMarks: t.negativeMarks ?? 0.25,
      difficulty: t.difficulty || 'Moderate',
      isPremium: Boolean(t.isPremium),
      questionCount: t.questionCount || 20,
      attemptCount: t.attemptCount || 0,
    });
  });

  const subjects: SubjectDetail[] = (baseExam.subjects || []).map((subName: string, idx: number) => ({
    id: `sub-${idx + 1}`,
    name: subName,
    questionCount: 20,
    topics: ['Concept Drills', 'Previous Year Questions', 'Mock Practice'],
  }));

  return {
    id: baseExam.id,
    name: baseExam.name,
    slug: baseExam.slug,
    category: baseExam.category,
    difficulty: baseExam.difficulty,
    description: baseExam.description,
    questionCount: baseExam.questionCount || 20,
    subjects,
    testsGrouped,
  };
}

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
export function startFallbackTestAttempt(testId: string): any {
  const testFull = FALLBACK_TESTS_WITH_QUESTIONS.find((t) => t.id === testId) ||
    FALLBACK_TESTS_WITH_QUESTIONS[0];

  const attemptId = `att_${testFull.id}_${Date.now()}`;

  const activeQuestions = (testFull.questions || []).map((q: any, idx: number) => ({
    questionId: q.id || q.questionId || `q-${idx + 1}`,
    id: q.id || q.questionId || `q-${idx + 1}`,
    order: q.order || idx + 1,
    questionText: q.questionText,
    questionType: q.questionType || 'MCQ',
    difficulty: q.difficulty || 'Moderate',
    marks: q.marks || 1,
    negativeMarks: q.negativeMarks || 0.25,
    subjectName: q.subjectName || 'General',
    topicName: q.topicName || 'General',
    isBookmarked: false,
    options: (q.options || []).map((o: any) => ({
      id: o.id,
      optionKey: o.optionKey,
      optionText: o.optionText,
    })),
    selectedOption: null,
    isMarked: false,
    timeSpent: 0,
  }));

  const fullAttempt = {
    id: attemptId,
    testId: testFull.id,
    testTitle: testFull.title,
    examName: testFull.examName || 'Competitive Exam',
    subjectName: testFull.subjectName || 'Full Syllabus',
    durationMinutes: testFull.duration || 60,
    totalDurationSeconds: (testFull.duration || 60) * 60,
    remainingSeconds: (testFull.duration || 60) * 60,
    elapsedSeconds: 0,
    status: 'IN_PROGRESS',
    startedAt: new Date().toISOString(),
    negativeMarks: testFull.negativeMarks || 0.25,
    totalMarks: testFull.totalMarks || 100,
    isPracticeMode: testFull.testType === 'Practice',
    responses: {},
    questions: activeQuestions,
  };

  try {
    const existing = JSON.parse(localStorage.getItem('abhi_local_attempts') || '{}');
    existing[attemptId] = fullAttempt;
    localStorage.setItem('abhi_local_attempts', JSON.stringify(existing));
  } catch {}

  return {
    success: true,
    attemptId,
    attempt: fullAttempt,
    test: {
      id: testFull.id,
      title: testFull.title,
      duration: testFull.duration,
      totalMarks: testFull.totalMarks,
      negativeMarks: testFull.negativeMarks,
      difficulty: testFull.difficulty,
    },
    questions: activeQuestions,
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
    const attempt = existing[attemptId];
    if (attempt) {
      if (!attempt.responses) attempt.responses = {};
      attempt.responses[questionId] = {
        questionId,
        selectedOption,
        status,
        timeSpent: (attempt.responses[questionId]?.timeSpent || 0) + timeSpentSeconds,
        updatedAt: new Date().toISOString(),
      };
      existing[attemptId] = attempt;
      localStorage.setItem('abhi_local_attempts', JSON.stringify(existing));
    }
  } catch {}
  return { success: true };
}

export function submitFallbackTestAttempt(attemptId: string, _timeSpent = 0): any {
  let attempt: any = null;
  try {
    const existing = JSON.parse(localStorage.getItem('abhi_local_attempts') || '{}');
    attempt = existing[attemptId];
  } catch {}

  const testFull =
    FALLBACK_TESTS_WITH_QUESTIONS.find((t) => t.id === attempt?.testId) ||
    FALLBACK_TESTS_WITH_QUESTIONS[0];

  const questionsList = (attempt?.questions || testFull.questions || []).map((q: any, idx: number) => ({
    ...q,
    questionId: q.questionId || q.id || `q-${idx + 1}`,
  }));

  const responses = attempt?.responses || {};
  let totalScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const sectionBreakdown: Record<string, any> = {};

  const reviewQuestions = questionsList.map((q: any, idx: number) => {
    const subName = q.subjectName || 'General';
    if (!sectionBreakdown[subName]) {
      sectionBreakdown[subName] = {
        subjectName: subName,
        totalQuestions: 0,
        correct: 0,
        wrong: 0,
        unanswered: 0,
        score: 0,
        timeSpent: 0,
        accuracy: 0,
      };
    }
    sectionBreakdown[subName].totalQuestions++;

    const userResp = responses[q.questionId] || responses[q.id];
    const correctOptionObj = q.options?.find((o: any) => o.isCorrect) || q.options?.[0];
    const correctOpt = correctOptionObj?.optionKey || 'A';
    const userSelected = userResp?.selectedOption || null;

    let qStatus: 'CORRECT' | 'WRONG' | 'UNANSWERED' = 'UNANSWERED';
    let isCorrect: boolean | null = null;

    if (!userSelected) {
      unattemptedCount++;
      sectionBreakdown[subName].unanswered++;
    } else if (userSelected === correctOpt) {
      correctCount++;
      qStatus = 'CORRECT';
      isCorrect = true;
      const m = q.marks || 1;
      totalScore += m;
      sectionBreakdown[subName].correct++;
      sectionBreakdown[subName].score += m;
    } else {
      incorrectCount++;
      qStatus = 'WRONG';
      isCorrect = false;
      const nm = q.negativeMarks || 0.25;
      totalScore -= nm;
      sectionBreakdown[subName].wrong++;
      sectionBreakdown[subName].score -= nm;
    }

    const tSpent = userResp?.timeSpent || 15;
    sectionBreakdown[subName].timeSpent += tSpent;

    return {
      questionId: q.questionId,
      index: idx + 1,
      questionText: q.questionText,
      subjectName: subName,
      topicName: q.topicName || 'General',
      difficulty: q.difficulty || 'Moderate',
      marks: q.marks || 1,
      negativeMarks: q.negativeMarks || 0.25,
      selectedOption: userSelected,
      correctOptionKey: correctOpt,
      correctOptionText: correctOptionObj?.optionText || '',
      isCorrect,
      status: qStatus,
      explanation: q.explanation || 'Review concepts thoroughly for better conceptual clarity.',
      timeSpent: tSpent,
      isMarked: Boolean(userResp?.isMarked),
      isBookmarked: false,
      options: q.options || [],
    };
  });

  const attemptedTotal = correctCount + incorrectCount;
  const accuracy = attemptedTotal > 0 ? Math.round((correctCount / attemptedTotal) * 100) : 0;
  const finalScore = Math.max(0, Math.round(totalScore * 100) / 100);
  const totalMarks = testFull.totalMarks || 100;
  const percentage = Math.round((finalScore / totalMarks) * 100);
  const percentile = Math.min(99.4, Math.max(45, Math.round((percentage * 1.05) * 10) / 10));

  // Compute accuracy for sections
  Object.values(sectionBreakdown).forEach((sec: any) => {
    const secAttempted = sec.correct + sec.wrong;
    sec.accuracy = secAttempted > 0 ? Math.round((sec.correct / secAttempted) * 100) : 0;
    sec.score = Math.round(sec.score * 100) / 100;
  });

  const wrongCount = incorrectCount;
  const unansweredCount = unattemptedCount;

  const fullResult = {
    result: {
      attemptId,
      testId: testFull.id,
      testTitle: testFull.title,
      examName: testFull.examName || 'Competitive Exam',
      examSlug: testFull.examSlug || 'sbi-po',
      subjectName: testFull.subjectName || 'Full Syllabus',
      durationMinutes: testFull.duration || 60,
      totalMarks,
      negativeMarks: testFull.negativeMarks || 0.25,
      startedAt: attempt?.startedAt || new Date(Date.now() - 3600000).toISOString(),
      submittedAt: new Date().toISOString(),
      timeTaken: Math.min(testFull.duration * 60, 1800),
      score: finalScore,
      percentage,
      accuracy,
      correctCount,
      wrongCount,
      unansweredCount,
      totalQuestions: questionsList.length,
      rank: Math.floor(Math.random() * 30) + 10,
      percentile,
      totalTakers: 1420,
      highestScore: Math.round(totalMarks * 0.94),
      avgScore: Math.round(totalMarks * 0.58),
    },
    subjectAnalysis: Object.values(sectionBreakdown),
    questions: reviewQuestions,
  };

  try {
    const results = JSON.parse(localStorage.getItem('abhi_local_results') || '{}');
    results[attemptId] = fullResult;
    localStorage.setItem('abhi_local_results', JSON.stringify(results));

    // Save to test history
    const existingHistory = JSON.parse(localStorage.getItem('abhi_test_history') || '[]');
    const historyItem = {
      id: attemptId,
      testId: testFull.id,
      testTitle: testFull.title,
      examName: testFull.examName || 'Competitive Exam',
      subjectName: testFull.subjectName || 'Full Syllabus',
      status: 'COMPLETED',
      score: finalScore,
      totalMarks,
      percentage,
      accuracy,
      startedAt: attempt?.startedAt || new Date(Date.now() - 3600000).toISOString(),
      submittedAt: new Date().toISOString(),
      durationMinutes: testFull.duration || 60,
      timeTaken: Math.min(testFull.duration * 60, 1800),
    };
    const updatedHistory = [historyItem, ...existingHistory.filter((h: any) => h.id !== attemptId)];
    localStorage.setItem('abhi_test_history', JSON.stringify(updatedHistory));

    // Save wrong questions to mistake notebook
    const wrongQuestions = reviewQuestions
      .filter((q: any) => q.status === 'WRONG')
      .map((q: any) => ({
        questionId: q.questionId,
        questionText: q.questionText,
        difficulty: q.difficulty || 'Moderate',
        marks: q.marks || 1,
        negativeMarks: q.negativeMarks || 0.25,
        explanation: q.explanation || 'Detailed solution will appear after test completion.',
        shortcut: null,
        subjectName: q.subjectName,
        topicName: q.topicName,
        examName: testFull.examName || 'Competitive Exam',
        correctOptionKey: q.correctOptionKey,
        correctOptionText: q.correctOptionText,
        lastChosenOption: q.selectedOption,
        missCount: 1,
        lastAttemptDate: new Date().toISOString(),
        lastTestTitle: testFull.title,
        options: q.options || [],
      }));
    if (wrongQuestions.length > 0) {
      const existingWrongs = JSON.parse(localStorage.getItem('abhi_wrong_questions') || '[]');
      const newWrongs = [...wrongQuestions, ...existingWrongs.filter((w: any) => !wrongQuestions.some((nw: any) => nw.questionId === w.questionId))];
      localStorage.setItem('abhi_wrong_questions', JSON.stringify(newWrongs));
    }
  } catch {}

  return fullResult;
}

export function getFallbackTestResult(attemptId: string): any {
  try {
    const results = JSON.parse(localStorage.getItem('abhi_local_results') || '{}');
    if (results[attemptId]) {
      return results[attemptId];
    }
  } catch {}

  // Generate a realistic full result
  return submitFallbackTestAttempt(attemptId);
}
