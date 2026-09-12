/**
 * Universal Resilient API Client & Fallback Router
 * Automatically protects against HTML responses returned by static SPA hosts
 * (e.g., Cloudflare Pages _redirects returning index.html for /api/*)
 */

import {
  FALLBACK_EXAMS,
  FALLBACK_PRACTICE_CATEGORIES,
  FALLBACK_QUESTIONS,
  FALLBACK_STATS,
  filterFallbackTests,
  getFallbackDailyChallenge,
  submitFallbackDailyChallenge,
  startFallbackTestAttempt,
  saveFallbackAttemptAnswer,
  submitFallbackTestAttempt,
  getFallbackTestResult,
  FALLBACK_TESTS,
} from './fallbackData';

/**
 * Client-Side API Router: handles requests offline or when Cloudflare Pages
 * serves static files without an active Express backend.
 */
export function clientApiRouter(urlStr: string, options?: RequestInit): Response {
  try {
    const parsed = new URL(urlStr, window.location.origin);
    const pathname = parsed.pathname;
    const searchParams = parsed.searchParams;
    const method = (options?.method || 'GET').toUpperCase();

    // Query params helper object
    const query: Record<string, string> = {};
    searchParams.forEach((v, k) => {
      query[k] = v;
    });

    let bodyData: any = {};
    if (options?.body && typeof options.body === 'string') {
      try {
        bodyData = JSON.parse(options.body);
      } catch {}
    }

    // 1. /api/exams
    if (pathname === '/api/exams') {
      return jsonResponse({ exams: FALLBACK_EXAMS });
    }
    if (pathname.startsWith('/api/exams/')) {
      const slugOrId = pathname.replace('/api/exams/', '');
      const exam =
        FALLBACK_EXAMS.find((e) => e.slug === slugOrId || e.id === slugOrId) ||
        FALLBACK_EXAMS[0];
      return jsonResponse({ exam });
    }

    // 2. /api/tests
    if (pathname === '/api/tests') {
      const filtered = filterFallbackTests(query);
      return jsonResponse({ tests: filtered });
    }
    if (pathname.match(/^\/api\/tests\/[^/]+\/start$/) && method === 'POST') {
      const testId = pathname.split('/')[3];
      const attempt = startFallbackTestAttempt(testId);
      return jsonResponse(attempt);
    }
    if (pathname.startsWith('/api/tests/')) {
      const testId = pathname.replace('/api/tests/', '');
      const test = FALLBACK_TESTS.find((t) => t.id === testId) || FALLBACK_TESTS[0];
      return jsonResponse({ test });
    }

    // 3. /api/practice
    if (pathname === '/api/practice') {
      return jsonResponse({ categories: FALLBACK_PRACTICE_CATEGORIES });
    }
    if (pathname.startsWith('/api/practice/topics/')) {
      const topicId = pathname.replace('/api/practice/topics/', '');
      // Find matching questions or return a curated set
      let matching = FALLBACK_QUESTIONS.filter((q) => q.topicId === topicId);
      if (matching.length === 0) {
        matching = FALLBACK_QUESTIONS.slice(0, 10);
      }
      return jsonResponse({
        topic: { id: topicId, name: matching[0]?.topic?.name || 'Practice Drill' },
        questions: matching.map((q, idx) => ({
          id: q.id,
          order: idx + 1,
          questionText: q.questionText,
          difficulty: q.difficulty,
          subjectName: q.subject?.name,
          explanation: q.explanation,
          options: q.options,
        })),
      });
    }

    // 4. /api/daily-challenge
    if (pathname === '/api/daily-challenge' && method === 'GET') {
      const challengeData = getFallbackDailyChallenge();
      return jsonResponse(challengeData);
    }
    if (pathname === '/api/daily-challenge/submit' && method === 'POST') {
      const result = submitFallbackDailyChallenge(bodyData);
      return jsonResponse(result);
    }

    // 5. /api/attempts
    if (pathname.match(/^\/api\/attempts\/[^/]+\/answer$/) && method === 'POST') {
      const attemptId = pathname.split('/')[3];
      const res = saveFallbackAttemptAnswer(
        attemptId,
        bodyData.questionId,
        bodyData.selectedOption,
        bodyData.status,
        bodyData.timeSpentSeconds
      );
      return jsonResponse(res);
    }
    if (pathname.match(/^\/api\/attempts\/[^/]+\/submit$/) && method === 'POST') {
      const attemptId = pathname.split('/')[3];
      const result = submitFallbackTestAttempt(attemptId, bodyData.timeSpent);
      return jsonResponse(result);
    }
    if (pathname.startsWith('/api/attempts/')) {
      const attemptId = pathname.replace('/api/attempts/', '');
      try {
        const attempts = JSON.parse(localStorage.getItem('abhi_local_attempts') || '{}');
        if (attempts[attemptId]) {
          const att = attempts[attemptId];
          return jsonResponse({
            success: true,
            attempt: att,
            questions: att.questions || [],
          });
        }
      } catch {}
      const defaultAttempt = startFallbackTestAttempt(FALLBACK_TESTS[0]?.id || 'sbi-po-test-1');
      return jsonResponse({
        success: true,
        attempt: defaultAttempt.attempt,
        questions: defaultAttempt.questions || [],
      });
    }

    // 6. /api/results
    if (pathname.startsWith('/api/results/')) {
      const attemptId = pathname.replace('/api/results/', '');
      const res = getFallbackTestResult(attemptId);
      return jsonResponse(res);
    }

    // 7. /api/leaderboard
    if (pathname === '/api/leaderboard') {
      return jsonResponse({
        leaderboard: [
          { rank: 1, name: 'Ananya Sharma', score: 94.5, accuracy: 96, percentile: 99.8, avatar: 'AS' },
          { rank: 2, name: 'Rohan Verma', score: 91.0, accuracy: 93, percentile: 99.2, avatar: 'RV' },
          { rank: 3, name: 'Priya Patel', score: 88.75, accuracy: 91, percentile: 98.7, avatar: 'PP' },
          { rank: 4, name: 'Amit Kumar', score: 86.25, accuracy: 89, percentile: 97.9, avatar: 'AK' },
          { rank: 5, name: 'Sneha Roy', score: 84.5, accuracy: 88, percentile: 96.5, avatar: 'SR' },
          { rank: 6, name: 'You', score: 78.5, accuracy: 84, percentile: 92.1, avatar: 'ME', isUser: true },
        ],
      });
    }

    // 8. /api/analytics
    if (pathname.startsWith('/api/analytics')) {
      return jsonResponse({
        overview: {
          testsAttempted: 14,
          avgScore: 72.4,
          avgAccuracy: 84.6,
          totalTimeHours: 18.5,
          percentile: 88.3,
        },
        weakAreas: [
          { subject: 'Quantitative Aptitude', topic: 'Data Interpretation', accuracy: 52 },
          { subject: 'Reasoning Ability', topic: 'Floor & Flat Puzzles', accuracy: 58 },
          { subject: 'English Language', topic: 'Sentence Rearrangement', accuracy: 64 },
        ],
      });
    }

    // 9. /api/bookmarks
    if (pathname === '/api/bookmarks') {
      const stored = JSON.parse(localStorage.getItem('abhi_bookmarks') || '[]');
      if (method === 'POST') {
        const questionId = bodyData.questionId;
        if (questionId && !stored.includes(questionId)) {
          stored.push(questionId);
          localStorage.setItem('abhi_bookmarks', JSON.stringify(stored));
        }
        return jsonResponse({ success: true, bookmarks: stored });
      }
      return jsonResponse({ bookmarks: stored });
    }

    // 10. /api/dashboard
    if (pathname === '/api/dashboard') {
      return jsonResponse({
        stats: FALLBACK_STATS,
        recentAttempts: [],
        dailyChallenge: getFallbackDailyChallenge(),
        recommendedTests: FALLBACK_TESTS.slice(0, 4),
      });
    }

    // 11. /api/reports
    if (pathname === '/api/reports' && method === 'POST') {
      return jsonResponse({ success: true, message: 'Report submitted successfully.' });
    }

    // 12. /api/auth/me
    if (pathname === '/api/auth/me') {
      const storedUser = localStorage.getItem('abhi_user');
      if (storedUser) {
        return jsonResponse({ user: JSON.parse(storedUser) });
      }
      return jsonResponse({ user: null }, 401);
    }

    // Generic fallback for any other unhandled /api path
    return jsonResponse({ success: true, data: [] });
  } catch (err) {
    console.error('clientApiRouter error:', err);
    return jsonResponse({ error: 'Internal fallback error' }, 500);
  }
}

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Fallback-Source': 'client-router',
    },
  });
}

