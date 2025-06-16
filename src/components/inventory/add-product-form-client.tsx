
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { enhanceProductDescription, type EnhanceProductDescriptionInput } from '@/ai/flows/enhance-product-description';
import { extractProductInfo, type ExtractProductInfoInput } from '@/ai/flows/extract-product-info-flow';
import { addProductToInventory } from '@/data/mock-data';
import type { ProductFormData, Product } from '@/lib/types';
import { fileToDataUri } from '@/lib/utils';
import Image from 'next/image';
import { UploadCloud, Wand2, Save, RotateCcw, Camera, ScanLine, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const productFormSchema = z.object({
  productLabelImage: z.custom<FileList>().optional(), // For file upload
  productName: z.string().min(2, { message: 'Product name must be at least 2 characters.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  quantity: z.coerce.number().int().min(0, { message: 'Quantity must be a non-negative integer.' }),
  expiryDate: z.string().optional(),
  description: z.string().optional(),
  barcode: z.string().optional(), // Added barcode
});


export function AddProductFormClient() {
  const { toast } = useToast();
  const router = useRouter();
  const [isAiProcessing, setIsAiProcessing] = React.useState(false);
  const [isAiExtracting, setIsAiExtracting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);


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
      barcode: '',
    },
  });

  const productImageFile = watch('productLabelImage');
  const productNameWatch = watch('productName');

  React.useEffect(() => {
    if (productImageFile && productImageFile.length > 0) {
      const file = productImageFile[0];
      fileToDataUri(file).then(dataUri => {
        setPreviewImage(dataUri);
        if (isCameraOpen) setIsCameraOpen(false); // Close camera if file is uploaded
      }).catch(console.error);
    }
  }, [productImageFile, isCameraOpen]);

  React.useEffect(() => {
    if (isCameraOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          setIsCameraOpen(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      };
      getCameraPermission();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isCameraOpen, toast]);

  const handleToggleCamera = () => {
    if (isCameraOpen) {
      setIsCameraOpen(false);
    } else {
      setPreviewImage(null); // Clear file preview if opening camera
      setValue('productLabelImage', undefined); // Clear file input
      setIsCameraOpen(true);
    }
  };

  const handleCaptureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/png');
        setPreviewImage(dataUri);
        setIsCameraOpen(false); // Close camera after capture
      }
    }
  };
  
  const handleExtractWithAI = async () => {
    if (!previewImage) {
      toast({ title: 'Image required', description: 'Please upload or capture a product label image.', variant: 'destructive' });
      return;
    }
    setIsAiExtracting(true);
    try {
      const aiInput: ExtractProductInfoInput = { productLabelDataUri: previewImage };
      const result = await extractProductInfo(aiInput);
      
      if (result.productName) setValue('productName', result.productName);
      if (result.description) setValue('description', result.description);
      if (result.barcode) setValue('barcode', result.barcode);
      if (result.price) {
        const numericPrice = parseFloat(result.price.replace(/[^0-9.-]+/g,""));
        if (!isNaN(numericPrice)) {
          setValue('price', numericPrice);
        } else {
           toast({ title: 'AI Price Note', description: `AI extracted price "${result.price}", please verify.`, variant: 'default' });
        }
      }
      toast({ title: 'Data Extracted!', description: 'AI has populated form fields. Please review.' });
    } catch (error) {
      console.error('AI extraction failed:', error);
      toast({ title: 'AI Error', description: 'Failed to extract data from label.', variant: 'destructive' });
    } finally {
      setIsAiExtracting(false);
    }
  };

  const handleEnhanceDescription = async () => {
    if (!previewImage) {
      toast({ title: 'Image required', description: 'Please upload or capture a product label image for context.', variant: 'destructive' });
      return;
    }
    if (!productNameWatch) {
      toast({ title: 'Product name required', description: 'Please enter or scan a product name.', variant: 'destructive' });
      return;
    }

    setIsAiProcessing(true);
    try {
      const aiInput: EnhanceProductDescriptionInput = {
        productLabelDataUri: previewImage,
        productName: productNameWatch,
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
      const newProductData: Omit<Product, 'id'> = {
        name: data.productName,
        price: data.price,
        quantity: data.quantity,
        expiryDate: data.expiryDate,
        description: data.description,
        barcode: data.barcode,
        imageUrl: previewImage || undefined,
        lowStockThreshold: 5, 
      };
      
      await addProductToInventory(newProductData);
      
      toast({
        title: 'Product Added!',
        description: `${data.productName} has been successfully added to inventory.`,
      });
      reset();
      setPreviewImage(null);
      setIsCameraOpen(false);
      router.push('/inventory');
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
        <CardDescription>Upload/capture a label, use AI to extract info, or fill in details manually.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="productLabelImage">Product Label Image</Label>
            <div className="flex gap-2">
              <Input
                id="productLabelImage"
                type="file"
                accept="image/*"
                {...register('productLabelImage')}
                className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                disabled={isCameraOpen}
              />
              <Button type="button" variant="outline" onClick={handleToggleCamera}>
                <Camera className="mr-2 h-4 w-4" /> {isCameraOpen ? 'Close Camera' : 'Use Camera'}
              </Button>
            </div>
            {errors.productLabelImage && <p className="text-sm text-destructive">{errors.productLabelImage.message?.toString()}</p>}
          </div>

          {isCameraOpen && (
            <div className="space-y-2">
              <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
              {hasCameraPermission === false && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Camera Access Denied</AlertTitle>
                    <AlertDescription>
                      Please enable camera permissions in your browser settings to use this feature.
                    </AlertDescription>
                  </Alert>
              )}
              {hasCameraPermission && (
                <Button type="button" onClick={handleCaptureImage} className="w-full">
                  <Camera className="mr-2 h-4 w-4" /> Capture Image
                </Button>
              )}
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />

          {previewImage && (
            <div className="mt-2 border rounded-md p-2 flex flex-col items-center bg-muted/50 space-y-2">
              <Image src={previewImage} alt="Product label preview" width={200} height={200} className="object-contain rounded-md max-h-[200px]" />
              <Button type="button" variant="outline" size="sm" onClick={handleExtractWithAI} disabled={isAiExtracting || isAiProcessing || isSaving}>
                {isAiExtracting ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Scan Label with AI
              </Button>
            </div>
          )}

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
            <Label htmlFor="barcode">Barcode (Optional)</Label>
            <Input id="barcode" {...register('barcode')} placeholder="e.g., 123456789012" />
            {errors.barcode && <p className="text-sm text-destructive">{errors.barcode.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
            <Input id="expiryDate" type="date" {...register('expiryDate')} />
            {errors.expiryDate && <p className="text-sm text-destructive">{errors.expiryDate.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="description">Product Description (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleEnhanceDescription} disabled={isAiProcessing || isAiExtracting || !previewImage || !productNameWatch}>
                {isAiProcessing ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                AI Enhance Desc.
              </Button>
            </div>
            <Textarea id="description" {...register('description')} placeholder="Enter product description or use AI to populate." rows={4} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => { reset(); setPreviewImage(null); setIsCameraOpen(false); }} disabled={isSaving || isAiProcessing || isAiExtracting}>
              Reset
            </Button>
            <Button type="submit" disabled={isSaving || isAiProcessing || isAiExtracting}>
              {isSaving ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Product
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
