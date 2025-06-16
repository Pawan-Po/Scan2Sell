'use client';
import { LoginForm } from '@/components/auth/login-form'; // Reusing LoginForm for OAuth signup
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons/logo';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SignupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/inventory'); // Redirect if already logged in
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
     // Show loading skeleton or minimal content while checking auth / redirecting
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center">
            <Logo className="h-16 w-16 mb-4 text-primary" />
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center">
          <Logo className="h-16 w-16 mb-4 text-primary" />
          <CardTitle className="font-headline text-3xl">Create your Scan2Sale Account</CardTitle>
          <CardDescription>Sign up using your preferred provider to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
