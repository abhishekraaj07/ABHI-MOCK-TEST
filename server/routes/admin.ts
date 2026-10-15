import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest, authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Enforce ADMIN role on all admin routes
router.use(authenticate);
router.use(requireAdmin);

async function logAdminAction(
  req: AuthRequest,
  action: string,
  targetType: string,
  targetId?: string | null,
  metadata?: any
) {
  try {
    const adminUserId = req.user?.id;
    if (!adminUserId) return;
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
    const userAgent = (req.headers['user-agent'] as string) || null;

    await prisma.adminAuditLog.create({
      data: {
        adminUserId,
        action,
        targetType,
        targetId: targetId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress: typeof ipAddress === 'string' ? ipAddress.slice(0, 100) : null,
        userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 255) : null,
      },
    });
  } catch (err) {
    console.error('Failed to write admin audit log:', err);
  }
}

// GET /api/admin/audit-logs - audit history
router.get('/audit-logs', async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 25));
    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      prisma.adminAuditLog.count(),
      prisma.adminAuditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return res.json({
      success: true,
      logs: logs.map((l) => ({
        id: l.id,
        adminUserId: l.adminUserId,
        adminName: l.admin?.name || 'System',
        adminEmail: l.admin?.email || 'unknown',
        action: l.action,
        targetType: l.targetType,
        targetId: l.targetId,
        metadata: l.metadata ? JSON.parse(l.metadata) : null,
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
        createdAt: l.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin audit logs:', error);
    return res.status(500).json({ error: 'Failed to retrieve admin audit logs.' });
  }
});

// GET /api/admin/stats - overall metrics (§14)
router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const [
      usersCount,
      examsCount,
      testsCount,
      questionsCount,
      attemptsCount,
      recentAttempts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.exam.count(),
      prisma.test.count(),
      prisma.question.count(),
      prisma.attempt.count(),
      prisma.attempt.findMany({
        take: 8,
        orderBy: { startedAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          test: { select: { title: true, exam: { select: { name: true } } } },
        },
      }),
    ]);

    // Exam-wise attempt distribution
    const exams = await prisma.exam.findMany({
      include: {
        tests: {
          include: {
            _count: { select: { attempts: true } },
          },
        },
      },
    });

    const examAttemptsData = exams.map((ex) => {
      const attemptsForExam = ex.tests.reduce((sum, t) => sum + t._count.attempts, 0);
      return {
        name: ex.name,
        attempts: attemptsForExam,
      };
    });

    return res.json({
      metrics: {
        usersCount,
        examsCount,
        testsCount,
        questionsCount,
        attemptsCount,
      },
      recentAttempts: recentAttempts.map((a) => ({
        id: a.id,
        userName: a.user.name,
        userEmail: a.user.email,
        testTitle: a.test.title,
        examName: a.test.exam.name,
        status: a.status,
        score: a.score,
        startedAt: a.startedAt,
      })),
      examAttemptsData,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: 'Failed to retrieve admin stats.' });
  }
});

// --- USERS MANAGEMENT (§14) ---
// GET /api/admin/users
router.get('/users', async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { attempts: true, bookmarks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      attemptsCount: u._count.attempts,
      bookmarksCount: u._count.bookmarks,
    }));

    return res.json({ users: formatted });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load users list.' });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (role !== 'USER' && role !== 'ADMIN') {
      return res.status(400).json({ error: 'Invalid role. Must be USER or ADMIN.' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, updatedAt: true },
    });

    await logAdminAction(req, 'UPDATE_USER_ROLE', 'User', id, {
      oldRole: targetUser.role,
      newRole: role,
      targetEmail: targetUser.email,
    });

    return res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Failed to update user role.' });
  }
});

// --- EXAMS CRUD ---
// GET /api/admin/exams
router.get('/exams', async (_req: AuthRequest, res: Response) => {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        subjects: { select: { id: true, name: true } },
        _count: { select: { tests: true, questions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ exams });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load exams.' });
  }
});

// POST /api/admin/exams
router.post('/exams', async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, description, category, difficulty, isActive } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Exam name and slug are required.' });
    }

    const created = await prisma.exam.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: description || '',
        category: category || 'Banking',
        difficulty: difficulty || 'Moderate',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await logAdminAction(req, 'CREATE_EXAM', 'Exam', created.id, { name: created.name, slug: created.slug });

    return res.status(201).json({ exam: created });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'An exam with this slug already exists.' });
    }
    return res.status(500).json({ error: 'Failed to create exam.' });
  }
});

