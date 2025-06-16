import { AppLayout } from '@/components/layout/app-layout';
import { AddProductFormClient } from '@/components/inventory/add-product-form-client';

export const metadata = {
  title: 'Add Product | Scan2Sale',
};

export default function AddProductPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <AddProductFormClient />
      </div>
    </AppLayout>
  );
}
