export function stripUndefined<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

export function mapFirestoreError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes('BLOCKED_BY_CLIENT') || message.includes('Failed to fetch')) {
    return 'Firebase is blocked by a browser extension or ad blocker. Allow firestore.googleapis.com for this site.';
  }

  if (code === 'permission-denied') {
    return 'Permission denied. Run: npm run deploy:rules:cli';
  }

  if (code === 'not-found') {
    return 'Data not found. Please sign out and back in.';
  }

  return message || 'Something went wrong. Please try again.';
}

export function isFirestoreConnectivityError(message: string | null): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes('blocked_by_client') ||
    lower.includes('failed to fetch') ||
    lower.includes('permission') ||
    lower.includes('insufficient') ||
    lower.includes('network')
  );
}