// PUT /api/admin/exams/:id
router.put('/exams/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, category, difficulty, isActive } = req.body;

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        name,
        slug: slug ? slug.trim().toLowerCase().replace(/\s+/g, '-') : undefined,
        description,
        category,
        difficulty,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    await logAdminAction(req, 'UPDATE_EXAM', 'Exam', updated.id, { name: updated.name, slug: updated.slug });

    return res.json({ exam: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update exam.' });
  }
});

// DELETE /api/admin/exams/:id
router.delete('/exams/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.exam.findUnique({ where: { id }, select: { name: true } });
    await prisma.exam.delete({ where: { id } });

    await logAdminAction(req, 'DELETE_EXAM', 'Exam', id, { name: existing?.name });

    return res.json({ success: true, message: 'Exam deleted.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete exam.' });
  }
});

// --- SUBJECTS CRUD ---
// GET /api/admin/subjects
router.get('/subjects', async (req: AuthRequest, res: Response) => {
  try {
    const { examId } = req.query;
    const where: any = {};
    if (examId) where.examId = String(examId);

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        exam: { select: { id: true, name: true } },
        _count: { select: { topics: true, questions: true } },
      },
      orderBy: { name: 'asc' },
    });
    return res.json({ subjects });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load subjects.' });
  }
});

// POST /api/admin/subjects
router.post('/subjects', async (req: AuthRequest, res: Response) => {
  try {
    const { name, examId, description } = req.body;
    if (!name || !examId) {
      return res.status(400).json({ error: 'Subject name and exam ID are required.' });
    }

    const created = await prisma.subject.create({
      data: {
        name: name.trim(),
        examId,
        description: description || '',
      },
    });

    await logAdminAction(req, 'CREATE_SUBJECT', 'Subject', created.id, { name: created.name });

    return res.status(201).json({ subject: created });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create subject.' });
  }
});

// DELETE /api/admin/subjects/:id
router.delete('/subjects/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.subject.findUnique({ where: { id }, select: { name: true } });
    await prisma.subject.delete({ where: { id } });

    await logAdminAction(req, 'DELETE_SUBJECT', 'Subject', id, { name: existing?.name });

    return res.json({ success: true, message: 'Subject deleted.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete subject.' });
  }
});

// --- TOPICS CRUD ---
// GET /api/admin/topics
router.get('/topics', async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId } = req.query;
    const where: any = {};
    if (subjectId) where.subjectId = String(subjectId);

    const topics = await prisma.topic.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, exam: { select: { name: true } } } },
        _count: { select: { questions: true } },
      },
      orderBy: { name: 'asc' },
    });
    return res.json({ topics });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load topics.' });
  }
});

// POST /api/admin/topics
router.post('/topics', async (req: AuthRequest, res: Response) => {
  try {
    const { name, subjectId, description } = req.body;
    if (!name || !subjectId) {
      return res.status(400).json({ error: 'Topic name and subject ID are required.' });
    }

    const created = await prisma.topic.create({
      data: {
        name: name.trim(),
        subjectId,
        description: description || '',
      },
    });

    await logAdminAction(req, 'CREATE_TOPIC', 'Topic', created.id, { name: created.name });

    return res.status(201).json({ topic: created });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create topic.' });
  }
});

// DELETE /api/admin/topics/:id
router.delete('/topics/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.topic.findUnique({ where: { id }, select: { name: true } });
    await prisma.topic.delete({ where: { id } });

    await logAdminAction(req, 'DELETE_TOPIC', 'Topic', id, { name: existing?.name });

    return res.json({ success: true, message: 'Topic deleted.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete topic.' });
  }
});

