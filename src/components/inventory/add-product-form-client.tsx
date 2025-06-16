'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { enhanceProductDescription, type EnhanceProductDescriptionInput } from '@/ai/flows/enhance-product-description';
import { addProductToInventory } from '@/data/mock-data'; // Mock action
import type { ProductFormData, Product } from '@/lib/types';
import { fileToDataUri } from '@/lib/utils';
import Image from 'next/image';
import { UploadCloud, Wand2, Save, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';


const productFormSchema = z.object({
  productLabelImage: z.custom<FileList>().optional(),
  productName: z.string().min(2, { message: 'Product name must be at least 2 characters.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  quantity: z.coerce.number().int().min(0, { message: 'Quantity must be a non-negative integer.' }),
  expiryDate: z.string().optional(),
  description: z.string().optional(),
});


export function AddProductFormClient() {
  const { toast } = useToast();
  const router = useRouter();
  const [isAiProcessing, setIsAiProcessing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      productName: '',
      price: 0,
      quantity: 0,
      description: '',
    },
  });

  const productImageFile = watch('productLabelImage');

  React.useEffect(() => {
    if (productImageFile && productImageFile.length > 0) {
      const file = productImageFile[0];
      fileToDataUri(file).then(setPreviewImage).catch(console.error);
    } else {
      setPreviewImage(null);
    }
  }, [productImageFile]);

  const handleEnhanceDescription = async () => {
    const currentProductName = watch('productName');
    const currentImageFile = watch('productLabelImage');

    if (!currentImageFile || currentImageFile.length === 0) {
      toast({ title: 'Image required', description: 'Please upload a product label image.', variant: 'destructive' });
      return;
    }
    if (!currentProductName) {
      toast({ title: 'Product name required', description: 'Please enter a product name.', variant: 'destructive' });
      return;
    }

    setIsAiProcessing(true);
    try {
      const dataUri = await fileToDataUri(currentImageFile[0]);
      const aiInput: EnhanceProductDescriptionInput = {
        productLabelDataUri: dataUri,
        productName: currentProductName,
      };
      const result = await enhanceProductDescription(aiInput);
      setValue('description', result.enhancedDescription);
      toast({ title: 'Description Enhanced!', description: 'AI has generated a new product description.' });
    } catch (error) {
      console.error('AI enhancement failed:', error);
      toast({ title: 'AI Error', description: 'Failed to enhance description.', variant: 'destructive' });
    } finally {
      setIsAiProcessing(false);
    }
  };
  
  const onSubmit = async (data: ProductFormData) => {
    setIsSaving(true);
    try {
      // Create product object for saving
      const newProductData: Omit<Product, 'id'> = {
        name: data.productName,
        price: data.price,
        quantity: data.quantity,
        expiryDate: data.expiryDate,
        description: data.description,
        imageUrl: previewImage || undefined, // Using label image as product image for now
        lowStockThreshold: 5, // Default low stock threshold
        // barcode and category would be other fields to add
      };
      
      await addProductToInventory(newProductData); // Mock save
      
      toast({
        title: 'Product Added!',
        description: `${data.productName} has been successfully added to inventory.`,
      });
      reset();
      setPreviewImage(null);
      router.push('/inventory'); // Redirect to inventory list
    } catch (error) {
      console.error('Failed to add product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Add New Product</CardTitle>
        <CardDescription>Fill in the product details. Use AI to enhance the description from a label image.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="productLabelImage">Product Label Image</Label>
            <Input
              id="productLabelImage"
              type="file"
              accept="image/*"
              {...register('productLabelImage')}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {previewImage && (
              <div className="mt-2 border rounded-md p-2 flex justify-center bg-muted/50">
                <Image src={previewImage} alt="Product label preview" width={200} height={200} className="object-contain rounded-md max-h-[200px]" />
              </div>
            )}
            {errors.productLabelImage && <p className="text-sm text-destructive">{errors.productLabelImage.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input id="productName" {...register('productName')} placeholder="e.g., Organic Apples" />
            {errors.productName && <p className="text-sm text-destructive">{errors.productName.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} placeholder="0.00" />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" {...register('quantity')} placeholder="0" />
              {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
            <Input id="expiryDate" type="date" {...register('expiryDate')} />
            {errors.expiryDate && <p className="text-sm text-destructive">{errors.expiryDate.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="description">Product Description (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleEnhanceDescription} disabled={isAiProcessing || !watch('productLabelImage') || !watch('productName')}>
                {isAiProcessing ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                AI Enhance
              </Button>
            </div>
            <Textarea id="description" {...register('description')} placeholder="Enter product description or use AI Enhance." rows={4} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => { reset(); setPreviewImage(null); }} disabled={isSaving || isAiProcessing}>
              Reset
            </Button>
            <Button type="submit" disabled={isSaving || isAiProcessing}>
              {isSaving ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Product
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
