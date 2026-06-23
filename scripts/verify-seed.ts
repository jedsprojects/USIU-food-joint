import 'dotenv/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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
  console.log(`products:   ${products.size} documents`);
  console.log(`orders:     ${orders.size} documents`);
  console.log(`customers:  ${customers.size} documents`);
  console.log(`messages:   ${messages.size} documents`);
  console.log(`promoCodes: ${promos.size} documents`);
  console.log(`weeklyStats: ${stats.exists ? 'current doc present' : 'missing'}`);
  console.log(`meta/seed:  version ${meta.data()?.version ?? 'not set'}`);

  if (products.size > 0) {
    const sample = products.docs[0].data();
    console.log(`sample image: ${String(sample.image).slice(0, 60)}...`);
  }

  const ok = products.size >= 6 && meta.data()?.version === 2;
  console.log(ok ? '\nSeed looks healthy.' : '\nSeed incomplete — run npm run seed');
  process.exit(ok ? 0 : 1);
}

main().catch(err => {
  console.error('Verify failed:', err);
  process.exit(1);
});