// --- TESTS CRUD (§14) ---
// GET /api/admin/tests
router.get('/tests', async (_req: AuthRequest, res: Response) => {
  try {
    const tests = await prisma.test.findMany({
      include: {
        exam: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        _count: { select: { testQuestions: true, attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ tests });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load tests.' });
  }
});

// POST /api/admin/tests
router.post('/tests', async (req: AuthRequest, res: Response) => {
  try {
    const {
      examId,
      subjectId,
      title,
      description,
      testType,
      duration,
      totalMarks,
      negativeMarks,
      difficulty,
      isPremium,
      isPublished,
      questionIds,
    } = req.body;

    if (!examId || !title || !duration || totalMarks === undefined) {
      return res.status(400).json({ error: 'Exam, title, duration, and total marks are required.' });
    }

    const test = await prisma.test.create({
      data: {
        examId,
        subjectId: subjectId || null,
        title: title.trim(),
        description: description || '',
        testType: testType || 'Full Length',
        duration: Number(duration),
        totalMarks: Number(totalMarks),
        negativeMarks: negativeMarks !== undefined ? Number(negativeMarks) : 0.25,
        difficulty: difficulty || 'Moderate',
        isPremium: Boolean(isPremium),
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      },
    });

    // If question IDs were provided, link them
    if (Array.isArray(questionIds) && questionIds.length > 0) {
      let order = 1;
      for (const qId of questionIds) {
        await prisma.testQuestion.create({
          data: {
            testId: test.id,
            questionId: qId,
            questionOrder: order++,
          },
        });
      }
    }

    await logAdminAction(req, 'CREATE_TEST', 'Test', test.id, { title: test.title });

    return res.status(201).json({ test });
  } catch (error) {
    console.error('Error creating test:', error);
    return res.status(500).json({ error: 'Failed to create test.' });
  }
});

// PUT /api/admin/tests/:id
router.put('/tests/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      examId,
      subjectId,
      title,
      description,
      testType,
      duration,
      totalMarks,
      negativeMarks,
      difficulty,
      isPremium,
      isPublished,
      questionIds,
    } = req.body;

    const updated = await prisma.test.update({
      where: { id },
      data: {
        examId,
        subjectId: subjectId !== undefined ? subjectId : undefined,
        title,
        description,
        testType,
        duration: duration !== undefined ? Number(duration) : undefined,
        totalMarks: totalMarks !== undefined ? Number(totalMarks) : undefined,
        negativeMarks: negativeMarks !== undefined ? Number(negativeMarks) : undefined,
        difficulty,
        isPremium: isPremium !== undefined ? Boolean(isPremium) : undefined,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined,
      },
    });

    if (Array.isArray(questionIds)) {
      await prisma.testQuestion.deleteMany({ where: { testId: id } });
      let order = 1;
      for (const qId of questionIds) {
        await prisma.testQuestion.create({
          data: {
            testId: id,
            questionId: qId,
            questionOrder: order++,
          },
        });
      }
    }

    await logAdminAction(req, 'UPDATE_TEST', 'Test', updated.id, { title: updated.title });

    return res.json({ test: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update test.' });
  }
});

// DELETE /api/admin/tests/:id
router.delete('/tests/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.test.findUnique({ where: { id }, select: { title: true } });
    await prisma.test.delete({ where: { id } });

    await logAdminAction(req, 'DELETE_TEST', 'Test', id, { title: existing?.title });

    return res.json({ success: true, message: 'Test deleted.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete test.' });
  }
});

// --- QUESTIONS CRUD (§14) ---
// GET /api/admin/questions (with search, exam, subject, pagination)
router.get('/questions', async (req: AuthRequest, res: Response) => {
  try {
    const { search, examId, subjectId, difficulty, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (examId && examId !== 'All') where.examId = String(examId);
    if (subjectId && subjectId !== 'All') where.subjectId = String(subjectId);
    if (difficulty && difficulty !== 'All') where.difficulty = String(difficulty);

    if (search && typeof search === 'string' && search.trim() !== '') {
      where.questionText = { contains: search.trim() };
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          exam: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true } },
          topic: { select: { id: true, name: true } },
          options: true,
        },
        orderBy: { id: 'asc' },
        skip,
        take: limitNum,
      }),
      prisma.question.count({ where }),
    ]);

    return res.json({
      questions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error loading questions:', error);
    return res.status(500).json({ error: 'Failed to load questions.' });
  }
});

// POST /api/admin/questions - create question with options
router.post('/questions', async (req: AuthRequest, res: Response) => {
  try {
    const {
      examId,
      subjectId,
      topicId,
      questionText,
      difficulty,
      marks,
      negativeMarks,
      explanation,
      options,
    } = req.body;

    if (!examId || !subjectId || !questionText || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        error: 'Exam, subject, question text, and at least two options are required.',
      });
    }

    const created = await prisma.question.create({
      data: {
        examId,
        subjectId,
        topicId: topicId || null,
        questionText: questionText.trim(),
        difficulty: difficulty || 'Moderate',
        marks: marks !== undefined ? Number(marks) : 1.0,
        negativeMarks: negativeMarks !== undefined ? Number(negativeMarks) : 0.25,
        explanation: explanation || '',
        options: {
          create: options.map((opt: any) => ({
            optionKey: opt.optionKey,
            optionText: opt.optionText,
            isCorrect: Boolean(opt.isCorrect),
          })),
        },
      },
      include: {
        options: true,
        exam: { select: { name: true } },
        subject: { select: { name: true } },
      },
    });

    await logAdminAction(req, 'CREATE_QUESTION', 'Question', created.id);

    return res.status(201).json({ question: created });
  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(500).json({ error: 'Failed to create question.' });
  }
});

