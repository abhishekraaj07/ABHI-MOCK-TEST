import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest, authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// GET /api/tests - full test library with server-side filtering
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      tab,
      search,
      exam,
      subject,
      difficulty,
      type,
      premium,
    } = req.query;

    const where: any = { isPublished: true };

    // Tab filter
    if (tab === 'Full Tests') {
      where.testType = 'Full Length';
    } else if (tab === 'Sectional') {
      where.testType = 'Sectional';
    } else if (tab === 'Free') {
      where.isPremium = false;
    } else if (tab === 'Premium') {
      where.isPremium = true;
    } else if (tab === 'Practice') {
      where.testType = 'Practice';
    }

    // Specific type override
    if (type && typeof type === 'string' && type !== 'All') {
      where.testType = type;
    }

    // Difficulty filter
    if (difficulty && typeof difficulty === 'string' && difficulty !== 'All') {
      where.difficulty = difficulty;
    }

    // Premium filter
    if (premium !== undefined && premium !== 'All') {
      where.isPremium = premium === 'true';
    }

    // Exam filter
    if (exam && typeof exam === 'string' && exam !== 'All') {
      where.OR = [
        { examId: exam },
        { exam: { slug: exam } },
      ];
    }

    // Subject filter
    if (subject && typeof subject === 'string' && subject !== 'All') {
      where.subjectId = subject;
    }

    // Search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.AND = [
        {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { exam: { name: { contains: q } } },
          ],
        },
      ];
    }

    const tests = await prisma.test.findMany({
      where,
      include: {
        exam: { select: { id: true, name: true, slug: true } },
        subject: { select: { id: true, name: true } },
        _count: {
          select: {
            testQuestions: true,
            attempts: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { title: 'asc' }],
    });

    const formatted = tests.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      examId: t.examId,
      examName: t.exam.name,
      examSlug: t.exam.slug,
      subjectId: t.subjectId,
      subjectName: t.subject?.name || 'Full Syllabus',
      testType: t.testType,
      duration: t.duration,
      totalMarks: t.totalMarks,
      negativeMarks: t.negativeMarks,
      difficulty: t.difficulty,
      isPremium: t.isPremium,
      questionCount: t._count.testQuestions,
      attemptCount: t._count.attempts,
    }));

    return res.json({ tests: formatted });
  } catch (error) {
    console.error('Error fetching tests:', error);
    return res.status(500).json({ error: 'Failed to retrieve test library.' });
  }
});

// GET /api/tests/:id - pre-test instructions & metadata (§7)
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const test = await prisma.test.findUnique({
      where: { id },
      include: {
        exam: { select: { id: true, name: true, slug: true } },
        subject: { select: { id: true, name: true } },
        _count: {
          select: {
            testQuestions: true,
            attempts: true,
          },
        },
      },
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found.' });
    }

    // Check if current user has an ongoing attempt
    let activeAttemptId: string | null = null;
    if (req.user) {
      const inProgress = await prisma.attempt.findFirst({
        where: {
          userId: req.user.id,
          testId: test.id,
          status: 'IN_PROGRESS',
        },
        select: { id: true },
      });
      if (inProgress) {
        activeAttemptId = inProgress.id;
      }
    }

    return res.json({
      test: {
        id: test.id,
        title: test.title,
        description: test.description,
        examId: test.examId,
        examName: test.exam.name,
        subjectId: test.subjectId,
        subjectName: test.subject?.name || 'Full Syllabus',
        testType: test.testType,
        duration: test.duration,
        totalMarks: test.totalMarks,
        negativeMarks: test.negativeMarks,
        difficulty: test.difficulty,
        isPremium: test.isPremium,
        questionCount: test._count.testQuestions,
        language: 'English',
        activeAttemptId,
        instructions: [
          `The examination comprises ${test._count.testQuestions} questions worth a total of ${test.totalMarks} marks.`,
          `Total duration is strictly ${test.duration} minutes. The countdown timer on the top-right displays the remaining time.`,
          `Each correct response is awarded ${(test.totalMarks / (test._count.testQuestions || 1)).toFixed(2)} marks.`,
          `Negative marking of ${test.negativeMarks} marks will be deducted for each incorrect answer. Unanswered questions attract 0 marks.`,
          `You can navigate between questions using the Question Palette on the left or the Next / Previous buttons.`,
          `Use "Mark for Review" to flag questions you want to re-evaluate before final submission.`,
          `When the timer reaches zero, the test will automatically submit with your saved responses.`,
        ],
      },
    });
  } catch (error) {
    console.error('Error fetching test instructions:', error);
    return res.status(500).json({ error: 'Failed to retrieve test details.' });
  }
});

