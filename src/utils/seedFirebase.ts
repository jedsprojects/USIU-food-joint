import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  INITIAL_PRODUCTS,
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
 * Forceful database overhaul on the client-side.
 * Clears old data (including Velvet product listings) and seeds Kwa Gavo menu items, pricing, promo codes, and metrics.
 * Skips gracefully when the device is offline — the app will load from the persistent Firestore IndexedDB cache.
 */
export async function seedDatabase(): Promise<SeedResult> {
  // Skip seeding entirely when offline — onSnapshot listeners will
  // serve the persisted cache and sync automatically on reconnection.
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.log('Device is offline — skipping seed check, loading from cache.');
    return { status: 'done' };
  }

  try {
    // Race the version check against a 6-second timeout so a slow
    // network never blocks the initial render.
    const versionPromise = getStoredSeedVersion();
    const timeoutPromise = new Promise<number>(resolve => setTimeout(() => resolve(-1), 6000));
    const storedVersion = await Promise.race([versionPromise, timeoutPromise]);

    // -1 means the timeout fired — treat as "needs seeding" only if we
    // have no products snapshot yet (handled by onSnapshot 8s fallback).
    if (storedVersion === -1) {
      console.warn('Seed version check timed out — deferring to cache.');
      return { status: 'done' };
    }

    const productsSnap = await getDocs(collection(db, 'products'));

    if (storedVersion >= SEED_VERSION && !productsSnap.empty) {

      return { status: 'done' };
    }

    console.log(`Force Seeding/Overhauling database to SEED_VERSION ${SEED_VERSION}...`);

    // 1. Delete all old products to prevent residual Velvet items
    for (const docRef of productsSnap.docs) {
      try {
        await deleteDoc(doc(db, 'products', docRef.id));
      } catch (e) {
        console.warn(`Failed to delete product ${docRef.id}:`, e);
      }
    }

    // 2. Seed authentic Gavo products
    console.log('Seeding Gavo products...');
    for (const product of INITIAL_PRODUCTS) {
      const { id, ...data } = product;
      await setDoc(doc(db, 'products', id), data);
    }

    // 3. Clear old orders if version changed, to prevent mixing currencies/items
    const ordersSnap = await getDocs(collection(db, 'orders'));
    for (const docRef of ordersSnap.docs) {
      try {
        await deleteDoc(doc(db, 'orders', docRef.id));
      } catch (e) {
        console.warn(`Failed to delete order ${docRef.id}:`, e);
      }
    }

    // 4. Overwrite/seed mock customers (we clear it completely and stop seeding)
    const customersSnap = await getDocs(collection(db, 'customers'));
    for (const docRef of customersSnap.docs) {
      try {
        await deleteDoc(doc(db, 'customers', docRef.id));
      } catch (e) {
        console.warn(`Failed to delete customer ${docRef.id}:`, e);
      }
    }

    // 5. Overwrite/seed mock messages (we clear it completely and stop seeding)
    const messagesSnap = await getDocs(collection(db, 'messages'));
    for (const docRef of messagesSnap.docs) {
      try {
        await deleteDoc(doc(db, 'messages', docRef.id));
      } catch (e) {
        console.warn(`Failed to delete message ${docRef.id}:`, e);
      }
    }

    // 6. Overwrite weekly stats (we delete the document as stats are computed dynamically)
    try {
      await deleteDoc(doc(db, 'weeklyStats', 'current'));
    } catch (e) {
      console.warn('Failed to delete weeklyStats doc:', e);
    }

    // 7. Overwrite promo codes
    const promoSnap = await getDocs(collection(db, 'promoCodes'));
    for (const docRef of promoSnap.docs) {
      try {
        await deleteDoc(doc(db, 'promoCodes', docRef.id));
      } catch (e) {
        console.warn(`Failed to delete promo code ${docRef.id}:`, e);
      }
    }
    for (const [code, data] of Object.entries(PROMO_CODES)) {
      await setDoc(doc(db, 'promoCodes', code), data);
    }

    // 8. Update stored seed version
    await setDoc(doc(db, 'meta', 'seed'), {
      version: SEED_VERSION,
      seededAt: new Date().toISOString(),
      source: 'client-force-overhaul',
    });

    console.log('Database overhaul completed successfully.');
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
