'use client';
import { AppLayout } from '@/components/layout/app-layout';
import { ProfileClient } from '@/components/profile/profile-client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserCircle, Settings2 } from 'lucide-react'; // Changed icon for variety
import { Skeleton } from '@/components/ui/skeleton';

// export const metadata = { // Metadata is static for client components
//   title: 'Profile | Scan2Sale',
// };

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/profile'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // Show a loading state within AppLayout while auth is resolving or if user is null
    return (
      <AppLayout>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-9 w-48" />
        </div>
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="items-center text-center pb-8">
            <Skeleton className="h-24 w-24 rounded-full mb-4" />
            <Skeleton className="h-8 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-6 w-1/4 mt-4" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Skeleton className="h-10 w-28 ml-auto" />
          </CardFooter>
        </Card>
      </AppLayout>
    );
  }
  
  // User is authenticated and loaded
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold flex items-center">
          <Settings2 className="mr-3 h-8 w-8 text-primary" /> My Profile & Settings
        </h1>
      </div>
      <ProfileClient />
    </AppLayout>
  );
}

// Added dummy Card, CardHeader etc. for skeleton
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