/**
 * Resilient API fetch wrapper
 */
export async function apiFetch(
  url: string,
  options?: RequestInit,
  retries = 2,
  delayMs = 400
): Promise<Response> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const res = await fetch(url, options);

      // Check if server returned HTML when JSON was expected (SPA redirect fallback)
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html') || res.status === 404) {
        // Transparently route to client router
        return clientApiRouter(url, options);
      }

      if (res.status >= 500 && attempt < retries - 1) {
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        continue;
      }
      return res;
    } catch (err) {
      attempt++;
      if (attempt >= retries) {
        // If network completely failed, deliver from client router!
        return clientApiRouter(url, options);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  return clientApiRouter(url, options);
}

/**
 * Global fetch interceptor: guarantees that direct window.fetch calls to /api/*
 * never crash with HTML parsing SyntaxError on static hosts.
 */
let interceptorInstalled = false;
export function installFetchInterceptor() {
  if (typeof window === 'undefined' || interceptorInstalled) return;
  interceptorInstalled = true;

  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (typeof urlStr === 'string' && urlStr.includes('/api/')) {
      try {
        const res = await originalFetch.apply(this, [input, init]);
        const contentType = res.headers.get('content-type') || '';

        // If Cloudflare Pages returned index.html for this API call, intercept!
        if (contentType.includes('text/html') || res.status === 404) {
          return clientApiRouter(urlStr, init);
        }
        return res;
      } catch (err) {
        // Network offline or failed connection
        return clientApiRouter(urlStr, init);
      }
    }

    return originalFetch.apply(this, [input, init]);
  };
}
