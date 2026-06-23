# USIU-food-joint

Velvet Crumbs — Fast Food Ordering

## Setup

### 1. Environment variables

```bash
cp .env.example .env
```

Fill in [`.env`](.env):

- **VITE_*** — Firebase web config and Cloudinary (from Firebase Console → Project settings → Your apps)
- **FIREBASE_CLIENT_EMAIL** and **FIREBASE_PRIVATE_KEY** — from Firebase Console → Project settings → Service accounts → **Generate new private key**

Never commit `.env` or service account JSON files.

### 2. Firestore security rules (required for the app)

The browser cannot read seeded data until rules allow it. **Admin seed (`npm run seed`) bypasses rules, but the React app does not.**

**Option A — Firebase Console (recommended if CLI deploy fails)**

1. Open [Firestore Rules](https://console.firebase.google.com/project/food-joint-usiu/firestore/rules)
2. Paste the contents of [`firestore.rules`](firestore.rules):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **Publish**
4. Refresh the app

**Option B — Service account (uses `.env` admin credentials; works when personal Firebase login lacks IAM)**

```bash
npm run deploy:rules
```

**Option C — Firebase CLI (personal Google account)**

```bash
firebase login
firebase use food-joint-usiu
npm run deploy:rules:cli
```

If CLI deploy fails with a 403 permission error, use Option A or B.

### 3. Seed the database

Primary seed (Admin SDK — bypasses security rules, uploads images to Cloudinary):

```bash
npm install
npm run seed
```

This writes products, orders, customers, messages, weekly stats, promo codes, and `meta/seed` (version 2) to Firestore.

### 4. Run the app

```bash
npm run dev
```

## Cloudinary

- Cloud name: `dkfb1kthv`
- Upload preset: `USIU-Food-Joint` (must be **unsigned** and **active**)
- Enable remote URL fetch on the preset if product image seeding from URLs fails

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run seed` | Admin seed Firestore + Cloudinary (requires `.env` admin credentials) |
| `npm run verify-seed` | Verify seeded doc counts via Admin SDK |
| `npm run verify-client-read` | Verify browser-style Firestore reads (rules published) |
| `npm run deploy:rules` | Publish Firestore rules via service account (`.env`) |
| `npm run deploy:rules:cli` | Publish rules via Firebase CLI (personal login) |
| `npm run build` | Production build |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Missing or insufficient permissions` in browser | Publish [`firestore.rules`](firestore.rules) in Firebase Console (see step 2) |
| Toast says "Cannot read Firestore" | Same — rules not published for browser reads |
| Empty menu after load | Run `npm run verify-seed`; if healthy, publish rules and refresh |
| `npm run verify-seed` fails | Run `npm run seed`; check `.env` admin credentials |
