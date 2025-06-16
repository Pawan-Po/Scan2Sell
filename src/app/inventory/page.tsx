import { AppLayout } from '@/components/layout/app-layout';
import { InventoryListClient } from '@/components/inventory/inventory-list-client';
import { fetchInventory } from '@/data/mock-data'; // Mock data fetching
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export const metadata = {
  title: 'Inventory | Scan2Sale',
};

export default async function InventoryPage() {
  const products = await fetchInventory();

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
      <InventoryListClient initialProducts={products} />
    </AppLayout>
  );
}
