import React, { useState } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Settings,
  User,
  Moon,
  Sun,
  Shield,
  Key,
  Sliders,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { navigate } = useRouter();

  // Test Engine Preferences (persisted in localStorage)
  const [autoAdvance, setAutoAdvance] = useState(() => {
    return localStorage.getItem('abhi_pref_autoadvance') === 'true';
  });
  const [timerAlerts, setTimerAlerts] = useState(() => {
    return localStorage.getItem('abhi_pref_timeralerts') !== 'false';
  });
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(() => {
    return localStorage.getItem('abhi_pref_shortcuts') !== 'false';
  });

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Clear drafts feedback
  const [draftsCleared, setDraftsCleared] = useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=/settings');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-sm text-[var(--ink)] opacity-60">
        Loading settings...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleToggleAutoAdvance = (val: boolean) => {
    setAutoAdvance(val);
    localStorage.setItem('abhi_pref_autoadvance', String(val));
  };

  const handleToggleTimerAlerts = (val: boolean) => {
    setTimerAlerts(val);
    localStorage.setItem('abhi_pref_timeralerts', String(val));
  };

  const handleToggleShortcuts = (val: boolean) => {
    setKeyboardShortcuts(val);
    localStorage.setItem('abhi_pref_shortcuts', String(val));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'All password fields are required.' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 8 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    if (user?.isGuest) {
      setPasswordStatus({ type: 'error', message: 'Guest mode active — password modification not available.' });
      return;
    }

    setUpdatingPassword(true);
    try {
      const token = localStorage.getItem('abhi_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const d = await res.json();
        setPasswordStatus({ type: 'error', message: d.error || 'Failed to update password.' });
      }
    } catch {
      setPasswordStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleClearDrafts = () => {
    // Clear any test attempt drafts stored locally
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('abhi_attempt_draft_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    setDraftsCleared(true);
    setTimeout(() => setDraftsCleared(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="border-b border-[var(--line)] bg-[var(--surface)] py-8 sm:py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded border border-[var(--line)] bg-[var(--paper)] flex items-center justify-center text-[var(--accent)]">
              <Settings size={20} />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                Account Settings & Preferences
              </h1>
              <p className="text-xs sm:text-sm opacity-75">
                Manage your credentials, examination preferences, and theme appearance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Details */}
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
            <User size={16} className="text-[var(--accent)]" />
            <h2 className="font-serif text-lg font-bold">Candidate Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1 text-xs">
            <div>
              <div className="opacity-60 uppercase tracking-wider font-semibold">Full Name</div>
              <div className="font-bold text-sm sm:text-base mt-1">{user.name}</div>
            </div>

            <div>
              <div className="opacity-60 uppercase tracking-wider font-semibold">Email Address</div>
              <div className="font-bold text-sm sm:text-base mt-1 font-mono">{user.email}</div>
            </div>

            <div>
              <div className="opacity-60 uppercase tracking-wider font-semibold">Account Role</div>
              <div className="mt-1">
                <span className={`inline-block rounded px-2.5 py-0.5 text-xs font-bold ${
                  user.role === 'ADMIN'
                    ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900'
                    : 'bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)]'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance & Theme */}
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
            {theme === 'dark' ? <Moon size={16} className="text-[var(--accent)]" /> : <Sun size={16} className="text-[var(--accent)]" />}
            <h2 className="font-serif text-lg font-bold">Theme & Appearance</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
            <div className="space-y-1">
              <div className="text-sm font-semibold">Color Scheme</div>
              <p className="text-xs opacity-75 max-w-md">
                Switch between high-contrast light mode and eye-safe deep twilight dark mode.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 rounded border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-xs font-semibold hover:border-[var(--accent)] transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={15} className="text-amber-500" />
                    <span>Switch to Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={15} className="text-slate-600" />
                    <span>Switch to Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Test Engine Preferences */}
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
            <Sliders size={16} className="text-[var(--accent)]" />
            <h2 className="font-serif text-lg font-bold">Examination Engine Preferences</h2>
          </div>

          <div className="divide-y divide-[var(--line)]/60 text-xs">
            {/* Auto-advance */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-sm">Auto-Advance on Selection</div>
                <p className="opacity-75 mt-0.5">
                  Automatically transition to the next question when an option is selected.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => handleToggleAutoAdvance(e.target.checked)}
                className="h-4 w-4 rounded accent-[var(--accent)] cursor-pointer"
              />
            </div>

            {/* Timer warning */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-sm">Timer Expiry Warnings</div>
                <p className="opacity-75 mt-0.5">
                  Display visual warnings and red pulsing animation when remaining time drops below 3 minutes.
                </p>
              </div>
              <input
                type="checkbox"
                checked={timerAlerts}
                onChange={(e) => handleToggleTimerAlerts(e.target.checked)}
                className="h-4 w-4 rounded accent-[var(--accent)] cursor-pointer"
              />
            </div>

            {/* Keyboard shortcuts */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-sm">Keyboard Navigation Shortcuts</div>
                <p className="opacity-75 mt-0.5">
                  Allow navigation using keys: 1-4 (select options), N (Next), P (Previous), M (Mark for review).
                </p>
              </div>
              <input
                type="checkbox"
                checked={keyboardShortcuts}
                onChange={(e) => handleToggleShortcuts(e.target.checked)}
                className="h-4 w-4 rounded accent-[var(--accent)] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
            <Key size={16} className="text-[var(--accent)]" />
            <h2 className="font-serif text-lg font-bold">Security & Password</h2>
          </div>

          {passwordStatus && (
            <div
              className={`rounded border p-3.5 flex items-center gap-2 text-xs ${
                passwordStatus.type === 'success'
                  ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300'
                  : 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
              }`}
            >
              {passwordStatus.type === 'success' ? (
                <CheckCircle2 size={16} className="flex-shrink-0" />
              ) : (
                <AlertCircle size={16} className="flex-shrink-0" />
              )}
              <span>{passwordStatus.message}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3.5 max-w-md text-xs font-medium">
            <div>
              <label className="block mb-1 opacity-80">Current Password</label>
              <div className="relative flex items-center">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2 pr-10 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink)] opacity-70 hover:opacity-100 transition-opacity p-1 cursor-pointer z-10"
                  aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  tabIndex={0}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-1 opacity-80">New Password (min. 8 characters)</label>
              <div className="relative flex items-center">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2 pr-10 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink)] opacity-70 hover:opacity-100 transition-opacity p-1 cursor-pointer z-10"
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  tabIndex={0}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-1 opacity-80">Confirm New Password</label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2 pr-10 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink)] opacity-70 hover:opacity-100 transition-opacity p-1 cursor-pointer z-10"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  tabIndex={0}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="rounded bg-[var(--accent)] px-5 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Data & Session Actions */}
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
            <Shield size={16} className="text-[var(--accent)]" />
            <h2 className="font-serif text-lg font-bold">Session & Local Data</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div>
              <div className="font-semibold text-sm">Clear Cached Test Drafts</div>
              <p className="opacity-75 mt-0.5">
                Remove unsubmitted local test answer backups stored in your browser cache.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearDrafts}
              className="rounded border border-[var(--line)] bg-[var(--paper)] px-4 py-2 font-semibold hover:border-red-500 hover:text-red-600 transition-colors"
            >
              {draftsCleared ? 'Drafts Cleared!' : 'Clear Local Drafts'}
            </button>
          </div>

          <div className="border-t border-[var(--line)] pt-4 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-sm">Sign Out</div>
              <p className="opacity-75 mt-0.5">
                End your authenticated session on this computer.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="inline-flex items-center gap-1.5 rounded border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-2 font-semibold text-red-700 dark:text-red-400 hover:bg-red-100 transition-colors"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
