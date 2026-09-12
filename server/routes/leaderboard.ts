import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

// GET /api/leaderboard (§11)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { exam, period } = req.query;

    const where: any = { status: 'COMPLETED' };

    // Period filter
    if (period === 'Weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      where.submittedAt = { gte: oneWeekAgo };
    } else if (period === 'Monthly') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      where.submittedAt = { gte: oneMonthAgo };
    }

    // Exam filter
    if (exam && typeof exam === 'string' && exam !== 'All') {
      where.test = {
        OR: [{ examId: exam }, { exam: { slug: exam } }],
      };
    }

    // Fetch attempts with user details (display name ONLY, never email!)
    const attempts = await prisma.attempt.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        test: { select: { totalMarks: true, exam: { select: { name: true } } } },
      },
    });

    // Aggregate by user
    const userMap = new Map<
      string,
      {
        userId: string;
        displayName: string;
        totalScore: number;
        totalAccuracy: number;
        testsCount: number;
        bestScore: number;
      }
    >();

    for (const att of attempts) {
      if (!userMap.has(att.userId)) {
        userMap.set(att.userId, {
          userId: att.userId,
          displayName: att.user.name || 'Aspirant',
          totalScore: 0,
          totalAccuracy: 0,
          testsCount: 0,
          bestScore: -Infinity,
        });
      }

      const uData = userMap.get(att.userId)!;
      uData.totalScore += att.score;
      uData.totalAccuracy += att.accuracy;
      uData.testsCount++;
      if (att.score > uData.bestScore) {
        uData.bestScore = att.score;
      }
    }

    const leaderboard = Array.from(userMap.values())
      .map((u) => ({
        userId: u.userId,
        displayName: u.displayName,
        totalScore: parseFloat(u.totalScore.toFixed(2)),
        averageScore: parseFloat((u.totalScore / u.testsCount).toFixed(2)),
        bestScore: u.bestScore === -Infinity ? 0 : parseFloat(u.bestScore.toFixed(2)),
        averageAccuracy: parseFloat((u.totalAccuracy / u.testsCount).toFixed(1)),
        testsAttempted: u.testsCount,
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((item, idx) => ({
        rank: idx + 1,
        ...item,
      }));

    return res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Failed to load leaderboard.' });
  }
});

export default router;
