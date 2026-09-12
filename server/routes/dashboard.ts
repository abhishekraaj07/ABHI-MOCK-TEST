import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

// GET /api/dashboard - user stats, trends, weak areas, and recommendations (§11 & §13)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // 1. Fetch completed attempts
    const completedAttempts = await prisma.attempt.findMany({
      where: { userId, status: 'COMPLETED' },
      include: {
        test: {
          include: {
            exam: { select: { name: true, slug: true } },
            subject: { select: { name: true } },
          },
        },
        answers: {
          include: {
            question: {
              select: { subjectId: true, subject: { select: { name: true } }, topic: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    // 2. Active in-progress attempt
    const activeAttempt = await prisma.attempt.findFirst({
      where: { userId, status: 'IN_PROGRESS' },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            duration: true,
            exam: { select: { name: true } },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    // Compute basic aggregates
    const testsAttempted = completedAttempts.length;
    let avgScore = 0;
    let bestScore = 0;
    let avgAccuracy = 0;

    if (testsAttempted > 0) {
      const totalScore = completedAttempts.reduce((acc, a) => acc + a.score, 0);
      const totalAcc = completedAttempts.reduce((acc, a) => acc + a.accuracy, 0);
      avgScore = parseFloat((totalScore / testsAttempted).toFixed(1));
      avgAccuracy = parseFloat((totalAcc / testsAttempted).toFixed(1));
      bestScore = Math.max(...completedAttempts.map((a) => a.score));
    }

    // Compute active day streak
    let streak = 0;
    if (testsAttempted > 0) {
      const dates = Array.from(
        new Set(
          completedAttempts
            .filter((a) => a.submittedAt)
            .map((a) => new Date(a.submittedAt!).toISOString().slice(0, 10))
        )
      ).sort().reverse();

      const today = new Date().toISOString().slice(0, 10);
      let currentCheck = new Date();

      for (let i = 0; i < dates.length; i++) {
        const checkStr = currentCheck.toISOString().slice(0, 10);
        if (dates.includes(checkStr)) {
          streak++;
          currentCheck.setDate(currentCheck.getDate() - 1);
        } else if (i === 0 && checkStr === today) {
          // If no test today yet, check starting from yesterday
          currentCheck.setDate(currentCheck.getDate() - 1);
          const yesterdayStr = currentCheck.toISOString().slice(0, 10);
          if (dates.includes(yesterdayStr)) {
            streak++;
            currentCheck.setDate(currentCheck.getDate() - 1);
          } else {
            break;
          }
        } else {
          break;
        }
      }
    }

    // Chart trend points (chronological)
    const trendData = completedAttempts.map((a, idx) => ({
      index: idx + 1,
      date: a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `T${idx + 1}`,
      title: a.test.title,
      score: a.score,
      accuracy: a.accuracy,
      percentage: a.percentage,
    }));

    // Weak Subject & Topic Analysis (§13)
    // Map accuracy by subject across all user answers
    const subjectStatsMap = new Map<string, { correct: number; total: number }>();

    for (const att of completedAttempts) {
      for (const ans of att.answers) {
        if (!ans.selectedOption) continue;
        const subName = ans.question.subject.name;
        if (!subjectStatsMap.has(subName)) {
          subjectStatsMap.set(subName, { correct: 0, total: 0 });
        }
        const s = subjectStatsMap.get(subName)!;
        s.total++;
        if (ans.isCorrect) s.correct++;
      }
    }

    const weakSubjects: { subject: string; accuracy: number; totalQuestions: number }[] = [];
    const strongSubjects: { subject: string; accuracy: number }[] = [];

    subjectStatsMap.forEach((data, sub) => {
      const acc = data.total > 0 ? parseFloat(((data.correct / data.total) * 100).toFixed(1)) : 0;
      if (acc < 60 && data.total >= 5) {
        weakSubjects.push({ subject: sub, accuracy: acc, totalQuestions: data.total });
      } else if (acc >= 75) {
        strongSubjects.push({ subject: sub, accuracy: acc });
      }
    });

    // Rule-based inspectable recommendations (§13)
    const recommendations: { title: string; reason: string; action: string; link: string }[] = [];

    // Rule 1: Weak subjects under 60%
    for (const ws of weakSubjects) {
      recommendations.push({
        title: `Focus Drill: ${ws.subject}`,
        reason: `Your accuracy is currently ${ws.accuracy}% across ${ws.totalQuestions} attempted questions (threshold: 60%).`,
        action: 'Practice Topics',
        link: '/practice',
      });
    }

    // Rule 2: Full mock freshness
    const lastFullMock = completedAttempts.filter((a) => a.test.testType === 'Full Length').pop();
    const daysSinceFullMock = lastFullMock && lastFullMock.submittedAt
      ? Math.floor((Date.now() - new Date(lastFullMock.submittedAt).getTime()) / (1000 * 3600 * 24))
      : 999;

    if (daysSinceFullMock > 4) {
      recommendations.push({
        title: 'Attempt Full-Length Mock Test',
        reason: daysSinceFullMock === 999
          ? 'You have not yet completed a timed full-length mock simulation.'
          : `It has been ${daysSinceFullMock} days since your last full-length mock attempt. Consistent pacing improves retention.`,
        action: 'Browse Mock Tests',
        link: '/mock-tests',
      });
    }

    // Rule 3: Speed & sectional sharpening if accuracy is high
    if (strongSubjects.length > 0 && recommendations.length < 3) {
      recommendations.push({
        title: `Speed Drill: ${strongSubjects[0].subject}`,
        reason: `High accuracy of ${strongSubjects[0].accuracy}%. Try sectional tests to reduce average time per question.`,
        action: 'Sectional Tests',
        link: '/mock-tests?tab=Sectional',
      });
    }

    // Recent 5 tests
    const recentTests = completedAttempts.slice(-5).reverse().map((a) => ({
      attemptId: a.id,
      testId: a.testId,
      testTitle: a.test.title,
      examName: a.test.exam.name,
      score: a.score,
      totalMarks: a.test.totalMarks,
      accuracy: a.accuracy,
      submittedAt: a.submittedAt,
      timeTaken: a.timeTaken,
    }));

    return res.json({
      summary: {
        testsAttempted,
        avgScore,
        bestScore,
        avgAccuracy,
        streak,
      },
      trendData,
      weakSubjects,
      recommendations,
      recentTests,
      activeAttempt: activeAttempt
        ? {
            attemptId: activeAttempt.id,
            testId: activeAttempt.test.id,
            testTitle: activeAttempt.test.title,
            examName: activeAttempt.test.exam.name,
            duration: activeAttempt.test.duration,
            startedAt: activeAttempt.startedAt,
          }
        : null,
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    return res.status(500).json({ error: 'Failed to retrieve dashboard analytics.' });
  }
});

export default router;
