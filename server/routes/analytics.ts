import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

// GET /api/analytics - in-depth performance analytics across historical attempts (§10)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Fetch all completed attempts with tests, subjects, topics, and answers
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
              select: {
                id: true,
                subjectId: true,
                subject: { select: { name: true } },
                topic: { select: { name: true } },
                difficulty: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    const totalAttempts = completedAttempts.length;

    if (totalAttempts === 0) {
      return res.json({
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        averageAccuracy: 0,
        averageTimePerQuestion: 0,
        scoreTrend: [],
        accuracyTrend: [],
        subjectPerformance: [],
        topicPerformance: [],
        weakAreas: [],
        strongAreas: [],
        insights: [
          'No completed tests yet. Attempt your first mock test to generate deep analytical insights.',
        ],
      });
    }

    // 1. Core Summary Metrics
    const totalScore = completedAttempts.reduce((acc, a) => acc + a.score, 0);
    const totalAccuracy = completedAttempts.reduce((acc, a) => acc + a.accuracy, 0);
    const averageScore = parseFloat((totalScore / totalAttempts).toFixed(2));
    const averageAccuracy = parseFloat((totalAccuracy / totalAttempts).toFixed(1));
    const bestScore = Math.max(...completedAttempts.map((a) => a.score));

    // Calculate total questions attempted and total time spent across all attempts
    let totalQuestionsAttempted = 0;
    let totalTimeSpentSeconds = 0;

    completedAttempts.forEach((att) => {
      att.answers.forEach((ans) => {
        if (ans.selectedOption) {
          totalQuestionsAttempted++;
          totalTimeSpentSeconds += ans.timeSpent || 0;
        }
      });
    });

    const averageTimePerQuestion =
      totalQuestionsAttempted > 0
        ? Math.round(totalTimeSpentSeconds / totalQuestionsAttempted)
        : 0;

    // 2. Score & Accuracy Trends (Chronological)
    const scoreTrend = completedAttempts.map((a, idx) => ({
      index: idx + 1,
      attemptId: a.id,
      testTitle: a.test.title,
      examName: a.test.exam.name,
      date: a.submittedAt
        ? new Date(a.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : `T${idx + 1}`,
      score: a.score,
      totalMarks: a.test.totalMarks,
      percentage: a.percentage,
    }));

    const accuracyTrend = completedAttempts.map((a, idx) => ({
      index: idx + 1,
      testTitle: a.test.title,
      date: a.submittedAt
        ? new Date(a.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : `T${idx + 1}`,
      accuracy: a.accuracy,
    }));

    // 3. Subject-wise aggregation
    const subjectMap = new Map<
      string,
      {
        subjectName: string;
        attempted: number;
        correct: number;
        wrong: number;
        totalScore: number;
        timeSpent: number;
      }
    >();

    // 4. Topic-wise aggregation
    const topicMap = new Map<
      string,
      {
        topicName: string;
        subjectName: string;
        attempted: number;
        correct: number;
        wrong: number;
      }
    >();

    // Chronological tracking by subject to detect improvement trends
    const subjectHistoricalAcc = new Map<string, number[]>();

    completedAttempts.forEach((att) => {
      // Per-attempt subject tally to observe trends
      const attemptSubMap = new Map<string, { correct: number; total: number }>();

      att.answers.forEach((ans) => {
        if (!ans.selectedOption) return;

        const subName = ans.question.subject.name;
        const topicName = ans.question.topic?.name || 'General';

        // Subject stats
        if (!subjectMap.has(subName)) {
          subjectMap.set(subName, {
            subjectName: subName,
            attempted: 0,
            correct: 0,
            wrong: 0,
            totalScore: 0,
            timeSpent: 0,
          });
        }
        const s = subjectMap.get(subName)!;
        s.attempted++;
        s.timeSpent += ans.timeSpent || 0;
        s.totalScore += ans.marksObtained;
        if (ans.isCorrect) s.correct++;
        else s.wrong++;

        // Track for attempt
        if (!attemptSubMap.has(subName)) {
          attemptSubMap.set(subName, { correct: 0, total: 0 });
        }
        const attSub = attemptSubMap.get(subName)!;
        attSub.total++;
        if (ans.isCorrect) attSub.correct++;

        // Topic stats
        const topicKey = `${subName}:::${topicName}`;
        if (!topicMap.has(topicKey)) {
          topicMap.set(topicKey, {
            topicName,
            subjectName: subName,
            attempted: 0,
            correct: 0,
            wrong: 0,
          });
        }
        const t = topicMap.get(topicKey)!;
        t.attempted++;
        if (ans.isCorrect) t.correct++;
        else t.wrong++;
      });

      // Record accuracy for this attempt by subject
      attemptSubMap.forEach((val, sub) => {
        if (!subjectHistoricalAcc.has(sub)) subjectHistoricalAcc.set(sub, []);
        const acc = (val.correct / val.total) * 100;
        subjectHistoricalAcc.get(sub)!.push(acc);
      });
    });

    // Format subject performance list
    const subjectPerformance = Array.from(subjectMap.values()).map((s) => {
      const accuracy = s.attempted > 0 ? parseFloat(((s.correct / s.attempted) * 100).toFixed(1)) : 0;
      const avgTime = s.attempted > 0 ? Math.round(s.timeSpent / s.attempted) : 0;
      return {
        subjectName: s.subjectName,
        attempted: s.attempted,
        correct: s.correct,
        wrong: s.wrong,
        accuracy,
        totalScore: parseFloat(s.totalScore.toFixed(2)),
        avgTimePerQuestion: avgTime,
      };
    });

    // Format topic performance list
    const topicPerformance = Array.from(topicMap.values())
      .map((t) => {
        const accuracy = t.attempted > 0 ? parseFloat(((t.correct / t.attempted) * 100).toFixed(1)) : 0;
        return {
          topicName: t.topicName,
          subjectName: t.subjectName,
          attempted: t.attempted,
          correct: t.correct,
          wrong: t.wrong,
          accuracy,
        };
      })
      .sort((a, b) => a.accuracy - b.accuracy);

    // Weak areas: accuracy < 60%
    const weakAreas = topicPerformance.filter((t) => t.accuracy < 60 && t.attempted >= 2);

    // Strong areas: accuracy >= 75%
    const strongAreas = topicPerformance.filter((t) => t.accuracy >= 75 && t.attempted >= 2);

    // 5. Generate Real Actionable Insights derived strictly from data (§10)
    const insights: string[] = [];

    // Check subject improvement trend
    subjectHistoricalAcc.forEach((history, sub) => {
      if (history.length >= 2) {
        const first = history[0];
        const last = history[history.length - 1];
        const diff = parseFloat((last - first).toFixed(1));
        if (diff > 5) {
          insights.push(`Your ${sub} accuracy is improving (+${diff}% higher in recent tests).`);
        } else if (diff < -10) {
          insights.push(`Your ${sub} accuracy has dropped by ${Math.abs(diff)}% recently. Focus on fundamental revisions.`);
        }
      }
    });

    // Weakest topic insight
    if (weakAreas.length > 0) {
      const weakest = weakAreas[0];
      insights.push(`Your weakest topic is ${weakest.topicName} in ${weakest.subjectName} (${weakest.accuracy}% accuracy across ${weakest.attempted} questions).`);
    }

    // Strongest topic insight
    if (strongAreas.length > 0) {
      const strongest = strongAreas[strongAreas.length - 1];
      insights.push(`High mastery in ${strongest.topicName} (${strongest.accuracy}% accuracy). Maintain this edge with timed sectional practice.`);
    }

    // Speed insight
    if (averageTimePerQuestion > 75) {
      insights.push(`Your average speed is ${averageTimePerQuestion} seconds/question. Practice quick-calculation techniques to stay within section limits.`);
    } else if (averageTimePerQuestion > 0 && averageTimePerQuestion <= 45) {
      insights.push(`Excellent pacing at ${averageTimePerQuestion} seconds/question. Ensure you double-check calculations before locking answers.`);
    }

    // Default if fewer insights
    if (insights.length === 0) {
      insights.push(`Completed ${totalAttempts} test(s) with an overall accuracy of ${averageAccuracy}%. Target weak topics to boost percentile.`);
    }

    return res.json({
      totalAttempts,
      averageScore,
      bestScore,
      averageAccuracy,
      averageTimePerQuestion,
      scoreTrend,
      accuracyTrend,
      subjectPerformance,
      topicPerformance,
      weakAreas,
      strongAreas,
      insights,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ error: 'Failed to retrieve analytics data.' });
  }
});

