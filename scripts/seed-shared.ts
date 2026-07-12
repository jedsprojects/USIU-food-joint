import fs from 'fs';
import path from 'path';
import type { Order, Product } from '../src/context/types';
import {
  INITIAL_PRODUCTS,
  MOCK_CUSTOMERS,
  MOCK_ORDERS,
  MOCK_MESSAGES,
  MOCK_STATS,
  PROMO_CODES,
} from '../src/data/seedData';
import { SEED_VERSION } from '../src/data/seedConstants';

export { SEED_VERSION };

function getCloudinaryConfig() {
  const cloudName =
    process.env.VITE_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    'dkfb1kthv';
  const uploadPreset =
    process.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
    process.env.CLOUDINARY_UPLOAD_PRESET ||
    'USIU-Food-Joint';
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  return { uploadPreset, uploadUrl };
}

interface CloudinaryUploadResponse {
  secure_url: string;
  error?: { message: string };
}

export async function uploadToCloudinary(
  file: string | Blob,
  folder?: string,
): Promise<string> {
  const { uploadPreset, uploadUrl } = getCloudinaryConfig();
  const body = new FormData();

  let uploadFile = file;
  if (typeof file === 'string' && file.startsWith('/')) {
    const fullPath = path.join(process.cwd(), 'public', file);
    if (fs.existsSync(fullPath)) {
      const buffer = fs.readFileSync(fullPath);
      const ext = path.extname(file).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
      const base64 = buffer.toString('base64');
      uploadFile = `data:${mime};base64,${base64}`;
    }
  }

  body.append('file', uploadFile);
  body.append('upload_preset', uploadPreset);
  if (folder) body.append('folder', folder);

  const res = await fetch(uploadUrl, { method: 'POST', body });
  const data = (await res.json()) as CloudinaryUploadResponse;

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Cloudinary upload failed (${res.status})`);
  }

  return data.secure_url;
}

export async function buildProductMapWithCloudinary(): Promise<Map<string, Product>> {
  const productMap = new Map<string, Product>();

  for (const product of INITIAL_PRODUCTS) {
    const { id, image, ...rest } = product;
    let cloudinaryUrl = image;

    try {
      cloudinaryUrl = await uploadToCloudinary(image, 'food-joint/products');
      console.log(`Uploaded ${id} to Cloudinary`);
    } catch (err) {
      console.error(`Cloudinary upload failed for ${id}, using original URL:`, err);
    }

    productMap.set(id, { id, image: cloudinaryUrl, ...rest });
  }

  return productMap;
}

export function remapOrderProducts(order: Order, productMap: Map<string, Product>): Order {
  return {
    ...order,
    items: order.items.map(item => ({
      ...item,
      product: productMap.get(item.product.id) ?? item.product,
    })),
  };
}

export function productToFirestoreData(product: Product): Omit<Product, 'id'> {
  const data = { ...product } as Partial<Product>;
  delete data.id;
  return data as Omit<Product, 'id'>;
}

export function orderToFirestoreData(order: Order): Omit<Order, 'id'> {
  const data = { ...order } as Partial<Order>;
  delete data.id;
  return data as Omit<Order, 'id'>;
}

export {
  INITIAL_PRODUCTS,
  MOCK_CUSTOMERS,
  MOCK_ORDERS,
  MOCK_MESSAGES,
  MOCK_STATS,
  PROMO_CODES,
};
