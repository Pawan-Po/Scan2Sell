
export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  expiryDate?: string; // YYYY-MM-DD
  barcode?: string;
  description?: string;
  imageUrl?: string; // Optional image of the product itself
  dataAiHint?: string; // For placeholder images
  lowStockThreshold: number; // Products with quantity <= this are low stock
  category?: string; // Optional category
}

export interface CartItem extends Product {
  cartQuantity: number;
}

// For AI form
export interface ProductFormData {
  productLabelImage?: FileList; // For standard file upload
  productName: string;
  price: number;
  quantity: number;
  expiryDate?: string;
  description?: string;
  barcode?: string;
}
