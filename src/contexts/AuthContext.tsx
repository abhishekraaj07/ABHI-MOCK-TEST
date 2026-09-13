import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiFetch } from '../lib/api';
import {
  auth,
  googleProvider,
  syncUserToFirestore,
} from '../lib/firebase';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<{ success: boolean; error?: string }>;
  guestLogin: () => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfileName: (name: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('abhi_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  const syncUserState = (u: User | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.setItem('abhi_user', JSON.stringify(u));
      } else {
        localStorage.removeItem('abhi_user');
      }
    } catch {}
  };

  // Sync session on mount via secure HTTP-only cookie
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await apiFetch('/api/auth/me', {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            syncUserState(data.user);
            // Keep Firestore user doc up to date
            syncUserToFirestore(data.user);
          } else {
            syncUserState(null);
          }
        }
      } catch (err) {
        console.warn('Session check notice:', err);
      } finally {
        // Clean up any legacy localStorage tokens for security (§Phase 2 & 22)
        try {
          localStorage.removeItem('abhi_token');
        } catch {}
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Standard Email & Password Login
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error?.message || data.error || 'Invalid email or password.';
        return { success: false, error: errMsg };
      }

      syncUserState(data.user);

      // Background persist to Firestore
      if (data.user) {
        syncUserToFirestore(data.user);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Standard Aspirant Registration
  const register = async (name: string, email: string, password: string, confirmPassword?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error?.message || data.error || 'Registration failed.';
        return { success: false, error: errMsg };
      }

      syncUserState(data.user);

      // Persist to Firestore
      if (data.user) {
        syncUserToFirestore(data.user);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Genuine Guest Mode (server-side session via HTTP-only cookie, or edge fallback)
  const guestLogin = async () => {
    try {
      const res = await fetch('/api/auth/guest-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          syncUserState(data.user);
          return { success: true };
        }
      }

      // Edge/fallback guest session
      const fallbackGuest: User = {
        id: `guest_${Date.now()}`,
        name: 'Guest Aspirant',
        email: `guest_${Date.now()}@guest.abhimocktest.com`,
        role: 'USER',
        isGuest: true,
      };
      syncUserState(fallbackGuest);
      return { success: true };
    } catch (err: any) {
      const fallbackGuest: User = {
        id: `guest_${Date.now()}`,
        name: 'Guest Aspirant',
        email: `guest_${Date.now()}@guest.abhimocktest.com`,
        role: 'USER',
        isGuest: true,
      };
      syncUserState(fallbackGuest);
      return { success: true };
    }
  };

  // Google Sign-In with Firebase Auth & Server ID Token Verification
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser: FirebaseUser = result.user;

      // Obtain verified cryptographically signed ID token from Firebase
      const idToken = await fbUser.getIdToken();

      // Sync with server session & Prisma database via server-verified token (§Phase 2)
      const res = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          idToken,
          email: fbUser.email,
          name: fbUser.displayName,
          photoURL: fbUser.photoURL,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error?.message || data.error || 'Failed to initialize session with Google account.';
        return { success: false, error: errMsg };
      }

      syncUserState(data.user);

      // Persist to Firestore database
      if (data.user) {
        await syncUserToFirestore({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          photoURL: fbUser.photoURL,
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Sign-in popup was closed before completing.' };
      }
      if (error.code === 'auth/popup-blocked') {
        return { success: false, error: 'Popup was blocked by your browser. Please allow popups for Google Sign-In.' };
      }
      return { success: false, error: error.message || 'Google Sign-In failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      // Ignore
    }
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // Ignore
    }
    try {
      localStorage.removeItem('abhi_token');
    } catch {}
    syncUserState(null);
  };

  const updateProfileName = async (name: string) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json();
        syncUserState(data.user);
        syncUserToFirestore(data.user);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: null, // Tokens stored strictly in HTTP-only cookies
        loading,
        login,
        register,
        guestLogin,
        signInWithGoogle,
        logout,
        updateProfileName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
