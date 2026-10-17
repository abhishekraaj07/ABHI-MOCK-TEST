import React, { useState } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { Wordmark } from '../components/Wordmark';
import { isFirebaseConfigured } from '../lib/firebase';
import { Lock, Mail, User, ShieldCheck, UserCheck, Sparkles, LogIn, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export const AuthPage: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
  const { navigate, queryParams } = useRouter();
  const { user, loading, login, register, guestLogin, signInWithGoogle } = useAuth();
  const explicitRedirect = queryParams.get('redirect');
  const redirectTarget = explicitRedirect && explicitRedirect !== '/login' ? explicitRedirect : '/dashboard';

  const [isLogin, setIsLogin] = useState<boolean>(mode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated or after session sync, redirect away from /login
  React.useEffect(() => {
    if (!loading && user) {
      if (user.isGuest) {
        navigate(explicitRedirect && explicitRedirect !== '/login' ? explicitRedirect : '/');
      } else {
        navigate(redirectTarget);
      }
    }
  }, [user, loading, explicitRedirect, redirectTarget, navigate]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleSubmitting(true);
    const res = await signInWithGoogle();
    setGoogleSubmitting(false);
    if (res.success) {
      navigate(redirectTarget);
    } else {
      setError(res.error || 'Google Sign-In failed');
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setGuestSubmitting(true);
    const res = await guestLogin();
    setGuestSubmitting(false);
    if (res.success) {
      navigate(explicitRedirect && explicitRedirect !== '/login' ? explicitRedirect : '/');
    } else {
      setError(res.error || 'Failed to initialize guest session.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side instant validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isLogin && password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    if (isLogin) {
      const res = await login(email, password);
      setSubmitting(false);
      if (res.success) {
        navigate(redirectTarget);
      } else {
        setError(res.error || 'Invalid email or password.');
      }
    } else {
      const res = await register(name, email, password, confirmPassword);
      setSubmitting(false);
      if (res.success) {
        navigate(redirectTarget);
      } else {
        setError(res.error || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-[var(--paper)]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Wordmark size="lg" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">
            {isLogin ? 'Candidate Examination Portal' : 'Register Aspirant Account'}
          </h1>
          <p className="text-xs text-[var(--ink)] opacity-70">
            {isLogin
              ? 'Sign in securely with Google, credentials, or explore in Guest Mode.'
              : 'Create your account to unlock simulated mocks and diagnostic analytics.'}
          </p>
        </div>

        {/* Guest Mode Card */}
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
              <Sparkles size={12} /> Instant Access
            </div>
            <span className="text-[10px] text-[var(--ink)] opacity-60">No account required</span>
          </div>
          <button
            type="button"
            id="guest-mode-btn"
            onClick={handleGuestLogin}
            disabled={guestSubmitting || submitting || googleSubmitting}
            className="w-full rounded border border-[var(--line)] bg-[var(--paper)] p-3 text-left hover:border-[var(--accent)] hover:bg-[var(--surface)] transition-all flex items-center justify-between group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--accent)] group-hover:scale-105 transition-transform">
                <UserCheck size={16} />
              </div>
              <div>
                <div className="font-bold text-xs text-[var(--ink)]">Guest Mode</div>
                <div className="text-[11px] text-[var(--ink)] opacity-70">
                  Try ABHI MOCK TEST without creating an account
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-[var(--accent)] group-hover:translate-x-0.5 transition-transform">
              {guestSubmitting ? 'Entering...' : 'Enter →'}
            </span>
          </button>
        </div>

        {/* Main Auth Form Card */}
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 space-y-5 shadow-xs">
          {/* Google Sign-In with Firebase Auth button */}
          <div>
            <button
              type="button"
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={googleSubmitting || submitting}
              className="w-full flex items-center justify-center gap-3 rounded border border-[var(--line)] bg-[var(--paper)] py-2.5 px-4 text-xs font-bold text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--surface)] transition-all shadow-xs disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{googleSubmitting ? 'Authenticating with Google...' : 'Continue with Google'}</span>
            </button>
            {!isFirebaseConfigured && (
              <p className="mt-1.5 text-center text-[11px] text-[var(--ink)] opacity-60">
                Google Sign-In requires Firebase configuration. Use{' '}
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="font-semibold underline hover:text-[var(--accent)] cursor-pointer"
                >
                  Guest Mode
                </button>{' '}
                or Email below for instant access.
              </p>
            )}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--line)]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-[var(--ink)] opacity-50">
                <span className="bg-[var(--surface)] px-2">or with email credentials</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label htmlFor="auth-name-input" className="text-xs font-semibold text-[var(--ink)] opacity-80">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-3 opacity-40 pointer-events-none" />
                  <input
                    id="auth-name-input"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    aria-label="Full Name"
                    aria-required="true"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full rounded border border-[var(--line)] bg-[var(--paper)] pl-9 pr-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="auth-email-input" className="text-xs font-semibold text-[var(--ink)] opacity-80">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 opacity-40 pointer-events-none" />
                <input
                  id="auth-email-input"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  aria-label="Email Address"
                  aria-required="true"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full rounded border border-[var(--line)] bg-[var(--paper)] pl-9 pr-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="auth-password-input" className="text-xs font-semibold text-[var(--ink)] opacity-80">Password</label>
                {!isLogin && (
                  <span className={`text-[10px] font-medium flex items-center gap-1 ${password.length >= 8 ? 'text-emerald-500' : 'text-[var(--ink)] opacity-50'}`}>
                    <CheckCircle2 size={11} className={password.length >= 8 ? 'opacity-100' : 'opacity-30'} />
                    Min 8 characters
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock size={15} className="absolute left-3 opacity-50 pointer-events-none text-[var(--ink)]" />
                <input
                  id="auth-password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  aria-label="Password"
                  aria-required="true"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded border border-[var(--line)] bg-[var(--paper)] pl-9 pr-10 py-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--ink)] opacity-70 hover:opacity-100 hover:bg-[var(--line)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all cursor-pointer z-10"
                >
                  {showPassword ? <EyeOff size={15} className="text-[var(--accent)]" /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label htmlFor="auth-confirm-password-input" className="text-xs font-semibold text-[var(--ink)] opacity-80">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3 opacity-50 pointer-events-none text-[var(--ink)]" />
                  <input
                    id="auth-confirm-password-input"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    aria-label="Confirm Password"
                    aria-required="true"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded border border-[var(--line)] bg-[var(--paper)] pl-9 pr-10 py-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--ink)] opacity-70 hover:opacity-100 hover:bg-[var(--line)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all cursor-pointer z-10"
                  >
                    {showConfirmPassword ? <EyeOff size={15} className="text-[var(--accent)]" /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 flex items-start gap-2"
              >
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              id="auth-submit-btn"
              disabled={submitting || googleSubmitting}
              className="w-full rounded bg-[var(--accent)] py-2.5 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {submitting
                ? 'Processing...'
                : isLogin
                ? 'Sign In to Portal'
                : 'Create Aspirant Account'}
            </button>
          </form>

          <div className="border-t border-[var(--line)] pt-4 text-center text-xs opacity-80">
            {isLogin ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setError(null);
                  }}
                  className="font-bold text-[var(--accent)] hover:underline"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setError(null);
                  }}
                  className="font-bold text-[var(--accent)] hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
