import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

// Permitted Gemini models specified in requirements:
// - gemini-3.1-pro-preview: For particularly complex tasks (complex DI, reasoning logic, proof)
// - gemini-3.5-flash: For general tasks (comprehensive exam mentoring, question explanation)
// - gemini-3.1-flash-lite: For tasks that should happen fast (quick doubt clearing, formula lookup)
export const SUPPORTED_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-pro-preview',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
] as const;

export type SupportedModel = typeof SUPPORTED_MODELS[number];

// System instructions tailored to competitive exam preparation
export const PERSONA_INSTRUCTIONS: Record<string, string> = {
  'exam-mentor': `You are "ABHI Exam Mentor", an expert pedagogical counselor and senior educator for Indian Competitive Examinations (SBI PO, IBPS PO, SSC CGL, RRB PO, RBI Grade B).
Your responsibilities:
1. Provide accurate, syllabus-aligned guidance for Quantitative Aptitude, Logical Reasoning, English Language, and General/Banking Awareness.
2. Break down sectional strategies, cutoff analysis, time management techniques, and revision timetables.
3. Be encouraging, disciplined, highly articulate, and practical.
4. Structure explanations with headings, bullet points, and clean formatting.`,

  'quant-reasoning': `You are "Prof. Ramanujan & Master of Reasoning", an elite Quantitative Aptitude and Analytical Reasoning master trainer for Banking & SSC exams.
Your responsibilities:
1. Solve any math or reasoning question step-by-step.
2. Always provide TWO approaches where possible: (a) Conceptual Standard Method, and (b) 20-second Exam Shortcut / Vedic Math / Option-elimination trick.
3. For puzzles, seating arrangements, and syllogisms: show clear Venn diagrams or case grids in text.
4. Highlight common traps set by examiners (e.g. "ratio of remaining vs total", "neither nor vs either or").`,

  'quick-doubts': `You are "Lightning Doubt Solver", optimized for rapid, concise, zero-fluff answers.
Your responsibilities:
1. Provide quick formula verification, grammar rule explanations, vocabulary mnemonics, or direct answer checks in under 3-4 concise bullet points.
2. State formulas clearly in standard notation.
3. Deliver high-speed clarity without filler or pleasantries.`,

  'question-explainer': `You are "Diagnostic Question Analyzer", specialized in dissecting test questions and reviewing candidate mistakes.
Your responsibilities:
1. Clarify the question statement, given variables, and required output.
2. Clearly identify the correct option and explain the exact mathematical or grammatical reason.
3. Explain why the other options (distractors) are incorrect.
4. Suggest a memory rule or checkpoint to prevent repeating this error under exam timer pressure.`
};

interface ChatMessageInput {
  role: 'user' | 'model';
  content: string;
}

// GET /api/gemini/personas
router.get('/personas', (_req: Request, res: Response) => {
  res.json({
    personas: [
      { id: 'exam-mentor', name: 'Exam Mentor', description: 'Holistic strategy, timetables & section management' },
      { id: 'quant-reasoning', name: 'Quant & Reasoning Master', description: 'Step-by-step proofs + 20-second shortcut tricks' },
      { id: 'quick-doubts', name: 'Lightning Doubts', description: 'Rapid formula verification & quick answers' },
      { id: 'question-explainer', name: 'Question Dissector', description: 'Option trap analysis & deep-dive solutions' },
    ],
    models: SUPPORTED_MODELS,
  });
});

// POST /api/gemini/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      model = 'gemini-2.5-flash',
      persona = 'exam-mentor',
      examContext,
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Messages array is required.' },
      });
    }

    // Input bounds: limit message count and length (§Phase 15)
    if (messages.length > 20) {
      return res.status(400).json({
        success: false,
        error: { code: 'PAYLOAD_TOO_LARGE', message: 'Conversation history is too long. Please start a fresh topic.' },
      });
    }

    for (const msg of messages) {
      if (!msg.content || typeof msg.content !== 'string' || msg.content.length > 2500) {
        return res.status(400).json({
          success: false,
          error: { code: 'PAYLOAD_TOO_LARGE', message: 'Message content exceeds maximum allowed length of 2500 characters.' },
        });
      }
    }

    // Validate or default model
    let targetModel: string = SUPPORTED_MODELS.includes(model) ? model : 'gemini-2.5-flash';

    // Base system instruction
    let systemInstruction = PERSONA_INSTRUCTIONS[persona] || PERSONA_INSTRUCTIONS['exam-mentor'];
    if (examContext && typeof examContext === 'object') {
      systemInstruction += `\n\nCandidate Target Context: ${JSON.stringify(examContext).slice(0, 500)}`;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: true,
        reply: `### AI Exam Mentor Guidance\n\n- **Target Strategy:** Prioritize accuracy to eliminate penalty markdowns under standard Indian banking/SSC marking schemes.\n- **Speed Math:** Dedicate 15 minutes daily to multiplication tables (up to 30), squares (up to 50), and cube roots (up to 30).\n- **Diagnostic Drill:** Solve previous year papers under strict 20-minute section clocks.`,
        modelUsed: `${targetModel}-mentor-fallback`,
        timestamp: Date.now(),
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format messages for @google/genai contents
    const contents = messages.map((m: ChatMessageInput) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content.slice(0, 2500) }],
    }));

    // 15-second timeout protection
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI response timed out after 15 seconds.')), 15000)
    );

    const generatePromise = ai.models.generateContent({
      model: targetModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.65,
      },
    });

    const response: any = await Promise.race([generatePromise, timeoutPromise]);
    const replyText = response?.text || 'No response generated from Gemini.';

    return res.json({
      success: true,
      reply: replyText,
      modelUsed: targetModel,
      persona,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'AI_PROCESSING_ERROR',
        message: error?.message || 'Failed to process conversation with Gemini.',
      },
    });
  }
});

// GET /api/gemini/models - list available models and role modes
router.get('/models', (_req: Request, res: Response) => {
  return res.json({
    models: [
      {
        id: 'gemini-3.5-flash',
        name: 'Gemini 3.5 Flash (Recommended)',
        speed: 'Fast & Balanced',
        description: 'Best for general exam mentoring, syllabus queries, and comprehensive question explanations.',
        badge: 'General Tasks',
      },
      {
        id: 'gemini-3.1-pro-preview',
        name: 'Gemini 3.1 Pro Preview',
        speed: 'Deep Reasoning',
        description: 'Best for particularly complex tasks: advanced Data Interpretation, multi-variable logic puzzles, and mathematical proofs.',
        badge: 'Complex Tasks',
      },
      {
        id: 'gemini-3.1-flash-lite',
        name: 'Gemini 3.1 Flash Lite',
        speed: 'Ultra Fast',
        description: 'Best for tasks that should happen fast: quick formula lookups, vocabulary, grammar rules, and quick verification.',
        badge: 'Lightning Fast',
      },
    ],
    personas: [
      { id: 'exam-mentor', name: 'Exam Mentor & Strategist', icon: 'Sparkles' },
      { id: 'quant-reasoning', name: 'Quant & Reasoning Expert', icon: 'Brain' },
      { id: 'quick-doubts', name: 'Lightning Doubt Solver', icon: 'Zap' },
      { id: 'question-explainer', name: 'Question Dissector', icon: 'Target' },
    ],
  });
});

export default router;
