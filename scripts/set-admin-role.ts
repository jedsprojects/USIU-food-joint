import 'dotenv/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function initAdmin() {
  if (getApps().length > 0) {
    return { db: getFirestore(), auth: getAuth() };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      'Missing admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env',
    );
    process.exit(1);
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });

  return { db: getFirestore(), auth: getAuth() };
}

async function main() {
  const identifier = process.argv[2];
  if (!identifier) {
    console.error('Usage: npm run set-admin -- <uid-or-email>');
    process.exit(1);
  }

  const { db, auth } = initAdmin();

  let uid = identifier;
  if (identifier.includes('@')) {
    const user = await auth.getUserByEmail(identifier);
    uid = user.uid;
    console.log(`Resolved email to uid: ${uid}`);
  }

  const userRef = db.collection('users').doc(uid);
  const snap = await userRef.get();

  if (!snap.exists) {
    await userRef.set({
      uid,
      role: 'admin',
      displayName: 'Admin',
      isAnonymous: false,
      loyaltyPoints: 0,
      tier: 'Crumbler',
      streakDays: 0,
      createdAt: new Date().toISOString(),
    });
    console.log(`Created users/${uid} with role: admin`);
  } else {
    await userRef.update({ role: 'admin' });
    console.log(`Updated users/${uid} to role: admin`);
  }

  console.log('Done. Sign out and back in to access the admin dashboard.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
