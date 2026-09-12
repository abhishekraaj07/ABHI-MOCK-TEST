import React, { useState } from 'react';
import { GeminiChatbot } from '../components/GeminiChatbot';
import { useAuth } from '../contexts/AuthContext';
import {
  Sparkles,
  Bot,
  Brain,
  Zap,
  Target,
  Database,
  ShieldCheck,
  BookOpen,
  HelpCircle,
} from 'lucide-react';

export const MentorPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedPersona, setSelectedPersona] = useState<string>('exam-mentor');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                <Sparkles size={11} /> Gemini 3 Multimodal AI
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Database size={11} /> Firestore Cloud Sync
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              ABHI AI Exam Mentor & Doubts Solver
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink)] opacity-70 max-w-3xl">
              Multi-turn pedagogical intelligence powered by Google Gemini. Ask doubt clarifications,
              break down intricate Quant/Reasoning puzzles, and receive tailored examination strategies.
            </p>
          </div>

          {/* Model Specification Card */}
          <div className="flex flex-col sm:flex-row gap-2 text-xs">
            <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-2.5 space-y-1 min-w-[140px]">
              <div className="text-[10px] font-bold uppercase opacity-60">Engine Tiers</div>
              <div className="font-mono text-[11px] font-semibold text-[var(--accent)]">
                Gemini 3.5 Flash
              </div>
              <div className="text-[10px] opacity-70">General tasks & explanations</div>
            </div>

            <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-2.5 space-y-1 min-w-[140px]">
              <div className="text-[10px] font-bold uppercase opacity-60">Complex Tasks</div>
              <div className="font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                Gemini 3.1 Pro
              </div>
              <div className="text-[10px] opacity-70">Deep math proof & puzzles</div>
            </div>

            <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-2.5 space-y-1 min-w-[140px]">
              <div className="text-[10px] font-bold uppercase opacity-60">High Speed</div>
              <div className="font-mono text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Gemini 3.1 Flash Lite
              </div>
              <div className="text-[10px] opacity-70">Formula & instant doubts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar guides + Interactive Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Roles & Capabilities */}
        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 space-y-3">
            <h2 className="font-serif font-bold text-sm text-[var(--ink)] border-b border-[var(--line)] pb-2 flex items-center gap-1.5">
              <Bot size={16} className="text-[var(--accent)]" />
              Specialist AI Roles
            </h2>

            <div className="space-y-2 text-xs">
              <div className="rounded p-2.5 border border-[var(--line)] bg-[var(--paper)] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[var(--ink)]">
                  <Sparkles size={13} className="text-[var(--accent)]" />
                  Exam Strategist
                </div>
                <p className="text-[11px] opacity-70">
                  Targeted study timetables, sectional cutoffs, and revision roadmaps.
                </p>
              </div>

              <div className="rounded p-2.5 border border-[var(--line)] bg-[var(--paper)] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[var(--ink)]">
                  <Brain size={13} className="text-indigo-500" />
                  Quant & Logic Master
                </div>
                <p className="text-[11px] opacity-70">
                  Step-by-step arithmetic proofs, Venn syllogisms, and 20-second Vedic shortcuts.
                </p>
              </div>

              <div className="rounded p-2.5 border border-[var(--line)] bg-[var(--paper)] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[var(--ink)]">
                  <Zap size={13} className="text-amber-500" />
                  Lightning Doubt Solver
                </div>
                <p className="text-[11px] opacity-70">
                  Instant formula lookups, grammar rule verification, and rapid checks.
                </p>
              </div>

              <div className="rounded p-2.5 border border-[var(--line)] bg-[var(--paper)] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[var(--ink)]">
                  <Target size={13} className="text-emerald-500" />
                  Question Dissector
                </div>
                <p className="text-[11px] opacity-70">
                  Detailed analysis of why options are traps to prevent negative marks.
                </p>
              </div>
            </div>
          </div>

          {/* Firestore Persistence Status */}
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[var(--ink)]">
              <Database size={15} className="text-blue-500" />
              Cloud Database Status
            </div>
            <p className="text-[11px] opacity-70 leading-relaxed">
              {user ? (
                <>
                  Logged in as <strong className="text-[var(--accent)]">{user.name}</strong>.
                  Your conversation history and mock test attempts are securely synchronized with Firestore.
                </>
              ) : (
                <>
                  Guest mode active. Sign in with Google to automatically back up your conversation threads to Firestore.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right 3 Columns: Active Multi-Turn Chat Engine */}
        <div className="lg:col-span-3 min-h-[620px]">
          <GeminiChatbot initialPersona={selectedPersona} />
        </div>
      </div>
    </div>
  );
};

export default MentorPage;
