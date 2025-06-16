'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card'; // Added import for actual Card component
import { Edit2, PackageSearch, Filter, AlertCircle } from 'lucide-react';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { UpdateStockDialog } from './update-stock-dialog';

interface InventoryListClientProps {
  initialProducts: Product[];
}

export function InventoryListClient({ initialProducts }: InventoryListClientProps) {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = React.useState(false);
  
  const [selectedProductForUpdate, setSelectedProductForUpdate] = React.useState<Product | null>(null);
  const [isUpdateStockDialogOpen, setIsUpdateStockDialogOpen] = React.useState(false);

  const categories = React.useMemo(() => 
    ['all', ...new Set(initialProducts.map(p => p.category).filter(Boolean) as string[])],
    [initialProducts]
  );

  const filteredProducts = React.useMemo(() => {
    return products
      .filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.includes(searchTerm)) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .filter(product => filterCategory === 'all' || product.category === filterCategory)
      .filter(product => !showLowStockOnly || product.quantity <= product.lowStockThreshold);
  }, [products, searchTerm, filterCategory, showLowStockOnly]);

  const handleStockUpdate = (updatedProduct: Product) => {
    setProducts(prevProducts => 
      prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  };

  const openUpdateStockDialog = (product: Product) => {
    setSelectedProductForUpdate(product);
    setIsUpdateStockDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products by name, barcode, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
            aria-label="Search products"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-[180px]" aria-label="Filter by category">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant={showLowStockOnly ? "secondary" : "outline"}
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className="w-full md:w-auto"
            aria-pressed={showLowStockOnly}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Low Stock
          </Button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-10">
          <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">No products found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <Card className="shadow-lg rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className={product.quantity <= product.lowStockThreshold ? 'bg-accent/10 hover:bg-accent/20' : ''}>
                  <TableCell>
                    <Image
                      src={product.imageUrl || `https://placehold.co/64x64.png`}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="rounded-md object-cover"
                      data-ai-hint={product.imageUrl ? undefined : "product generic"}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category || 'N/A'}</TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{product.quantity}</TableCell>
                  <TableCell>
                    {product.quantity <= product.lowStockThreshold ? (
                      <Badge variant="destructive">Low Stock</Badge>
                    ) : product.quantity <= product.lowStockThreshold + 5 ? (
                       <Badge variant="outline" className="border-primary text-primary">Warning</Badge>
                    ) : (
                      <Badge variant="secondary">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>{product.expiryDate || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openUpdateStockDialog(product)} aria-label={`Update stock for ${product.name}`}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
       <UpdateStockDialog
        product={selectedProductForUpdate}
        isOpen={isUpdateStockDialogOpen}
        onOpenChange={setIsUpdateStockDialogOpen}
        onStockUpdate={handleStockUpdate}
      />
    </div>
  );
}
