export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  expiryDate?: string; // YYYY-MM-DD
  barcode?: string;
  description?: string;
  imageUrl?: string; // Optional image of the product itself
  lowStockThreshold: number; // Products with quantity <= this are low stock
  category?: string; // Optional category
}

export interface CartItem extends Product {
  cartQuantity: number;
}

// For AI form
export interface ProductFormData {
  productLabelImage?: FileList;
  productName: string;
  price: number;
  quantity: number;
  expiryDate?: string;
  description?: string; // This will be filled by AI
}
