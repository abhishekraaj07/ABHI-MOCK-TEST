import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

// GET /api/results/:id - full analytical result breakdown (§10 & §Phase 14)
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const attempt = await prisma.attempt.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        test: {
          include: {
            exam: { select: { id: true, name: true, slug: true } },
            subject: { select: { id: true, name: true } },
            testQuestions: {
              include: {
                question: {
                  include: {
                    options: true,
                    subject: { select: { id: true, name: true } },
                    topic: { select: { id: true, name: true } },
                  },
                },
              },
              orderBy: { questionOrder: 'asc' },
            },
          },
        },
        answers: {
          include: {
            question: {
              include: {
                options: true,
                subject: { select: { id: true, name: true } },
                topic: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Evaluation result not found.' });
    }

    // Security Authorization: verify ownership unless admin
    if (attempt.userId && (!req.user || (attempt.userId !== req.user.id && req.user.role !== 'ADMIN'))) {
      return res.status(403).json({ error: 'Unauthorized to access this examination result.' });
    }

    // Bookmarks for current user if logged in
    let bookmarkedQuestionIds = new Set<string>();
    if (req.user) {
      const bmarks = await prisma.bookmark.findMany({
        where: { userId: req.user.id },
        select: { questionId: true },
      });
      bookmarkedQuestionIds = new Set(bmarks.map((b) => b.questionId));
    }

    // Compute cohort statistics for this test (Rank & Percentile from real attempts)
    const allCompletedAttempts = await prisma.attempt.findMany({
      where: { testId: attempt.testId, status: 'COMPLETED' },
      select: { id: true, score: true },
      orderBy: { score: 'desc' },
    });

    const totalTakers = allCompletedAttempts.length;
    let rank = 1;
    let rankIndex = allCompletedAttempts.findIndex((a) => a.id === attempt.id);
    if (rankIndex !== -1) {
      rank = rankIndex + 1;
    }
    const belowCount = allCompletedAttempts.filter((a) => a.score < attempt.score).length;
    const percentile = totalTakers > 1
      ? parseFloat(((belowCount / (totalTakers - 1)) * 100).toFixed(1))
      : 100.0;

    const highestScore = allCompletedAttempts.length > 0 ? allCompletedAttempts[0].score : attempt.score;
    const avgScore = allCompletedAttempts.length > 0
      ? parseFloat((allCompletedAttempts.reduce((acc, c) => acc + c.score, 0) / allCompletedAttempts.length).toFixed(1))
      : attempt.score;

    // Subject analysis table computation (Subject | Score | Correct | Wrong | Accuracy)
    const subjectMap = new Map<
      string,
      {
        subjectName: string;
        totalQuestions: number;
        correct: number;
        wrong: number;
        unanswered: number;
        score: number;
        timeSpent: number;
      }
    >();

    const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

    const questionReviews = attempt.test.testQuestions.map((tq, idx) => {
      const q = tq.question;
      const ans = answerMap.get(q.id);
      const subName = q.subject.name;

      if (!subjectMap.has(subName)) {
        subjectMap.set(subName, {
          subjectName: subName,
          totalQuestions: 0,
          correct: 0,
          wrong: 0,
          unanswered: 0,
          score: 0,
          timeSpent: 0,
        });
      }

      const sData = subjectMap.get(subName)!;
      sData.totalQuestions++;
      sData.timeSpent += ans?.timeSpent || 0;

      let status: 'CORRECT' | 'WRONG' | 'UNANSWERED' = 'UNANSWERED';
      if (ans?.selectedOption) {
        if (ans.isCorrect) {
          status = 'CORRECT';
          sData.correct++;
          sData.score += ans.marksObtained;
        } else {
          status = 'WRONG';
          sData.wrong++;
          sData.score += ans.marksObtained;
        }
      } else {
        sData.unanswered++;
      }

      const correctOption = q.options.find((o) => o.isCorrect);

      return {
        questionId: q.id,
        index: tq.questionOrder || idx + 1,
        questionText: q.questionText,
        subjectName: subName,
        topicName: q.topic?.name || 'General',
        difficulty: q.difficulty,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        selectedOption: ans?.selectedOption || null,
        correctOptionKey: correctOption?.optionKey || 'A',
        correctOptionText: correctOption?.optionText || '',
        isCorrect: ans?.isCorrect ?? null,
        status,
        explanation: q.explanation || 'Detailed explanation not provided for this question.',
        timeSpent: ans?.timeSpent || 0,
        isMarked: ans?.isMarked || false,
        isBookmarked: bookmarkedQuestionIds.has(q.id),
        options: q.options
          .map((o) => ({
            optionKey: o.optionKey,
            optionText: o.optionText,
            isCorrect: o.isCorrect,
          }))
          .sort((a, b) => a.optionKey.localeCompare(b.optionKey)),
      };
    });

    // Finalize subject table with accuracy
    const subjectAnalysis = Array.from(subjectMap.values()).map((s) => {
      const attempted = s.correct + s.wrong;
      const accuracy = attempted > 0 ? parseFloat(((s.correct / attempted) * 100).toFixed(1)) : 0;
      return {
        ...s,
        score: parseFloat(s.score.toFixed(2)),
        accuracy,
      };
    });

    return res.json({
      result: {
        attemptId: attempt.id,
        testId: attempt.testId,
        testTitle: attempt.test.title,
        examName: attempt.test.exam.name,
        examSlug: attempt.test.exam.slug,
        subjectName: attempt.test.subject?.name || 'Full Syllabus',
        durationMinutes: attempt.test.duration,
        totalMarks: attempt.test.totalMarks,
        negativeMarks: attempt.test.negativeMarks,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        timeTaken: attempt.timeTaken, // in seconds
        score: attempt.score,
        percentage: attempt.percentage,
        accuracy: attempt.accuracy,
        correctCount: attempt.correctCount,
        wrongCount: attempt.wrongCount,
        unansweredCount: attempt.unansweredCount,
        totalQuestions: questionReviews.length,
        rank,
        percentile,
        totalTakers,
        highestScore,
        avgScore,
      },
      subjectAnalysis,
      questions: questionReviews,
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    return res.status(500).json({ error: 'Failed to retrieve test analytics.' });
  }
});

export default router;
