import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest, authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

export const VALID_REPORT_REASONS = [
  'wrong_question',
  'wrong_answer',
  'typo',
  'unclear_question',
  'technical_issue',
] as const;

// POST /api/reports - Candidate flags a question issue (§Feature 1)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { questionId, testId, reason, description } = req.body;

    if (!questionId || typeof questionId !== 'string') {
      return res.status(400).json({ error: 'Valid Question ID is required.' });
    }

    if (!reason || !VALID_REPORT_REASONS.includes(reason)) {
      return res.status(400).json({
        error: `Invalid report reason. Allowed reasons: ${VALID_REPORT_REASONS.join(', ')}`,
      });
    }

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return res.status(400).json({
        error: 'Please provide a clear description of the issue (at least 5 characters).',
      });
    }

    // Verify question exists
    const questionExists = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });

    if (!questionExists) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const report = await prisma.questionReport.create({
      data: {
        userId,
        questionId,
        testId: testId && typeof testId === 'string' ? testId : null,
        reason,
        description: description.trim(),
        status: 'PENDING',
      },
      include: {
        question: { select: { questionText: true } },
      },
    });

    return res.status(201).json({
      success: true,
      report: {
        id: report.id,
        questionId: report.questionId,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt,
      },
      message: 'Question report submitted successfully. Our pedagogical team will review it.',
    });
  } catch (error) {
    console.error('Error reporting question:', error);
    return res.status(500).json({ error: 'Failed to submit question report.' });
  }
});

// GET /api/reports - Admin lists all reports
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status && typeof status === 'string' && status !== 'All') {
      where.status = status;
    }

    const reports = await prisma.questionReport.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        question: {
          select: {
            id: true,
            questionText: true,
            difficulty: true,
            subject: { select: { name: true } },
            topic: { select: { name: true } },
            options: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ error: 'Failed to fetch question reports.' });
  }
});

// PATCH /api/reports/:id - Admin updates report status
router.patch('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'RESOLVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be PENDING, RESOLVED, or REJECTED.' });
    }

    const updated = await prisma.questionReport.update({
      where: { id },
      data: { status },
    });

    return res.json({ success: true, report: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update report status.' });
  }
});

export default router;
