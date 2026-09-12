import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest, authenticate } from '../middleware/auth';
import { score } from '../scoring';

const router = Router();

// GET /api/attempts - history for user (§11 My Tests)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { status } = req.query;

    const where: any = { userId };
    if (status && typeof status === 'string' && status !== 'All') {
      const clean = status.trim().toUpperCase().replace(/\s+/g, '_');
      if (clean === 'COMPLETED' || clean === 'IN_PROGRESS') {
        where.status = clean;
      }
    }

    const attempts = await prisma.attempt.findMany({
      where,
      include: {
        test: {
          include: {
            exam: { select: { name: true, slug: true } },
            subject: { select: { name: true } },
            _count: { select: { testQuestions: true } },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    const formatted = attempts.map((att) => ({
      id: att.id,
      testId: att.testId,
      testTitle: att.test.title,
      examName: att.test.exam.name,
      subjectName: att.test.subject?.name || 'Full Syllabus',
      testType: att.test.testType,
      duration: att.test.duration,
      totalMarks: att.test.totalMarks,
      questionCount: att.test._count.testQuestions,
      status: att.status,
      startedAt: att.startedAt,
      submittedAt: att.submittedAt,
      timeTaken: att.timeTaken,
      score: att.score,
      percentage: att.percentage,
      accuracy: att.accuracy,
      correctCount: att.correctCount,
      wrongCount: att.wrongCount,
      unansweredCount: att.unansweredCount,
    }));

    return res.json({ attempts: formatted });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    return res.status(500).json({ error: 'Failed to retrieve test attempts.' });
  }
});

// GET /api/attempts/:id - load live test engine state (§8)
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const attempt = await prisma.attempt.findUnique({
      where: { id },
      include: {
        test: {
          include: {
            exam: { select: { name: true, slug: true } },
            subject: { select: { name: true } },
            testQuestions: {
              include: {
                question: {
                  include: {
                    options: {
                      select: { id: true, optionKey: true, optionText: true }, // Hide isCorrect during test!
                    },
                    topic: { select: { id: true, name: true } },
                    subject: { select: { id: true, name: true } },
                  },
                },
              },
              orderBy: { questionOrder: 'asc' },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found.' });
    }

    if (attempt.userId !== userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to access this test attempt.' });
    }

    // User bookmarks lookup
    const userBookmarks = await prisma.bookmark.findMany({
      where: { userId },
      select: { questionId: true },
    });
    const bookmarkedSet = new Set(userBookmarks.map((b) => b.questionId));

    // Calculate server-authoritative timer remaining
    const totalDurationSeconds = attempt.test.duration * 60;
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000));
    let remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);

    // If test is a practice set with no hard timer, remainingSeconds can be null or infinity
    const isPracticeMode = attempt.test.testType === 'Practice';
    if (isPracticeMode) {
      remainingSeconds = 999999;
    }

    // Map questions with current answer state
    const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

    const questions = attempt.test.testQuestions.map((tq, idx) => {
      const q = tq.question;
      const ans = answerMap.get(q.id);

      return {
        questionId: q.id,
        order: tq.questionOrder || idx + 1,
        questionText: q.questionText,
        questionType: q.questionType,
        difficulty: q.difficulty,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        subjectName: q.subject.name,
        topicName: q.topic?.name || 'General',
        isBookmarked: bookmarkedSet.has(q.id),
        options: q.options.sort((a, b) => a.optionKey.localeCompare(b.optionKey)),
        selectedOption: ans?.selectedOption || null,
        isMarked: ans?.isMarked || false,
        timeSpent: ans?.timeSpent || 0,
      };
    });

    return res.json({
      attempt: {
        id: attempt.id,
        testId: attempt.testId,
        testTitle: attempt.test.title,
        examName: attempt.test.exam.name,
        subjectName: attempt.test.subject?.name || 'Full Syllabus',
        durationMinutes: attempt.test.duration,
        totalDurationSeconds,
        remainingSeconds,
        elapsedSeconds,
        status: attempt.status,
        startedAt: attempt.startedAt,
        negativeMarks: attempt.test.negativeMarks,
        totalMarks: attempt.test.totalMarks,
        isPracticeMode,
      },
      questions,
    });
  } catch (error) {
    console.error('Error fetching live attempt:', error);
    return res.status(500).json({ error: 'Failed to load test session.' });
  }
});

// POST /api/attempts/:id/answer - save response in real-time (§8)
router.post('/:id/answer', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { questionId, selectedOption, isMarked, timeSpent } = req.body;

    if (!questionId) {
      return res.status(400).json({ error: 'Question ID is required.' });
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found.' });
    }

    if (attempt.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    if (attempt.status === 'COMPLETED') {
      return res.status(400).json({ error: 'This test has already been completed and submitted.' });
    }

    // Upsert answer in database
    const existing = await prisma.attemptAnswer.findFirst({
      where: { attemptId: id, questionId },
    });

    let updatedAnswer;
    if (existing) {
      updatedAnswer = await prisma.attemptAnswer.update({
        where: { id: existing.id },
        data: {
          selectedOption: selectedOption !== undefined ? selectedOption : existing.selectedOption,
          isMarked: isMarked !== undefined ? Boolean(isMarked) : existing.isMarked,
          timeSpent: timeSpent !== undefined ? Math.max(0, Number(timeSpent)) : existing.timeSpent,
        },
      });
    } else {
      updatedAnswer = await prisma.attemptAnswer.create({
        data: {
          attemptId: id,
          questionId,
          selectedOption: selectedOption || null,
          isMarked: Boolean(isMarked),
          timeSpent: timeSpent ? Math.max(0, Number(timeSpent)) : 0,
        },
      });
    }

    return res.json({
      success: true,
      answer: {
        questionId: updatedAnswer.questionId,
        selectedOption: updatedAnswer.selectedOption,
        isMarked: updatedAnswer.isMarked,
      },
    });
  } catch (error) {
    console.error('Error saving answer:', error);
    return res.status(500).json({ error: 'Failed to record answer response.' });
  }
});

