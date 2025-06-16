'use client'; // Marking as client component for auth check

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { AddProductFormClient } from '@/components/inventory/add-product-form-client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

// export const metadata = { // Static metadata
//   title: 'Add Product | Scan2Sale',
// };

export default function AddProductPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/inventory/add');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <Skeleton className="h-10 w-1/3 mb-4" /> {/* Title skeleton */}
          <Skeleton className="h-12 w-full mb-4" /> {/* Image input skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-24 w-full mb-4" /> {/* Description skeleton */}
          <Skeleton className="h-10 w-24 ml-auto" /> {/* Save button skeleton */}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <AddProductFormClient />
      </div>
    </AppLayout>
  );
}
