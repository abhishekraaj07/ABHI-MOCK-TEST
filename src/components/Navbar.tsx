import React, { useState } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Wordmark } from './Wordmark';
import { Sun, Moon, Menu, X, User as UserIcon, LogOut, ShieldCheck, Bookmark, LayoutDashboard, FileText, TrendingUp, Settings, Sparkles, Bot, Flame, BookX, Sliders } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { path, navigate } = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Exclude navbar in active test engine full screen mode
  if (path.startsWith('/test/') && !path.endsWith('/instructions')) {
    return null;
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Exams', href: '/exams' },
    { name: 'Mock Tests', href: '/mock-tests' },
    { name: 'Practice', href: '/practice' },
    { name: 'Daily Sprint', href: '/daily-challenge', isDaily: true },
    { name: 'AI Mentor', href: '/mentor', isGemini: true },
    { name: 'Leaderboard', href: '/leaderboard' },
  ];

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 w-full border-b border-[var(--line)] bg-[var(--surface)] transition-colors"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Wordmark */}
        <Link href="/" id="nav-brand" className="flex items-center gap-3">
          <Wordmark size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = path === link.href || (link.href !== '/' && path.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
                  isActive
                    ? 'border-[var(--accent)] text-[var(--accent)] font-semibold'
                    : 'border-transparent text-[var(--ink)] opacity-80 hover:opacity-100 hover:text-[var(--accent)]'
                }`}
              >
                {link.isGemini && <Sparkles size={13} className="text-[var(--accent)]" />}
                {link.isDaily && <Flame size={13} className="text-amber-500 fill-current animate-pulse" />}
                <span>{link.name}</span>
                {link.isGemini && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 leading-none">
                    Gemini
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded border border-[var(--line)] text-[var(--ink)] opacity-80 hover:opacity-100 transition-colors"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* User Section */}
          {user ? (
            <div className="relative">
              <button
                id="user-menu-btn"
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded border border-[var(--line)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-xs text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline-block max-w-[120px] truncate">{user.name}</span>
                {user.role === 'ADMIN' && (
                  <span className="hidden sm:inline-block rounded bg-red-100 dark:bg-red-950 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400">
                    ADMIN
                  </span>
                )}
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded border border-[var(--line)] bg-[var(--surface)] py-1 shadow-lg z-50 text-sm text-[var(--ink)]">
                    <div className="border-b border-[var(--line)] px-4 py-2">
                      <p className="font-semibold truncate">{user.name}</p>
                      <p className="text-xs opacity-60 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--paper)] transition-colors"
                    >
                      <LayoutDashboard size={16} className="text-[var(--accent)]" />
                      Dashboard
                    </Link>

                    <Link
                      href="/analytics"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--paper)] transition-colors"
                    >
                      <TrendingUp size={16} className="text-[var(--accent)]" />
                      Analytics & Trends
                    </Link>

                    <Link
                      href="/my-tests"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--paper)] transition-colors"
                    >
                      <FileText size={16} className="text-[var(--accent)]" />
                      My Test History
                    </Link>

                    <Link
                      href="/mentor"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--paper)] transition-colors text-[var(--accent)] font-semibold"
                    >
                      <Sparkles size={16} />
                      AI Mentor (Gemini)
                    </Link>

                    <Link
                      href="/bookmarks"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--paper)] transition-colors"
                    >
                      <Bookmark size={16} className="text-[var(--accent)]" />
                      Bookmarked Questions
                    </Link>

                    <Link
                      href="/wrong-questions"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--paper)] transition-colors text-rose-600 dark:text-rose-400 font-medium"
                    >
                      <BookX size={16} />
                      Mistake Notebook
                    </Link>

                    <Link
                      href="/custom-test"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--paper)] transition-colors"
                    >
                      <Sliders size={16} className="text-[var(--accent)]" />
                      Custom Test Builder
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--paper)] transition-colors"
                    >
                      <Settings size={16} className="text-[var(--accent)]" />
                      Settings & Preferences
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <ShieldCheck size={16} />
                        Admin Control Panel
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--paper)] transition-colors"
                    >
                      <UserIcon size={16} className="text-[var(--accent)]" />
                      Profile
                    </Link>

                    <div className="border-t border-[var(--line)] mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--signal-wrong)] hover:bg-[var(--paper)] transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                id="nav-login-btn"
                className="rounded border border-[var(--line)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                id="nav-register-btn"
                className="hidden sm:inline-flex rounded bg-[var(--accent)] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden flex h-9 w-9 items-center justify-center rounded border border-[var(--line)] text-[var(--ink)]"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--line)] bg-[var(--surface)] px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper)]"
            >
              {link.name}
            </Link>
          ))}
          {user && (
            <>
              <div className="border-t border-[var(--line)] pt-2" />
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper)]"
              >
                Dashboard
              </Link>
              <Link
                href="/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper)]"
              >
                Analytics & Trends
              </Link>
              <Link
                href="/my-tests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper)]"
              >
                My Tests
              </Link>
              <Link
                href="/bookmarks"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper)]"
              >
                Bookmarks
              </Link>
              <Link
                href="/wrong-questions"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-[var(--paper)] font-semibold"
              >
                Mistake Notebook
              </Link>
              <Link
                href="/custom-test"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper)]"
              >
                Custom Test Builder
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper)]"
              >
                Settings
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  Admin Control Panel
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
};
