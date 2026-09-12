import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { RouterProvider, useRouter } from './contexts/RouterContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Spinner } from './components/Spinner';

// Lazy-loaded pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const ExamsPage = React.lazy(() => import('./pages/ExamsPage'));
const ExamDetailPage = React.lazy(() => import('./pages/ExamDetailPage'));
const MockTestsPage = React.lazy(() => import('./pages/MockTestsPage'));
const TestInstructionsPage = React.lazy(() => import('./pages/TestInstructionsPage'));
const LiveTestEnginePage = React.lazy(() => import('./pages/LiveTestEnginePage'));
const ResultPage = React.lazy(() => import('./pages/ResultPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const MyTestsPage = React.lazy(() => import('./pages/MyTestsPage'));
const PracticePage = React.lazy(() => import('./pages/PracticePage'));
const TopicPracticePage = React.lazy(() => import('./pages/TopicPracticePage'));
const BookmarksPage = React.lazy(() => import('./pages/BookmarksPage'));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const FaqPage = React.lazy(() => import('./pages/FaqPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const MentorPage = React.lazy(() => import('./pages/MentorPage'));
const WrongQuestionsPage = React.lazy(() => import('./pages/WrongQuestionsPage'));
const DailyChallengePage = React.lazy(() => import('./pages/DailyChallengePage'));
const CustomTestBuilderPage = React.lazy(() => import('./pages/CustomTestBuilderPage'));

const AppContent: React.FC = () => {
  const { path, currentPath: rawCurrentPath } = useRouter();
  const currentPath = rawCurrentPath || path || '/';

  // Route matching helpers (distraction-free live engine canvas)
  const isLiveTest =
    (/^\/tests?\/[^/]+$/.test(currentPath) && !currentPath.endsWith('/instructions')) ||
    /^\/daily-challenge\/quiz$/.test(currentPath);

  const renderRoute = () => {
    // Exact routes
    if (currentPath === '/') return <LandingPage />;
    if (currentPath === '/exams') return <ExamsPage />;
    if (currentPath === '/mock-tests' || currentPath === '/tests') return <MockTestsPage />;
    if (currentPath === '/dashboard') return <DashboardPage />;
    if (currentPath === '/my-tests') return <MyTestsPage />;
    if (currentPath === '/practice') return <PracticePage />;
    if (currentPath === '/bookmarks') return <BookmarksPage />;
    if (currentPath === '/wrong-questions' || currentPath === '/notebook') return <WrongQuestionsPage />;
    if (currentPath === '/daily-challenge' || currentPath === '/daily') return <DailyChallengePage />;
    if (currentPath === '/custom-test' || currentPath === '/create-test') return <CustomTestBuilderPage />;
    if (currentPath === '/mentor' || currentPath === '/ai-tutor') return <MentorPage />;
    if (currentPath === '/leaderboard') return <LeaderboardPage />;
    if (currentPath === '/profile') return <ProfilePage />;
    if (currentPath === '/analytics') return <AnalyticsPage />;
    if (currentPath === '/settings') return <SettingsPage />;
    if (currentPath === '/about') return <AboutPage />;
    if (currentPath === '/faq') return <FaqPage />;
    if (currentPath === '/contact') return <ContactPage />;
    if (currentPath === '/privacy') return <PrivacyPage />;
    if (currentPath === '/terms') return <TermsPage />;
    if (currentPath === '/login') return <AuthPage mode="login" />;
    if (currentPath === '/register') return <AuthPage mode="register" />;
    if (currentPath === '/admin') return <AdminPage />;

    // Dynamic routes
    // /test/:testId/instructions or /tests/:testId/instructions
    const instMatch = currentPath.match(/^\/tests?\/([^/]+)\/instructions$/);
    if (instMatch) {
      return <TestInstructionsPage testId={instMatch[1]} />;
    }

    // /test/:attemptId or /tests/:attemptId
    const testMatch = currentPath.match(/^\/tests?\/([^/]+)$/);
    if (testMatch) {
      return <LiveTestEnginePage attemptId={testMatch[1]} />;
    }

    // /result/:attemptId
    const resultMatch = currentPath.match(/^\/result\/([^/]+)$/);
    if (resultMatch) {
      return <ResultPage attemptId={resultMatch[1]} />;
    }

    // /exams/:slug
    const examMatch = currentPath.match(/^\/exams\/([^/]+)$/);
    if (examMatch) {
      return <ExamDetailPage slug={examMatch[1]} />;
    }

    // /practice/topics/:id
    const topicMatch = currentPath.match(/^\/practice\/topics\/([^/]+)$/);
    if (topicMatch) {
      return <TopicPracticePage topicId={topicMatch[1]} />;
    }

    // 404 fallback
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-[var(--ink)]">Page Not Found</h2>
        <p className="text-xs text-[var(--ink)] opacity-70">
          The requested page could not be located in the examination portal.
        </p>
        <a
          href="/"
          className="inline-block rounded bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white"
        >
          Return to Home
        </a>
      </div>
    );
  };

  // Live examination is rendered in dedicated distraction-free canvas without default navbar/footer
  if (isLiveTest) {
    return renderRoute();
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--paper)] text-[var(--ink)] antialiased transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Suspense fallback={<Spinner />}>
            <motion.div
              key={currentPath}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full"
            >
              {renderRoute()}
            </motion.div>
          </Suspense>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider>
          <AppContent />
        </RouterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
