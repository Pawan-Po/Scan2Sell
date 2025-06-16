
import type { Product } from '@/lib/types';

const INVENTORY_STORAGE_KEY = 'scan2saleInventory';

// This is the hardcoded default inventory. Used if localStorage is empty or on server.
const initialDefaultInventory: Product[] = [
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

// This will be the in-memory "source of truth" for the session.
// It's initialized from localStorage on the client, or defaults on the server.
export let mockInventory: Product[];

if (typeof window !== 'undefined') {
  // Client-side execution
  const storedInventory = localStorage.getItem(INVENTORY_STORAGE_KEY);
  if (storedInventory) {
    try {
      mockInventory = JSON.parse(storedInventory);
      // Ensure all products have necessary fields if migrating from an older structure
      mockInventory.forEach(p => {
        p.lowStockThreshold = p.lowStockThreshold || 5;
        p.category = p.category || 'Uncategorized';
        p.dataAiHint = p.dataAiHint || (p.imageUrl ? undefined : 'product generic');
      });
    } catch (e) {
      console.error("Failed to parse inventory from localStorage, resetting to default.", e);
      mockInventory = JSON.parse(JSON.stringify(initialDefaultInventory)); // Deep copy
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(mockInventory));
    }
  } else {
    // No inventory in localStorage, use default and save it
    mockInventory = JSON.parse(JSON.stringify(initialDefaultInventory)); // Deep copy
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(mockInventory));
  }
} else {
  // Server-side execution (e.g., during build or for SSR)
  mockInventory = JSON.parse(JSON.stringify(initialDefaultInventory)); // Deep copy
}

function saveCurrentInventoryToStorage() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(mockInventory));
  }
}

// This function simulates fetching data from a backend
export async function fetchInventory(): Promise<Product[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));
  // Returns a deep copy of the current in-memory inventory
  // (which is localStorage-aware on client, default on server)
  return JSON.parse(JSON.stringify(mockInventory));
}

// Simulate adding a product
export async function addProductToInventory(productData: Omit<Product, 'id'>): Promise<Product> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const newProduct: Product = {
    ...productData,
    id: String(Date.now() + Math.random().toString(36).substring(2, 9)), // More robust unique ID
    // Ensure default fields if not provided
    lowStockThreshold: productData.lowStockThreshold || 5,
    category: productData.category || 'General',
    dataAiHint: productData.dataAiHint || (productData.imageUrl ? undefined : 'product generic')
  };
  mockInventory.push(newProduct);
  saveCurrentInventoryToStorage();
  console.log('Added product:', newProduct);
  console.log('Current inventory size (in-memory):', mockInventory.length);
  return JSON.parse(JSON.stringify(newProduct));
}

// Simulate updating a product
export async function updateProductInInventory(updatedProduct: Product): Promise<Product> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const index = mockInventory.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    mockInventory[index] = { ...mockInventory[index], ...updatedProduct };
    saveCurrentInventoryToStorage();
    console.log('Updated product:', mockInventory[index]);
    return JSON.parse(JSON.stringify(mockInventory[index]));
  }
  console.error("Product not found for update, ID:", updatedProduct.id);
  throw new Error("Product not found for update");
}

// Function to reset mock inventory to its initial state (also updates localStorage)
export async function resetMockInventory(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50));
  mockInventory = JSON.parse(JSON.stringify(initialDefaultInventory)); // Reset to a deep copy of the defaults
  saveCurrentInventoryToStorage(); // Save the reset state to localStorage
  console.log('Mock inventory reset to defaults and saved to localStorage.');
}