// GET /api/analytics/wrong-questions - Mistake Notebook (§Feature 4)
router.get('/wrong-questions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { subject, difficulty } = req.query;

    const wrongAnswers = await prisma.attemptAnswer.findMany({
      where: {
        attempt: { userId, status: 'COMPLETED' },
        isCorrect: false,
      },
      include: {
        attempt: { select: { submittedAt: true, test: { select: { title: true } } } },
        question: {
          include: {
            options: true,
            subject: { select: { id: true, name: true } },
            topic: { select: { id: true, name: true } },
            exam: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    // Group by unique question ID
    const questionMap = new Map<string, any>();

    for (const ans of wrongAnswers) {
      const q = ans.question;

      // Subject filter
      if (subject && subject !== 'All' && q.subject.name !== subject && q.subject.id !== subject) {
        continue;
      }

      // Difficulty filter
      if (difficulty && difficulty !== 'All' && q.difficulty !== difficulty) {
        continue;
      }

      if (!questionMap.has(q.id)) {
        const correctOption = q.options.find((o) => o.isCorrect);
        questionMap.set(q.id, {
          questionId: q.id,
          questionText: q.questionText,
          difficulty: q.difficulty,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
          explanation: q.explanation,
          shortcut: q.shortcut,
          subjectName: q.subject.name,
          topicName: q.topic?.name || 'General',
          examName: q.exam.name,
          correctOptionKey: correctOption?.optionKey || 'A',
          correctOptionText: correctOption?.optionText || '',
          lastChosenOption: ans.selectedOption,
          missCount: 1,
          lastAttemptDate: ans.attempt.submittedAt,
          lastTestTitle: ans.attempt.test.title,
          options: q.options
            .map((o) => ({
              optionKey: o.optionKey,
              optionText: o.optionText,
              isCorrect: o.isCorrect,
            }))
            .sort((a, b) => a.optionKey.localeCompare(b.optionKey)),
        });
      } else {
        const item = questionMap.get(q.id);
        item.missCount++;
      }
    }

    const wrongQuestions = Array.from(questionMap.values()).sort(
      (a, b) => b.missCount - a.missCount
    );

    return res.json({
      wrongQuestions,
      totalMistakes: wrongQuestions.length,
    });
  } catch (error) {
    console.error('Error fetching wrong questions notebook:', error);
    return res.status(500).json({ error: 'Failed to retrieve wrong questions.' });
  }
});

export default router;
