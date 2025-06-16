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
import type { CartItem } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Printer } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  cartItems: CartItem[];
  totalAmount: number;
}

export function ReceiptModal({ isOpen, onOpenChange, cartItems, totalAmount }: ReceiptModalProps) {
  const transactionDate = new Date();

  const handlePrint = () => {
    // Basic browser print functionality
    // In a real app, you might generate a PDF or use a more sophisticated printing solution
    window.print(); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-center">Scan2Sale Receipt</DialogTitle>
          <DialogDescription className="text-center">
            Transaction ID: {(Math.random() * 1000000).toFixed(0)} <br />
            Date: {transactionDate.toLocaleDateString()} {transactionDate.toLocaleTimeString()}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] my-4 pr-4">
          <div className="space-y-2 text-sm">
            {cartItems.map((item) => (
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
                <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
                <span>Tax (0%)</span> 
                <span>$0.00</span>
            </div>
            <Separator className="my-1"/>
            <div className="flex justify-between text-lg font-bold text-primary">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
            </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-center pt-2">
          Thank you for your purchase!
        </p>

        <DialogFooter className="sm:justify-between mt-4 gap-2">
           <Button type="button" variant="outline" onClick={handlePrint} className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
