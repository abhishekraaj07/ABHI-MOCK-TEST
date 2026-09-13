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

function findTest(testIdOrSlug: string) {
  return (
    dbData.testsWithQuestions?.find((t: any) => t.id === testIdOrSlug || t.slug === testIdOrSlug) ||
    dbData.tests?.find((t: any) => t.id === testIdOrSlug || t.slug === testIdOrSlug) ||
    dbData.testsWithQuestions?.[0] ||
    dbData.tests?.[0]
  );
}

function getQuestionsForTest(testIdOrSlug: string) {
  const testWithQ = dbData.testsWithQuestions?.find(
    (t: any) => t.id === testIdOrSlug || t.slug === testIdOrSlug
  );
  if (testWithQ && Array.isArray(testWithQ.questions) && testWithQ.questions.length > 0) {
    return testWithQ.questions;
  }
  const test = dbData.tests?.find((t: any) => t.id === testIdOrSlug || t.slug === testIdOrSlug);
  if (test) {
    const matching = (dbData.questions || []).filter(
      (q: any) => q.subjectId === test.subjectId || q.testId === test.id
    );
    if (matching.length > 0) return matching.slice(0, test.questionCount || 20);
  }
  return dbData.testsWithQuestions?.[0]?.questions || (dbData.questions || []).slice(0, 20);
}

function parseTestIdFromAttempt(attemptId: string): string {
  if (attemptId.startsWith('att_')) {
    const parts = attemptId.split('_');
    if (parts.length >= 3 && parts[1] !== 'edge') {
      return parts.slice(1, parts.length - 1).join('_');
    }
  }
  const directMatch = dbData.testsWithQuestions?.find((t: any) => t.id === attemptId);
  if (directMatch) return directMatch.id;
  return dbData.testsWithQuestions?.[0]?.id || 'de94ec9c-7468-42bd-8206-20edf41c9295';
}

