import dbDataRaw from '../../src/lib/dbData.json';

const dbData = dbDataRaw as {
  tests: any[];
  practiceCategories: any[];
  questions: any[];
  testsWithQuestions: any[];
};

const EXAMS = [
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

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequest(context: any): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // 1. /api/exams
  if (pathname === '/api/exams') {
    return json({ exams: EXAMS });
  }

  // 2. /api/tests
  if (pathname === '/api/tests') {
    let list = [...(dbData.tests || [])];
    const tab = url.searchParams.get('tab');
    if (tab === 'Full Tests') list = list.filter((t) => t.testType === 'Full Length');
    else if (tab === 'Sectional') list = list.filter((t) => t.testType === 'Sectional');
    else if (tab === 'Free') list = list.filter((t) => !t.isPremium);
    else if (tab === 'Premium') list = list.filter((t) => t.isPremium);
    else if (tab === 'Practice') list = list.filter((t) => t.testType === 'Practice');

    const search = url.searchParams.get('search')?.toLowerCase().trim();
    if (search) {
      list = list.filter(
        (t) =>
          t.title?.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search) ||
          t.examName?.toLowerCase().includes(search)
      );
    }

    const exam = url.searchParams.get('exam');
    if (exam && exam !== 'All') {
      list = list.filter((t) => t.examId === exam || t.examSlug === exam || t.examName === exam);
    }

    const difficulty = url.searchParams.get('difficulty');
    if (difficulty && difficulty !== 'All') {
      list = list.filter((t) => t.difficulty?.toLowerCase() === difficulty.toLowerCase());
    }

    return json({ tests: list });
  }

  // 3. /api/practice
  if (pathname === '/api/practice') {
    return json({ categories: dbData.practiceCategories || [] });
  }
  if (pathname.startsWith('/api/practice/topics/')) {
    const topicId = pathname.replace('/api/practice/topics/', '');
    let matching = (dbData.questions || []).filter((q: any) => q.topicId === topicId);
    if (matching.length === 0) {
      matching = (dbData.questions || []).slice(0, 10);
    }
    return json({
      topic: { id: topicId, name: matching[0]?.topic?.name || 'Practice Drill' },
      questions: matching.map((q: any, idx: number) => ({
        id: q.id,
        order: idx + 1,
        questionText: q.questionText,
        difficulty: q.difficulty,
        subjectName: q.subject?.name,
        explanation: q.explanation,
        options: q.options,
      })),
    });
  }

  // 4. /api/daily-challenge
  if (pathname === '/api/daily-challenge') {
    const today = new Date().toISOString().slice(0, 10);
    const dateHash = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const shuffled = [...(dbData.questions || [])].sort(
      (a, b) => ((a.id.charCodeAt(0) * dateHash) % 100) - ((b.id.charCodeAt(0) * dateHash) % 100)
    );
    const selectedQuestions = shuffled.slice(0, 5).map((q: any, idx: number) => ({
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
      correctOptionKey: q.options?.find((o: any) => o.isCorrect)?.optionKey || 'A',
      explanation: q.explanation || 'Detailed explanation will appear after test completion.',
      shortcut: q.shortcut || null,
    }));

    return json({
      challenge: {
        id: `daily-${today}`,
        date: today,
        title: `Daily Sprint Challenge — ${new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}`,
        description: 'A 5-question high-yield rapid drill covering mixed sections to maintain your daily streak.',
        durationMinutes: 5,
        totalQuestions: 5,
        totalParticipants: 450 + (dateHash % 80),
      },
      questions: selectedQuestions,
      userAttempt: null,
    });
  }

  if (pathname === '/api/daily-challenge/submit' && method === 'POST') {
    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    const answers = body.answers || {};
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    const questions = (dbData.questions || []).slice(0, 5);
    const solutions = questions.map((q: any) => {
      const userAnswer = answers[q.id] || null;
      const correctKey = q.options?.find((o: any) => o.isCorrect)?.optionKey || 'A';
      const isCorrect = userAnswer === correctKey;

      if (!userAnswer) skippedCount++;
      else if (isCorrect) correctCount++;
      else incorrectCount++;

      return {
        questionId: q.id,
        questionText: q.questionText,
        options: q.options,
        userAnswer,
        correctAnswer: correctKey,
        isCorrect,
        explanation: q.explanation,
        shortcut: q.shortcut,
        subjectName: q.subject?.name,
        topicName: q.topic?.name,
      };
    });

    const score = Math.max(0, Math.round((correctCount * 1 - incorrectCount * 0.25) * 100) / 100);
    const accuracy = (correctCount + incorrectCount) > 0
      ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
      : 0;

    return json({
      success: true,
      score,
      correctCount,
      incorrectCount,
      skippedCount,
      accuracy,
      timeTaken: body.timeTaken || 120,
      streak: 1,
      rank: 14,
      totalParticipants: 450,
      solutions,
    });
  }

  // 5. /api/leaderboard
  if (pathname === '/api/leaderboard') {
    return json({
      leaderboard: [
        { rank: 1, name: 'Ananya Sharma', score: 94.5, accuracy: 96, percentile: 99.8, avatar: 'AS' },
        { rank: 2, name: 'Rohan Verma', score: 91.0, accuracy: 93, percentile: 99.2, avatar: 'RV' },
        { rank: 3, name: 'Priya Patel', score: 88.75, accuracy: 91, percentile: 98.7, avatar: 'PP' },
        { rank: 4, name: 'Amit Kumar', score: 86.25, accuracy: 89, percentile: 97.9, avatar: 'AK' },
        { rank: 5, name: 'Sneha Roy', score: 84.5, accuracy: 88, percentile: 96.5, avatar: 'SR' },
        { rank: 6, name: 'You', score: 78.5, accuracy: 84, percentile: 92.1, avatar: 'ME', isUser: true },
      ],
    });
  }

  // 6. /api/analytics
  if (pathname === '/api/analytics/wrong-questions') {
    const wrongQs = (dbData.questions || []).slice(0, 6).map((q: any) => ({
      id: q.id,
      questionText: q.questionText,
      subjectName: q.subject?.name || 'General',
      topicName: q.topic?.name || 'Topic Drill',
      difficulty: q.difficulty || 'Moderate',
      options: q.options || [],
      correctOption: q.options?.find((o: any) => o.isCorrect)?.optionKey || 'A',
      selectedOption: 'B',
      explanation: q.explanation || 'Review concepts thoroughly.',
      testTitle: 'SBI PO Full Mock 1',
    }));
    return json({ wrongQuestions: wrongQs });
  }

  if (pathname.startsWith('/api/analytics')) {
    return json({
      overview: {
        testsAttempted: 14,
        avgScore: 72.4,
        avgAccuracy: 84.6,
        totalTimeHours: 18.5,
        percentile: 88.3,
      },
      weakAreas: [
        { subject: 'Quantitative Aptitude', topic: 'Data Interpretation', accuracy: 52 },
        { subject: 'Reasoning Ability', topic: 'Floor & Flat Puzzles', accuracy: 58 },
        { subject: 'English Language', topic: 'Sentence Rearrangement', accuracy: 64 },
      ],
    });
  }

  // 7. /api/dashboard
  if (pathname === '/api/dashboard') {
    return json({
      stats: {
        totalExams: EXAMS.length,
        totalTests: (dbData.tests || []).length,
        totalQuestions: (dbData.questions || []).length,
        availabilityRate: '99.9%',
      },
      recentAttempts: [],
      recommendedTests: (dbData.tests || []).slice(0, 4),
    });
  }

  // 8. /api/bookmarks
  if (pathname === '/api/bookmarks') {
    return json({ bookmarks: [] });
  }

  // 9. /api/reports
  if (pathname === '/api/reports' && method === 'POST') {
    return json({ success: true, message: 'Report submitted successfully.' });
  }

  // 10. Fallback 404 for unhandled API endpoints
  return new Response(
    JSON.stringify({ error: 'Endpoint not implemented at edge; falling back to client router.' }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    }
  );
}
