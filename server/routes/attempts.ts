import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest, authenticate } from '../middleware/auth';
import { score } from '../scoring';

const router = Router();

// GET /api/attempts - history for authenticated user (§11 My Tests)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { status } = req.query;

    const where: any = { userId };
    if (status && typeof status === 'string' && status !== 'All') {
      const clean = status.trim().toUpperCase().replace(/\s+/g, '_');
      if (clean === 'COMPLETED' || clean === 'IN_PROGRESS' || clean === 'EXPIRED') {
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

    return res.json({ success: true, attempts: formatted });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ATTEMPTS_FAILED', message: 'Failed to retrieve test attempts.' },
    });
  }
});

// GET /api/attempts/:id - load live test engine state (§Phase 5 & 8)
// Strictly prevents answer keys, isCorrect, explanation, and shortcut leaks during active tests
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
                  select: {
                    id: true,
                    questionText: true,
                    questionType: true,
                    difficulty: true,
                    marks: true,
                    negativeMarks: true,
                    subject: { select: { id: true, name: true } },
                    topic: { select: { id: true, name: true } },
                    options: {
                      // CRITICAL: NEVER include isCorrect during an active test session (§Phase 5)
                      select: { id: true, optionKey: true, optionText: true },
                    },
                    // Notice: explanation and shortcut are deliberately EXCLUDED here!
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
      return res.status(404).json({
        success: false,
        error: { code: 'ATTEMPT_NOT_FOUND', message: 'Test attempt not found.' },
      });
    }

    // IDOR Protection: verify user ownership or admin access (§Phase 14)
    if (attempt.userId !== userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Unauthorized to access this test attempt.' },
      });
    }

    // User bookmarks lookup
    const userBookmarks = await prisma.bookmark.findMany({
      where: { userId },
      select: { questionId: true },
    });
    const bookmarkedSet = new Set(userBookmarks.map((b) => b.questionId));

    // Calculate server-authoritative timer remaining (§Phase 8)
    const totalDurationSeconds = attempt.test.duration * 60;
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000));
    const isPracticeMode = attempt.test.testType === 'Practice';
    let remainingSeconds = isPracticeMode ? 999999 : Math.max(0, totalDurationSeconds - elapsedSeconds);

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
      success: true,
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
    return res.status(500).json({
      success: false,
      error: { code: 'SESSION_LOAD_FAILED', message: 'Failed to load test session.' },
    });
  }
});

// POST /api/attempts/:id/answer - save response in real-time (§Phase 6, 7 & 8)
router.post('/:id/answer', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { questionId, selectedOption, isMarked, timeSpent } = req.body;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_QUESTION_ID', message: 'Question ID is required.' },
      });
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id },
      include: {
        test: { select: { duration: true, testType: true } },
      },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: { code: 'ATTEMPT_NOT_FOUND', message: 'Attempt not found.' },
      });
    }

    if (attempt.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Unauthorized to modify this test attempt.' },
      });
    }

    if (attempt.status === 'COMPLETED' || attempt.status === 'EXPIRED') {
      return res.status(400).json({
        success: false,
        error: { code: 'ATTEMPT_CLOSED', message: 'This test has already been completed and submitted.' },
      });
    }

    // Server-authoritative timer check with 30-second network grace period (§Phase 8)
    const isPracticeMode = attempt.test.testType === 'Practice';
    const totalDurationSeconds = attempt.test.duration * 60;
    const elapsedSeconds = (Date.now() - new Date(attempt.startedAt).getTime()) / 1000;
    const gracePeriodSeconds = 30;

    if (!isPracticeMode && elapsedSeconds > (totalDurationSeconds + gracePeriodSeconds)) {
      await prisma.attempt.update({
        where: { id: attempt.id },
        data: { status: 'EXPIRED' },
      });
      return res.status(403).json({
        success: false,
        error: {
          code: 'TEST_EXPIRED',
          message: 'The examination time limit has expired. Please submit your test.',
        },
        expired: true,
      });
    }

    // Upsert answer in database using unique composite constraint
    const updatedAnswer = await prisma.attemptAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: id,
          questionId,
        },
      },
      update: {
        selectedOption: selectedOption !== undefined ? selectedOption : undefined,
        isMarked: isMarked !== undefined ? Boolean(isMarked) : undefined,
        timeSpent: timeSpent !== undefined ? Math.max(0, Number(timeSpent)) : undefined,
      },
      create: {
        attemptId: id,
        questionId,
        selectedOption: selectedOption || null,
        isMarked: Boolean(isMarked),
        timeSpent: timeSpent ? Math.max(0, Number(timeSpent)) : 0,
      },
    });

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
    return res.status(500).json({
      success: false,
      error: { code: 'ANSWER_SAVE_FAILED', message: 'Failed to record answer response.' },
    });
  }
});

