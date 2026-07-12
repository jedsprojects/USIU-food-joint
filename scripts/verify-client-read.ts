import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const snap = await getDocs(collection(db, 'products'));
  console.log(`Client read: ${snap.size} products`);

  if (snap.size === 0) {
    console.error('FAIL: No products readable (rules or seed issue)');
    process.exit(1);
  }

  snap.docs.forEach(doc => {
    const data = doc.data();
    console.log(`Product: "${data.name}" | Category: "${data.category}"`);
  });
  console.log('Browser reads should work — refresh the app.');
}

main().catch(err => {
  console.error('FAIL:', err.message ?? err);
  process.exit(1);
});
