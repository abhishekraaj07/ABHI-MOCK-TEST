import React, { useState } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { Wordmark } from '../components/Wordmark';
import { Lock, Mail, User, ShieldCheck, UserCheck, Sparkles, LogIn } from 'lucide-react';

export const AuthPage: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
  const { navigate, queryParams } = useRouter();
  const { login, register, signInWithGoogle } = useAuth();
  const redirectTarget = queryParams.get('redirect') || '/dashboard';

  const [isLogin, setIsLogin] = useState<boolean>(mode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (isLogin) {
      const res = await login(email, password);
      setSubmitting(false);
      if (res.success) {
        navigate(redirectTarget);
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } else {
      if (password !== confirmPassword) {
        setSubmitting(false);
        setError('Passwords do not match');
        return;
      }
      const res = await register(name, email, password, confirmPassword);
      setSubmitting(false);
      if (res.success) {
        navigate(redirectTarget);
      } else {
        setError(res.error || 'Registration failed');
      }
    }
  };

  // Quick 1-click Demo Fill (email only — never ship passwords in client bundles)
  const fillStudent = () => {
    setIsLogin(true);
    setEmail('student@abhimocktest.com');
    setPassword('');
  };

  const fillAdmin = () => {
    setIsLogin(true);
    setEmail('admin@abhimocktest.com');
    setPassword('');
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
              ? 'Sign in securely with Google or credentials to access your tests and scorecards.'
              : 'Create your account to unlock simulated mocks and diagnostic analytics.'}
          </p>
        </div>

        {/* Quick Demo Logins Box */}
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-4 space-y-2 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
            Instant Demo Logins
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="demo-student-btn"
              onClick={fillStudent}
              className="rounded border border-[var(--line)] bg-[var(--paper)] p-2 text-left hover:border-[var(--accent)] transition-colors flex items-center gap-2"
            >
              <UserCheck size={16} className="text-[var(--accent)] flex-shrink-0" />
              <div>
                <div className="font-bold text-[11px] text-[var(--ink)]">Student Login</div>
                <div className="text-[9px] opacity-60">student@abhimocktest.com</div>
              </div>
            </button>

            <button
              type="button"
              id="demo-admin-btn"
              onClick={fillAdmin}
              className="rounded border border-[var(--line)] bg-[var(--paper)] p-2 text-left hover:border-red-500 transition-colors flex items-center gap-2"
            >
              <ShieldCheck size={16} className="text-red-600 flex-shrink-0" />
              <div>
                <div className="font-bold text-[11px] text-[var(--ink)]">Admin Login</div>
                <div className="text-[9px] opacity-60">admin@abhimocktest.com</div>
              </div>
            </button>
          </div>
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
                <label className="text-xs font-semibold text-[var(--ink)] opacity-80">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-3 opacity-40" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full rounded border border-[var(--line)] bg-[var(--paper)] pl-9 pr-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--ink)] opacity-80">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 opacity-40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full rounded border border-[var(--line)] bg-[var(--paper)] pl-9 pr-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--ink)] opacity-80">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 opacity-40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded border border-[var(--line)] bg-[var(--paper)] pl-9 pr-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--ink)] opacity-80">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-3 opacity-40" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded border border-[var(--line)] bg-[var(--paper)] pl-9 pr-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300">
                {error}
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
