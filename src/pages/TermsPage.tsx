import React from 'react';
import { FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="border-b border-[var(--line)] bg-[var(--surface)] py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
            <FileText size={14} />
            User Agreement
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm opacity-75 max-w-xl mx-auto font-mono">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-sm leading-relaxed opacity-85 font-sans">
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-3">
          <h2 className="font-serif text-lg font-bold opacity-100 flex items-center gap-2 text-[var(--accent)]">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or creating an account on <strong>ABHI MOCK TEST</strong> (&quot;the Platform&quot;), you agree to comply with and be bound by these Terms of Service. If you do not accept these conditions, you must refrain from using the examination simulator.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold opacity-100">
            2. Platform Purpose & Educational Disclaimer
          </h2>
          <p>
            ABHI MOCK TEST provides simulated practice exams for academic, self-evaluation, and competitive examination preparation (such as SBI PO, SSC CGL, IBPS, and RRB).
          </p>
          <div className="rounded border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle size={16} className="flex-shrink-0 text-amber-600 mt-0.5" />
            <span>
              <strong>Independent Platform Notice:</strong> ABHI MOCK TEST is an independent preparatory platform and is not affiliated, endorsed, or partnered with the State Bank of India, Institute of Banking Personnel Selection, Staff Selection Commission, or Reserve Bank of India.
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold opacity-100">
            3. User Conduct & Integrity
          </h2>
          <p>Candidates agree not to engage in any activity that compromises examination integrity, including:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>Attempting to alter server countdown timer synchronization or manipulate client network payloads.</li>
            <li>Deploying automated scripts or scrapers to harvest question databases without authorization.</li>
            <li>Sharing administrative credentials or interfering with the testing sessions of other candidates.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold opacity-100">
            4. Intellectual Property
          </h2>
          <p>
            The software design, compilation algorithms, analytical score calculations, user interface components, and branding are the intellectual property of the ABHI MOCK TEST development team.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold opacity-100">
            5. Termination & Modifications
          </h2>
          <p>
            We reserve the right to update these terms or suspend user accounts that violate test security rules or attempt unauthorized server intrusions.
          </p>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;
