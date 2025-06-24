
'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { CreditListClient } from '@/components/credit/credit-list-client';
import { fetchSales } from '@/data/mock-data';
import type { SaleTransaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard } from 'lucide-react';

export default function CreditPage() {
  const [creditSales, setCreditSales] = React.useState<SaleTransaction[] | null>(null);
  const [dataLoading, setDataLoading] = React.useState(true);

  const loadData = async () => {
    setDataLoading(true);
    const allSales = await fetchSales();
    // Filter for unpaid credit sales
    const unpaid = allSales.filter(s => s.paymentMethod === 'credit' && s.status === 'unpaid');
    setCreditSales(unpaid);
    setDataLoading(false);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold flex items-center">
            <CreditCard className="mr-3 h-8 w-8 text-primary"/> Outstanding Credit
        </h1>
      </div>
      {dataLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : creditSales ? (
        <CreditListClient initialCreditSales={creditSales} onSalePaid={loadData} />
      ) : (
        <p>No credit sales records found.</p>
      )}
    </AppLayout>
  );
}
