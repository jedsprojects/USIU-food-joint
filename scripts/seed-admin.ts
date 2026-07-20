import 'dotenv/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  SEED_VERSION,
  buildProductMapWithCloudinary,
  productToFirestoreData,
  PROMO_CODES,
} from './seed-shared';

function initAdmin() {
  if (getApps().length > 0) {
    return getFirestore();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      'Missing admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env',
    );
    console.error(
      'Get them from Firebase Console → Project Settings → Service Accounts → Generate new private key',
    );
    process.exit(1);
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });

  return getFirestore();
}

async function main() {
  console.log('Starting admin seed (bypasses Firestore security rules)...');
  const db = initAdmin();

  const metaSnap = await db.doc('meta/seed').get();
  const storedVersion = metaSnap.data()?.version ?? 0;
  const productsSnap = await db.collection('products').get();
  const needsProductSeed = storedVersion < SEED_VERSION || productsSnap.empty;

  if (!needsProductSeed) {
    console.log(`Database already seeded (version ${storedVersion}). Skipping product/order seed.`);
  } else {
    console.log('Uploading product images to Cloudinary and writing to Firestore...');
    const productMap = await buildProductMapWithCloudinary();

    for (const [id, product] of productMap) {
      await db.doc(`products/${id}`).set(productToFirestoreData(product));
    }
    console.log(`Seeded ${productMap.size} products`);

    // Clean up old demo orders
    console.log('Cleaning up old orders...');
    const ordersSnap = await db.collection('orders').get();
    for (const docRef of ordersSnap.docs) {
      await docRef.ref.delete();
    }

    // Clean up old messages
    console.log('Cleaning up old messages...');
    const messagesSnap = await db.collection('messages').get();
    for (const docRef of messagesSnap.docs) {
      await docRef.ref.delete();
    }

    // Clean up old customers collection
    console.log('Cleaning up obsolete customers collection...');
    const customersSnap = await db.collection('customers').get();
    for (const docRef of customersSnap.docs) {
      await docRef.ref.delete();
    }

    // Clean up weeklyStats doc
    console.log('Cleaning up weeklyStats document...');
    await db.doc('weeklyStats/current').delete().catch(() => {});

    await db.doc('meta/seed').set({
      version: SEED_VERSION,
      seededAt: new Date().toISOString(),
    });
    console.log(`Updated meta/seed to version ${SEED_VERSION}`);
  }

  const promoSnap = await db.collection('promoCodes').get();
  if (promoSnap.empty) {
    console.log('Seeding promo codes...');
    for (const [code, data] of Object.entries(PROMO_CODES)) {
      await db.doc(`promoCodes/${code}`).set(data);
    }
    console.log(`Seeded ${Object.keys(PROMO_CODES).length} promo codes`);
  }

  console.log('Admin seed completed successfully.');
}

main().catch(err => {
  console.error('Admin seed failed:', err);
  process.exit(1);
});
