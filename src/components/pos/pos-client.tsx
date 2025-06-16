'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, MinusCircle, Trash2, ShoppingBag, CheckCircle, RotateCcw } from 'lucide-react';
import type { Product, CartItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ReceiptModal } from './receipt-modal';
import Image from 'next/image';

interface POSClientProps {
  inventory: Product[];
}

export function POSClient({ inventory }: POSClientProps) {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = React.useState<string | undefined>(undefined);
  const { toast } = useToast();
  const [isReceiptModalOpen, setIsReceiptModalOpen] = React.useState(false);

  const handleAddToCart = () => {
    if (!selectedProductId) {
      toast({ title: 'No Product Selected', description: 'Please select a product to add.', variant: 'destructive' });
      return;
    }
    const productToAdd = inventory.find(p => p.id === selectedProductId);
    if (!productToAdd) {
      toast({ title: 'Product Not Found', description: 'Selected product does not exist in inventory.', variant: 'destructive' });
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productToAdd.id);
      if (existingItem) {
        if (existingItem.cartQuantity < productToAdd.quantity) {
          return prevCart.map(item =>
            item.id === productToAdd.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
          );
        } else {
          toast({ title: 'Stock Limit Reached', description: `Cannot add more ${productToAdd.name}. Available: ${productToAdd.quantity}`, variant: 'destructive' });
          return prevCart;
        }
      } else {
        if (1 <= productToAdd.quantity) {
          return [...prevCart, { ...productToAdd, cartQuantity: 1 }];
        } else {
          toast({ title: 'Out of Stock', description: `${productToAdd.name} is out of stock.`, variant: 'destructive' });
          return prevCart;
        }
      }
    });
    setSelectedProductId(undefined); // Reset select
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const productInInventory = inventory.find(p => p.id === productId);
    if (!productInInventory) return;

    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
    } else if (newQuantity > productInInventory.quantity) {
       toast({ title: 'Stock Limit Exceeded', description: `Only ${productInInventory.quantity} units of ${productInInventory.name} available.`, variant: 'destructive' });
    }
    else {
      setCart(prevCart =>
        prevCart.map(item => (item.id === productId ? { ...item, cartQuantity: newQuantity } : item))
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const totalAmount = React.useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);
  }, [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({ title: 'Empty Cart', description: 'Please add items to your cart before checkout.', variant: 'destructive' });
      return;
    }
    // In a real app, this would trigger payment processing and inventory update.
    // For now, just show receipt and clear cart.
    setIsReceiptModalOpen(true);
  };

  const handleNewSale = () => {
    setCart([]);
    setIsReceiptModalOpen(false);
    toast({ title: 'New Sale Started', description: 'Cart has been cleared.'});
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2 shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <ShoppingBag className="mr-3 h-7 w-7 text-primary" /> Current Sale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-grow space-y-1">
              <Label htmlFor="product-select">Select Product</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger id="product-select" aria-label="Select product">
                  <SelectValue placeholder="Scan or select a product..." />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map(product => (
                    <SelectItem key={product.id} value={product.id} disabled={product.quantity === 0}>
                      {product.name} ({product.quantity} in stock) - ${product.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddToCart} className="w-full sm:w-auto" disabled={!selectedProductId}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">Your cart is empty</h3>
              <p className="mt-1 text-sm text-muted-foreground">Add products using the selector above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Img</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="w-[120px] text-center">Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"> </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map(item => (
                    <TableRow key={item.id}>
                       <TableCell>
                        <Image
                          src={item.imageUrl || `https://placehold.co/48x48.png`}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="rounded-sm object-cover"
                          data-ai-hint={item.imageUrl ? undefined : "product generic"}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.cartQuantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                            className="w-12 h-8 text-center px-1"
                            aria-label={`Quantity of ${item.name}`}
                            min="0"
                            max={inventory.find(p=>p.id === item.id)?.quantity}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${(item.price * item.cartQuantity).toFixed(2)}
                      </TableCell>
                       <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-destructive hover:text-destructive/80 h-7 w-7" aria-label={`Remove ${item.name} from cart`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-1 shadow-xl sticky top-20 h-fit">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (0%)</span>
            <span>$0.00</span>
          </div>
          <hr/>
          <div className="flex justify-between text-xl font-bold text-primary">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button size="lg" className="w-full" onClick={handleCheckout} disabled={cart.length === 0}>
            <CheckCircle className="mr-2 h-5 w-5" /> Checkout
          </Button>
           <Button size="lg" variant="outline" className="w-full" onClick={handleNewSale}>
            <RotateCcw className="mr-2 h-5 w-5" /> New Sale
          </Button>
        </CardFooter>
      </Card>

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onOpenChange={setIsReceiptModalOpen}
        cartItems={cart}
        totalAmount={totalAmount}
      />
    </div>
  );
}
