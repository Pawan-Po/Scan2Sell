'use client'; // Marking as client component for auth check

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { POSClient } from '@/components/pos/pos-client';
import { fetchInventory } from '@/data/mock-data';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

// export const metadata = { // Static metadata
//   title: 'Point of Sale | Scan2Sale',
// };

export default function POSPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [inventory, setInventory] = React.useState<Awaited<ReturnType<typeof fetchInventory>> | null>(null);
  const [dataLoading, setDataLoading] = React.useState(true);


  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/pos');
    }
  }, [user, authLoading, router]);

  React.useEffect(() => {
    if (user) { // Only fetch data if user is authenticated
      const loadData = async () => {
        setDataLoading(true);
        const fetchedInventory = await fetchInventory();
        setInventory(fetchedInventory);
        setDataLoading(false);
      };
      loadData();
    }
  }, [user]);


  if (authLoading || !user || dataLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-9 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-24 w-full" /> {/* Product selection skeleton */}
            <Skeleton className="h-64 w-full" /> {/* Cart table skeleton */}
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-48 w-full" /> {/* Order summary skeleton */}
          </div>
        </div>
      </AppLayout>
    );
  }


  return (
    <AppLayout>
       <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold">Point of Sale</h1>
      </div>
      {inventory ? (
        <POSClient inventory={inventory} />
      ) : (
        <p>Loading inventory for POS...</p> // Should be covered by skeleton, but as fallback
      )}
    </AppLayout>
  );
}
