'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { updateProductInInventory } from '@/data/mock-data'; // Mock action

const updateStockSchema = z.object({
  quantity: z.coerce.number().min(0, 'Quantity must be non-negative'),
});

type UpdateStockFormData = z.infer<typeof updateStockSchema>;

interface UpdateStockDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onStockUpdate: (updatedProduct: Product) => void;
}

export function UpdateStockDialog({ product, isOpen, onOpenChange, onStockUpdate }: UpdateStockDialogProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateStockFormData>({
    resolver: zodResolver(updateStockSchema),
  });

  React.useEffect(() => {
    if (product && isOpen) {
      reset({ quantity: product.quantity });
    }
  }, [product, isOpen, reset]);

  if (!product) return null;

  const onSubmit = async (data: UpdateStockFormData) => {
    try {
      const updatedProductData = { ...product, quantity: data.quantity };
      // In a real app, call server action here
      // For now, using mock-data function directly
      const updatedProd = await updateProductInInventory(updatedProductData);
      onStockUpdate(updatedProd);
      toast({
        title: 'Stock Updated',
        description: `${product.name} quantity updated to ${data.quantity}.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update stock:', error);
      toast({
        title: 'Error',
        description: 'Failed to update stock. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Update Stock for {product.name}</DialogTitle>
            <DialogDescription>
              Current quantity: {product.quantity}. Enter the new quantity.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                New Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                className="col-span-3"
                {...register('quantity')}
                aria-invalid={errors.quantity ? "true" : "false"}
              />
            </div>
            {errors.quantity && (
              <p className="col-span-4 text-sm text-destructive text-right">{errors.quantity.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Stock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
