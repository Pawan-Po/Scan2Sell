
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
import { extractBarcode, type ExtractBarcodeInput } from '@/ai/flows/extract-barcode-flow';
import { addProductToInventory } from '@/data/mock-data';
import type { ProductFormData, Product } from '@/lib/types';
import { fileToDataUri } from '@/lib/utils';
import Image from 'next/image';
import { Wand2, Save, RotateCcw, Camera, AlertTriangle, Barcode, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const productFormSchema = z.object({
  productLabelImage: z.custom<FileList>().optional(),
  productName: z.string().min(2, { message: 'Product name must be at least 2 characters.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  quantity: z.coerce.number().int().min(0, { message: 'Quantity must be a non-negative integer.' }),
  expiryDate: z.string().optional(),
  description: z.string().optional(),
  barcode: z.string().optional(),
});


export function AddProductFormClient() {
  const { toast } = useToast();
  const router = useRouter();
  const [isAiProcessing, setIsAiProcessing] = React.useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  const [isCameraOpen, setIsCameraOpen] = React.useState(false); // For product image
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = React.useState(false); // For barcode
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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
      let isCancelled = false;
      fileToDataUri(file).then(dataUri => {
        if (!isCancelled) {
          setPreviewImage(dataUri);
        }
      }).catch(error => {
        if (!isCancelled) {
          console.error('Error converting file to data URI:', error);
          toast({ title: 'Image Error', description: 'Could not process the uploaded image.', variant: 'destructive' });
        }
      });
      return () => { isCancelled = true; };
    }
  }, [productImageFile, toast]);

  React.useEffect(() => {
    const streamShouldBeActive = isCameraOpen || isBarcodeScannerOpen;

    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setIsCameraOpen(false);
        setIsBarcodeScannerOpen(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };

    const stopStream = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
       if (videoRef.current) {
          videoRef.current.srcObject = null;
      }
    };

    if (streamShouldBeActive) {
      startStream();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isCameraOpen, isBarcodeScannerOpen, toast]);

  const handleToggleCamera = () => {
    if (isBarcodeScannerOpen) setIsBarcodeScannerOpen(false);
    if (isCameraOpen) {
      setIsCameraOpen(false);
    } else {
      setPreviewImage(null); 
      setValue('productLabelImage', undefined); 
      setHasCameraPermission(null);
      setIsCameraOpen(true);
    }
  };

  const handleToggleBarcodeScanner = () => {
    if (isCameraOpen) setIsCameraOpen(false);
    setIsBarcodeScannerOpen(prev => !prev);
  };
  
  const handleCaptureProductImage = React.useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUri = canvas.toDataURL('image/png');

    setPreviewImage(dataUri);
    setIsCameraOpen(false);
    toast({ title: "Product image captured." });
  }, [toast]);


  const handleOcrBarcodeFromUpload = React.useCallback(async () => {
    if (!previewImage) {
      toast({ title: 'Image required', description: 'Please upload an image to scan for a barcode.', variant: 'destructive' });
      return;
    }

    setIsOcrProcessing(true);
    try {
      const aiInput: ExtractBarcodeInput = {
        productLabelDataUri: previewImage,
      };
      const result = await extractBarcode(aiInput);
      if (result.barcode) {
        setValue('barcode', result.barcode);
        toast({ title: 'Barcode Scanned!', description: `Found barcode: ${result.barcode}` });
      } else {
        setValue('barcode', '');
        toast({ title: 'No Barcode Found', description: 'Could not detect a barcode in the image.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('OCR failed:', error);
      toast({ title: 'OCR Error', description: 'Failed to scan barcode from image.', variant: 'destructive' });
    } finally {
      setIsOcrProcessing(false);
    }
  }, [previewImage, setValue, toast]);


  const handleScanBarcodeFromCamera = React.useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUri = canvas.toDataURL('image/png');

    setIsBarcodeScannerOpen(false);
    setIsOcrProcessing(true);
    toast({ title: "Scanning for barcode..." });
    
    try {
      const result = await extractBarcode({ productLabelDataUri: dataUri });
      if (result.barcode) {
        setValue('barcode', result.barcode);
        toast({ title: 'Barcode Scanned!', description: `Found barcode: ${result.barcode}` });
      } else {
        setValue('barcode', '');
        toast({ title: 'No Barcode Found', description: 'Could not detect a barcode in the image.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('OCR failed:', error);
      toast({ title: 'OCR Error', description: 'Failed to scan barcode from image.', variant: 'destructive' });
    } finally {
      setIsOcrProcessing(false);
    }
  }, [setValue, toast]);


  const handleEnhanceDescription = React.useCallback(async () => {
    if (!previewImage) {
      toast({ title: 'Image required', description: 'Please upload or capture a product label image for context.', variant: 'destructive' });
      return;
    }
    if (!productNameWatch) {
      toast({ title: 'Product name required', description: 'Please enter a product name.', variant: 'destructive' });
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
  }, [previewImage, productNameWatch, setValue, toast]);
  
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
        category: 'General', 
      };
      
      await addProductToInventory(newProductData);
      
      toast({
        title: 'Product Added!',
        description: `${data.productName} has been successfully added to inventory.`,
      });
      reset();
      setPreviewImage(null);
      setIsCameraOpen(false);
      setIsBarcodeScannerOpen(false);
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

  const isProcessing = isSaving || isAiProcessing || isOcrProcessing;
  const isAnyCameraOpen = isCameraOpen || isBarcodeScannerOpen;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Add New Product</CardTitle>
        <CardDescription>Fill in the details below. Use your camera for the product image and to scan barcodes.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="productLabelImage">Product Image</Label>
            <div className="flex gap-2">
              <Input
                id="productLabelImage"
                type="file"
                accept="image/*"
                {...register('productLabelImage')}
                className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                disabled={isAnyCameraOpen || isProcessing}
              />
              <Button type="button" variant="outline" onClick={handleToggleCamera} disabled={isProcessing || isBarcodeScannerOpen}>
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
                      Please enable camera permissions in your browser settings.
                    </AlertDescription>
                  </Alert>
              )}
              {hasCameraPermission === true && (
                <Button type="button" onClick={handleCaptureProductImage} className="w-full" disabled={isProcessing}>
                  <ImageIcon className="mr-2 h-4 w-4" /> Capture Product Image
                </Button>
              )}
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {previewImage && !isAnyCameraOpen && (
            <div className="mt-2 border rounded-md p-2 flex flex-col items-center bg-muted/50 space-y-2">
              <Image src={previewImage} alt="Product label preview" width={200} height={200} className="object-contain rounded-md max-h-[200px]" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input id="productName" {...register('productName')} placeholder="e.g., Organic Apples" disabled={isProcessing || isAnyCameraOpen} />
            {errors.productName && <p className="text-sm text-destructive">{errors.productName.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} placeholder="0.00" disabled={isProcessing || isAnyCameraOpen}/>
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" {...register('quantity')} placeholder="0" disabled={isProcessing || isAnyCameraOpen} />
              {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode (Optional)</Label>
             <div className="flex gap-2">
                <Input 
                    id="barcode" 
                    {...register('barcode')} 
                    placeholder="e.g., 123456789012" 
                    className="flex-grow"
                    disabled={isProcessing || isAnyCameraOpen}
                />
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleOcrBarcodeFromUpload} 
                    disabled={isOcrProcessing || !previewImage || isSaving || isAiProcessing || isAnyCameraOpen}
                    aria-label="Scan barcode from uploaded image"
                    title="Scan barcode from uploaded image"
                >
                    {isOcrProcessing && !isAnyCameraOpen ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Barcode className="h-4 w-4" />}
                </Button>
                 <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleToggleBarcodeScanner} 
                    disabled={isProcessing || isCameraOpen}
                    aria-label="Scan barcode with camera"
                    title="Scan barcode with camera"
                >
                   {isOcrProcessing && isAnyCameraOpen ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">Upload an image and click the barcode icon, or click the camera icon to scan live.</p>
            {errors.barcode && <p className="text-sm text-destructive">{errors.barcode.message}</p>}
          </div>
          
           {isBarcodeScannerOpen && (
            <div className="space-y-2">
              <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
              {hasCameraPermission === false && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Camera Access Denied</AlertTitle>
                    <AlertDescription>
                      Please enable camera permissions in your browser settings.
                    </AlertDescription>
                  </Alert>
              )}
              {hasCameraPermission === true && (
                <Button type="button" onClick={handleScanBarcodeFromCamera} className="w-full" disabled={isProcessing}>
                  <Barcode className="mr-2 h-4 w-4" /> Capture & Scan Barcode
                </Button>
              )}
            </div>
          )}


          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
            <Input id="expiryDate" type="date" {...register('expiryDate')} disabled={isProcessing || isAnyCameraOpen} />
            {errors.expiryDate && <p className="text-sm text-destructive">{errors.expiryDate.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="description">Product Description (Optional)</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleEnhanceDescription} 
                disabled={isProcessing || !previewImage || !productNameWatch || isAnyCameraOpen}
              >
                {isAiProcessing ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                AI Enhance
              </Button>
            </div>
            <Textarea id="description" {...register('description')} placeholder="Enter product description or use AI to populate." rows={4} disabled={isProcessing || isAnyCameraOpen}/>
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => { reset(); setPreviewImage(null); setIsCameraOpen(false); setIsBarcodeScannerOpen(false); }} disabled={isProcessing || isAnyCameraOpen}>
              Reset
            </Button>
            <Button type="submit" disabled={isProcessing || isAnyCameraOpen}>
              {isSaving ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Product
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
