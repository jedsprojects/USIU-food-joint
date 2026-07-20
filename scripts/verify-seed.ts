import 'dotenv/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { SEED_VERSION } from '../src/data/seedConstants';

function initAdmin() {
  if (getApps().length > 0) return getFirestore();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY in .env');
    process.exit(1);
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return getFirestore();
}

async function main() {
  const db = initAdmin();

  const [products, orders, customers, messages, promos, meta] = await Promise.all([
    db.collection('products').get(),
    db.collection('orders').get(),
    db.collection('customers').get(),
    db.collection('messages').get(),
    db.collection('promoCodes').get(),
    db.doc('meta/seed').get(),
  ]);

  const stats = await db.collection('weeklyStats').doc('current').get();

  console.log('--- Seed verification (admin read) ---');
  console.log(`products:    ${products.size} documents`);
  console.log(`orders:      ${orders.size} documents (should be 0 for demo clean)`);
  console.log(`customers:   ${customers.size} documents (should be 0 for demo clean)`);
  console.log(`messages:    ${messages.size} documents (should be 0 for demo clean)`);
  console.log(`promoCodes:  ${promos.size} documents`);
  console.log(`weeklyStats: ${stats.exists ? 'current doc present' : 'missing (correct)'}`);
  console.log(`meta/seed:   version ${meta.data()?.version ?? 'not set'} (should be ${SEED_VERSION})`);

  if (products.size > 0) {
    const sample = products.docs[0].data();
    console.log(`sample image: ${String(sample.image).slice(0, 60)}...`);
  }

  const ok = products.size >= 6 && meta.data()?.version === SEED_VERSION;
  console.log(ok ? '\nSeed looks healthy.' : '\nSeed incomplete or version mismatch — run npm run seed');
  process.exit(ok ? 0 : 1);
}

main().catch(err => {
  console.error('Verify failed:', err);
  process.exit(1);
});
