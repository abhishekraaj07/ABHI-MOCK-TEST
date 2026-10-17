import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import { BookOpen, ChevronRight, HelpCircle } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { logger } from '../lib/logger';

interface PracticeTopic {
  id: string;
  name: string;
  questionCount: number;
}

interface PracticeCategory {
  name: string;
  topics: PracticeTopic[];
}

export const PracticePage: React.FC = () => {
  const [categories, setCategories] = useState<PracticeCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadPractice() {
      try {
        const res = await apiFetch('/api/practice');
        if (res.ok && isMounted) {
          const json = await res.json();
          setCategories(json.categories || []);
        }
      } catch (e) {
        logger.warn('Practice categories load deferred:', e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadPractice();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-[var(--line)] pb-5 space-y-1">
        <h1 className="font-serif text-3xl font-bold text-[var(--ink)]">
          Topic-Wise Practice Drills
        </h1>
        <p className="text-xs text-[var(--ink)] opacity-70">
          Untimed practice sessions with immediate step-by-step explanations and bookmarking. Ideal for eliminating weak areas identified on your dashboard.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm opacity-60">Loading practice syllabus...</div>
      ) : (
        <div className="space-y-10">
          {categories.map((cat) => (
            <div key={cat.name} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2">
                <BookOpen size={17} className="text-[var(--accent)]" />
                <h2 className="font-serif text-xl font-bold text-[var(--ink)]">{cat.name}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.topics.map((tp) => (
                  <Link
                    key={tp.id}
                    href={`/practice/topics/${tp.id}`}
                    className="flex items-center justify-between rounded border border-[var(--line)] bg-[var(--surface)] p-4 hover:border-[var(--accent)] transition-colors group"
                  >
                    <div>
                      <h3 className="font-serif text-sm font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                        {tp.name}
                      </h3>
                      <p className="text-[11px] opacity-60 font-mono mt-0.5">
                        {tp.questionCount} Questions Available
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-[var(--ink)] opacity-40 group-hover:opacity-100 group-hover:text-[var(--accent)] transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PracticePage;
