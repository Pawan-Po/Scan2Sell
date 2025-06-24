
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
import { PlusCircle, MinusCircle, Trash2, ShoppingBag, CheckCircle, RotateCcw, Camera, Sparkles, AlertTriangle, CreditCard, DollarSign } from 'lucide-react';
import type { Product, CartItem, SaleTransaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ReceiptModal } from './receipt-modal';
import Image from 'next/image';
import { extractProductInfo, type ExtractProductInfoInput } from '@/ai/flows/extract-product-info-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { fetchInventory, processSale } from '@/data/mock-data';

interface POSClientProps {
  inventory: Product[];
}

export function POSClient({ inventory: initialInventory }: POSClientProps) {
  const [currentInventory, setCurrentInventory] = React.useState<Product[]>(initialInventory);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = React.useState<string | undefined>(undefined);
  const { toast } = useToast();
  
  const [isReceiptModalOpen, setIsReceiptModalOpen] = React.useState(false);
  const [completedSale, setCompletedSale] = React.useState<SaleTransaction | null>(null);

  const [isProcessingCheckout, setIsProcessingCheckout] = React.useState(false);
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isAiScanning, setIsAiScanning] = React.useState(false);
  const [scannedPreviewImage, setScannedPreviewImage] = React.useState<string | null>(null);

  const refreshInventory = async () => {
    const clientInventory = await fetchInventory();
    setCurrentInventory(clientInventory);
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      refreshInventory();
    }
  }, []);

  React.useEffect(() => {
    if (isCameraOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
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
    setIsCameraOpen(prev => !prev);
    setScannedPreviewImage(null); 
  };

  const triggerAiScanAndMatch = async (imageDataUri: string) => {
    setIsAiScanning(true);
    setScannedPreviewImage(imageDataUri); 

    try {
      const aiInput: ExtractProductInfoInput = { productLabelDataUri: imageDataUri };
      const extractedInfo = await extractProductInfo(aiInput);

      let matchedProduct: Product | undefined = undefined;

      if (extractedInfo.barcode) {
        matchedProduct = currentInventory.find(p => p.barcode === extractedInfo.barcode);
      }
      if (!matchedProduct && extractedInfo.productName) {
        matchedProduct = currentInventory.find(p => p.name.toLowerCase() === extractedInfo.productName!.toLowerCase());
      }

      if (matchedProduct) {
        setSelectedProductId(matchedProduct.id);
        toast({
          title: 'Product Found!',
          description: `${matchedProduct.name} selected from scan.`,
        });
      } else {
        toast({
          title: 'Product Not Matched',
          description: 'Could not find a matching product in inventory from the scan. Try manual selection.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('AI scan and match failed:', error);
      toast({ title: 'AI Scan Error', description: 'Failed to process the image or match product.', variant: 'destructive' });
    } finally {
      setIsAiScanning(false);
      setIsCameraOpen(false); 
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
        triggerAiScanAndMatch(dataUri);
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedProductId) {
      toast({ title: 'No Product Selected', description: 'Please select a product to add.', variant: 'destructive' });
      return;
    }
    const productToAdd = currentInventory.find(p => p.id === selectedProductId);
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
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const productInInventory = currentInventory.find(p => p.id === productId);
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

  const handleCheckout = async (paymentMethod: 'cash' | 'credit') => {
    if (cart.length === 0) {
      toast({ title: 'Empty Cart', description: 'Please add items to your cart.', variant: 'destructive' });
      return;
    }
    setIsProcessingCheckout(true);
    try {
      const sale = await processSale(cart, paymentMethod);
      setCompletedSale(sale);
      setIsReceiptModalOpen(true);
      toast({
        title: 'Checkout Successful!',
        description: `Sale recorded with payment method: ${paymentMethod}.`,
      });
    } catch (error) {
      console.error('Checkout failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        title: 'Checkout Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleNewSale = () => {
    setCart([]);
    setIsReceiptModalOpen(false);
    setCompletedSale(null);
    setSelectedProductId(undefined);
    setScannedPreviewImage(null);
    refreshInventory(); // Refresh inventory for next sale
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
              <Select value={selectedProductId} onValueChange={setSelectedProductId} disabled={isCameraOpen || isAiScanning || isProcessingCheckout}>
                <SelectTrigger id="product-select" aria-label="Select product">
                  <SelectValue placeholder="Scan or select a product..." />
                </SelectTrigger>
                <SelectContent>
                  {currentInventory.map(product => (
                    <SelectItem key={product.id} value={product.id} disabled={product.quantity === 0}>
                      {product.name} ({product.quantity} in stock) - ${product.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleToggleCamera} variant="outline" className="w-full sm:w-auto" disabled={isAiScanning || isProcessingCheckout}>
              <Camera className="mr-2 h-4 w-4" /> {isCameraOpen ? 'Close Camera' : 'Scan Label'}
            </Button>
            <Button onClick={handleAddToCart} className="w-full sm:w-auto" disabled={!selectedProductId || isCameraOpen || isAiScanning || isProcessingCheckout}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
          </div>

          {isCameraOpen && (
            <div className="space-y-2 border p-4 rounded-md bg-muted/20">
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
              {hasCameraPermission && (
                <Button 
                  type="button" 
                  onClick={handleCaptureImage} 
                  className="w-full" 
                  disabled={isAiScanning || isProcessingCheckout}
                >
                  {isAiScanning ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" /> }
                  {isAiScanning ? 'Scanning...' : 'Capture & Scan Product'}
                </Button>
              )}
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />

          {scannedPreviewImage && !isCameraOpen && (
             <div className="mt-2 border rounded-md p-2 flex flex-col items-center bg-muted/50 space-y-2">
              <p className="text-sm text-muted-foreground">Last Scanned Image:</p>
              <Image src={scannedPreviewImage} alt="Scanned product preview" width={150} height={150} className="object-contain rounded-md max-h-[150px]" />
            </div>
          )}


          {cart.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg mt-4">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">Your cart is empty</h3>
              <p className="mt-1 text-sm text-muted-foreground">Add products using the selector or camera scan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto mt-4">
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
                          data-ai-hint={item.dataAiHint || (item.imageUrl ? undefined : "product generic")}
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
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                const productInInv = currentInventory.find(p => p.id === item.id);
                                if (productInInv && val > productInInv.quantity) {
                                   toast({ title: 'Stock Limit Exceeded', description: `Only ${productInInv.quantity} units of ${productInInv.name} available.`, variant: 'destructive' });
                                   updateQuantity(item.id, productInInv.quantity);
                                } else {
                                   updateQuantity(item.id, val || 0)
                                }
                            }}
                            onBlur={(e) => {
                                if (item.cartQuantity === 0 && cart.find(ci => ci.id === item.id)) {
                                } else if (isNaN(item.cartQuantity)) {
                                    updateQuantity(item.id, 1);
                                }
                            }}
                            className="w-12 h-8 text-center px-1"
                            aria-label={`Quantity of ${item.name}`}
                            min="0"
                            max={currentInventory.find(p=>p.id === item.id)?.quantity}
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
            <Button size="lg" className="w-full" onClick={() => handleCheckout('cash')} disabled={cart.length === 0 || isCameraOpen || isAiScanning || isProcessingCheckout}>
                {isProcessingCheckout ? <RotateCcw className="mr-2 h-5 w-5 animate-spin" /> : <DollarSign className="mr-2 h-5 w-5" />}
                Pay with Cash
            </Button>
            <Button size="lg" variant="secondary" className="w-full" onClick={() => handleCheckout('credit')} disabled={cart.length === 0 || isCameraOpen || isAiScanning || isProcessingCheckout}>
                {isProcessingCheckout ? <RotateCcw className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
                Pay on Credit
            </Button>
           <Button size="lg" variant="outline" className="w-full mt-4" onClick={handleNewSale} disabled={isCameraOpen || isAiScanning || isProcessingCheckout}>
            <RotateCcw className="mr-2 h-5 w-5" /> New Sale
          </Button>
        </CardFooter>
      </Card>
      
      {completedSale && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              handleNewSale();
            }
            setIsReceiptModalOpen(isOpen);
          }}
          transaction={completedSale}
        />
      )}
    </div>
  );
}

    