// POST /api/tests/:id/start - initiate or resume an attempt
router.post('/:id/start', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const test = await prisma.test.findUnique({
      where: { id },
      include: {
        testQuestions: {
          include: { question: true },
          orderBy: { questionOrder: 'asc' },
        },
      },
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found.' });
    }

    if (!test.isPublished) {
      return res.status(403).json({ error: 'This test is currently unpublished.' });
    }

    // Resume existing in-progress attempt if exists
    const existingAttempt = await prisma.attempt.findFirst({
      where: {
        userId,
        testId: test.id,
        status: 'IN_PROGRESS',
      },
    });

    if (existingAttempt) {
      return res.json({
        attemptId: existingAttempt.id,
        resumed: true,
        message: 'Resuming existing in-progress attempt.',
      });
    }

    // Create new attempt atomically in a database transaction (§Phase 11)
    const attempt = await prisma.$transaction(async (tx) => {
      const newAttempt = await tx.attempt.create({
        data: {
          userId,
          testId: test.id,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          score: 0,
          percentage: 0,
          accuracy: 0,
          correctCount: 0,
          wrongCount: 0,
          unansweredCount: test.testQuestions.length,
        },
      });

      // Pre-create blank attempt answers
      if (test.testQuestions.length > 0) {
        const answerData = test.testQuestions.map((tq) => ({
          attemptId: newAttempt.id,
          questionId: tq.questionId,
          selectedOption: null,
          isCorrect: null,
          marksObtained: 0,
          timeSpent: 0,
          isMarked: false,
        }));

        await tx.attemptAnswer.createMany({
          data: answerData,
        });
      }

      return newAttempt;
    });

    return res.json({
      success: true,
      attemptId: attempt.id,
      resumed: false,
      message: 'New test attempt initialized successfully.',
    });
  } catch (error) {
    console.error('Error starting test:', error);
    return res.status(500).json({ error: 'Failed to start test attempt.' });
  }
});

export function clampQuestionCount(count: any): number {
  return Math.min(50, Math.max(5, parseInt(String(count), 10) || 10));
}

export function clampDuration(duration: any): number {
  return Math.min(180, Math.max(5, parseInt(String(duration), 10) || 15));
}

// POST /api/tests/custom - Generate custom test from real question bank (§Feature 12)
router.post('/custom', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      examId,
      subjectId,
      topicId,
      difficulty,
      questionCount = 10,
      duration = 15,
      title,
    } = req.body;

    if (!examId) {
      return res.status(400).json({ error: 'Target examination is required.' });
    }

    const exam = await prisma.exam.findFirst({
      where: { OR: [{ id: examId }, { slug: examId }] },
    });

    if (!exam) {
      return res.status(404).json({ error: 'Selected examination not found.' });
    }

    const count = clampQuestionCount(questionCount);
    const durationMinutes = clampDuration(duration);

    // Build question criteria
    const where: any = { examId: exam.id };
    if (subjectId && subjectId !== 'All') where.subjectId = subjectId;
    if (topicId && topicId !== 'All') where.topicId = topicId;
    if (difficulty && difficulty !== 'All') where.difficulty = difficulty;

    const availableQuestions = await prisma.question.findMany({
      where,
      select: { id: true, marks: true },
      take: 100, // sample pool
    });

    if (availableQuestions.length < 3) {
      return res.status(400).json({
        error: `Only ${availableQuestions.length} question(s) found matching criteria. Minimum 3 questions required. Try widening your filters.`,
      });
    }

    // Shuffle and pick requested count
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    const totalMarks = selected.reduce((sum, q) => sum + (q.marks || 1.0), 0);

    const testTitle =
      title && typeof title === 'string' && title.trim()
        ? title.trim()
        : `Custom Practice Sprint — ${exam.name}`;

    // Create test in database
    const customTest = await prisma.test.create({
      data: {
        examId: exam.id,
        subjectId: subjectId && subjectId !== 'All' ? subjectId : null,
        title: testTitle,
        description: `Custom-generated practice sprint with ${selected.length} questions across ${exam.name}.`,
        testType: 'Custom',
        duration: durationMinutes,
        totalMarks,
        negativeMarks: 0.25,
        difficulty: difficulty && difficulty !== 'All' ? difficulty : 'Moderate',
        isPremium: false,
        isPublished: true,
        testQuestions: {
          create: selected.map((q, idx) => ({
            questionId: q.id,
            questionOrder: idx + 1,
          })),
        },
      },
    });

    return res.status(201).json({
      success: true,
      testId: customTest.id,
      title: customTest.title,
      questionCount: selected.length,
      duration: customTest.duration,
      message: 'Custom test generated successfully from question bank.',
    });
  } catch (error) {
    console.error('Custom test generation error:', error);
    return res.status(500).json({ error: 'Failed to create custom test.' });
  }
});

export default router;
