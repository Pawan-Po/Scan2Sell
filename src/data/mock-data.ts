
import type { Product, SaleTransaction, CartItem } from '@/lib/types';

const INVENTORY_STORAGE_KEY = 'scan2saleInventory';
const SALES_STORAGE_KEY = 'scan2saleSales';

// --- INVENTORY ---

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

export let mockInventory: Product[];
if (typeof window !== 'undefined') {
  const storedInventory = localStorage.getItem(INVENTORY_STORAGE_KEY);
  mockInventory = storedInventory ? JSON.parse(storedInventory) : JSON.parse(JSON.stringify(initialDefaultInventory));
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(mockInventory));
} else {
  mockInventory = JSON.parse(JSON.stringify(initialDefaultInventory));
}

function saveInventoryToStorage() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(mockInventory));
  }
}

export async function fetchInventory(): Promise<Product[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return JSON.parse(JSON.stringify(mockInventory));
}

export async function addProductToInventory(productData: Omit<Product, 'id'>): Promise<Product> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const newProduct: Product = {
    ...productData,
    id: String(Date.now() + Math.random().toString(36).substring(2, 9)),
    lowStockThreshold: productData.lowStockThreshold || 5,
    category: productData.category || 'General',
    dataAiHint: productData.dataAiHint || (productData.imageUrl ? undefined : 'product generic')
  };
  mockInventory.push(newProduct);
  saveInventoryToStorage();
  return JSON.parse(JSON.stringify(newProduct));
}

export async function updateProductInInventory(updatedProduct: Product): Promise<Product> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const index = mockInventory.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    mockInventory[index] = { ...mockInventory[index], ...updatedProduct };
    saveInventoryToStorage();
    return JSON.parse(JSON.stringify(mockInventory[index]));
  }
  throw new Error("Product not found for update");
}


// --- SALES ---

export let mockSales: SaleTransaction[];
if (typeof window !== 'undefined') {
  const storedSales = localStorage.getItem(SALES_STORAGE_KEY);
  mockSales = storedSales ? JSON.parse(storedSales) : [];
  localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(mockSales));
} else {
  mockSales = [];
}

function saveSalesToStorage() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(mockSales));
  }
}

export async function fetchSales(): Promise<SaleTransaction[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return JSON.parse(JSON.stringify(mockSales));
}

export async function processSale(cart: CartItem[], paymentMethod: 'cash' | 'credit'): Promise<SaleTransaction> {
    await new Promise(resolve => setTimeout(resolve, 50));

    // 1. Validate stock and update inventory
    for (const item of cart) {
        const productInStock = mockInventory.find(p => p.id === item.id);
        if (!productInStock) {
            throw new Error(`Product ${item.name} not found in inventory.`);
        }
        if (productInStock.quantity < item.cartQuantity) {
            throw new Error(`Not enough stock for ${item.name}. Available: ${productInStock.quantity}, Requested: ${item.cartQuantity}`);
        }
        productInStock.quantity -= item.cartQuantity;
    }

    // 2. Create sale transaction record
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);
    const newSale: SaleTransaction = {
        id: String(Date.now() + Math.random().toString(36).substring(2, 9)),
        date: new Date().toISOString(),
        items: cart,
        totalAmount,
        paymentMethod,
        status: paymentMethod === 'credit' ? 'unpaid' : 'paid',
    };
    mockSales.unshift(newSale); // Add to the beginning of the list

    // 3. Save both stores
    saveInventoryToStorage();
    saveSalesToStorage();

    return JSON.parse(JSON.stringify(newSale));
}

export async function updateCreditSaleToPaid(saleId: string): Promise<SaleTransaction> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const saleIndex = mockSales.findIndex(s => s.id === saleId);
    if (saleIndex === -1) {
        throw new Error("Sale not found.");
    }
    if (mockSales[saleIndex].paymentMethod !== 'credit') {
        throw new Error("This is not a credit sale.");
    }
    mockSales[saleIndex].status = 'paid';
    saveSalesToStorage();
    return JSON.parse(JSON.stringify(mockSales[saleIndex]));
}

// --- RESET ALL ---

export async function resetMockData(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50));
  mockInventory = JSON.parse(JSON.stringify(initialDefaultInventory));
  mockSales = [];
  if (typeof window !== 'undefined') {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(mockInventory));
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(mockSales));
  }
}
