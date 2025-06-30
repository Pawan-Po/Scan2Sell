'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { ExpensesClient } from '@/components/expenses/expenses-client';
import { fetchExpenses } from '@/data/mock-data';
import type { Expense } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt } from 'lucide-react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = React.useState<Expense[] | null>(null);
  const [dataLoading, setDataLoading] = React.useState(true);

  const loadData = async () => {
    setDataLoading(true);
    const fetchedExpenses = await fetchExpenses();
    setExpenses(fetchedExpenses);
    setDataLoading(false);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold flex items-center">
          <Receipt className="mr-3 h-8 w-8 text-primary"/> Expenses
        </h1>
      </div>
      {dataLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="md:col-span-2 space-y-4">
             <Skeleton className="h-20 w-full" />
             <Skeleton className="h-20 w-full" />
          </div>
        </div>
      ) : expenses ? (
        <ExpensesClient initialExpenses={expenses} onExpenseAdded={loadData} />
      ) : (
        <p>No expenses records found.</p>
      )}
    </AppLayout>
  );
}
