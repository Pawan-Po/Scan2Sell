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
    const result = await signInWithPopup(auth, googleProvider);
    if (!result.user) {
      // This case should ideally not be reached if signInWithPopup resolves successfully
      // and doesn't throw, but as a safeguard.
      throw new Error('Firebase sign-in successful but no user object was returned.');
    }
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    // Re-throw the error to be caught by the calling component.
    // Firebase errors often have a 'code' and 'message' property.
    // If it's a standard Error, its message will be used.
    // If it's a Firebase specific error, its message might be more informative.
    if (error instanceof Error) {
      // You could check for specific Firebase error codes here if needed
      // e.g., if (error.code === 'auth/popup-closed-by-user') { ... }
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
