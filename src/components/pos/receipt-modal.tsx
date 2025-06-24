
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { SaleTransaction } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReceiptModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  transaction: SaleTransaction | null;
}

export function ReceiptModal({ isOpen, onOpenChange, transaction }: ReceiptModalProps) {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print(); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md print:shadow-none print:border-none" onInteractOutside={(e) => e.preventDefault()}>
        <div className="print:hidden">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-center">Scan2Sale Receipt</DialogTitle>
            <DialogDescription className="text-center">
              Transaction complete!
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div id="receipt-content" className="space-y-4">
          <div className="text-center hidden print:block">
             <h2 className="font-headline text-2xl">Scan2Sale Receipt</h2>
          </div>
          <div className="text-sm text-center">
             <p>Transaction ID: {transaction.id.slice(-8)}</p>
             <p>Date: {new Date(transaction.date).toLocaleString()}</p>
          </div>
        
          <ScrollArea className="max-h-[40vh] my-4 pr-4 border-y py-2">
            <div className="space-y-2 text-sm">
              {transaction.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.cartQuantity} x ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p>${(item.cartQuantity * item.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator />
          
          <div className="py-2 space-y-1">
              <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>${transaction.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                  <span>Tax (0%)</span> 
                  <span>$0.00</span>
              </div>
              <Separator className="my-1"/>
              <div className="flex justify-between text-lg font-bold text-primary">
                  <span>Total</span>
                  <span>${transaction.totalAmount.toFixed(2)}</span>
              </div>
          </div>

          <div className="flex justify-center">
            <Badge variant={transaction.paymentMethod === 'credit' ? 'destructive' : 'secondary'}>
              Paid by: {transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground text-center pt-2">
            Thank you for your purchase!
          </p>
        </div>

        <DialogFooter className="sm:justify-between mt-4 gap-2 print:hidden">
           <Button type="button" variant="outline" onClick={handlePrint} className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            New Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
