
'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { SalesListClient } from '@/components/sales/sales-list-client';
import { fetchSales } from '@/data/mock-data';
import type { SaleTransaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign } from 'lucide-react';

export default function SalesPage() {
  const [sales, setSales] = React.useState<SaleTransaction[] | null>(null);
  const [dataLoading, setDataLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      const fetchedSales = await fetchSales();
      setSales(fetchedSales);
      setDataLoading(false);
    };
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold flex items-center">
          <DollarSign className="mr-3 h-8 w-8 text-primary"/> Sales History
        </h1>
      </div>
      {dataLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : sales ? (
        <SalesListClient initialSales={sales} />
      ) : (
        <p>No sales records found.</p>
      )}
    </AppLayout>
  );
}
