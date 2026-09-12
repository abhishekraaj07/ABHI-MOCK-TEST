import test from 'node:test';
import assert from 'node:assert/strict';

test('Leaderboard Calculation & Ranking Logic Unit Tests', async (t) => {
  await t.test('Correctly aggregates scores, averages, and ranks candidates descending by score', () => {
    const rawAttempts = [
      { userId: 'user-1', name: 'Candidate A', score: 85.5, accuracy: 90 },
      { userId: 'user-1', name: 'Candidate A', score: 92.0, accuracy: 95 },
      { userId: 'user-2', name: 'Candidate B', score: 45.0, accuracy: 60 },
      { userId: 'user-3', name: 'Candidate C', score: 110.0, accuracy: 88 },
    ];

    const userMap = new Map<string, any>();
    for (const att of rawAttempts) {
      if (!userMap.has(att.userId)) {
        userMap.set(att.userId, {
          userId: att.userId,
          displayName: att.name,
          totalScore: 0,
          totalAccuracy: 0,
          testsCount: 0,
          bestScore: -Infinity,
        });
      }
      const u = userMap.get(att.userId);
      u.totalScore += att.score;
      u.totalAccuracy += att.accuracy;
      u.testsCount++;
      if (att.score > u.bestScore) u.bestScore = att.score;
    }

    const ranked = Array.from(userMap.values())
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

    assert.equal(ranked[0].displayName, 'Candidate A'); // 85.5 + 92.0 = 177.5
    assert.equal(ranked[0].rank, 1);
    assert.equal(ranked[0].totalScore, 177.5);
    assert.equal(ranked[0].bestScore, 92.0);

    assert.equal(ranked[1].displayName, 'Candidate C'); // 110.0
    assert.equal(ranked[1].rank, 2);

    assert.equal(ranked[2].displayName, 'Candidate B'); // 45.0
    assert.equal(ranked[2].rank, 3);
  });

  await t.test('Supports negative score retention without resetting to 0', () => {
    // If a candidate scores negative in an attempt, bestScore should accurately reflect the negative score
    const negativeAttempts = [
      { userId: 'user-neg', name: 'Risk Taker', score: -2.5, accuracy: 10 },
    ];

    const userMap = new Map<string, any>();
    for (const att of negativeAttempts) {
      if (!userMap.has(att.userId)) {
        userMap.set(att.userId, {
          userId: att.userId,
          displayName: att.name,
          totalScore: 0,
          totalAccuracy: 0,
          testsCount: 0,
          bestScore: -Infinity,
        });
      }
      const u = userMap.get(att.userId);
      u.totalScore += att.score;
      u.totalAccuracy += att.accuracy;
      u.testsCount++;
      if (att.score > u.bestScore) u.bestScore = att.score;
    }

    const ranked = Array.from(userMap.values())
      .map((u) => ({
        userId: u.userId,
        displayName: u.displayName,
        totalScore: parseFloat(u.totalScore.toFixed(2)),
        bestScore: u.bestScore === -Infinity ? 0 : parseFloat(u.bestScore.toFixed(2)),
      }));

    assert.equal(ranked[0].totalScore, -2.5);
    assert.equal(ranked[0].bestScore, -2.5);
  });
});
