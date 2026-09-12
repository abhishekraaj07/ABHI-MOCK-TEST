import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  limit,
} from 'firebase/firestore';
import defaultConfig from '../../firebase-applet-config.example.json';

// Safely discover local uncommitted config if present, otherwise use example config
const metaAny = import.meta as any;
const localConfigs = typeof metaAny?.glob === 'function' ? metaAny.glob('../../firebase-applet-config.json', { eager: true }) : {};
const localConfig = (localConfigs['../../firebase-applet-config.json'] as any)?.default || {};

const firebaseConfig = {
  ...defaultConfig,
  ...localConfig,
  apiKey:
    metaAny?.env?.VITE_FIREBASE_API_KEY ||
    localConfig.apiKey ||
    defaultConfig.apiKey ||
    'development-placeholder-key',
};

// Initialize Firebase App singleton safely
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with custom databaseId if configured
export const db: Firestore =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Firestore Collection References & Helpers
export interface FirestoreUserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  role: 'USER' | 'ADMIN';
  targetExam?: string;
  createdAt: string;
  lastLoginAt: string;
  stats?: {
    completedTests: number;
    bookmarkedQuestions: number;
    avgAccuracy?: number;
  };
}

export interface FirestoreAttempt {
  id: string;
  userId: string;
  testId: string;
  testTitle: string;
  examName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  accuracy: number;
  timeTaken: number;
  status: string;
  startedAt: string;
  submittedAt: string;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
}

export interface FirestoreChatMessage {
  id?: string;
  role: 'user' | 'model';
  content: string;
  model: string;
  persona: string;
  timestamp: number;
}

/**
 * Persist or update user profile document in Firestore
 */
export async function syncUserToFirestore(user: {
  id: string;
  email: string;
  name: string;
  role?: string;
  photoURL?: string | null;
  targetExam?: string;
}) {
  try {
    const userRef = doc(db, 'users', user.id);
    const existing = await getDoc(userRef);
    const now = new Date().toISOString();

    const userData: FirestoreUserProfile = {
      id: user.id,
      email: user.email,
      displayName: user.name,
      photoURL: user.photoURL || null,
      role: (user.role as 'USER' | 'ADMIN') || 'USER',
      targetExam: user.targetExam || 'SBI PO',
      createdAt: existing.exists() ? existing.data()?.createdAt || now : now,
      lastLoginAt: now,
    };

    await setDoc(userRef, userData, { merge: true });
    return userData;
  } catch (error) {
    console.warn('Firestore user sync notice:', error);
    return null;
  }
}

/**
 * Persist test attempt in Firestore under users/{userId}/attempts/{attemptId}
 */
export async function persistAttemptToFirestore(userId: string, attempt: FirestoreAttempt) {
  try {
    const attemptRef = doc(db, 'users', userId, 'attempts', attempt.id);
    await setDoc(attemptRef, attempt, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore attempt persistence notice:', error);
    return false;
  }
}

/**
 * Persist bookmarked question in Firestore under users/{userId}/bookmarks/{bookmarkId}
 */
export async function persistBookmarkToFirestore(
  userId: string,
  bookmark: {
    id: string;
    questionId: string;
    testTitle?: string;
    questionText?: string;
    subjectName?: string;
    topicName?: string;
  }
) {
  try {
    const bmRef = doc(db, 'users', userId, 'bookmarks', bookmark.id);
    await setDoc(
      bmRef,
      {
        ...bookmark,
        userId,
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('Firestore bookmark persistence notice:', error);
    return false;
  }
}

/**
 * Persist Gemini chat message in Firestore under users/{userId}/chats/{chatId}/messages
 */
export async function persistChatMessageToFirestore(
  userId: string,
  chatId: string,
  message: FirestoreChatMessage
) {
  try {
    const messagesCol = collection(db, 'users', userId, 'chats', chatId, 'messages');
    await addDoc(messagesCol, {
      ...message,
      createdAt: new Date().toISOString(),
    });

    // Also update parent chat metadata
    const chatDoc = doc(db, 'users', userId, 'chats', chatId);
    await setDoc(
      chatDoc,
      {
        id: chatId,
        lastUpdated: Date.now(),
        lastMessageSnippet: message.content.slice(0, 100),
        persona: message.persona,
        model: message.model,
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('Firestore chat persistence notice:', error);
    return false;
  }
}

/**
 * Fetch persisted attempts from Firestore for a user
 */
export async function fetchUserAttemptsFromFirestore(userId: string): Promise<FirestoreAttempt[]> {
  try {
    const attemptsCol = collection(db, 'users', userId, 'attempts');
    const q = query(attemptsCol, limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as FirestoreAttempt);
  } catch (error) {
    console.warn('Firestore fetch attempts notice:', error);
    return [];
  }
}