// POST /api/attempts/:id/submit - idempotent exam submission (§8 & §9)
router.post('/:id/submit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const attempt = await prisma.attempt.findUnique({
      where: { id },
      include: {
        test: {
          include: {
            testQuestions: {
              include: {
                question: {
                  include: { options: true },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found.' });
    }

    if (attempt.userId !== userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    // Idempotent: if already completed, return existing score directly
    if (attempt.status === 'COMPLETED') {
      return res.json({
        attemptId: attempt.id,
        score: attempt.score,
        percentage: attempt.percentage,
        accuracy: attempt.accuracy,
        message: 'Attempt was already submitted.',
      });
    }

    const test = attempt.test;
    const submittedAt = new Date();
    const timeTaken = Math.max(1, Math.floor((submittedAt.getTime() - new Date(attempt.startedAt).getTime()) / 1000));

    const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const marksPerQ = test.testQuestions[0]?.question.marks ?? 1.0;
    const negativeMarksPerQ = typeof test.negativeMarks === 'number' ? test.negativeMarks : 0.25;

    // Evaluate answers
    for (const tq of test.testQuestions) {
      const q = tq.question;
      const ans = answerMap.get(q.id);
      const correctOption = q.options.find((o) => o.isCorrect);

      const userSelected = ans?.selectedOption || null;

      if (!userSelected) {
        unansweredCount++;
        if (ans) {
          await prisma.attemptAnswer.update({
            where: { id: ans.id },
            data: { isCorrect: null, marksObtained: 0 },
          });
        } else {
          await prisma.attemptAnswer.create({
            data: {
              attemptId: attempt.id,
              questionId: q.id,
              selectedOption: null,
              isCorrect: null,
              marksObtained: 0,
              timeSpent: 0,
              isMarked: false,
            },
          });
        }
      } else if (correctOption && userSelected === correctOption.optionKey) {
        correctCount++;
        const marksObtained = q.marks;
        if (ans) {
          await prisma.attemptAnswer.update({
            where: { id: ans.id },
            data: { isCorrect: true, marksObtained },
          });
        } else {
          await prisma.attemptAnswer.create({
            data: {
              attemptId: attempt.id,
              questionId: q.id,
              selectedOption: userSelected,
              isCorrect: true,
              marksObtained,
              timeSpent: 0,
              isMarked: false,
            },
          });
        }
      } else {
        wrongCount++;
        const marksObtained = -negativeMarksPerQ;
        if (ans) {
          await prisma.attemptAnswer.update({
            where: { id: ans.id },
            data: { isCorrect: false, marksObtained },
          });
        } else {
          await prisma.attemptAnswer.create({
            data: {
              attemptId: attempt.id,
              questionId: q.id,
              selectedOption: userSelected,
              isCorrect: false,
              marksObtained,
              timeSpent: 0,
              isMarked: false,
            },
          });
        }
      }
    }

    // Use single reusable, testable scoring function (§9)
    const scoreResult = score(
      correctCount,
      wrongCount,
      marksPerQ,
      negativeMarksPerQ,
      test.totalMarks,
      test.testQuestions.length
    );

    // Persist final attempt state
    const updatedAttempt = await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        status: 'COMPLETED',
        submittedAt,
        timeTaken,
        score: scoreResult.score,
        percentage: scoreResult.percentage,
        accuracy: scoreResult.accuracy,
        correctCount,
        wrongCount,
        unansweredCount,
      },
    });

    return res.json({
      attemptId: updatedAttempt.id,
      score: updatedAttempt.score,
      percentage: updatedAttempt.percentage,
      accuracy: updatedAttempt.accuracy,
      message: 'Test evaluated and completed successfully.',
    });
  } catch (error) {
    console.error('Error submitting attempt:', error);
    return res.status(500).json({ error: 'Failed to submit test.' });
  }
});

export default router;
