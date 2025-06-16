'use client';
import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChangedWrapper, type User } from '@/lib/firebase/auth';
import { Skeleton } from '@/components/ui/skeleton'; // Assuming you have a Skeleton component

export interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedWrapper((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    // Basic full-page skeleton loader
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
          <Skeleton className="h-8 w-8 rounded-md md:hidden" /> {/* SidebarTrigger skeleton */}
          <div className="flex-1" />
          <Skeleton className="h-8 w-8 rounded-full" /> {/* UserCircle skeleton */}
        </header>
        <div className="flex flex-1">
          <aside className="hidden md:flex md:flex-col md:w-[var(--sidebar-width-icon)] lg:md:w-[var(--sidebar-width)] border-r bg-sidebar p-2">
            {/* Simplified Sidebar skeleton */}
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
            <div className="mt-auto">
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-full" />
            </div>
          </aside>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Skeleton className="h-12 w-1/3 mb-6" />
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-32 w-full" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
