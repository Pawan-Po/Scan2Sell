
'use client';

import * as React from 'react';
import type { SaleTransaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateCreditSaleToPaid } from '@/data/mock-data';
import { format } from 'date-fns';
import { CheckCircle } from 'lucide-react';

interface CreditListClientProps {
  initialCreditSales: SaleTransaction[];
  onSalePaid: () => void; // Callback to refresh data on parent page
}

export function CreditListClient({ initialCreditSales, onSalePaid }: CreditListClientProps) {
  const [sales, setSales] = React.useState(initialCreditSales);
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null);
  const { toast } = useToast();
  
  React.useEffect(() => {
    setSales(initialCreditSales);
  }, [initialCreditSales]);

  const handleMarkAsPaid = async (saleId: string) => {
    setIsUpdating(saleId);
    try {
      await updateCreditSaleToPaid(saleId);
      toast({
        title: 'Success!',
        description: `Sale ID ${saleId.slice(-6).toUpperCase()} marked as paid.`,
      });
      onSalePaid(); // Trigger data refresh on the parent page
    } catch (error) {
      console.error('Failed to update sale status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the sale. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  if (sales.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No outstanding credit sales.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sales.map((sale) => (
        <Card key={sale.id} className="shadow-md">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2">
            <div className="flex-grow">
              <CardTitle className="text-lg">Sale ID: {sale.id.slice(-6).toUpperCase()}</CardTitle>
              <CardDescription>{format(new Date(sale.date), "PPP p")}</CardDescription>
            </div>
            <div className="text-2xl font-bold text-destructive self-end sm:self-center">
                ${sale.totalAmount.toFixed(2)}
            </div>
          </CardHeader>
          <CardContent>
             <div className="pl-4 border-l-2 border-destructive/50 ml-2 mb-4">
                <h4 className="font-semibold mb-2 text-sm pl-2">Items:</h4>
                <ul className="space-y-1 pl-2 text-sm text-muted-foreground">
                    {sale.items.map(item => (
                        <li key={item.id}>{item.cartQuantity}x {item.name}</li>
                    ))}
                </ul>
             </div>
            <Button
              onClick={() => handleMarkAsPaid(sale.id)}
              disabled={isUpdating === sale.id}
              className="w-full"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isUpdating === sale.id ? 'Updating...' : 'Mark as Paid'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
