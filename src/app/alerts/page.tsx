'use client'; // Marking as client component for auth check

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';


// export const metadata = { // Static metadata
//   title: 'Alerts | Scan2Sale',
// };

export default function AlertsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/alerts');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-between mb-6">
           <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-48 w-full" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold">Alerts</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Notifications & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Alerts page is under construction. You will see low stock alerts and other important notifications here.
          </p>
          {/* Future alert listings can go here */}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