// POST /api/attempts/:id/submit - idempotent, transaction-safe exam submission (§Phase 6, 8 & 10)
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
      return res.status(404).json({
        success: false,
        error: { code: 'ATTEMPT_NOT_FOUND', message: 'Attempt not found.' },
      });
    }

    if (attempt.userId !== userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Unauthorized to submit this test attempt.' },
      });
    }

    // Idempotent: if already completed, return existing score directly (§Phase 6)
    if (attempt.status === 'COMPLETED') {
      return res.json({
        success: true,
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

    const answerUpdates: {
      questionId: string;
      selectedOption: string | null;
      isCorrect: boolean | null;
      marksObtained: number;
    }[] = [];

    // Evaluate answers server-side
    for (const tq of test.testQuestions) {
      const q = tq.question;
      const ans = answerMap.get(q.id);
      const correctOption = q.options.find((o) => o.isCorrect);
      const userSelected = ans?.selectedOption || null;

      if (!userSelected) {
        unansweredCount++;
        answerUpdates.push({
          questionId: q.id,
          selectedOption: null,
          isCorrect: null,
          marksObtained: 0,
        });
      } else if (correctOption && userSelected === correctOption.optionKey) {
        correctCount++;
        answerUpdates.push({
          questionId: q.id,
          selectedOption: userSelected,
          isCorrect: true,
          marksObtained: q.marks,
        });
      } else {
        wrongCount++;
        answerUpdates.push({
          questionId: q.id,
          selectedOption: userSelected,
          isCorrect: false,
          marksObtained: -negativeMarksPerQ,
        });
      }
    }

    // Centralized scoring function (§Phase 10)
    const scoreResult = score(
      correctCount,
      wrongCount,
      marksPerQ,
      negativeMarksPerQ,
      test.totalMarks,
      test.testQuestions.length
    );

    // Atomically persist all answer updates and final attempt score via transaction (§Phase 11)
    const updatedAttempt = await prisma.$transaction(async (tx) => {
      for (const update of answerUpdates) {
        await tx.attemptAnswer.upsert({
          where: {
            attemptId_questionId: {
              attemptId: attempt.id,
              questionId: update.questionId,
            },
          },
          update: {
            isCorrect: update.isCorrect,
            marksObtained: update.marksObtained,
          },
          create: {
            attemptId: attempt.id,
            questionId: update.questionId,
            selectedOption: update.selectedOption,
            isCorrect: update.isCorrect,
            marksObtained: update.marksObtained,
            timeSpent: 0,
            isMarked: false,
          },
        });
      }

      return tx.attempt.update({
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
    });

    return res.json({
      success: true,
      attemptId: updatedAttempt.id,
      score: updatedAttempt.score,
      percentage: updatedAttempt.percentage,
      accuracy: updatedAttempt.accuracy,
      message: 'Test evaluated and completed successfully.',
    });
  } catch (error) {
    console.error('Error submitting attempt:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SUBMISSION_FAILED', message: 'Failed to submit test.' },
    });
  }
});

export default router;
