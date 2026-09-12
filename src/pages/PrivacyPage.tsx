import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="border-b border-[var(--line)] bg-[var(--surface)] py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
            <Shield size={14} />
            Data Protection & Privacy
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm opacity-75 max-w-xl mx-auto font-mono">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-sm leading-relaxed opacity-85 font-sans">
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-3">
          <h2 className="font-serif text-lg font-bold opacity-100 flex items-center gap-2 text-[var(--accent)]">
            <Lock size={16} /> 1. Overview & Commitment
          </h2>
          <p>
            At <strong>ABHI MOCK TEST</strong>, we take the confidentiality of candidate data seriously. This Privacy Policy sets out the categories of personal data collected, stored, and processed when you interact with our online examination testing engine.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold opacity-100">
            2. Information We Collect
          </h2>
          <p>We collect only the minimum data strictly required to deliver mock tests and track candidate performance:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li><strong>Account Data:</strong> Name and email address provided during registration. Passwords are never stored in plaintext and are hashed using bcrypt.</li>
            <li><strong>Examination Data:</strong> Timestamped responses, question selection options, time spent per question, review flags, and submission timestamps.</li>
            <li><strong>Diagnostic Metrics:</strong> Historical test scores, sectional accuracies, topic error rates, and saved question bookmarks.</li>
            <li><strong>Technical Diagnostics:</strong> IP addresses and browser agent headers to protect against automated bots and maintain platform stability.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold opacity-100">
            3. How Information is Used
          </h2>
          <p>Your examination submissions and performance records are used exclusively to:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>Evaluate test responses against official marking criteria and negative deduction rules.</li>
            <li>Calculate authentic cohort ranking and percentile standing relative to other test-takers.</li>
            <li>Power the Weak-Area Diagnostic Engine that suggests remedial study modules.</li>
            <li>Authenticate user sessions securely via JSON Web Tokens (JWT).</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold opacity-100">
            4. Data Retention & Third Parties
          </h2>
          <p>
            We do not sell, rent, or trade student personal information with commercial advertisers or third-party marketing companies. Test answers are stored securely within our local SQLite / Prisma persistence tier.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold opacity-100">
            5. Candidate Rights
          </h2>
          <p>
            You may review your profile details, inspect all historical test scores, delete stored bookmarks, or request complete account erasure at any time by contacting our developer team.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;
