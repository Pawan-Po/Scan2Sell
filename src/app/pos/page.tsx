import { AppLayout } from '@/components/layout/app-layout';
import { POSClient } from '@/components/pos/pos-client';
import { fetchInventory } from '@/data/mock-data';

export const metadata = {
  title: 'Point of Sale | Scan2Sale',
};

// Revalidate this page frequently or on demand if data changes
// export const revalidate = 0; // Or use on-demand revalidation

export default async function POSPage() {
  const inventory = await fetchInventory();

  return (
    <AppLayout>
       <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold">Point of Sale</h1>
      </div>
      <POSClient inventory={inventory} />
    </AppLayout>
  );
}
