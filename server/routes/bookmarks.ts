import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

// GET /api/bookmarks - list all saved questions for user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        question: {
          include: {
            options: true,
            subject: { select: { name: true } },
            topic: { select: { name: true } },
            exam: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = bookmarks.map((b) => ({
      id: b.id,
      questionId: b.questionId,
      createdAt: b.createdAt,
      questionText: b.question.questionText,
      subjectName: b.question.subject.name,
      topicName: b.question.topic?.name || 'General',
      examName: b.question.exam.name,
      difficulty: b.question.difficulty,
      marks: b.question.marks,
      negativeMarks: b.question.negativeMarks,
      explanation: b.question.explanation,
      options: b.question.options.map((o) => ({
        optionKey: o.optionKey,
        optionText: o.optionText,
        isCorrect: o.isCorrect,
      })),
    }));

    return res.json({ bookmarks: formatted });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return res.status(500).json({ error: 'Failed to load bookmarks.' });
  }
});

// POST /api/bookmarks - toggle or add bookmark
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { questionId } = req.body;

    if (!questionId) {
      return res.status(400).json({ error: 'Question ID is required.' });
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_questionId: { userId, questionId },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return res.json({ bookmarked: false, message: 'Question removed from bookmarks.' });
    }

    const created = await prisma.bookmark.create({
      data: { userId, questionId },
    });

    return res.json({ bookmarked: true, id: created.id, message: 'Question bookmarked for revision.' });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return res.status(500).json({ error: 'Failed to update bookmark.' });
  }
});

// DELETE /api/bookmarks/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Target can be bookmark ID or question ID
    await prisma.bookmark.deleteMany({
      where: {
        userId,
        OR: [{ id }, { questionId: id }],
      },
    });

    return res.json({ success: true, message: 'Bookmark removed.' });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return res.status(500).json({ error: 'Failed to remove bookmark.' });
  }
});

export default router;