function generatePedagogicalFallback(prompt: string, _persona: string = 'exam-mentor'): string {
  const p = (prompt || '').toLowerCase();

  if (p.includes('syllogism') || p.includes('statement') || p.includes('conclusion')) {
    return `### Syllogism Diagnostic & Venn Method

**Standard Rules:**
1. **"All A are B" + "All B are C"** ⇒ "All A are C" is definitely true.
2. **"Some A are B"** ⇒ Reversible: "Some B are A".
3. **"No A is B"** ⇒ Fully disjoint sets. No intersection allowed.
4. **"Only a few A are B"** ⇒ "Some A are B" AND "Some A are NOT B" (both are simultaneously true).

**Exam Shortcut:**
- Draw minimum overlapping diagrams for definite conclusions.
- For "possibility" questions ("can be / is a possibility"), check if any non-contradictory diagram exists. If yes, the possibility is VALID.`;
  }

  if (p.includes('percentage') || p.includes('profit') || p.includes('loss') || p.includes('discount')) {
    return `### Quant High-Yield Shortcuts: Percentage & Profit-Loss

**1. Price-Consumption Invariance:**
- If price increases by $r\\%$, consumption must decrease by:
  $$\\Delta C = \\left(\\frac{r}{100 + r}\\right) \\times 100\\%$$
- Example: 25% price increase $\\implies \\frac{25}{125} \\times 100\\% = 20\\%$ reduction.

**2. Successive Changes:**
- Effective change $= a + b + \\frac{a \\times b}{100}\\%$
- For discount $d_1$ and $d_2$: Effective Discount $= d_1 + d_2 - \\frac{d_1 \\times d_2}{100}\\%$.

**3. Margin Trap:**
- Profit on Cost Price $\\neq$ Profit on Selling Price. Always base your ratio on $CP = 100$ unless explicitly asked for SP.`;
  }

  if (p.includes('cutoff') || p.includes('strategy') || p.includes('score') || p.includes('timetable') || p.includes('tips')) {
    return `### Exam Strategy & Sectional Cutoff Optimization

**1. Time Allocation Blueprint (60-minute Prelims):**
- **Reasoning Ability (20 mins):** Attempt standalone questions first (Inequalities, Syllogisms, Direction, Coding-Decoding) in 6-7 mins. Dedicate remaining 13 mins to 2-3 standard puzzles. Target: 28-32 marks.
- **Quantitative Aptitude (20 mins):** Simplification/Approximation (5 Qs in 2.5 mins), Quadratic Equations (5 Qs in 2.5 mins), Number Series (5 Qs in 3 mins), DI (5 Qs in 6 mins). Arithmetic last. Target: 24-28 marks.
- **English Language (20 mins):** Error spotting, Cloze test, Fillers (10 mins). RC passage (10 mins). Target: 22-26 marks.

**2. The 30-Second Skip Rule:**
- Never spend more than 45 seconds on any single question without an active pathway to the solution. Mark for review and move on immediately.`;
  }

  if (p.includes('puzzle') || p.includes('seating') || p.includes('arrangement')) {
    return `### Seating Arrangement & Floor Puzzle Strategy

**1. Parallel Case Elimination Method:**
- Never solve a puzzle with a single diagram. Always draw **2 parallel cases** from clue #1.
- Eliminate case 2 as soon as a condition fails (usually around clue 4 or 5).

**2. Definitive Anchor Clues First:**
- Identify fixed positions (e.g. "A sits at an extreme end", "B lives on an even-numbered floor below floor 4").
- Chain relative clues to the established anchor to prevent redundant branches.`;
  }

  return `### ABHI AI Exam Mentor Guidance

**Core Diagnostic Principles:**
1. **Accuracy > Attempts:** Negative marking (-0.25) penalizes blind guessing. Every wrong answer robs you of 1.25 marks compared to a correct answer.
2. **Review Mistake Notebook Daily:** Revisit previously missed questions in your **Mistake Notebook** before starting any new full-length mock.
3. **Speed Drill Consistency:** Attempt the 5-question **Daily Sprint Challenge** every morning to maintain cognitive agility across mixed reasoning and math topics.

Feel free to paste any specific question or formula, and I will dissect the options, traps, and fastest shortcut!`;
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

  // 1e. /api/exams/:id
  if (pathname.startsWith('/api/exams/')) {
    const slugOrId = pathname.replace('/api/exams/', '');
    const exam = EXAMS.find((e) => e.slug === slugOrId || e.id === slugOrId) || EXAMS[0];

    const matchingTests = (dbData.tests || []).filter(
      (t: any) =>
        t.examSlug === exam.slug ||
        t.examId === exam.id ||
        (t.examName && t.examName.toLowerCase() === exam.name.toLowerCase())
    );

    const grouped: Record<string, any[]> = {
      'Full Length': [],
      'Sectional': [],
      'Practice': [],
      'Previous Year': [],
    };

    matchingTests.forEach((t: any) => {
      const typeKey = t.testType in grouped ? t.testType : 'Full Length';
      grouped[typeKey].push({
        id: t.id,
        title: t.title,
        description: t.description,
        testType: t.testType || 'Full Length',
        duration: t.duration || 60,
        totalMarks: t.totalMarks || 100,
        negativeMarks: t.negativeMarks ?? 0.25,
        difficulty: t.difficulty || 'Moderate',
        isPremium: Boolean(t.isPremium),
        subjectName: t.subjectName || 'Full Syllabus',
        questionCount: t.questionCount || 20,
        attemptCount: t.attemptCount || 0,
      });
    });

    const subjects = (exam.subjects || []).map((subName: string, idx: number) => ({
      id: `sub-${idx + 1}`,
      name: subName,
      questionCount: 20,
      topics: ['Concept Drills', 'Previous Year Questions', 'Mock Practice'],
    }));

    return json({
      exam: {
        id: exam.id,
        name: exam.name,
        slug: exam.slug,
        category: exam.category,
        difficulty: exam.difficulty,
        description: exam.description,
        questionCount: exam.questionCount || 20,
        subjects,
        testsGrouped: grouped,
      },
    });
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
    const test = findTest(testId);
    const attemptId = `att_${test.id}_${Date.now()}`;
    return json({
      success: true,
      attemptId,
      test: {
        id: test.id,
        title: test.title,
        duration: test.duration || 60,
        totalMarks: test.totalMarks || 100,
        negativeMarks: test.negativeMarks ?? 0.25,
        difficulty: test.difficulty || 'Moderate',
        questionCount: test.questionCount || 20,
      },
      message: 'Official attempt session initialized.'
    });
  }

  // 2c. /api/tests/:id
  if (pathname.startsWith('/api/tests/')) {
    const testId = pathname.replace('/api/tests/', '');
    const found = findTest(testId);
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
    const wrongQs = (dbData.questions || []).slice(0, 8).map((q: any, idx: number) => {
      const correctOpt = q.options?.find((o: any) => o.isCorrect) || q.options?.[0];
      const wrongOpt = q.options?.find((o: any) => !o.isCorrect) || q.options?.[1] || correctOpt;
      return {
        questionId: q.id,
        questionText: q.questionText,
        difficulty: q.difficulty || 'Moderate',
        marks: q.marks || 1,
        negativeMarks: q.negativeMarks || 0.25,
        explanation: q.explanation || 'Detailed concept revision required.',
        shortcut: q.shortcut || null,
        subjectName: q.subject?.name || 'General',
        topicName: q.topic?.name || 'High Yield Topics',
        examName: 'SBI PO / SSC CGL',
        correctOptionKey: correctOpt?.optionKey || 'A',
        correctOptionText: correctOpt?.optionText || '',
        lastChosenOption: wrongOpt?.optionKey || 'B',
        missCount: (idx % 3) + 1,
        lastAttemptDate: new Date(Date.now() - ((idx + 1) * 86400000)).toISOString(),
        lastTestTitle: 'All-India Prelims Live Mock',
        options: (q.options || []).map((o: any) => ({
          optionKey: o.optionKey,
          optionText: o.optionText,
          isCorrect: Boolean(o.isCorrect),
        })),
      };
    });
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
      summary: {
        testsAttempted: 1,
        avgScore: 78.5,
        bestScore: 88.0,
        avgAccuracy: 84.5,
        streak: 1,
      },
      trendData: [
        { index: 1, date: 'Prev', title: 'Diagnostic Drill', score: 72, accuracy: 80, percentage: 72 },
        { index: 2, date: 'Recent', title: 'Speed Test', score: 78.5, accuracy: 84.5, percentage: 78.5 },
      ],
      weakSubjects: [
        { subject: 'Quantitative Aptitude', accuracy: 56.4, totalQuestions: 25 },
        { subject: 'Reasoning Ability', accuracy: 62.0, totalQuestions: 30 },
      ],
      recommendations: [
        {
          title: 'Focus Drill: Quantitative Aptitude',
          reason: 'Your accuracy is currently 56.4% across 25 attempted questions.',
          action: 'Practice Topics',
          link: '/practice',
        },
        {
          title: 'Attempt Full-Length Mock Test',
          reason: 'Consistent timed pacing improves retention and sectional cutoffs.',
          action: 'Browse Mock Tests',
          link: '/mock-tests',
        },
        {
          title: 'Speed Drill: Reasoning Ability',
          reason: 'Puzzles and syllogisms benefit from 20-minute timed sectional drills.',
          action: 'Sectional Tests',
          link: '/mock-tests?tab=Sectional',
        },
      ],
      recentTests: [
        {
          attemptId: 'att_de94ec9c-7468-42bd-8206-20edf41c9295_recent',
          testId: 'de94ec9c-7468-42bd-8206-20edf41c9295',
          title: 'SBI PO Prelims Full Mock 1',
          examName: 'SBI PO',
          score: 78.5,
          totalMarks: 100,
          percentage: 78.5,
          accuracy: 84.5,
          status: 'COMPLETED',
          submittedAt: new Date().toISOString(),
        },
      ],
      activeAttempt: null,
    });
  }

  // 8. /api/bookmarks
  if (pathname === '/api/bookmarks' && method === 'GET') {
    const sampleBookmarks = (dbData.questions || []).slice(0, 6).map((q: any, idx: number) => {
      const correctOpt = q.options?.find((o: any) => o.isCorrect) || q.options?.[0];
      return {
        id: `bm-${idx + 1}`,
        questionId: q.id,
        questionText: q.questionText,
        subjectName: q.subject?.name || 'General',
        topicName: q.topic?.name || 'High-Yield Formulae',
        examName: 'SBI PO / SSC CGL',
        difficulty: q.difficulty || 'Moderate',
        explanation: q.explanation || 'Key conceptual checkpoint for speed and accuracy.',
        correctOptionKey: correctOpt?.optionKey || 'A',
        correctOptionText: correctOpt?.optionText || '',
        createdAt: new Date(Date.now() - (idx * 3600000)).toISOString(),
        options: (q.options || []).map((o: any) => ({
          optionKey: o.optionKey,
          optionText: o.optionText,
          isCorrect: Boolean(o.isCorrect),
        })),
      };
    });
    return json({ bookmarks: sampleBookmarks });
  }

  if (pathname === '/api/bookmarks' && method === 'POST') {
    let body: any = {};
    try { body = await request.json(); } catch {}
    return json({ success: true, bookmarked: true, questionId: body.questionId });
  }

  if (pathname.startsWith('/api/bookmarks/') && method === 'DELETE') {
    const id = pathname.replace('/api/bookmarks/', '');
    return json({ success: true, id, removed: true });
  }

  // 9. /api/reports
  if (pathname === '/api/reports' && method === 'POST') {
    return json({ success: true, message: 'Report submitted successfully.' });
  }

  // 10. /api/attempts archive
  if (pathname === '/api/attempts' && method === 'GET') {
    return json({
      attempts: [
        {
          id: 'att_de94ec9c-7468-42bd-8206-20edf41c9295_sample',
          testId: 'de94ec9c-7468-42bd-8206-20edf41c9295',
          testTitle: 'SBI PO Prelims Full Mock 1',
          examName: 'SBI PO',
          subjectName: 'Full Syllabus',
          status: 'COMPLETED',
          score: 78.5,
          totalMarks: 100,
          percentage: 78.5,
          accuracy: 84.5,
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          submittedAt: new Date().toISOString(),
          durationMinutes: 60,
          timeTaken: 1845,
        },
      ],
    });
  }

  // 10b. /api/attempts/:id/answer
  if (pathname.match(/^\/api\/attempts\/[^/]+\/answer$/) && method === 'POST') {
    return json({ success: true, message: 'Response recorded' });
  }

  // 10c. /api/attempts/:id/submit
  if (pathname.match(/^\/api\/attempts\/[^/]+\/submit$/) && method === 'POST') {
    const attemptId = pathname.split('/')[3];
    const testId = parseTestIdFromAttempt(attemptId);
    const test = findTest(testId);
    const rawQuestions = getQuestionsForTest(testId);

    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    const submittedAnswers: Array<{ questionId: string; selectedOption: string | null; timeSpent?: number; isMarked?: boolean }> =
      body.answers || [];
    const timeTaken = body.timeTaken || 1200;

    const answerMap = new Map<string, { selectedOption: string | null; timeSpent: number; isMarked: boolean }>();
    submittedAnswers.forEach((ans) => {
      answerMap.set(ans.questionId, {
        selectedOption: ans.selectedOption,
        timeSpent: ans.timeSpent || 0,
        isMarked: Boolean(ans.isMarked),
      });
    });

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let totalScore = 0;

    const sectionBreakdown: Record<string, any> = {};

    const evaluatedQuestions = rawQuestions.map((q: any, idx: number) => {
      const qId = q.id || q.questionId || `q-${idx + 1}`;
      const userAns = answerMap.get(qId);
      const selectedOpt = userAns?.selectedOption || null;

      const correctOptObj = q.options?.find((o: any) => o.isCorrect) || q.options?.[0];
      const correctKey = correctOptObj?.optionKey || 'A';
      const correctText = correctOptObj?.optionText || '';

      const subName = q.subjectName || q.subject?.name || test?.subjectName || 'General';
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

      const m = q.marks || 1;
      const nm = q.negativeMarks ?? (test?.negativeMarks ?? 0.25);
      const qTimeSpent = userAns?.timeSpent || 25;
      sectionBreakdown[subName].timeSpent += qTimeSpent;

      let status: 'CORRECT' | 'WRONG' | 'UNANSWERED' = 'UNANSWERED';
      let isCorrect: boolean | null = null;

      if (!selectedOpt) {
        unansweredCount++;
        sectionBreakdown[subName].unanswered++;
      } else if (selectedOpt === correctKey) {
        correctCount++;
        status = 'CORRECT';
        isCorrect = true;
        totalScore += m;
        sectionBreakdown[subName].correct++;
        sectionBreakdown[subName].score += m;
      } else {
        wrongCount++;
        status = 'WRONG';
        isCorrect = false;
        totalScore -= nm;
        sectionBreakdown[subName].wrong++;
        sectionBreakdown[subName].score -= nm;
      }

      return {
        questionId: qId,
        index: idx + 1,
        questionText: q.questionText,
        subjectName: subName,
        topicName: q.topicName || q.topic?.name || 'General',
        difficulty: q.difficulty || 'Moderate',
        marks: m,
        negativeMarks: nm,
        selectedOption: selectedOpt,
        correctOptionKey: correctKey,
        correctOptionText: correctText,
        isCorrect,
        status,
        explanation: q.explanation || 'Review concepts thoroughly for conceptual clarity.',
        shortcut: q.shortcut || null,
        timeSpent: qTimeSpent,
        isMarked: Boolean(userAns?.isMarked),
        isBookmarked: false,
        options: q.options || [],
      };
    });

    const attemptedTotal = correctCount + wrongCount;
    const accuracy = attemptedTotal > 0 ? Math.round((correctCount / attemptedTotal) * 100) : 0;
    const finalScore = Math.max(0, Math.round(totalScore * 100) / 100);
    const totalMarks = test?.totalMarks || rawQuestions.length;
    const percentage = Math.round((finalScore / totalMarks) * 100);
    const percentile = Math.min(99.4, Math.max(45, Math.round((percentage * 1.05) * 10) / 10));

    Object.values(sectionBreakdown).forEach((sec: any) => {
      const secAttempted = sec.correct + sec.wrong;
      sec.accuracy = secAttempted > 0 ? Math.round((sec.correct / secAttempted) * 100) : 0;
      sec.score = Math.round(sec.score * 100) / 100;
    });

    const fullResult = {
      result: {
        attemptId,
        testId: test?.id || testId,
        testTitle: test?.title || 'Mock Examination',
        examName: test?.examName || 'Competitive Exam',
        examSlug: test?.examSlug || 'sbi-po',
        subjectName: test?.subjectName || 'Full Syllabus',
        durationMinutes: test?.duration || 60,
        totalMarks,
        negativeMarks: test?.negativeMarks ?? 0.25,
        startedAt: new Date(Date.now() - (timeTaken * 1000)).toISOString(),
        submittedAt: new Date().toISOString(),
        timeTaken,
        score: finalScore,
        percentage,
        accuracy,
        correctCount,
        wrongCount,
        unansweredCount,
        totalQuestions: rawQuestions.length,
        rank: Math.max(1, Math.floor((100 - percentile) * 15)),
        percentile,
        totalTakers: 1420,
        highestScore: Math.round(totalMarks * 0.94),
        avgScore: Math.round(totalMarks * 0.58),
      },
      subjectAnalysis: Object.values(sectionBreakdown),
      questions: evaluatedQuestions,
    };

    return json({
      success: true,
      attemptId,
      status: 'COMPLETED',
      result: fullResult,
    });
  }

  // 10d. /api/attempts/:id
  if (pathname.startsWith('/api/attempts/')) {
    const attemptId = pathname.replace('/api/attempts/', '');
    const testId = parseTestIdFromAttempt(attemptId);
    const test = findTest(testId);
    const rawQuestions = getQuestionsForTest(testId);

    const qList = rawQuestions.map((q: any, idx: number) => ({
      questionId: q.id || q.questionId || `q-${idx + 1}`,
      order: q.order || idx + 1,
      questionText: q.questionText,
      questionType: q.questionType || 'MCQ',
      difficulty: q.difficulty || 'Moderate',
      marks: q.marks || 1,
      negativeMarks: q.negativeMarks ?? (test?.negativeMarks ?? 0.25),
      subjectName: q.subjectName || q.subject?.name || test?.subjectName || 'General',
      topicName: q.topicName || q.topic?.name || 'General',
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

    const dur = test?.duration || 60;
    return json({
      success: true,
      attempt: {
        id: attemptId,
        testId: test?.id || testId,
        testTitle: test?.title || 'Mock Examination',
        examName: test?.examName || 'Competitive Exam',
        subjectName: test?.subjectName || 'Full Syllabus',
        durationMinutes: dur,
        totalDurationSeconds: dur * 60,
        remainingSeconds: dur * 60,
        elapsedSeconds: 0,
        status: 'IN_PROGRESS',
        startedAt: new Date().toISOString(),
        negativeMarks: test?.negativeMarks ?? 0.25,
        totalMarks: test?.totalMarks || 100,
        isPracticeMode: test?.testType === 'Practice',
      },
      questions: qList,
    });
  }

  // 11. /api/results/:id
  if (pathname.startsWith('/api/results/')) {
    const attemptId = pathname.replace('/api/results/', '');
    const testId = parseTestIdFromAttempt(attemptId);
    const test = findTest(testId);
    const rawQuestions = getQuestionsForTest(testId);

    const qList = rawQuestions.map((q: any, idx: number) => {
      const correctOptObj = q.options?.find((o: any) => o.isCorrect) || q.options?.[0];
      const correctKey = correctOptObj?.optionKey || 'A';
      const isCorrect = idx % 2 === 0; // Realistic default preview if loaded directly
      const selectedKey = isCorrect ? correctKey : (correctKey === 'A' ? 'B' : 'A');
      return {
        questionId: q.id || q.questionId || `q-${idx + 1}`,
        index: idx + 1,
        questionText: q.questionText,
        subjectName: q.subjectName || q.subject?.name || test?.subjectName || 'General',
        topicName: q.topicName || q.topic?.name || 'General',
        difficulty: q.difficulty || 'Moderate',
        marks: q.marks || 1,
        negativeMarks: q.negativeMarks ?? (test?.negativeMarks ?? 0.25),
        selectedOption: selectedKey,
        correctOptionKey: correctKey,
        correctOptionText: correctOptObj?.optionText || '',
        isCorrect,
        status: isCorrect ? 'CORRECT' : 'WRONG',
        explanation: q.explanation || 'Detailed concept revision required.',
        shortcut: q.shortcut || null,
        timeSpent: 30,
        isMarked: false,
        isBookmarked: false,
        options: q.options || [],
      };
    });

    const correctCount = qList.filter((q: any) => q.status === 'CORRECT').length;
    const wrongCount = qList.filter((q: any) => q.status === 'WRONG').length;
    const unansweredCount = 0;
    const score = Math.max(0, Math.round((correctCount * 1 - wrongCount * (test?.negativeMarks ?? 0.25)) * 100) / 100);
    const accuracy = Math.round((correctCount / qList.length) * 100);
    const totalMarks = test?.totalMarks || qList.length;

    return json({
      result: {
        attemptId,
        testId: test?.id || testId,
        testTitle: test?.title || 'Mock Examination',
        examName: test?.examName || 'Competitive Exam',
        examSlug: test?.examSlug || 'sbi-po',
        subjectName: test?.subjectName || 'Full Syllabus',
        durationMinutes: test?.duration || 60,
        totalMarks,
        negativeMarks: test?.negativeMarks ?? 0.25,
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        submittedAt: new Date().toISOString(),
        timeTaken: 1845,
        score,
        percentage: Math.round((score / totalMarks) * 100),
        accuracy,
        correctCount,
        wrongCount,
        unansweredCount,
        totalQuestions: qList.length,
        rank: 18,
        percentile: 94.2,
        totalTakers: 1420,
        highestScore: Math.round(totalMarks * 0.94),
        avgScore: Math.round(totalMarks * 0.58),
      },
      subjectAnalysis: [
        { subjectName: test?.subjectName || 'Full Syllabus', totalQuestions: qList.length, correct: correctCount, wrong: wrongCount, unanswered: 0, score, timeSpent: 1845, accuracy },
      ],
      questions: qList,
    });
  }

  // 12. /api/gemini/personas & /api/gemini/chat
  if (pathname === '/api/gemini/personas') {
    return json({
      personas: [
        { id: 'exam-mentor', name: 'Exam Mentor', description: 'Holistic strategy, timetables & section management' },
        { id: 'quant-reasoning', name: 'Quant & Reasoning Master', description: 'Step-by-step proofs + 20-second shortcut tricks' },
        { id: 'quick-doubts', name: 'Lightning Doubts', description: 'Rapid formula verification & quick answers' },
        { id: 'question-explainer', name: 'Question Dissector', description: 'Option trap analysis & deep-dive solutions' },
      ],
      models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
    });
  }

  if (pathname === '/api/gemini/chat' && method === 'POST') {
    let body: any = {};
    try { body = await request.json(); } catch {}
    const messages = body.messages || [];
    const model = body.model || 'gemini-2.5-flash';
    const persona = body.persona || 'exam-mentor';
    const lastUserMsg = messages[messages.length - 1]?.content || 'Exam preparation strategy';

    const apiKey = (context.env as any)?.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: messages.map((m: any) => ({
              role: m.role === 'model' ? 'model' : 'user',
              parts: [{ text: m.content }],
            })),
          }),
        });
        if (geminiRes.ok) {
          const geminiData: any = await geminiRes.json();
          const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return json({
              success: true,
              reply: replyText,
              modelUsed: model,
            });
          }
        }
      } catch (err) {
        console.warn('Edge Gemini API call error:', err);
      }
    }

    const fallbackReply = generatePedagogicalFallback(lastUserMsg, persona);
    return json({
      success: true,
      reply: fallbackReply,
      modelUsed: `${model}-mentor-engine`,
    });
  }

  // 13. Fallback 404 for unhandled API endpoints
  return new Response(
    JSON.stringify({ error: 'Endpoint not implemented at edge; falling back to client router.' }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    }
  );
}
