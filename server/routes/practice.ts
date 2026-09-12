import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest, optionalAuth, authenticate } from '../middleware/auth';

const router = Router();

// GET /api/practice - list topics grouped by subject (§11)
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        exam: { select: { name: true, slug: true } },
        topics: {
          include: {
            _count: { select: { questions: true } },
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Group subjects by broad discipline to avoid duplicate subject names
    const groupedSubjectsMap = new Map<string, { name: string; topics: any[] }>();

    for (const sub of subjects) {
      let key = 'General';
      if (sub.name.includes('Quant')) key = 'Quantitative Aptitude';
      else if (sub.name.includes('Reasoning') || sub.name.includes('Intelligence')) key = 'Reasoning Ability';
      else if (sub.name.includes('English')) key = 'English Language';
      else if (sub.name.includes('Awareness') || sub.name.includes('General Knowledge')) key = 'General Awareness';

      if (!groupedSubjectsMap.has(key)) {
        groupedSubjectsMap.set(key, { name: key, topics: [] });
      }

      const entry = groupedSubjectsMap.get(key)!;
      for (const t of sub.topics) {
        if (!entry.topics.some((existing) => existing.name === t.name)) {
          entry.topics.push({
            id: t.id,
            name: t.name,
            description: t.description,
            questionCount: t._count.questions,
          });
        }
      }
    }

    const practiceCategories = Array.from(groupedSubjectsMap.values());
    return res.json({ categories: practiceCategories });
  } catch (error) {
    console.error('Error fetching practice topics:', error);
    return res.status(500).json({ error: 'Failed to retrieve practice modules.' });
  }
});

// GET /api/practice/topics/:id - load practice questions for a topic
router.get('/topics/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        subject: { include: { exam: true } },
        questions: {
          include: {
            options: true,
          },
          take: 20,
        },
      },
    });

    if (!topic) {
      return res.status(404).json({ error: 'Practice topic not found.' });
    }

    let bookmarkedSet = new Set<string>();
    if (req.user) {
      const bmarks = await prisma.bookmark.findMany({
        where: { userId: req.user.id },
        select: { questionId: true },
      });
      bookmarkedSet = new Set(bmarks.map((b) => b.questionId));
    }

    const questions = topic.questions.map((q, idx) => ({
      id: q.id,
      index: idx + 1,
      questionText: q.questionText,
      difficulty: q.difficulty,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      explanation: q.explanation,
      isBookmarked: bookmarkedSet.has(q.id),
      options: q.options
        .map((o) => ({
          id: o.id,
          optionKey: o.optionKey,
          optionText: o.optionText,
          isCorrect: o.isCorrect,
        }))
        .sort((a, b) => a.optionKey.localeCompare(b.optionKey)),
    }));

    return res.json({
      topic: {
        id: topic.id,
        name: topic.name,
        description: topic.description,
        subjectName: topic.subject.name,
        examName: topic.subject.exam.name,
      },
      questions,
    });
  } catch (error) {
    console.error('Error fetching topic practice:', error);
    return res.status(500).json({ error: 'Failed to retrieve topic practice questions.' });
  }
});

export default router;
