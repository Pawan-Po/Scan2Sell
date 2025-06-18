'use client';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { firebaseApp } from './config';

const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User> => {
  try {
    // Diagnostic log
    console.log(
      `Attempting Google Sign-In for Firebase app: ${auth.app.name} from domain: ${window.location.origin}`
    );
    const result = await signInWithPopup(auth, googleProvider);
    if (!result.user) {
      throw new Error('Firebase sign-in successful but no user object was returned.');
    }
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    if (error instanceof Error) {
      // Check if it's a FirebaseError with a code property
      if ('code' in error && typeof (error as any).code === 'string') {
        throw new Error((error as any).message || 'An unknown Firebase error occurred during Google Sign-In.');
      }
      throw new Error(error.message || 'An unknown error occurred during Google Sign-In.');
    }
    throw new Error('An unexpected error occurred during Google Sign-In.');
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    // Consider throwing the error
    if (error instanceof Error) {
      throw new Error(error.message || 'An unknown error occurred during sign-out.');
    }
    throw new Error('An unexpected error occurred during sign-out.');
  }
};

// Wrapper to ensure it's clear this is for client-side use
export const onAuthStateChangedWrapper = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export type { User };
export { auth };