// PUT /api/admin/questions/:id
router.put('/questions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      examId,
      subjectId,
      topicId,
      questionText,
      difficulty,
      marks,
      negativeMarks,
      explanation,
      options,
    } = req.body;

    // Update question fields
    const updated = await prisma.question.update({
      where: { id },
      data: {
        examId,
        subjectId,
        topicId: topicId !== undefined ? topicId : undefined,
        questionText,
        difficulty,
        marks: marks !== undefined ? Number(marks) : undefined,
        negativeMarks: negativeMarks !== undefined ? Number(negativeMarks) : undefined,
        explanation,
      },
    });

    // Update options if provided
    if (Array.isArray(options)) {
      await prisma.option.deleteMany({ where: { questionId: id } });
      await prisma.option.createMany({
        data: options.map((opt: any) => ({
          questionId: id,
          optionKey: opt.optionKey,
          optionText: opt.optionText,
          isCorrect: Boolean(opt.isCorrect),
        })),
      });
    }

    const fullQuestion = await prisma.question.findUnique({
      where: { id },
      include: { options: true, exam: true, subject: true },
    });

    await logAdminAction(req, 'UPDATE_QUESTION', 'Question', updated.id);

    return res.json({ question: fullQuestion });
  } catch (error) {
    console.error('Error updating question:', error);
    return res.status(500).json({ error: 'Failed to update question.' });
  }
});

// POST /api/admin/questions/:id/duplicate (§14 duplicate question)
router.post('/questions/:id/duplicate', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const source = await prisma.question.findUnique({
      where: { id },
      include: { options: true },
    });

    if (!source) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const duplicated = await prisma.question.create({
      data: {
        examId: source.examId,
        subjectId: source.subjectId,
        topicId: source.topicId,
        questionText: `[Copy] ${source.questionText}`,
        questionType: source.questionType,
        difficulty: source.difficulty,
        marks: source.marks,
        negativeMarks: source.negativeMarks,
        explanation: source.explanation,
        options: {
          create: source.options.map((o) => ({
            optionKey: o.optionKey,
            optionText: o.optionText,
            isCorrect: o.isCorrect,
          })),
        },
      },
      include: { options: true },
    });

    await logAdminAction(req, 'DUPLICATE_QUESTION', 'Question', duplicated.id, { sourceId: id });

    return res.status(201).json({ question: duplicated, message: 'Question duplicated successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to duplicate question.' });
  }
});

// DELETE /api/admin/questions/:id
router.delete('/questions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.question.delete({ where: { id } });

    await logAdminAction(req, 'DELETE_QUESTION', 'Question', id);

    return res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete question.' });
  }
});

