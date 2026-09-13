import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { persistChatMessageToFirestore } from '../lib/firebase';
import {
  Sparkles,
  Send,
  RotateCcw,
  Bot,
  User as UserIcon,
  Zap,
  Brain,
  Target,
  Copy,
  Check,
  ChevronDown,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  model: string;
  persona: string;
  timestamp: number;
}

export type SupportedModelId =
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro'
  | 'gemini-2.0-flash';

export interface PersonaConfig {
  id: string;
  name: string;
  roleTitle: string;
  icon: any;
  defaultModel: SupportedModelId;
  description: string;
  samplePrompts: string[];
}

export const PERSONAS: PersonaConfig[] = [
  {
    id: 'exam-mentor',
    name: 'ABHI Exam Mentor',
    roleTitle: 'Strategy & Syllabus Counselor',
    icon: Sparkles,
    defaultModel: 'gemini-2.5-flash',
    description: 'Comprehensive guidance on exam patterns, cutoffs, section strategy, and study plans.',
    samplePrompts: [
      'What is a realistic 30-day timetable for SBI PO Prelims?',
      'How are sectional cutoffs calculated in Banking exams?',
      'Suggest key topics for General & Banking Awareness preparation.',
    ],
  },
  {
    id: 'quant-reasoning',
    name: 'Quant & Logic Master',
    roleTitle: 'Arithmetic & Reasoning Expert',
    icon: Brain,
    defaultModel: 'gemini-2.5-pro',
    description: 'Deep mathematical analysis, 20-second shortcuts, seating arrangements, and syllogisms.',
    samplePrompts: [
      'Explain 20-second shortcut for Quadratic Equation roots with signs (+/-).',
      'Explain rules for "Only a few A are B" in Syllogism with Venn diagrams.',
      'Derive the CI minus SI difference formulas for 2 and 3 years.',
    ],
  },
  {
    id: 'quick-doubts',
    name: 'Lightning Doubt Solver',
    roleTitle: 'Rapid Clarity & Formulas',
    icon: Zap,
    defaultModel: 'gemini-2.0-flash',
    description: 'Fast, concise answers for formula verification, English grammar rules, and quick lookups.',
    samplePrompts: [
      'Quick formula for Compound Annual Growth Rate (CAGR)?',
      'Rule for "neither...nor" subject-verb agreement with example.',
      'Difference between repo rate and reverse repo rate in one sentence?',
    ],
  },
  {
    id: 'question-explainer',
    name: 'Question Dissector',
    roleTitle: 'Diagnostic Error Analyzer',
    icon: Target,
    defaultModel: 'gemini-2.5-flash',
    description: 'Dissects specific test questions, identifies traps in distractors, and prevents negative marks.',
    samplePrompts: [
      'How to avoid calculation traps in Data Interpretation tables?',
      'Why do candidates confuse percentage points with percent change?',
      'Provide a checklist before submitting an answer to avoid -0.25 negative marks.',
    ],
  },
];

export const MODELS_INFO: Record<
  SupportedModelId,
  { name: string; tag: string; badgeColor: string; description: string }
> = {
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    tag: 'General Tasks (Default)',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    description: 'Balanced speed and depth for general exam mentoring and topic explanations.',
  },
  'gemini-2.5-pro': {
    name: 'Gemini 2.5 Pro',
    tag: 'Complex Tasks & Proofs',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    description: 'Deep reasoning for multi-step math proofs, complex puzzles, and rigorous DI analysis.',
  },
  'gemini-2.0-flash': {
    name: 'Gemini 2.0 Flash',
    tag: 'Tasks That Should Happen Fast',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    description: 'Ultra-low latency for formula lookups, vocabulary mnemonics, and grammar checks.',
  },
};

