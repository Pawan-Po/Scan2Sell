
'use client';

import * as React from 'react';
import type { SaleTransaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format } from 'date-fns';

interface SalesListClientProps {
  initialSales: SaleTransaction[];
}

export function SalesListClient({ initialSales }: SalesListClientProps) {
  const [sales, setSales] = React.useState(initialSales);

  React.useEffect(() => {
    setSales(initialSales);
  }, [initialSales]);

  if (sales.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No sales have been recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>All Transactions</CardTitle>
        <CardDescription>A log of all cash and paid credit sales.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {sales.map((sale) => (
            <AccordionItem key={sale.id} value={sale.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full pr-4 gap-2">
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-base">Sale ID: {sale.id.slice(-6).toUpperCase()}</span>
                    <span className="text-sm text-muted-foreground">{format(new Date(sale.date), "PPP p")}</span>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-center">
                     <Badge variant={sale.paymentMethod === 'credit' ? 'outline' : 'secondary'}>
                      {sale.paymentMethod}
                    </Badge>
                    <span className="text-lg font-bold text-primary">${sale.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-2 border-l-2 border-primary/50 ml-2">
                  <h4 className="font-semibold mb-2 text-sm pl-4">Items Sold:</h4>
                  <ul className="space-y-2 pl-4">
                    {sale.items.map(item => (
                      <li key={item.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div className="flex items-center gap-3">
                           <Image
                              src={item.imageUrl || 'https://placehold.co/48x48.png'}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="rounded-sm object-cover"
                              data-ai-hint={item.dataAiHint || (item.imageUrl ? undefined : "product generic")}
                            />
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.cartQuantity} x ${item.price.toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <p className="font-medium">${(item.cartQuantity * item.price).toFixed(2)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
