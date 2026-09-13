import React, { useState } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { User, KeyRound, Shield, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { navigate } = useRouter();
  const { user, loading, logout, updateProfileName } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [updatingName, setUpdatingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=/profile');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-sm text-[var(--ink)] opacity-60">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setUpdatingName(true);
    setNameSuccess(false);

    const ok = await updateProfileName(name.trim());
    setUpdatingName(false);
    if (ok) {
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (user.isGuest) {
      setPasswordMsg({ type: 'error', text: 'Guest mode active — password modification not available.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setUpdatingPassword(true);
    try {
      const token = localStorage.getItem('abhi_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const json = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: 'success', text: 'Password updated successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: json.error || 'Failed to update password.' });
      }
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Network error.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-[var(--line)] pb-5 space-y-1">
        <h1 className="font-serif text-3xl font-bold text-[var(--ink)]">Aspirant Profile</h1>
        <p className="text-xs text-[var(--ink)] opacity-70">
          Manage your account credentials, display identity, and security preferences.
        </p>
      </div>

      {/* Account Details Card */}
      <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] font-serif text-2xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h2 className="font-serif text-xl font-bold text-[var(--ink)]">{user.name}</h2>
            <p className="text-xs opacity-70">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  user.role === 'ADMIN'
                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    : 'bg-[var(--paper)] border border-[var(--line)] opacity-80'
                }`}
              >
                ROLE: {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Update Name Form */}
        <form onSubmit={handleSaveName} className="border-t border-[var(--line)] pt-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            Change Display Name
          </h3>

          <div className="space-y-1.5 max-w-md">
            <label className="text-xs font-medium opacity-80">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={updatingName}
              className="rounded bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              {updatingName ? 'Saving...' : 'Save Name'}
            </button>
            {nameSuccess && (
              <span className="flex items-center gap-1 text-xs text-[var(--signal-correct)]">
                <CheckCircle2 size={14} /> Name updated
              </span>
            )}
          </div>
        </form>

        {/* Update Password Form */}
        <form onSubmit={handleChangePassword} className="border-t border-[var(--line)] pt-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            Update Account Password
          </h3>

          <div className="space-y-3 max-w-md">
            <div className="space-y-1">
              <label className="text-xs font-medium opacity-80">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium opacity-80">New Password (min. 6 chars)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium opacity-80">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          {passwordMsg && (
            <div
              className={`rounded border p-3 text-xs max-w-md ${
                passwordMsg.type === 'success'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-red-300 bg-red-50 text-red-800'
              }`}
            >
              {passwordMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={updatingPassword}
            className="rounded border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
          >
            {updatingPassword ? 'Changing Password...' : 'Update Password'}
          </button>
        </form>

        {/* Sign Out */}
        <div className="border-t border-[var(--line)] pt-6 flex justify-between items-center">
          <div className="text-xs opacity-70">
            Sign out of your session on this device.
          </div>
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="rounded border border-red-200 dark:border-red-900 px-4 py-2 text-xs font-bold text-[var(--signal-wrong)] hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1.5"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
