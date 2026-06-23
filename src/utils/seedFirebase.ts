import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  INITIAL_PRODUCTS,
  MOCK_CUSTOMERS,
  MOCK_ORDERS,
  MOCK_MESSAGES,
  MOCK_STATS,
  PROMO_CODES,
} from '../data/seedData';
import { SEED_VERSION } from '../data/seedConstants';

export type SeedStatus = 'idle' | 'seeding' | 'done' | 'error';

export interface SeedResult {
  status: SeedStatus;
  error?: string;
}

function isPermissionError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('permission') || msg.includes('PERMISSION_DENIED');
}

async function getStoredSeedVersion(): Promise<number> {
  try {
    const snap = await getDoc(doc(db, 'meta', 'seed'));
    return snap.data()?.version ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Lightweight browser fallback — writes seed data without Cloudinary uploads.
 * Primary seed path: `npm run seed` (admin SDK, bypasses security rules).
 */
export async function seedDatabase(): Promise<SeedResult> {
  try {
    const storedVersion = await getStoredSeedVersion();
    const productsSnap = await getDocs(collection(db, 'products'));

    if (storedVersion >= SEED_VERSION && !productsSnap.empty) {
      return { status: 'done' };
    }

    if (productsSnap.empty) {
      console.log('Client fallback: seeding products...');
      for (const product of INITIAL_PRODUCTS) {
        const { id, ...data } = product;
        await setDoc(doc(db, 'products', id), data);
      }
    }

    const ordersSnap = await getDocs(collection(db, 'orders'));
    if (ordersSnap.empty) {
      console.log('Client fallback: seeding orders...');
      for (const order of MOCK_ORDERS) {
        const { id, ...data } = order;
        await setDoc(doc(db, 'orders', id), data);
      }
    }

    const customersSnap = await getDocs(collection(db, 'customers'));
    if (customersSnap.empty) {
      for (const customer of MOCK_CUSTOMERS) {
        const { id, ...data } = customer;
        await setDoc(doc(db, 'customers', id), data);
      }
    }

    const messagesSnap = await getDocs(collection(db, 'messages'));
    if (messagesSnap.empty) {
      for (const message of MOCK_MESSAGES) {
        const { id, ...data } = message;
        await setDoc(doc(db, 'messages', id), data);
      }
    }

    const statsSnap = await getDocs(collection(db, 'weeklyStats'));
    if (statsSnap.empty) {
      await setDoc(doc(db, 'weeklyStats', 'current'), { days: MOCK_STATS });
    }

    const promoSnap = await getDocs(collection(db, 'promoCodes'));
    if (promoSnap.empty) {
      for (const [code, data] of Object.entries(PROMO_CODES)) {
        await setDoc(doc(db, 'promoCodes', code), data);
      }
    }

    if (storedVersion < SEED_VERSION) {
      await setDoc(doc(db, 'meta', 'seed'), {
        version: SEED_VERSION,
        seededAt: new Date().toISOString(),
        source: 'client-fallback',
      });
    }

    return { status: 'done' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Seed failed';
    console.error('Client seed failed:', err);

    if (isPermissionError(err)) {
      return {
        status: 'error',
        error: 'Missing or insufficient permissions. Run npm run seed and publish Firestore rules.',
      };
    }

    return { status: 'error', error: message };
  }
}
