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
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfileName: (name: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('abhi_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Sync session on mount
  useEffect(() => {
    async function checkAuth() {
      const storedToken = localStorage.getItem('abhi_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiFetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(storedToken);

          // Keep Firestore user doc up to date
          if (data.user?.id) {
            syncUserToFirestore(data.user);
          }
        } else {
          // Token expired or invalid
          localStorage.removeItem('abhi_token');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.warn('Session verification deferred:', err);
      } finally {
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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('abhi_token', data.token);

      // Background persist to Firestore
      syncUserToFirestore(data.user);

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
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('abhi_token', data.token);

      // Persist to Firestore
      syncUserToFirestore(data.user);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Google Sign-In with Firebase Auth
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser: FirebaseUser = result.user;

      // Sync with server session & Prisma database
      const res = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Aspirant',
          photoURL: fbUser.photoURL,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to initialize session with Google account.' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('abhi_token', data.token);

      // Persist to Firestore database
      await syncUserToFirestore({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        photoURL: fbUser.photoURL,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      // Helpful error message if popups are blocked or cancelled
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
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore
    }
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('abhi_token');
    setUser(null);
    setToken(null);
  };

  const updateProfileName = async (name: string) => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
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
        token,
        loading,
        login,
        register,
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
