import React, { useState } from 'react';
import { Link } from '../contexts/RouterContext';
import { ChevronDown, ChevronUp, HelpCircle, ArrowRight } from 'lucide-react';

interface FaqItem {
  question: string;
  category: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    category: 'Test Engine & Scoring',
    question: 'How does the negative marking scheme work?',
    answer:
      'Our platform strictly replicates official exam evaluation standards (such as SBI PO and SSC CGL). For each correct answer, you receive full positive marks (e.g. +1.0). For each incorrect response, 0.25 marks (or the specific negative marking fraction designated for that test) are subtracted. Unanswered questions do not result in any penalty.',
  },
  {
    category: 'Test Engine & Scoring',
    question: 'What happens when the countdown timer reaches zero?',
    answer:
      'When the timer expires, the test engine automatically finalizes and safely submits your responses to our server. All recorded answers up to that exact second are calculated into your final score without data loss.',
  },
  {
    category: 'Test Engine & Scoring',
    question: 'What if my browser crashes, page refreshes, or internet drops?',
    answer:
      'We use a dual-tier persistence layer. Every answer choice is immediately backed up to local storage as well as debounced and synchronized to our server in real-time. If your browser closes or device reboots, you can return to the test and your saved selections will be restored.',
  },
  {
    category: 'Test Engine & Scoring',
    question: 'What are the 5 standardized question states in the question palette?',
    answer:
      'The question palette follows standard competitive exam UI conventions: 1) White/Grey: Not Visited, 2) Orange/Red: Visited but Unanswered, 3) Green: Answered, 4) Purple: Marked for Review, and 5) Purple with Green Pip: Answered & Marked for Review (which is evaluated for marks upon final submission).',
  },
  {
    category: 'Question Types & Exams',
    question: 'What types of questions are available on ABHI MOCK TEST?',
    answer:
      'The platform supports Single-Choice Multiple Choice Questions (MCQs), Multiple-Choice MCQs, True/False format questions, and Numerical Answer types (where the candidate directly enters a calculated numeric result). All questions are curated strictly against current syllabus patterns.',
  },
  {
    category: 'Question Types & Exams',
    question: 'Which university degrees and competitive exams are covered?',
    answer:
      'We offer specialized mock tests for University Degree Programs — specifically BCA 5th Semester (CCSU) featuring 400 curated questions across DBMS, Java, Computer Networks, and Numerical Methods — as well as leading competitive exams including Banking (SBI PO, SBI Clerk, IBPS PO, RRB Officer), Staff Selection (SSC CGL), and Regulatory Bodies (RBI Grade B).',
  },
  {
    category: 'Question Types & Exams',
    question: 'How is the BCA 5th Semester (CCSU) test series structured?',
    answer:
      'The BCA series provides 10 full-scale mock tests comprising 400 syllabus-accurate questions: four 100-question master subject tests (BCA-501 DBMS, BCA-502 Java & Webpage Design, BCA-503 Computer Networks, and BCA-504 Numerical Methods), four 50-question semester mock papers, a 100-question Grand Semester Final covering all 4 subjects, and a 40-question practice mock.',
  },
  {
    category: 'Question Types & Exams',
    question: 'Are topic-wise practice drills available for BCA subjects?',
    answer:
      'Yes! Under the Practice section, students can drill down into 20 syllabus topics (5 topics per subject with 20 targeted questions each), covering critical areas like ANSI-SPARC 3-tier architecture, B+ trees, Normalization, Multithreading & Synchronization, OSI & TCP/IP framing, CRC error detection, Newton-Raphson, and RK4 numerical methods.',
  },
  {
    category: 'Analytics & Performance',
    question: 'How are my rank and percentile calculated?',
    answer:
      'Unlike platforms with fabricated percentiles, ABHI MOCK TEST calculates percentile and cohort rank using real completed attempt scores in our database. When enough tests are completed by candidates, your percentile reflects the exact proportion of participants who scored below your total.',
  },
  {
    category: 'Analytics & Performance',
    question: 'How does the Weak Area Diagnostic Engine work?',
    answer:
      'After you submit tests, our diagnostics engine audits your accuracy across all attempted topics. Any subject or sub-topic where your historical accuracy falls below 60% is automatically flagged as a weak area with direct recommended practice drills.',
  },
  {
    category: 'Account & Security',
    question: 'Is an account required to attempt mock tests?',
    answer:
      'You can browse tests and attempt free introductory practice without logging in. Creating a free account enables persistent attempt tracking, performance graphs, bookmarks, and detailed question-by-question explanations.',
  },
  {
    category: 'Account & Security',
    question: 'Is ABHI MOCK TEST optimized for mobile devices?',
    answer:
      'Yes, the entire platform is built mobile-first and responsive. The live test engine includes a collapsible question drawer and responsive touch targets designed for smartphones and tablets.',
  },
];

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Test Engine & Scoring', 'Question Types & Exams', 'Analytics & Performance', 'Account & Security'];

  const filteredFaqs =
    selectedCategory === 'All'
      ? FAQ_DATA
      : FAQ_DATA.filter((item) => item.category === selectedCategory);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      {/* Header */}
      <section className="border-b border-[var(--line)] bg-[var(--surface)] py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
            <HelpCircle size={14} />
            Frequently Asked Questions
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            How Can We Help You?
          </h1>
          <p className="text-sm sm:text-base opacity-75 max-w-xl mx-auto">
            Everything you need to know about the mock test engine, scoring formulas, timing policies, and analytics.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded px-3.5 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[var(--accent)] text-white'
                  : 'border border-[var(--line)] bg-[var(--surface)] opacity-80 hover:opacity-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="rounded border border-[var(--line)] bg-[var(--surface)] transition-colors overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-semibold transition-colors hover:bg-[var(--paper)]"
                >
                  <span className="pr-4">{faq.question}</span>
                  <span className="text-[var(--accent)] flex-shrink-0">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm opacity-80 leading-relaxed border-t border-[var(--line)]/50 bg-[var(--paper)]/40 font-sans">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions card */}
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-base">Have a question not listed here?</h3>
            <p className="text-xs opacity-75">
              Contact our engineering team or send feedback regarding examination patterns.
            </p>
          </div>
          <Link
            href="/contact"
            className="rounded bg-[var(--accent)] px-5 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors flex-shrink-0"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
};

export default FaqPage;
