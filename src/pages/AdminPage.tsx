import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import {
  ShieldAlert,
  FolderKanban,
  HelpCircle,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Search,
  UploadCloud,
  FileSpreadsheet,
  Flag,
  AlertTriangle,
  Download,
  RefreshCw,
  XCircle,
  Loader2,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { navigate } = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TESTS' | 'QUESTIONS' | 'USERS' | 'BULK_IMPORT' | 'REPORTS'>('OVERVIEW');
  const [stats, setStats] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Bulk Import state
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [importData, setImportData] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Question Reports state
  const [reports, setReports] = useState<any[]>([]);
  const [reportFilter, setReportFilter] = useState<string>('All');
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);

  // New Test Modal state
  const [showNewTestModal, setShowNewTestModal] = useState(false);
  const [examsList, setExamsList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [newTestTitle, setNewTestTitle] = useState('');
  const [newTestExamId, setNewTestExamId] = useState('');
  const [newTestSubjectId, setNewTestSubjectId] = useState('');
  const [newTestDuration, setNewTestDuration] = useState(60);
  const [newTestMarks, setNewTestMarks] = useState(100);
  const [newTestNeg, setNewTestNeg] = useState(0.25);
  const [savingTest, setSavingTest] = useState(false);

  // New Question Modal state
  const [showNewQModal, setShowNewQModal] = useState(false);
  const [topicsList, setTopicsList] = useState<any[]>([]);
  const [qText, setQText] = useState('');
  const [qSubjectId, setQSubjectId] = useState('');
  const [qTopicId, setQTopicId] = useState('');
  const [qExplanation, setQExplanation] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctKey, setCorrectKey] = useState('A');
  const [savingQ, setSavingQ] = useState(false);

  // Questions filter
  const [qSearch, setQSearch] = useState('');

  const token = localStorage.getItem('abhi_token');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/admin');
      return;
    }
    if (user.role !== 'ADMIN') {
      setLoading(false);
      return;
    }

    async function loadAdminData() {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, testsRes, qRes, usersRes, examsRes, reportsRes] = await Promise.all([
          fetch('/api/admin/stats', { headers }),
          fetch('/api/admin/tests', { headers }),
          fetch('/api/admin/questions', { headers }),
          fetch('/api/admin/users', { headers }),
          fetch('/api/exams'),
          fetch('/api/reports', { headers }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (testsRes.ok) {
          const d = await testsRes.json();
          setTests(d.tests || []);
        }
        if (qRes.ok) {
          const d = await qRes.json();
          setQuestions(d.questions || []);
        }
        if (usersRes.ok) {
          const d = await usersRes.json();
          setUsersList(d.users || []);
        }
        if (reportsRes.ok) {
          const d = await reportsRes.json();
          setReports(d.reports || []);
        }
        if (examsRes.ok) {
          const d = await examsRes.json();
          setExamsList(d.exams || []);
          if (d.exams.length > 0) {
            setNewTestExamId(d.exams[0].id);
            setSubjectsList(d.exams[0].subjects || []);
            if (d.exams[0].subjects?.length > 0) {
              setNewTestSubjectId(d.exams[0].subjects[0].id);
              setQSubjectId(d.exams[0].subjects[0].id);
              setTopicsList(d.exams[0].subjects[0].topics || []);
              if (d.exams[0].subjects[0].topics?.length > 0) {
                setQTopicId(d.exams[0].subjects[0].topics[0].id);
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [user, token, navigate]);

  // When exam selection changes in new test modal
  const handleExamChange = (examId: string) => {
    setNewTestExamId(examId);
    const chosen = examsList.find((e) => e.id === examId);
    if (chosen && chosen.subjects?.length > 0) {
      setSubjectsList(chosen.subjects);
      setNewTestSubjectId(chosen.subjects[0].id);
    }
  };

  // When subject changes in new question modal
  const handleQSubjectChange = (subId: string) => {
    setQSubjectId(subId);
    for (const ex of examsList) {
      const sub = ex.subjects?.find((s: any) => s.id === subId);
      if (sub && sub.topics) {
        setTopicsList(sub.topics);
        if (sub.topics.length > 0) setQTopicId(sub.topics[0].id);
        break;
      }
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestTitle || !newTestExamId || !newTestSubjectId) return;
    setSavingTest(true);

    try {
      const res = await fetch('/api/admin/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTestTitle,
          examId: newTestExamId,
          subjectId: newTestSubjectId,
          duration: Number(newTestDuration),
          totalMarks: Number(newTestMarks),
          negativeMarks: Number(newTestNeg),
          isPublished: true,
          isPremium: false,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setTests((prev) => [created.test, ...prev]);
        setShowNewTestModal(false);
        setNewTestTitle('');
      } else {
        alert('Failed to create test.');
      }
    } catch (e) {
      alert('Network error.');
    } finally {
      setSavingTest(false);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText || !qSubjectId || !qTopicId || !optA || !optB || !optC || !optD) return;
    setSavingQ(true);

    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionText: qText,
          subjectId: qSubjectId,
          topicId: qTopicId,
          explanation: qExplanation,
          marks: 1.0,
          negativeMarks: 0.25,
          options: [
            { optionKey: 'A', optionText: optA, isCorrect: correctKey === 'A' },
            { optionKey: 'B', optionText: optB, isCorrect: correctKey === 'B' },
            { optionKey: 'C', optionText: optC, isCorrect: correctKey === 'C' },
            { optionKey: 'D', optionText: optD, isCorrect: correctKey === 'D' },
          ],
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setQuestions((prev) => [created.question, ...prev]);
        setShowNewQModal(false);
        setQText('');
        setOptA('');
        setOptB('');
        setOptC('');
        setOptD('');
        setQExplanation('');
      } else {
        alert('Failed to create question.');
      }
    } catch (e) {
      alert('Error creating question.');
    } finally {
      setSavingQ(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    try {
      const res = await fetch(`/api/admin/tests/${testId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTests((prev) => prev.filter((t) => t.id !== testId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importData.trim()) return;
    setImporting(true);
    setImportResult(null);
    try {
      let payload: any = {};
      if (importFormat === 'csv') {
        payload.csv = importData;
      } else {
        payload.questions = JSON.parse(importData);
      }
      const res = await fetch('/api/admin/questions/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Import failed.');
      }
      setImportResult(data);
      // Reload questions
      const qRes = await fetch('/api/admin/questions', { headers: { Authorization: `Bearer ${token}` } });
      if (qRes.ok) {
        const qData = await qRes.json();
        setQuestions(qData.questions || []);
      }
    } catch (err: any) {
      setImportResult({
        success: false,
        errors: [err.message || 'Parsing error. Verify CSV columns or valid JSON array.'],
      });
    } finally {
      setImporting(false);
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: string) => {
    setUpdatingReportId(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status } : r))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingReportId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm opacity-60">
        Loading administrator management console...
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <ShieldAlert size={40} className="mx-auto text-red-600" />
        <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">Access Restricted</h2>
        <p className="text-xs opacity-75">
          Administrator privileges are required to access this portal. Log in with{' '}
          <code className="font-mono font-bold">admin@abhimocktest.com</code>.
        </p>
        <Link href="/login" className="inline-block rounded bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white">
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const filteredQuestions = questions.filter((q) =>
    q.questionText.toLowerCase().includes(qSearch.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--line)] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 px-2 py-0.5 text-[10px] font-mono font-bold">
              ADMINISTRATIVE CONTROL
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[var(--ink)] mt-1">
            Exam Management Console
          </h1>
          <p className="text-xs text-[var(--ink)] opacity-70">
            Author mock tests, inspect live database records, manage syllabus questions, and review registered candidate cohorts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewTestModal(true)}
            className="rounded bg-[var(--accent)] px-3.5 py-2 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} /> New Mock Test
          </button>
          <button
            onClick={() => setShowNewQModal(true)}
            className="rounded border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--accent)] transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} /> Add Question
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--line)] gap-6 overflow-x-auto">
        {(
          [
            { key: 'OVERVIEW', label: 'Platform Stats' },
            { key: 'TESTS', label: `Mock Tests (${tests.length})` },
            { key: 'QUESTIONS', label: `Question Bank (${questions.length})` },
            { key: 'USERS', label: `Candidate Roster (${usersList.length})` },
            { key: 'BULK_IMPORT', label: 'Bulk Import Questions' },
            {
              key: 'REPORTS',
              label: `Question Reports (${reports.filter((r) => r.status === 'PENDING').length} Pending)`,
            },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.key
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--ink)] opacity-60 hover:opacity-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-center">
            <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-1">
              <div className="text-[10px] uppercase opacity-60 font-sans">Total Candidates</div>
              <div className="font-serif text-3xl font-bold text-[var(--ink)]">{stats.totalUsers}</div>
            </div>
            <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-1">
              <div className="text-[10px] uppercase opacity-60 font-sans">Total Mock Tests</div>
              <div className="font-serif text-3xl font-bold text-[var(--accent)]">{stats.totalTests}</div>
            </div>
            <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-1">
              <div className="text-[10px] uppercase opacity-60 font-sans">Question Bank</div>
              <div className="font-serif text-3xl font-bold text-[var(--ink)]">{stats.totalQuestions}</div>
            </div>
            <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-1">
              <div className="text-[10px] uppercase opacity-60 font-sans">Live Attempts</div>
              <div className="font-serif text-3xl font-bold text-[var(--signal-correct)]">{stats.totalAttempts}</div>
            </div>
          </div>

          <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              System Architecture & Integrity Checks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-3 space-y-1">
                <div className="font-bold">Authoritative SQLite Storage</div>
                <p className="opacity-75">
                  Synchronized with Prisma schema. All attempt scores, section distributions, and response timestamps are durably committed.
                </p>
              </div>
              <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-3 space-y-1">
                <div className="font-bold">Strict Exam Marking Logic</div>
                <p className="opacity-75">
                  Negative-marking calculations, accuracy ratios, and cohort percentile rankings are evaluated server-side in <code>scoring.ts</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TESTS TAB */}
      {activeTab === 'TESTS' && (
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--ink)]">
            <thead className="border-b border-[var(--line)] bg-[var(--paper)] text-[10px] font-bold uppercase tracking-wider opacity-70">
              <tr>
                <th className="py-3 px-4">Test Title</th>
                <th className="py-3 px-4">Exam / Subject</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Marks / Negative</th>
                <th className="py-3 px-4">Questions</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] font-mono">
              {tests.map((t) => (
                <tr key={t.id} className="hover:bg-[var(--paper)] transition-colors">
                  <td className="py-3.5 px-4 font-sans font-medium">{t.title}</td>
                  <td className="py-3.5 px-4 font-sans opacity-80">
                    <div>{t.exam?.name}</div>
                    <div className="text-[10px] opacity-60">{t.subject?.name}</div>
                  </td>
                  <td className="py-3.5 px-4">{t.duration}m</td>
                  <td className="py-3.5 px-4">
                    +{t.totalMarks} / -{t.negativeMarks}
                  </td>
                  <td className="py-3.5 px-4">{t._count?.questions || 0} Qs</td>
                  <td className="py-3.5 px-4 font-bold">{t._count?.attempts || 0}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteTest(t.id)}
                      className="text-[var(--signal-wrong)] hover:underline opacity-80 hover:opacity-100 p-1"
                      title="Delete test"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. QUESTIONS TAB */}
      {activeTab === 'QUESTIONS' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3 top-3 opacity-50" />
            <input
              type="text"
              value={qSearch}
              onChange={(e) => setQSearch(e.target.value)}
              placeholder="Search question bank by keyword..."
              className="w-full rounded border border-[var(--line)] bg-[var(--surface)] pl-9 pr-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="rounded border border-[var(--line)] bg-[var(--surface)] overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--ink)]">
              <thead className="border-b border-[var(--line)] bg-[var(--paper)] text-[10px] font-bold uppercase tracking-wider opacity-70">
                <tr>
                  <th className="py-3 px-4">Question Text</th>
                  <th className="py-3 px-4">Subject / Topic</th>
                  <th className="py-3 px-4">Marks</th>
                  <th className="py-3 px-4">Correct Option</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredQuestions.map((q) => {
                  const correct = q.options?.find((o: any) => o.isCorrect);
                  return (
                    <tr key={q.id} className="hover:bg-[var(--paper)] transition-colors">
                      <td className="py-3.5 px-4 font-medium max-w-md">{q.questionText}</td>
                      <td className="py-3.5 px-4 font-mono opacity-80">
                        <div>{q.subject?.name}</div>
                        <div className="text-[10px] opacity-60">{q.topic?.name}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        +{q.marks} / -{q.negativeMarks}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[var(--signal-correct)]">
                        Option {correct?.optionKey || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. USERS TAB */}
      {activeTab === 'USERS' && (
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--ink)]">
            <thead className="border-b border-[var(--line)] bg-[var(--paper)] text-[10px] font-bold uppercase tracking-wider opacity-70">
              <tr>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Completed Tests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] font-mono">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--paper)] transition-colors">
                  <td className="py-3.5 px-4 font-sans font-medium">{u.name}</td>
                  <td className="py-3.5 px-4 opacity-80">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-[var(--paper)] border border-[var(--line)]'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 opacity-70 font-sans">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold">
                    {u._count?.attempts || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. BULK QUESTION IMPORT TAB */}
      {activeTab === 'BULK_IMPORT' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[var(--ink)] flex items-center gap-2">
                  <UploadCloud className="text-[var(--accent)]" size={20} />
                  Bulk Question Bank Ingestion
                </h2>
                <p className="text-xs text-[var(--ink-muted)] mt-1">
                  Upload questions via CSV spreadsheet or structured JSON. Automatically dedupes existing questions and links syllabus tags.
                </p>
              </div>

              {/* Format selector */}
              <div className="flex items-center gap-2 bg-[var(--surface-sunken)] p-1 rounded-xl border border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setImportFormat('csv')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    importFormat === 'csv'
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  CSV Format
                </button>
                <button
                  type="button"
                  onClick={() => setImportFormat('json')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    importFormat === 'json'
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  JSON Format
                </button>
              </div>
            </div>

            {/* Template Buttons & File Picker */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--ink-muted)]">Templates:</span>
                <button
                  type="button"
                  onClick={() => {
                    setImportFormat('csv');
                    setImportData(
                      `questionText,exam,subject,topic,difficulty,optionA,optionB,optionC,optionD,correctOption,explanation\n"What is the SI unit of electric current?",SSC CGL,General Science,Physics,EASY,Volt,Ampere,Ohm,Watt,B,"Ampere is the SI base unit of electric current."\n"If 2x + 5 = 15, what is the value of x?",SSC CGL,Quantitative Aptitude,Algebra,EASY,3,4,5,6,C,"2x = 15 - 5 = 10, so x = 5."`
                    );
                  }}
                  className="px-2.5 py-1 bg-[var(--surface-sunken)] hover:bg-[var(--surface-hover)] border border-[var(--line)] rounded-lg text-[var(--accent)] font-medium flex items-center gap-1"
                >
                  <Download size={12} />
                  <span>Load Sample CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImportFormat('json');
                    setImportData(
                      JSON.stringify(
                        [
                          {
                            questionText: 'Which planet is known as the Red Planet?',
                            exam: 'SSC CGL',
                            subject: 'General Science',
                            topic: 'Astronomy',
                            difficulty: 'EASY',
                            optionA: 'Venus',
                            optionB: 'Mars',
                            optionC: 'Jupiter',
                            optionD: 'Saturn',
                            correctOption: 'B',
                            explanation: 'Mars appears red due to iron oxide on its surface.',
                          },
                        ],
                        null,
                        2
                      )
                    );
                  }}
                  className="px-2.5 py-1 bg-[var(--surface-sunken)] hover:bg-[var(--surface-hover)] border border-[var(--line)] rounded-lg text-[var(--accent)] font-medium flex items-center gap-1"
                >
                  <Download size={12} />
                  <span>Load Sample JSON</span>
                </button>
              </div>

              <div>
                <label className="cursor-pointer px-3 py-1.5 bg-[var(--surface-sunken)] hover:bg-[var(--surface-hover)] border border-[var(--line)] rounded-lg text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5 transition-colors">
                  <FileSpreadsheet size={13} />
                  <span>Upload File (.csv / .json)</span>
                  <input
                    type="file"
                    accept=".csv,.json,text/csv,application/json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const isJson = file.name.endsWith('.json');
                      setImportFormat(isJson ? 'json' : 'csv');
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setImportData(String(event.target?.result || ''));
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Editor Textarea */}
            <form onSubmit={handleBulkImport} className="space-y-4">
              <div>
                <textarea
                  rows={10}
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder={
                    importFormat === 'csv'
                      ? 'Paste CSV content here...\nquestionText,exam,subject,topic,difficulty,optionA,optionB,optionC,optionD,correctOption,explanation'
                      : 'Paste JSON array here...\n[ { "questionText": "...", "optionA": "...", ... } ]'
                  }
                  className="w-full p-4 font-mono text-xs bg-[var(--surface-sunken)] border border-[var(--line)] rounded-xl text-[var(--ink)] placeholder-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Import Results Banner */}
              {importResult && (
                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    importResult.success && importResult.importedCount > 0
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {importResult.success ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : (
                      <AlertTriangle size={16} className="text-amber-500" />
                    )}
                    <span>Import Batch Completed</span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs font-mono">
                    <span>
                      Imported: <strong>{importResult.importedCount || 0}</strong>
                    </span>
                    <span>
                      Duplicates Skipped: <strong>{importResult.duplicateCount || 0}</strong>
                    </span>
                    <span>
                      Failed: <strong>{importResult.failedCount || 0}</strong>
                    </span>
                  </div>

                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-2 text-xs space-y-1 max-h-32 overflow-y-auto border-t border-current/20 pt-2 font-mono">
                      {importResult.errors.map((err: string, i: number) => (
                        <div key={i}>• {err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setImportData('');
                    setImportResult(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)]"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={importing || !importData.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Processing Batch...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={14} />
                      <span>Run Ingestion Process</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. QUESTION REPORTS AUDIT TAB */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[var(--ink)] flex items-center gap-2">
                <Flag className="text-amber-500" size={20} />
                Question Error & Academic Review Inbox
              </h2>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                User-reported question discrepancies, typos, formula errors, and answer key appeals.
              </p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-[var(--surface-sunken)] p-1 rounded-xl border border-[var(--line)] text-xs font-semibold">
              {['All', 'PENDING', 'RESOLVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setReportFilter(st)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    reportFilter === st
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {st === 'All' ? 'All Reports' : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="py-16 text-center text-sm text-[var(--ink-muted)] rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
              No question reports lodged by users yet.
            </div>
          ) : (
            <div className="space-y-4">
              {reports
                .filter((r) => reportFilter === 'All' || r.status === reportFilter)
                .map((r) => (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold ${
                            r.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : r.status === 'RESOLVED'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                          }`}
                        >
                          {r.status}
                        </span>
                        <span className="font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded uppercase text-[10px]">
                          {r.reason?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[var(--ink-muted)] font-sans">
                          Reported by {r.user?.name} ({r.user?.email})
                        </span>
                        <span className="text-[var(--ink-muted)]">
                          • {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {r.status !== 'RESOLVED' && (
                          <button
                            type="button"
                            disabled={updatingReportId === r.id}
                            onClick={() => handleUpdateReportStatus(r.id, 'RESOLVED')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 size={12} />
                            <span>Resolve</span>
                          </button>
                        )}
                        {r.status !== 'REJECTED' && (
                          <button
                            type="button"
                            disabled={updatingReportId === r.id}
                            onClick={() => handleUpdateReportStatus(r.id, 'REJECTED')}
                            className="px-3 py-1 bg-[var(--surface-sunken)] hover:bg-[var(--surface-hover)] border border-[var(--line)] text-[var(--ink-muted)] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={12} />
                            <span>Reject</span>
                          </button>
                        )}
                        {r.status !== 'PENDING' && (
                          <button
                            type="button"
                            disabled={updatingReportId === r.id}
                            onClick={() => handleUpdateReportStatus(r.id, 'PENDING')}
                            className="px-2.5 py-1 text-xs text-[var(--accent)] hover:underline"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Candidate's description */}
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-[var(--ink)]">
                      <span className="font-bold text-amber-600 dark:text-amber-400 mr-2">
                        Candidate Feedback:
                      </span>
                      <span>"{r.description}"</span>
                    </div>

                    {/* Question snippet */}
                    {r.question && (
                      <div className="p-3.5 rounded-xl bg-[var(--surface-sunken)] border border-[var(--line)] space-y-2 text-xs">
                        <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--accent)] font-bold">
                          <span>{r.question.subject?.name}</span>
                          <span>• {r.question.topic?.name}</span>
                          <span>• {r.question.difficulty}</span>
                        </div>
                        <p className="font-medium text-[var(--ink)] font-sans">
                          {r.question.questionText}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE TEST */}
      {showNewTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--line)] pb-3">
              <h3 className="font-serif text-lg font-bold text-[var(--ink)]">
                Create New Mock Test
              </h3>
              <button onClick={() => setShowNewTestModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold">Test Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SBI PO Prelims Speed Drill #04"
                  value={newTestTitle}
                  onChange={(e) => setNewTestTitle(e.target.value)}
                  className="w-full rounded border border-[var(--line)] bg-[var(--paper)] p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Target Exam</label>
                  <select
                    value={newTestExamId}
                    onChange={(e) => handleExamChange(e.target.value)}
                    className="w-full rounded border border-[var(--line)] bg-[var(--paper)] p-2"
                  >
                    {examsList.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Subject</label>
                  <select
                    value={newTestSubjectId}
                    onChange={(e) => setNewTestSubjectId(e.target.value)}
                    className="w-full rounded border border-[var(--line)] bg-[var(--paper)] p-2"
                  >
                    {subjectsList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newTestDuration}
                    onChange={(e) => setNewTestDuration(Number(e.target.value))}
                    className="w-full rounded border border-[var(--line)] bg-[var(--paper)] p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Total Marks</label>
                  <input
                    type="number"
                    value={newTestMarks}
                    onChange={(e) => setNewTestMarks(Number(e.target.value))}
                    className="w-full rounded border border-[var(--line)] bg-[var(--paper)] p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Negative Marking</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newTestNeg}
                    onChange={(e) => setNewTestNeg(Number(e.target.value))}
                    className="w-full rounded border border-[var(--line)] bg-[var(--paper)] p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setShowNewTestModal(false)}
                  className="rounded border border-[var(--line)] px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTest}
                  className="rounded bg-[var(--accent)] px-4 py-2 text-white font-bold"
                >
                  {savingTest ? 'Creating...' : 'Publish Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE QUESTION */}
      {showNewQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[var(--line)] pb-3">
              <h3 className="font-serif text-lg font-bold text-[var(--ink)]">
                Add Question to Question Bank
              </h3>
              <button onClick={() => setShowNewQModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Subject</label>
                  <select
                    value={qSubjectId}
                    onChange={(e) => handleQSubjectChange(e.target.value)}
                    className="w-full rounded border border-[var(--line)] bg-[var(--paper)] p-2"
                  >
                    {subjectsList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Topic</label>
                  <select
                    value={qTopicId}
                    onChange={(e) => setQTopicId(e.target.value)}
                    className="w-full rounded border border-[var(--line)] bg-[var(--paper)] p-2"
                  >
                    {topicsList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Question Formulation</label>
                <textarea
                  required
                  rows={3}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter full question text..."
                  className="w-full rounded border border-[var(--line)] bg-[var(--paper)] p-2 font-sans"
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold">Four Answer Options</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold">A.</span>
                    <input
                      type="text"
                      required
                      placeholder="Option A text"
                      value={optA}
                      onChange={(e) => setOptA(e.target.value)}
                      className="w-full rounded border border-[var(--line)] bg-[var(--paper)] p-1.5"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold">B.</span>
                    <input
                      type="text"
                      required
                      placeholder="Option B text"
                      value={optB}
                      onChange={(e) => setOptB(e.target.value)}
                      className="w-full rounded border border-[var(--line)] bg-[var(--paper)] p-1.5"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold">C.</span>
                    <input
                      type="text"
                      required
                      placeholder="Option C text"
                      value={optC}
                      onChange={(e) => setOptC(e.target.value)}
                      className="w-full rounded border border-[var(--line)] bg-[var(--paper)] p-1.5"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold">D.</span>
                    <input
                      type="text"
                      required
                      placeholder="Option D text"
                      value={optD}
                      onChange={(e) => setOptD(e.target.value)}
                      className="w-full rounded border border-[var(--line)] bg-[var(--paper)] p-1.5"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Correct Option</label>
                <select
                  value={correctKey}
                  onChange={(e) => setCorrectKey(e.target.value)}
                  className="w-32 rounded border border-[var(--line)] bg-[var(--paper)] p-2 font-mono font-bold"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Detailed Solution & Explanation</label>
                <textarea
                  rows={3}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Explain formula, shortcut, or rationale..."
                  className="w-full rounded border border-[var(--line)] bg-[var(--paper)] p-2 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setShowNewQModal(false)}
                  className="rounded border border-[var(--line)] px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingQ}
                  className="rounded bg-[var(--accent)] px-4 py-2 text-white font-bold"
                >
                  {savingQ ? 'Saving Question...' : 'Save to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
