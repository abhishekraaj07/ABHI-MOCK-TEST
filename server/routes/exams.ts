import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

// GET /api/exams
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, difficulty } = req.query;

    const where: any = { isActive: true };

    if (category && typeof category === 'string' && category !== 'All') {
      where.category = category;
    }

    if (difficulty && typeof difficulty === 'string' && difficulty !== 'All') {
      where.difficulty = difficulty;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      where.OR = [
        { name: { contains: search.trim() } },
        { description: { contains: search.trim() } },
      ];
    }

    const [exams, totalExamsCount, totalTestsCount, totalQuestionsCount] = await Promise.all([
      prisma.exam.findMany({
        where,
        include: {
          subjects: { select: { id: true, name: true } },
          tests: {
            where: { isPublished: true },
            select: { id: true, isPremium: true, testType: true },
          },
          _count: {
            select: {
              tests: { where: { isPublished: true } },
              questions: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.exam.count({ where: { isActive: true } }),
      prisma.test.count({ where: { isPublished: true } }),
      prisma.question.count(),
    ]);

    const formatted = exams.map((ex) => ({
      id: ex.id,
      name: ex.name,
      slug: ex.slug,
      category: ex.category,
      difficulty: ex.difficulty,
      description: ex.description,
      subjects: ex.subjects.map((s) => s.name),
      testCount: ex._count.tests,
      questionCount: ex._count.questions,
    }));

    return res.json({
      exams: formatted,
      stats: {
        totalExams: totalExamsCount,
        totalTests: totalTestsCount,
        totalQuestions: totalQuestionsCount,
        availabilityRate: '99.98%',
      },
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    return res.status(500).json({ error: 'Failed to load exams list.' });
  }
});

// GET /api/exams/:id (accepts id or slug)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const exam = await prisma.exam.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        subjects: {
          include: {
            topics: { select: { id: true, name: true } },
            _count: { select: { questions: true } },
          },
        },
        tests: {
          where: { isPublished: true },
          include: {
            subject: { select: { id: true, name: true } },
            _count: { select: { testQuestions: true, attempts: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { questions: true } },
      },
    });

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found.' });
    }

    // Group tests by type
    const grouped: Record<string, any[]> = {
      'Full Length': [],
      'Sectional': [],
      'Practice': [],
      'Previous Year': [],
    };

    exam.tests.forEach((t) => {
      const typeKey = t.testType in grouped ? t.testType : 'Full Length';
      grouped[typeKey].push({
        id: t.id,
        title: t.title,
        description: t.description,
        testType: t.testType,
        duration: t.duration,
        totalMarks: t.totalMarks,
        negativeMarks: t.negativeMarks,
        difficulty: t.difficulty,
        isPremium: t.isPremium,
        subjectName: t.subject?.name || 'Full Syllabus',
        questionCount: t._count.testQuestions,
        attemptCount: t._count.attempts,
      });
    });

    return res.json({
      exam: {
        id: exam.id,
        name: exam.name,
        slug: exam.slug,
        category: exam.category,
        difficulty: exam.difficulty,
        description: exam.description,
        questionCount: exam._count.questions,
        subjects: exam.subjects.map((s) => ({
          id: s.id,
          name: s.name,
          questionCount: s._count.questions,
          topics: s.topics.map((tp) => tp.name),
        })),
        testsGrouped: grouped,
      },
    });
  } catch (error) {
    console.error('Error fetching exam details:', error);
    return res.status(500).json({ error: 'Failed to retrieve exam details.' });
  }
});

export default router;