// POST /api/admin/questions/import - Bulk Import Question Bank (§Phase 7)
router.post('/questions/import', async (req: AuthRequest, res: Response) => {
  try {
    const { questions: rawList, csv } = req.body;

    let itemsToProcess: any[] = [];

    // 1. If raw CSV string provided, parse CSV lines
    if (typeof csv === 'string' && csv.trim()) {
      const lines = csv.trim().split(/\r?\n/);
      if (lines.length > 1) {
        const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          // Basic CSV quote-aware splitting
          const cols: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let c = 0; c < line.length; c++) {
            const ch = line[c];
            if (ch === '"') {
              inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
              cols.push(current.trim());
              current = '';
            } else {
              current += ch;
            }
          }
          cols.push(current.trim());

          const row: any = {};
          header.forEach((h, idx) => {
            row[h] = cols[idx] ? cols[idx].replace(/^"|"$/g, '').trim() : '';
          });
          itemsToProcess.push(row);
        }
      }
    } else if (Array.isArray(rawList)) {
      itemsToProcess = rawList;
    }

    if (itemsToProcess.length === 0) {
      return res.status(400).json({
        error: 'No valid questions found in payload. Provide a JSON array in "questions" or CSV string in "csv".',
      });
    }

    // Cache existing exams and subjects for ID resolution
    const [allExams, allSubjects] = await Promise.all([
      prisma.exam.findMany({ select: { id: true, name: true, slug: true } }),
      prisma.subject.findMany({ select: { id: true, name: true, examId: true } }),
    ]);

    const examMap = new Map<string, string>();
    allExams.forEach((e) => {
      examMap.set(e.id, e.id);
      examMap.set(e.name.toLowerCase(), e.id);
      examMap.set(e.slug.toLowerCase(), e.id);
    });

    const subjectMap = new Map<string, { id: string; examId: string }>();
    allSubjects.forEach((s) => {
      subjectMap.set(s.id, { id: s.id, examId: s.examId });
      subjectMap.set(s.name.toLowerCase(), { id: s.id, examId: s.examId });
    });

    let importedCount = 0;
    let duplicateCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let idx = 0; idx < itemsToProcess.length; idx++) {
      const item = itemsToProcess[idx];
      const itemNum = idx + 1;

      const qText = item.questionText || item.question || item.text;
      if (!qText || typeof qText !== 'string' || qText.trim().length < 5) {
        failedCount++;
        errors.push(`Row ${itemNum}: Missing or invalid question text.`);
        continue;
      }

      // Resolve exam
      let resolvedExamId =
        item.examId ||
        examMap.get((item.examName || item.exam || '').toLowerCase()) ||
        allExams[0]?.id;

      if (!resolvedExamId) {
        failedCount++;
        errors.push(`Row ${itemNum}: Unable to resolve target examination.`);
        continue;
      }

      // Resolve subject
      let resolvedSubjectId =
        item.subjectId ||
        subjectMap.get((item.subjectName || item.subject || '').toLowerCase())?.id ||
        allSubjects.find((s) => s.examId === resolvedExamId)?.id;

      if (!resolvedSubjectId) {
        failedCount++;
        errors.push(`Row ${itemNum}: Unable to resolve subject.`);
        continue;
      }

      // Format options
      let optionsList: Array<{ optionKey: string; optionText: string; isCorrect: boolean }> = [];
      if (Array.isArray(item.options) && item.options.length >= 2) {
        optionsList = item.options.map((o: any) => ({
          optionKey: String(o.optionKey || o.key).toUpperCase().trim(),
          optionText: String(o.optionText || o.text).trim(),
          isCorrect: Boolean(o.isCorrect),
        }));
      } else if (item.optionA && item.optionB) {
        const correctKey = String(item.correctOption || item.correctAnswer || item.correctKey || item.correct || 'A').toUpperCase().trim();
        optionsList = [
          { optionKey: 'A', optionText: String(item.optionA).trim(), isCorrect: correctKey === 'A' },
          { optionKey: 'B', optionText: String(item.optionB).trim(), isCorrect: correctKey === 'B' },
        ];
        if (item.optionC) {
          optionsList.push({ optionKey: 'C', optionText: String(item.optionC).trim(), isCorrect: correctKey === 'C' });
        }
        if (item.optionD) {
          optionsList.push({ optionKey: 'D', optionText: String(item.optionD).trim(), isCorrect: correctKey === 'D' });
        }
        if (item.optionE) {
          optionsList.push({ optionKey: 'E', optionText: String(item.optionE).trim(), isCorrect: correctKey === 'E' });
        }
      }

      if (optionsList.length < 2) {
        failedCount++;
        errors.push(`Row ${itemNum}: Question must have at least 2 options.`);
        continue;
      }

      // Ensure at least one correct option exists
      if (!optionsList.some((o) => o.isCorrect)) {
        optionsList[0].isCorrect = true; // Default to first if missing
      }

      // Check duplicate
      const existing = await prisma.question.findFirst({
        where: {
          examId: resolvedExamId,
          questionText: qText.trim(),
        },
        select: { id: true },
      });

      if (existing) {
        duplicateCount++;
        continue;
      }

      // Create question inside transaction
      try {
        await prisma.question.create({
          data: {
            examId: resolvedExamId,
            subjectId: resolvedSubjectId,
            topicId: item.topicId || null,
            questionText: qText.trim(),
            difficulty: ['Easy', 'Moderate', 'Hard'].includes(item.difficulty)
              ? item.difficulty
              : 'Moderate',
            marks: Number(item.marks) > 0 ? Number(item.marks) : 1.0,
            negativeMarks: Number(item.negativeMarks) >= 0 ? Number(item.negativeMarks) : 0.25,
            explanation: item.explanation || item.solution || '',
            shortcut: item.shortcut || null,
            options: {
              create: optionsList,
            },
          },
        });
        importedCount++;
      } catch (err: any) {
        failedCount++;
        errors.push(`Row ${itemNum}: Database insertion error (${err.message}).`);
      }
    }

    await logAdminAction(req, 'IMPORT_QUESTIONS', 'Question', null, {
      importedCount,
      duplicateCount,
      failedCount,
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalReceived: itemsToProcess.length,
        imported: importedCount,
        duplicates: duplicateCount,
        failed: failedCount,
        errors: errors.slice(0, 10), // return top 10 errors
      },
      message: `Successfully imported ${importedCount} question(s). ${duplicateCount} duplicates skipped. ${failedCount} failed.`,
    });
  } catch (error) {
    console.error('Import error:', error);
    return res.status(500).json({ error: 'Failed to process question bank import.' });
  }
});

export default router;
