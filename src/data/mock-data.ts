import type { Product } from '@/lib/types';

export const mockInventory: Product[] = [
  {
    id: '1',
    name: 'Organic Apples',
    price: 2.99,
    quantity: 50,
    expiryDate: '2024-12-31',
    barcode: '123456789012',
    description: 'Fresh, crisp organic apples. Perfect for snacking or baking.',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'apples fruit',
    lowStockThreshold: 10,
    category: 'Fruits',
  },
  {
    id: '2',
    name: 'Whole Wheat Bread',
    price: 3.49,
    quantity: 5, // Low stock example
    expiryDate: '2024-10-15',
    barcode: '234567890123',
    description: 'Healthy whole wheat bread, sliced.',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'bread bakery',
    lowStockThreshold: 5,
    category: 'Bakery',
  },
  {
    id: '3',
    name: 'Milk (1 Gallon)',
    price: 4.20,
    quantity: 30,
    expiryDate: '2024-10-20',
    barcode: '345678901234',
    description: 'Fresh whole milk, 1 gallon.',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'milk dairy',
    lowStockThreshold: 10,
    category: 'Dairy',
  },
  {
    id: '4',
    name: 'Cheddar Cheese Block',
    price: 5.99,
    quantity: 25,
    barcode: '456789012345',
    description: 'Sharp cheddar cheese block, 8oz.',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'cheese dairy',
    lowStockThreshold: 8,
    category: 'Dairy',
  },
  {
    id: '5',
    name: 'Free-Range Eggs (Dozen)',
    price: 3.99,
    quantity: 40,
    expiryDate: '2024-11-01',
    barcode: '567890123456',
    description: 'One dozen large free-range brown eggs.',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'eggs dairy',
    lowStockThreshold: 10,
    category: 'Dairy',
  },
];

// This function simulates fetching data from a backend
export async function fetchInventory(): Promise<Product[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockInventory;
}

// Simulate adding a product
export async function addProductToInventory(product: Omit<Product, 'id'>): Promise<Product> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newProduct: Product = {
    ...product,
    id: String(mockInventory.length + 1 + Math.random()), // simple id generation
  };
  mockInventory.push(newProduct);
  console.log('Added product:', newProduct);
  return newProduct;
}

// Simulate updating a product
export async function updateProductInInventory(updatedProduct: Product): Promise<Product> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockInventory.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    mockInventory[index] = updatedProduct;
    console.log('Updated product:', updatedProduct);
    return updatedProduct;
  }
  throw new Error("Product not found for update");
}
