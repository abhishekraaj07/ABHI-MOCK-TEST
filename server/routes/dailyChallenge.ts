import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest, optionalAuth, authenticate } from '../middleware/auth';
import { score } from '../scoring';

const router = Router();

function getTodayString(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

// GET /api/daily-challenge - Fetch or generate today's daily 5-question challenge
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const today = getTodayString();
    const userId = req.user?.id;

    // Check if challenge exists for today
    let challenge = await prisma.dailyChallenge.findUnique({
      where: { date: today },
      include: {
        questions: {
          include: {
            question: {
              include: {
                options: {
                  select: { id: true, optionKey: true, optionText: true },
                },
                subject: { select: { name: true } },
                topic: { select: { name: true } },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    // Auto-generate if not existing
    if (!challenge) {
      // Pick 5 random questions from active pool
      const pool = await prisma.question.findMany({
        take: 30,
        include: {
          options: true,
          subject: true,
          topic: true,
        },
      });

      if (pool.length > 0) {
        // Shuffle pool deterministically based on date string hash
        const dateSum = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const shuffled = [...pool].sort(
          (a, b) =>
            ((a.id.charCodeAt(0) * dateSum) % 100) -
            ((b.id.charCodeAt(0) * dateSum) % 100)
        );
        const selected = shuffled.slice(0, 5);

        challenge = await prisma.dailyChallenge.create({
          data: {
            date: today,
            title: `Daily Sprint Challenge — ${new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}`,
            description:
              'A 5-question high-yield rapid drill covering mixed sections to maintain your daily streak.',
            duration: 5,
            questions: {
              create: selected.map((q, idx) => ({
                questionId: q.id,
                order: idx + 1,
              })),
            },
          },
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    options: {
                      select: { id: true, optionKey: true, optionText: true },
                    },
                    subject: { select: { name: true } },
                    topic: { select: { name: true } },
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        });
      }
    }

    if (!challenge) {
      return res.status(404).json({ error: 'No questions available to form daily challenge.' });
    }

    // Check if current user already attempted today
    let userAttempt: any = null;
    if (userId) {
      userAttempt = await prisma.dailyChallengeAttempt.findUnique({
        where: {
          challengeId_userId: {
            challengeId: challenge.id,
            userId,
          },
        },
      });
    }

    // If user has attempted, reveal correct options and explanations
    let questionsData;
    if (userAttempt) {
      const fullQuestions = await prisma.question.findMany({
        where: {
          id: { in: challenge.questions.map((cq) => cq.questionId) },
        },
        include: { options: true, subject: true, topic: true },
      });
      const qMap = new Map(fullQuestions.map((q) => [q.id, q]));

      questionsData = challenge.questions.map((cq) => {
        const q = qMap.get(cq.questionId)!;
        const correctOpt = q.options.find((o) => o.isCorrect);
        return {
          id: q.id,
          order: cq.order,
          questionText: q.questionText,
          difficulty: q.difficulty,
          subjectName: q.subject.name,
          topicName: q.topic?.name || 'General',
          explanation: q.explanation,
          shortcut: q.shortcut,
          correctOptionKey: correctOpt?.optionKey || 'A',
          options: q.options
            .map((o) => ({
              id: o.id,
              optionKey: o.optionKey,
              optionText: o.optionText,
              isCorrect: o.isCorrect,
            }))
            .sort((a, b) => a.optionKey.localeCompare(b.optionKey)),
        };
      });
    } else {
      questionsData = challenge.questions.map((cq) => ({
        id: cq.question.id,
        order: cq.order,
        questionText: cq.question.questionText,
        difficulty: cq.question.difficulty,
        subjectName: cq.question.subject.name,
        topicName: cq.question.topic?.name || 'General',
        options: cq.question.options.sort((a, b) => a.optionKey.localeCompare(b.optionKey)),
      }));
    }

    // Count today's total participants
    const totalParticipants = await prisma.dailyChallengeAttempt.count({
      where: { challengeId: challenge.id },
    });

    return res.json({
      challenge: {
        id: challenge.id,
        date: challenge.date,
        title: challenge.title,
        description: challenge.description,
        durationMinutes: challenge.duration,
        totalQuestions: challenge.questions.length,
        totalParticipants,
      },
      questions: questionsData,
      userAttempt,
    });
  } catch (error) {
    console.error('Daily challenge error:', error);
    return res.status(500).json({ error: 'Failed to retrieve daily challenge.' });
  }
});

// POST /api/daily-challenge/submit - Submit answers for today's challenge
router.post('/submit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { challengeId, answers, timeTaken } = req.body;

    if (!challengeId || typeof challengeId !== 'string') {
      return res.status(400).json({ error: 'Challenge ID is required.' });
    }

    const challenge = await prisma.dailyChallenge.findUnique({
      where: { id: challengeId },
      include: {
        questions: {
          include: {
            question: {
              include: { options: true },
            },
          },
        },
      },
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Daily challenge not found.' });
    }

    // Prevent duplicate submission
    const existing = await prisma.dailyChallengeAttempt.findUnique({
      where: {
        challengeId_userId: { challengeId, userId },
      },
    });

    if (existing) {
      return res.json({
        attempt: existing,
        message: 'Daily challenge was already completed.',
      });
    }

    // Evaluate answers: support both Object map and Array of objects [{ questionId, selectedOption }]
    const userAnswers: Record<string, string> = {};
    if (Array.isArray(answers)) {
      answers.forEach((ans: any) => {
        const qId = ans?.questionId || ans?.id;
        const opt = ans?.selectedOption ?? ans?.selectedAnswer ?? ans?.optionKey;
        if (qId && typeof opt === 'string') {
          userAnswers[qId] = opt;
        }
      });
    } else if (answers && typeof answers === 'object') {
      Object.assign(userAnswers, answers);
    }
    let correctCount = 0;
    let wrongCount = 0;
    const totalQuestions = challenge.questions.length;

    for (const cq of challenge.questions) {
      const q = cq.question;
      const selected = userAnswers[q.id];
      const correctOpt = q.options.find((o) => o.isCorrect);

      if (selected) {
        if (correctOpt && selected === correctOpt.optionKey) {
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    }

    const scoreResult = score(correctCount, wrongCount, 1.0, 0.25, totalQuestions, totalQuestions);

    const attempt = await prisma.dailyChallengeAttempt.create({
      data: {
        challengeId,
        userId,
        score: scoreResult.score,
        totalMarks: totalQuestions,
        accuracy: scoreResult.accuracy,
        timeTaken: Math.max(1, Number(timeTaken) || 1),
        completedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      attempt,
      correctCount,
      wrongCount,
      unansweredCount: totalQuestions - (correctCount + wrongCount),
      message: 'Daily challenge completed! Streak incremented.',
    });
  } catch (error) {
    console.error('Daily challenge submission error:', error);
    return res.status(500).json({ error: 'Failed to submit daily challenge.' });
  }
});

export default router;
