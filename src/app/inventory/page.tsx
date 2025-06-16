'use client'; // Marking as client component to use hooks for auth check

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { InventoryListClient } from '@/components/inventory/inventory-list-client';
import { fetchInventory } from '@/data/mock-data'; 
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

// export const metadata = { // Static metadata is fine for this page structure
//   title: 'Inventory | Scan2Sale',
// };

export default function InventoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = React.useState<Awaited<ReturnType<typeof fetchInventory>> | null>(null);
  const [dataLoading, setDataLoading] = React.useState(true);

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/inventory');
    }
  }, [user, loading, router]);

  React.useEffect(() => {
    if (user) { // Only fetch data if user is authenticated
      const loadData = async () => {
        setDataLoading(true);
        const fetchedProducts = await fetchInventory();
        setProducts(fetchedProducts);
        setDataLoading(false);
      };
      loadData();
    }
  }, [user]); // Depend on user state

  if (loading || !user) {
    // Show loading skeleton for the entire page content if auth is loading or user is not logged in
    return (
      <AppLayout>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-12 w-full mb-4" /> {/* Filter/Search bar skeleton */}
        <Skeleton className="h-[400px] w-full" /> {/* Table skeleton */}
      </AppLayout>
    );
  }
  
  if (dataLoading) {
     return (
      <AppLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-headline font-bold">Inventory</h1>
           <Button asChild>
            <Link href="/inventory/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
            </Link>
          </Button>
        </div>
        <Skeleton className="h-12 w-full mb-4" /> {/* Filter/Search bar skeleton */}
        <Skeleton className="h-[400px] w-full" /> {/* Table skeleton */}
      </AppLayout>
    );
  }


  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold">Inventory</h1>
        <Button asChild>
          <Link href="/inventory/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
          </Link>
        </Button>
      </div>
      {products ? (
        <InventoryListClient initialProducts={products} />
      ) : (
        <p>No products to display or error loading products.</p> // Fallback message
      )}
    </AppLayout>
  );
}