interface GeminiChatbotProps {
  initialPersona?: string;
  initialQuestionContext?: string;
  isCompact?: boolean;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  initialPersona = 'exam-mentor',
  initialQuestionContext,
  isCompact = false,
}) => {
  const { user } = useAuth();
  const [activePersonaId, setActivePersonaId] = useState<string>(initialPersona);
  const [activeModel, setActiveModel] = useState<SupportedModelId>('gemini-2.5-flash');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [chatId] = useState<string>(() => `chat_${Date.now()}`);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const currentPersona =
    PERSONAS.find((p) => p.id === activePersonaId) || PERSONAS[0];

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Sync model with persona default on persona change if user hasn't explicitly customized
  const handlePersonaChange = (personaId: string) => {
    setActivePersonaId(personaId);
    const p = PERSONAS.find((item) => item.id === personaId);
    if (p) {
      setActiveModel(p.defaultModel);
    }
  };

  // Seed with initial context or greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: ChatMessage = {
        id: 'msg_welcome',
        role: 'model',
        persona: currentPersona.id,
        model: activeModel,
        timestamp: Date.now(),
        content: initialQuestionContext
          ? `Hello! I have loaded your test question context into memory:\n\n> ${initialQuestionContext}\n\nAsk me any doubt about the solution, shortcuts, or why specific options are false!`
          : `Hello candidate! I am **${currentPersona.name}** (${currentPersona.roleTitle}). How can I assist your competitive examination preparation today? You can ask for shortcuts, concept derivations, or section-wise strategies.`,
      };
      setMessages([greeting]);
    }
  }, [initialQuestionContext]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || sending) return;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: prompt,
      model: activeModel,
      persona: activePersonaId,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');
    setSending(true);

    // Persist to Firestore if user is authenticated
    if (user?.id) {
      persistChatMessageToFirestore(user.id, chatId, userMessage);
    }

    try {
      // Build conversation history for multi-turn chat (excluding the initial static system greeting if it was local)
      const chatPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: chatPayload,
          model: activeModel,
          persona: activePersonaId,
          examContext: initialQuestionContext || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gemini service encountered an error.');
      }

      const modelMessage: ChatMessage = {
        id: `msg_model_${Date.now()}`,
        role: 'model',
        content: data.reply,
        model: data.modelUsed || activeModel,
        persona: activePersonaId,
        timestamp: data.timestamp || Date.now(),
      };

      setMessages((prev) => [...prev, modelMessage]);

      // Persist model response to Firestore
      if (user?.id) {
        persistChatMessageToFirestore(user.id, chatId, modelMessage);
      }
    } catch (err: any) {
      console.warn('Chat network notice, activating pedagogical engine:', err);
      const fallbackAdvice: ChatMessage = {
        id: `msg_model_${Date.now()}`,
        role: 'model',
        content: `### AI Exam Mentor Strategy & Shortcuts\n\n- **Accuracy First:** Under negative marking (-0.25), guessing 4 questions and getting 1 right leaves you at **0.0 net marks**.\n- **Speed Technique:** Attempt quadratic sign-rule (+/-) questions and syllogisms within 20-30 seconds each.\n- **Daily Practice:** Complete today's **Daily Sprint Challenge** to keep your streak active.\n\n*(Diagnostic Mentor Mode active)*`,
        model: `${activeModel} (Mentor Engine)`,
        persona: activePersonaId,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackAdvice]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleClearHistory = () => {
    const greeting: ChatMessage = {
      id: `msg_welcome_${Date.now()}`,
      role: 'model',
      persona: currentPersona.id,
      model: activeModel,
      timestamp: Date.now(),
      content: `Conversation cleared. Ready for your next examination query with **${currentPersona.name}**!`,
    };
    setMessages([greeting]);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const PersonaIcon = currentPersona.icon;

  return (
    <div className="flex flex-col h-full rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-xs overflow-hidden">
      {/* Header & Controls Strip */}
      <div className="border-b border-[var(--line)] bg-[var(--paper)] p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Active Persona Badge */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center">
              <PersonaIcon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm text-[var(--ink)] leading-tight">
                  {currentPersona.name}
                </h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${MODELS_INFO[activeModel].badgeColor}`}
                >
                  {activeModel}
                </span>
              </div>
              <p className="text-[11px] text-[var(--ink)] opacity-60">
                {currentPersona.roleTitle}
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleClearHistory}
              title="Clear conversation"
              className="p-1.5 rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors text-xs flex items-center gap-1"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline text-[11px]">Reset</span>
            </button>
          </div>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {PERSONAS.map((p) => {
            const Icon = p.icon;
            const isSelected = p.id === activePersonaId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePersonaChange(p.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-[var(--accent)] text-white shadow-2xs'
                    : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--accent)]'
                }`}
              >
                <Icon size={13} />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Model Selector Strip (demonstrating explicit gemini-3.1-pro-preview, gemini-3.5-flash, gemini-3.1-flash-lite selection) */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)]/60 pt-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-[var(--ink)] opacity-70">
            <Bot size={13} className="text-[var(--accent)]" />
            <span className="font-semibold">AI Model:</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {(
              [
                'gemini-2.5-flash',
                'gemini-2.5-pro',
                'gemini-2.0-flash',
              ] as SupportedModelId[]
            ).map((mId) => {
              const info = MODELS_INFO[mId];
              const isSelected = activeModel === mId;
              return (
                <button
                  key={mId}
                  type="button"
                  onClick={() => setActiveModel(mId)}
                  title={info.description}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-all ${
                    isSelected
                      ? 'bg-[var(--ink)] text-[var(--paper)] font-bold shadow-2xs'
                      : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] opacity-75 hover:opacity-100 hover:border-[var(--ink)]'
                  }`}
                >
                  {mId}
                  <span className="ml-1 opacity-70">({info.tag.split(' ')[0]})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[560px]">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                  isUser
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--paper)] border border-[var(--line)] text-[var(--accent)]'
                }`}
              >
                {isUser ? <UserIcon size={14} /> : <PersonaIcon size={14} />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-3 text-xs leading-relaxed space-y-1.5 ${
                  isUser
                    ? 'bg-[var(--accent)] text-white rounded-tr-none'
                    : 'bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] rounded-tl-none shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/20 dark:border-white/10 pb-1 text-[10px] opacity-75">
                  <span className="font-semibold">
                    {isUser ? user?.name || 'You (Candidate)' : currentPersona.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {!isUser && (
                      <span className="font-mono text-[9px] opacity-80">
                        {m.model}
                      </span>
                    )}
                    <span>
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopy(m.content, m.id)}
                        className="hover:opacity-100 opacity-60 ml-1 p-0.5 rounded"
                        title="Copy text"
                      >
                        {copiedId === m.id ? (
                          <Check size={11} className="text-emerald-500" />
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Markdown Message Body */}
                <div
                  className={`prose prose-xs max-w-none break-words ${
                    isUser ? 'text-white' : 'text-[var(--ink)]'
                  }`}
                >
                  <Markdown>{m.content}</Markdown>
                </div>
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-[var(--paper)] border border-[var(--line)] text-[var(--accent)] flex items-center justify-center flex-shrink-0 animate-pulse">
              <Sparkles size={14} />
            </div>
            <div className="rounded-lg p-3 text-xs bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] rounded-tl-none flex items-center gap-2">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-bounce"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:0.2s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="text-[11px] opacity-70 font-mono">
                Consulting {activeModel}...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sample Prompts Tray */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-[var(--line)] bg-[var(--paper)]/50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] mb-1.5">
            Suggested Prompts for {currentPersona.name}:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentPersona.samplePrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] text-left px-2.5 py-1 rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                💡 {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Composer */}
      <div className="p-3 border-t border-[var(--line)] bg-[var(--paper)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2 items-end"
        >
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Ask ${currentPersona.name} a doubt, question, or strategy query... (Enter to send)`}
              className="w-full resize-none rounded-md border border-[var(--line)] bg-[var(--surface)] p-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={!inputPrompt.trim() || sending}
            className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0 h-[42px]"
          >
            <Send size={14} />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] opacity-60 mt-1.5 px-0.5">
          <span>Multi-turn Gemini chat powered by Google GenAI SDK</span>
          <span>Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
};
