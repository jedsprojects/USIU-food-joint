import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { GoogleAuth } from 'google-auth-library';

const RULES_API = 'https://firebaserules.googleapis.com/v1';

function getCredentials() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      'Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY in .env',
    );
    process.exit(1);
  }

  return { projectId, clientEmail, privateKey };
}

async function getAccessToken(clientEmail: string, privateKey: string) {
  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: [
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/firebase',
    ],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token.token) throw new Error('Failed to obtain access token');
  return token.token;
}

async function api(
  token: string,
  method: string,
  url: string,
  body?: unknown,
): Promise<Response> {
  return fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function main() {
  const { projectId, clientEmail, privateKey } = getCredentials();
  const rulesPath = resolve(process.cwd(), 'firestore.rules');
  const rulesContent = readFileSync(rulesPath, 'utf8');

  console.log(`Deploying Firestore rules to ${projectId} via service account...`);

  const token = await getAccessToken(clientEmail, privateKey);

  const createRes = await api(
    token,
    'POST',
    `${RULES_API}/projects/${projectId}/rulesets`,
    {
      source: {
        files: [{ name: 'firestore.rules', content: rulesContent }],
      },
    },
  );

  if (!createRes.ok) {
    const err = await createRes.text();
    console.error('Failed to create ruleset:', createRes.status, err);
    process.exit(1);
  }

  const ruleset = (await createRes.json()) as { name: string };
  console.log('Created ruleset:', ruleset.name);

  const releaseName = `projects/${projectId}/releases/cloud.firestore`;
  const releaseBody = { release: { name: releaseName, rulesetName: ruleset.name } };

  let releaseRes = await api(
    token,
    'PATCH',
    `${RULES_API}/${releaseName}?updateMask=rulesetName`,
    releaseBody,
  );

  if (releaseRes.status === 404) {
    releaseRes = await api(token, 'POST', `${RULES_API}/projects/${projectId}/releases`, {
      name: releaseName,
      rulesetName: ruleset.name,
    });
  }

  if (!releaseRes.ok) {
    const err = await releaseRes.text();
    console.error('Failed to publish release:', releaseRes.status, err);
    process.exit(1);
  }

  const release = await releaseRes.json();
  console.log('Published release:', release.name ?? releaseName);
  console.log('Firestore rules are live. Refresh the app.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
