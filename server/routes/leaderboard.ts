import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

export interface RawLeaderboardAttempt {
  userId: string;
  score: number;
  accuracy: number;
  submittedAt?: Date | string;
  user?: { id?: string; name?: string | null };
  test?: {
    id?: string;
    examId?: string;
    exam?: { name?: string; slug?: string } | null;
  } | null;
}

export interface LeaderboardUserEntry {
  rank: number;
  userId: string;
  displayName: string;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  averageAccuracy: number;
  testsAttempted: number;
}

export function buildLeaderboardWhere(
  query: { exam?: string; period?: string },
  now: Date = new Date()
): any {
  const where: any = { status: 'COMPLETED' };

  if (query.period === 'Weekly') {
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    where.submittedAt = { gte: oneWeekAgo };
  } else if (query.period === 'Monthly') {
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    where.submittedAt = { gte: oneMonthAgo };
  }

  if (query.exam && typeof query.exam === 'string' && query.exam !== 'All') {
    where.test = {
      OR: [{ examId: query.exam }, { exam: { slug: query.exam } }],
    };
  }

  return where;
}

export function filterLeaderboardAttempts(
  attempts: RawLeaderboardAttempt[],
  options: { exam?: string; period?: string; now?: Date }
): RawLeaderboardAttempt[] {
  const now = options.now || new Date();
  let filtered = attempts;

  if (options.period === 'Weekly') {
    const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filtered = filtered.filter((att) => att.submittedAt && new Date(att.submittedAt) >= cutoff);
  } else if (options.period === 'Monthly') {
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    filtered = filtered.filter((att) => att.submittedAt && new Date(att.submittedAt) >= cutoff);
  }

  if (options.exam && options.exam !== 'All') {
    filtered = filtered.filter(
      (att) => att.test?.examId === options.exam || att.test?.exam?.slug === options.exam
    );
  }

  return filtered;
}

export function computeLeaderboard(attempts: RawLeaderboardAttempt[]): LeaderboardUserEntry[] {
  if (!attempts || attempts.length === 0) {
    return [];
  }

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
        displayName: att.user?.name || 'Aspirant',
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

  return Array.from(userMap.values())
    .map((u) => ({
      userId: u.userId,
      displayName: u.displayName,
      totalScore: parseFloat(u.totalScore.toFixed(2)),
      averageScore: parseFloat((u.totalScore / u.testsCount).toFixed(2)),
      bestScore: u.bestScore === -Infinity ? 0 : parseFloat(u.bestScore.toFixed(2)),
      averageAccuracy: parseFloat((u.totalAccuracy / u.testsCount).toFixed(1)),
      testsAttempted: u.testsCount,
    }))
    .sort((a, b) => {
      // 1. Total score descending
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      // 2. Average accuracy descending
      if (b.averageAccuracy !== a.averageAccuracy) {
        return b.averageAccuracy - a.averageAccuracy;
      }
      // 3. Best single test score descending
      if (b.bestScore !== a.bestScore) {
        return b.bestScore - a.bestScore;
      }
      // 4. Deterministic tie-breaker: display name alphabetical
      return a.displayName.localeCompare(b.displayName);
    })
    .map((item, idx) => ({
      rank: idx + 1,
      ...item,
    }));
}

// GET /api/leaderboard (§11)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { exam, period } = req.query;
    const where = buildLeaderboardWhere({
      exam: typeof exam === 'string' ? exam : undefined,
      period: typeof period === 'string' ? period : undefined,
    });

    // Fetch attempts with user details (display name ONLY, never email!)
    const attempts = await prisma.attempt.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        test: { select: { totalMarks: true, exam: { select: { name: true, slug: true } } } },
      },
    });

    const leaderboard = computeLeaderboard(attempts as any);
    return res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Failed to load leaderboard.' });
  }
});

export default router;

