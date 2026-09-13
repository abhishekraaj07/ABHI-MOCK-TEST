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

  // 1a. /api/auth/guest-session
  if (pathname === '/api/auth/guest-session' && method === 'POST') {
    const guestId = `guest_edge_${Date.now()}`;
    const guestUser = {
      id: guestId,
      name: 'Guest Aspirant',
      email: `guest_${Date.now()}@guest.abhimocktest.com`,
      role: 'USER',
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    return new Response(JSON.stringify({ success: true, user: guestUser }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `token=edge_guest_${Date.now()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // 1b. /api/auth/me
  if (pathname === '/api/auth/me' && method === 'GET') {
    const cookie = request.headers.get('Cookie') || '';
    if (cookie.includes('token=')) {
      return json({
        success: true,
        user: {
          id: 'guest_aspirant',
          name: 'Guest Aspirant',
          email: 'guest@abhimocktest.com',
          role: 'USER',
          isGuest: true,
        },
        stats: { completedTests: 0, bookmarkedQuestions: 0 },
      });
    }
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  // 1c. /api/auth/logout
  if (pathname === '/api/auth/logout' && method === 'POST') {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'token=; Path=/; HttpOnly; Max-Age=0',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // 1d. /api/exams
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

  // 2b. /api/tests/:id/start
  if (pathname.match(/^\/api\/tests\/[^/]+\/start$/) && method === 'POST') {
    const testId = pathname.split('/')[3];
    const attemptId = `att_edge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    return json({ success: true, attemptId, message: 'Official attempt session initialized.' });
  }

  // 2c. /api/tests/:id
  if (pathname.startsWith('/api/tests/')) {
    const testId = pathname.replace('/api/tests/', '');
    const found = (dbData.tests || []).find((t: any) => t.id === testId) || (dbData.tests || [])[0];
    const qCount = found?.questionCount || 20;
    const dur = found?.duration || 60;
    const tMarks = found?.totalMarks || 100;
    return json({
      test: {
        id: found?.id || testId,
        title: found?.title || 'Mock Examination',
        description: found?.description || 'Full syllabus official standard test paper.',
        examId: found?.examId || 'sbi-po',
        examName: found?.examName || 'SBI PO',
        subjectName: found?.subjectName || 'Full Syllabus',
        testType: found?.testType || 'Full Length',
        duration: dur,
        totalMarks: tMarks,
        negativeMarks: found?.negativeMarks ?? 0.25,
        difficulty: found?.difficulty || 'Moderate',
        isPremium: Boolean(found?.isPremium),
        questionCount: qCount,
        language: 'English',
        activeAttemptId: null,
        instructions: [
          `The examination comprises ${qCount} questions worth a total of ${tMarks} marks.`,
          `Total duration is strictly ${dur} minutes. The countdown timer displays the remaining time.`,
          `Each correct response is awarded ${(tMarks / (qCount || 1)).toFixed(2)} marks.`,
          `Negative marking of ${found?.negativeMarks ?? 0.25} marks applies for incorrect answers. Unanswered questions attract 0 marks.`,
          `You can navigate between questions using the Question Palette on the right or Next / Previous buttons.`,
          `Use "Mark for Review" to flag questions for later review.`,
          `When the timer reaches zero, the test will automatically submit.`,
        ],
      },
    });
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

  // 10. /api/attempts/:id
  if (pathname.match(/^\/api\/attempts\/[^/]+\/answer$/) && method === 'POST') {
    return json({ success: true, message: 'Response recorded' });
  }

  if (pathname.match(/^\/api\/attempts\/[^/]+\/submit$/) && method === 'POST') {
    const attemptId = pathname.split('/')[3];
    return json({ success: true, attemptId, status: 'COMPLETED' });
  }

  if (pathname.startsWith('/api/attempts/')) {
    const attemptId = pathname.replace('/api/attempts/', '');
    const qList = (dbData.questions || []).slice(0, 20).map((q: any, idx: number) => ({
      questionId: q.id,
      order: idx + 1,
      questionText: q.questionText,
      questionType: q.questionType || 'MCQ',
      difficulty: q.difficulty || 'Moderate',
      marks: q.marks || 1,
      negativeMarks: q.negativeMarks || 0.25,
      subjectName: q.subject?.name || 'General',
      topicName: q.topic?.name || 'General',
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

    return json({
      success: true,
      attempt: {
        id: attemptId,
        testId: 'sbi-po-test-1',
        testTitle: 'SBI PO Prelims Full Mock 1',
        examName: 'SBI PO',
        subjectName: 'Full Syllabus',
        durationMinutes: 60,
        totalDurationSeconds: 3600,
        remainingSeconds: 3600,
        elapsedSeconds: 0,
        status: 'IN_PROGRESS',
        startedAt: new Date().toISOString(),
        negativeMarks: 0.25,
        totalMarks: 100,
        isPracticeMode: false,
      },
      questions: qList,
    });
  }

  // 11. /api/results/:id
  if (pathname.startsWith('/api/results/')) {
    const attemptId = pathname.replace('/api/results/', '');
    const qList = (dbData.questions || []).slice(0, 20).map((q: any, idx: number) => {
      const correctOpt = q.options?.find((o: any) => o.isCorrect)?.optionKey || 'A';
      return {
        questionId: q.id,
        index: idx + 1,
        questionText: q.questionText,
        subjectName: q.subject?.name || 'General',
        topicName: q.topic?.name || 'General',
        difficulty: q.difficulty || 'Moderate',
        marks: q.marks || 1,
        negativeMarks: q.negativeMarks || 0.25,
        selectedOption: idx % 3 === 0 ? correctOpt : idx % 3 === 1 ? 'B' : null,
        correctOptionKey: correctOpt,
        correctOptionText: q.options?.find((o: any) => o.isCorrect)?.optionText || '',
        isCorrect: idx % 3 === 0,
        status: idx % 3 === 0 ? 'CORRECT' : idx % 3 === 1 ? 'WRONG' : 'UNANSWERED',
        explanation: q.explanation || 'Review concepts thoroughly for higher accuracy.',
        timeSpent: 25,
        isMarked: false,
        isBookmarked: false,
        options: q.options || [],
      };
    });

    const correctCount = qList.filter((q: any) => q.status === 'CORRECT').length;
    const wrongCount = qList.filter((q: any) => q.status === 'WRONG').length;
    const unansweredCount = qList.filter((q: any) => q.status === 'UNANSWERED').length;
    const score = Math.max(0, Math.round((correctCount * 1 - wrongCount * 0.25) * 100) / 100);
    const accuracy = (correctCount + wrongCount) > 0 ? Math.round((correctCount / (correctCount + wrongCount)) * 100) : 0;

    return json({
      result: {
        attemptId,
        testId: 'sbi-po-test-1',
        testTitle: 'SBI PO Prelims Full Mock 1',
        examName: 'SBI PO',
        examSlug: 'sbi-po',
        subjectName: 'Full Syllabus',
        durationMinutes: 60,
        totalMarks: 100,
        negativeMarks: 0.25,
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        submittedAt: new Date().toISOString(),
        timeTaken: 1845,
        score,
        percentage: Math.round((score / 100) * 100),
        accuracy,
        correctCount,
        wrongCount,
        unansweredCount,
        totalQuestions: qList.length,
        rank: 24,
        percentile: 96.2,
        totalTakers: 1420,
        highestScore: 94,
        avgScore: 58,
      },
      subjectAnalysis: [
        { subjectName: 'Quantitative Aptitude', totalQuestions: 7, correct: 5, wrong: 1, unanswered: 1, score: 4.75, timeSpent: 620, accuracy: 83 },
        { subjectName: 'Reasoning Ability', totalQuestions: 7, correct: 5, wrong: 1, unanswered: 1, score: 4.75, timeSpent: 610, accuracy: 83 },
        { subjectName: 'English Language', totalQuestions: 6, correct: 4, wrong: 1, unanswered: 1, score: 3.75, timeSpent: 615, accuracy: 80 },
      ],
      questions: qList,
    });
  }

  // 12. Fallback 404 for unhandled API endpoints
  return new Response(
    JSON.stringify({ error: 'Endpoint not implemented at edge; falling back to client router.' }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    }
  );
}
