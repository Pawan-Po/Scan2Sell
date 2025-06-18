'use client';
import type { ReactNode } from 'react';
import React, { createContext } from 'react';
import type { User } from '@/lib/firebase/auth'; // Keep type for potential future use

export interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Since auth is removed "for now", we simulate a logged-out, not-loading state.
  const user: User | null = null;
  const loading = false;

  // No actual auth state checking needed if login/signup is removed.
  // The initial full-page loading skeleton can be removed as `loading` is always false.

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
