import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeLeaderboard,
  filterLeaderboardAttempts,
  buildLeaderboardWhere,
  RawLeaderboardAttempt,
} from '../server/routes/leaderboard';

describe('Leaderboard Calculation & Ranking Logic Unit Tests (§11)', () => {
  it('Ranking by score descending: orders candidates from highest total score to lowest', () => {
    const rawAttempts: RawLeaderboardAttempt[] = [
      { userId: 'user-1', user: { name: 'Candidate A' }, score: 85.5, accuracy: 90 },
      { userId: 'user-1', user: { name: 'Candidate A' }, score: 92.0, accuracy: 95 },
      { userId: 'user-2', user: { name: 'Candidate B' }, score: 45.0, accuracy: 60 },
      { userId: 'user-3', user: { name: 'Candidate C' }, score: 110.0, accuracy: 88 },
    ];

    const ranked = computeLeaderboard(rawAttempts);

    assert.strictEqual(ranked.length, 3);

    // Candidate A: 85.5 + 92.0 = 177.5 (Rank 1)
    assert.strictEqual(ranked[0].displayName, 'Candidate A');
    assert.strictEqual(ranked[0].rank, 1);
    assert.strictEqual(ranked[0].totalScore, 177.5);
    assert.strictEqual(ranked[0].bestScore, 92.0);
    assert.strictEqual(ranked[0].averageScore, 88.75);
    assert.strictEqual(ranked[0].averageAccuracy, 92.5);
    assert.strictEqual(ranked[0].testsAttempted, 2);

    // Candidate C: 110.0 (Rank 2)
    assert.strictEqual(ranked[1].displayName, 'Candidate C');
    assert.strictEqual(ranked[1].rank, 2);
    assert.strictEqual(ranked[1].totalScore, 110.0);
    assert.strictEqual(ranked[1].bestScore, 110.0);
    assert.strictEqual(ranked[1].testsAttempted, 1);

    // Candidate B: 45.0 (Rank 3)
    assert.strictEqual(ranked[2].displayName, 'Candidate B');
    assert.strictEqual(ranked[2].rank, 3);
    assert.strictEqual(ranked[2].totalScore, 45.0);
    assert.strictEqual(ranked[2].bestScore, 45.0);
    assert.strictEqual(ranked[2].testsAttempted, 1);
  });

  it('Tie-breaking logic: resolves equal scores using accuracy, then best score, then name', () => {
    const tieAttempts: RawLeaderboardAttempt[] = [
      // Both Candidate X and Candidate Y have identical total score of 100.0, but Candidate Y has higher accuracy
      { userId: 'u-x', user: { name: 'Candidate X' }, score: 100.0, accuracy: 80 },
      { userId: 'u-y', user: { name: 'Candidate Y' }, score: 100.0, accuracy: 95 },

      // Candidate M and Candidate N have identical total score (50.0) and identical accuracy (75%),
      // but Candidate M achieved it in 1 test (bestScore: 50), while Candidate N scored 25+25 (bestScore: 25)
      { userId: 'u-m', user: { name: 'Candidate M' }, score: 50.0, accuracy: 75 },
      { userId: 'u-n', user: { name: 'Candidate N' }, score: 25.0, accuracy: 75 },
      { userId: 'u-n', user: { name: 'Candidate N' }, score: 25.0, accuracy: 75 },

      // Candidate Alpha and Candidate Beta: exactly identical stats, resolved alphabetically
      { userId: 'u-beta', user: { name: 'Beta Candidate' }, score: 10.0, accuracy: 50 },
      { userId: 'u-alpha', user: { name: 'Alpha Candidate' }, score: 10.0, accuracy: 50 },
    ];

    const ranked = computeLeaderboard(tieAttempts);

    // Rank 1 & 2: Candidate Y (95% accuracy) should beat Candidate X (80% accuracy)
    assert.strictEqual(ranked[0].displayName, 'Candidate Y');
    assert.strictEqual(ranked[0].rank, 1);
    assert.strictEqual(ranked[1].displayName, 'Candidate X');
    assert.strictEqual(ranked[1].rank, 2);

    // Rank 3 & 4: Candidate M (bestScore 50) should beat Candidate N (bestScore 25)
    assert.strictEqual(ranked[2].displayName, 'Candidate M');
    assert.strictEqual(ranked[2].rank, 3);
    assert.strictEqual(ranked[3].displayName, 'Candidate N');
    assert.strictEqual(ranked[3].rank, 4);

    // Rank 5 & 6: Alpha Candidate should precede Beta Candidate alphabetically
    assert.strictEqual(ranked[4].displayName, 'Alpha Candidate');
    assert.strictEqual(ranked[4].rank, 5);
    assert.strictEqual(ranked[5].displayName, 'Beta Candidate');
    assert.strictEqual(ranked[5].rank, 6);
  });

  it('Period filtering: correctly isolates Weekly, Monthly, and All-Time attempts', () => {
    const fixedNow = new Date('2026-10-17T12:00:00Z');

    const sampleAttempts: RawLeaderboardAttempt[] = [
      // 3 days ago (within 7 days & 30 days)
      {
        userId: 'u-recent',
        user: { name: 'Recent' },
        score: 80,
        accuracy: 85,
        submittedAt: new Date('2026-10-14T12:00:00Z'),
      },
      // 15 days ago (outside 7 days, within 30 days)
      {
        userId: 'u-mid',
        user: { name: 'Mid' },
        score: 70,
        accuracy: 80,
        submittedAt: new Date('2026-10-02T12:00:00Z'),
      },
      // 45 days ago (outside both 7 and 30 days)
      {
        userId: 'u-old',
        user: { name: 'Old' },
        score: 95,
        accuracy: 90,
        submittedAt: new Date('2026-09-01T12:00:00Z'),
      },
    ];

    // Weekly filter: should only include u-recent
    const weeklyAttempts = filterLeaderboardAttempts(sampleAttempts, { period: 'Weekly', now: fixedNow });
    assert.strictEqual(weeklyAttempts.length, 1);
    assert.strictEqual(weeklyAttempts[0].userId, 'u-recent');

    // Monthly filter: should include u-recent and u-mid
    const monthlyAttempts = filterLeaderboardAttempts(sampleAttempts, { period: 'Monthly', now: fixedNow });
    assert.strictEqual(monthlyAttempts.length, 2);
    assert.ok(monthlyAttempts.some((a) => a.userId === 'u-recent'));
    assert.ok(monthlyAttempts.some((a) => a.userId === 'u-mid'));

    // All-Time filter: should include all 3 attempts
    const allTimeAttempts = filterLeaderboardAttempts(sampleAttempts, { period: 'All-Time', now: fixedNow });
    assert.strictEqual(allTimeAttempts.length, 3);

    // Test Prisma query builder for period filtering
    const weeklyWhere = buildLeaderboardWhere({ period: 'Weekly' }, fixedNow);
    assert.strictEqual(weeklyWhere.status, 'COMPLETED');
    assert.ok(weeklyWhere.submittedAt?.gte instanceof Date);

    const allTimeWhere = buildLeaderboardWhere({ period: 'All-Time' }, fixedNow);
    assert.strictEqual(allTimeWhere.submittedAt, undefined);
  });

  it('Exam-specific filtering: isolates attempts by exam ID or slug', () => {
    const attempts: RawLeaderboardAttempt[] = [
      {
        userId: 'u1',
        score: 80,
        accuracy: 85,
        test: { examId: 'exam-sbi-po', exam: { name: 'SBI PO', slug: 'sbi-po' } },
      },
      {
        userId: 'u2',
        score: 90,
        accuracy: 90,
        test: { examId: 'exam-ssc-cgl', exam: { name: 'SSC CGL', slug: 'ssc-cgl' } },
      },
    ];

    // Filter by examId
    const sbiFiltered = filterLeaderboardAttempts(attempts, { exam: 'exam-sbi-po' });
    assert.strictEqual(sbiFiltered.length, 1);
    assert.strictEqual(sbiFiltered[0].userId, 'u1');

    // Filter by slug
    const sscFiltered = filterLeaderboardAttempts(attempts, { exam: 'ssc-cgl' });
    assert.strictEqual(sscFiltered.length, 1);
    assert.strictEqual(sscFiltered[0].userId, 'u2');

    // Filter with "All" passes all attempts through
    const allExams = filterLeaderboardAttempts(attempts, { exam: 'All' });
    assert.strictEqual(allExams.length, 2);

    // Test query builder generates valid OR condition for exam matching
    const examWhere = buildLeaderboardWhere({ exam: 'sbi-po' });
    assert.deepStrictEqual(examWhere.test, {
      OR: [{ examId: 'sbi-po' }, { exam: { slug: 'sbi-po' } }],
    });
  });

  it('Empty leaderboard: returns empty array without throwing error', () => {
    const emptyRanked = computeLeaderboard([]);
    assert.deepStrictEqual(emptyRanked, []);

    const nullRanked = computeLeaderboard(null as any);
    assert.deepStrictEqual(nullRanked, []);

    const emptyFiltered = filterLeaderboardAttempts([], { exam: 'sbi-po', period: 'Weekly' });
    assert.deepStrictEqual(emptyFiltered, []);
  });

  it('Single entry leaderboard: accurately calculates rank 1 and user metrics', () => {
    const singleUserAttempts: RawLeaderboardAttempt[] = [
      { userId: 'usr-solo', user: { name: 'Lone Aspirant' }, score: 70.0, accuracy: 80 },
      { userId: 'usr-solo', user: { name: 'Lone Aspirant' }, score: 80.0, accuracy: 90 },
    ];

    const leaderboard = computeLeaderboard(singleUserAttempts);
    assert.strictEqual(leaderboard.length, 1);
    assert.strictEqual(leaderboard[0].rank, 1);
    assert.strictEqual(leaderboard[0].userId, 'usr-solo');
    assert.strictEqual(leaderboard[0].displayName, 'Lone Aspirant');
    assert.strictEqual(leaderboard[0].totalScore, 150.0);
    assert.strictEqual(leaderboard[0].averageScore, 75.0);
    assert.strictEqual(leaderboard[0].bestScore, 80.0);
    assert.strictEqual(leaderboard[0].averageAccuracy, 85.0);
    assert.strictEqual(leaderboard[0].testsAttempted, 2);
  });

  it('Negative score handling: retains negative totals and negative best scores without resetting to 0', () => {
    const negativeAttempts: RawLeaderboardAttempt[] = [
      { userId: 'user-neg', user: { name: 'Risk Taker' }, score: -2.5, accuracy: 10 },
    ];

    const ranked = computeLeaderboard(negativeAttempts);
    assert.strictEqual(ranked.length, 1);
    assert.strictEqual(ranked[0].totalScore, -2.5);
    assert.strictEqual(ranked[0].bestScore, -2.5);
    assert.strictEqual(ranked[0].averageScore, -2.5);
  });

  it('Fallbacks for nameless users default to Aspirant', () => {
    const anonAttempts: RawLeaderboardAttempt[] = [
      { userId: 'user-anon', user: { name: null }, score: 50.0, accuracy: 70 },
    ];

    const ranked = computeLeaderboard(anonAttempts);
    assert.strictEqual(ranked[0].displayName, 'Aspirant');
  });
});
