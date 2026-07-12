/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPhoneNumber,
  linkWithCredential,
  EmailAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
  updateProfile,
  type User,
  type ConfirmationResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { stripUndefined } from '../utils/firestore';
import type { UserProfile, AppRole } from './types';

interface AuthContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  role: AppRole;
  authLoading: boolean;
  signInAsGuest: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<void>;
  verifyPhoneOtp: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  linkWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  getOrderDisplayName: () => string;
  getOrderPhone: () => string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export function mapFirebaseAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Email already registered. Sign in instead.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/credential-already-in-use': 'This email is linked to another account.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
  };
  return messages[code] ?? (err instanceof Error ? err.message : 'Authentication failed');
}

export const HARDCODED_ADMINS: Record<string, { hash: string; name: string }> = {
  'admin@kwagavo.com': {
    hash: 'ca745e113d3763516e7029c3d2ce484fd7362421de9f291532bde31223c69e2e', // GavoAdmin2026!
    name: 'Kwa Gavo Chief'
  }
};

export async function hashSha256(str: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function buildDefaultProfile(uid: string, user: User): UserProfile {
  const profile: UserProfile = {
    uid,
    role: 'customer',
    displayName: user.displayName || '',
    isAnonymous: user.isAnonymous,
    loyaltyPoints: 0,
    tier: 'Gavo Regular',
    streakDays: 0,
    createdAt: new Date().toISOString(),
  };
  if (user.phoneNumber) profile.phone = user.phoneNumber;
  if (user.email) profile.email = user.email;
  if (user.photoURL) profile.avatarUrl = user.photoURL;
  return profile;
}

export async function fetchOrCreateProfile(user: User): Promise<UserProfile> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const emailLower = user.email?.trim().toLowerCase();
  const adminConfig = emailLower ? HARDCODED_ADMINS[emailLower] : null;

  if (snap.exists()) {
    const data = snap.data() as UserProfile;
    const updates: Partial<UserProfile> = {};
    if (user.email && !data.email) updates.email = user.email;
    if (user.phoneNumber && !data.phone) updates.phone = user.phoneNumber;
    if (user.displayName && !data.displayName) updates.displayName = user.displayName;
    if (user.photoURL && !data.avatarUrl) updates.avatarUrl = user.photoURL;
    if (!user.isAnonymous && data.isAnonymous) updates.isAnonymous = false;
    
    if (adminConfig && data.role !== 'admin') {
      updates.role = 'admin';
    }

    if (Object.keys(updates).length > 0) {
      const cleaned = stripUndefined(updates as Record<string, unknown>);
      await setDoc(ref, cleaned, { merge: true });
      return { ...data, ...updates };
    }
    return data;
  }

  const profile = buildDefaultProfile(user.uid, user);
  if (adminConfig) {
    profile.role = 'admin';
    profile.displayName = adminConfig.name;
  }
  await setDoc(ref, stripUndefined(profile as unknown as Record<string, unknown>));
  return profile;
}

function deriveRole(user: User | null, profile: UserProfile | null): AppRole {
  if (!user) return null;
  if (profile?.role === 'admin') return 'admin';
  if (user.isAnonymous) return 'guest';
  return 'customer';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const phoneForLinkRef = useRef<string>('');

  const role = deriveRole(user, userProfile);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profile = await fetchOrCreateProfile(firebaseUser);
          setUserProfile(profile);
        } catch (err) {
          console.error('Failed to load user profile:', err);
          setUserProfile(buildDefaultProfile(firebaseUser.uid, firebaseUser));
        }
      } else {
        setUserProfile(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const signInAsGuest = useCallback(async () => {
    if (auth.currentUser?.isAnonymous) {
      const profile = await fetchOrCreateProfile(auth.currentUser);
      setUserProfile(profile);
      return;
    }
    const cred = await signInAnonymously(auth);
    const profile = await fetchOrCreateProfile(cred.user);
    setUserProfile(profile);
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const adminConfig = HARDCODED_ADMINS[trimmedEmail];

    if (adminConfig) {
      // Step 1: Verify against the hardcoded hash BEFORE touching Firebase.
      // This prevents brute-force attempts from reaching Firebase Auth.
      const hashed = await hashSha256(password);
      if (hashed !== adminConfig.hash) {
        throw { code: 'auth/wrong-password', message: 'Invalid email or password.' };
      }

      // Step 2: Try signing in. If the account already exists this will succeed.
      try {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
        // onAuthStateChanged will fire and fetchOrCreateProfile will
        // detect isHardcodedAdminEmail() and ensure role='admin' is set.
        return;
      } catch (signInErr: any) {
        // Firebase v9 returns 'auth/invalid-credential' for BOTH wrong password
        // and non-existent user. We already verified the password above via hash,
        // so if we land here the only likely cause is the account doesn't exist yet.
        const isAccountMissing =
          signInErr.code === 'auth/user-not-found' ||
          signInErr.code === 'auth/invalid-credential' ||
          signInErr.code === 'auth/invalid-login-credentials';

        if (!isAccountMissing) {
          // Something unexpected (network, too-many-requests, etc.) — surface it.
          throw signInErr;
        }

        // Step 3: Self-provision the admin Firebase Auth account on first login.
        try {
          const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          await updateProfile(cred.user, { displayName: adminConfig.name });
          // The Firestore rule isHardcodedAdminEmail() allows this setDoc with role='admin'.
          await setDoc(doc(db, 'users', cred.user.uid), {
            uid: cred.user.uid,
            role: 'admin',
            displayName: adminConfig.name,
            email: trimmedEmail,
            isAnonymous: false,
            loyaltyPoints: 0,
            tier: 'Gavo Boss',
            streakDays: 0,
            createdAt: new Date().toISOString(),
          });
          return;
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            // Race condition: account was just created by another tab/session.
            // Retry sign-in once.
            await signInWithEmailAndPassword(auth, trimmedEmail, password);
            return;
          }
          console.error('[Admin self-provision] createUserWithEmailAndPassword failed:', createErr.code, createErr.message);
          throw createErr;
        }
      }
    }

    // Non-admin users: standard email/password sign-in.
    await signInWithEmailAndPassword(auth, email, password);
  }, []);


  const signUpWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (HARDCODED_ADMINS[trimmedEmail]) {
      throw { code: 'auth/email-already-in-use', message: 'Email already registered. Sign in instead.' };
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    await setDoc(
      doc(db, 'users', cred.user.uid),
      stripUndefined({ displayName, email, isAnonymous: false } as Record<string, unknown>),
      { merge: true },
    );
  }, []);

  const getRecaptcha = useCallback(() => {
    if (recaptchaRef.current) {
      recaptchaRef.current.clear();
      recaptchaRef.current = null;
    }
    recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
    return recaptchaRef.current;
  }, []);

  const sendPhoneOtp = useCallback(async (phone: string) => {
    const formatted = phone.startsWith('+') ? phone : `+254${phone.replace(/^0/, '')}`;
    phoneForLinkRef.current = formatted;
    const verifier = getRecaptcha();
    confirmationRef.current = await signInWithPhoneNumber(auth, formatted, verifier);
  }, [getRecaptcha]);

  const verifyPhoneOtp = useCallback(async (code: string) => {
    if (!confirmationRef.current) throw new Error('No OTP sent. Request a code first.');

    const currentUser = auth.currentUser;
    if (currentUser?.isAnonymous) {
      const credential = PhoneAuthProvider.credential(
        confirmationRef.current.verificationId,
        code,
      );
      const linked = await linkWithCredential(currentUser, credential);
      await setDoc(
        doc(db, 'users', linked.user.uid),
        stripUndefined({
          phone: phoneForLinkRef.current,
          isAnonymous: false,
        } as Record<string, unknown>),
        { merge: true },
      );
      const profile = await fetchOrCreateProfile(linked.user);
      setUserProfile(profile);
    } else {
      await confirmationRef.current.confirm(code);
    }
    confirmationRef.current = null;
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
  }, []);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    const cleaned = stripUndefined(updates as Record<string, unknown>);
    if (Object.keys(cleaned).length === 0) return;
    await setDoc(ref, cleaned, { merge: true });
    setUserProfile(prev => (prev ? { ...prev, ...updates } : prev));
    if (updates.displayName && !user.isAnonymous) {
      await updateProfile(user, { displayName: updates.displayName });
    }
    if (updates.avatarUrl && !user.isAnonymous) {
      await updateProfile(user, { photoURL: updates.avatarUrl });
    }
  }, [user]);

  const linkWithEmail = useCallback(async (email: string, password: string, displayName?: string) => {
    if (!user || !user.isAnonymous) throw new Error('Must be signed in as guest to link account');
    const credential = EmailAuthProvider.credential(email, password);
    const linked = await linkWithCredential(user, credential);
    if (displayName) {
      await updateProfile(linked.user, { displayName });
    }
    await setDoc(
      doc(db, 'users', linked.user.uid),
      stripUndefined({
        email,
        displayName: displayName || undefined,
        isAnonymous: false,
      } as Record<string, unknown>),
      { merge: true },
    );
    const profile = await fetchOrCreateProfile(linked.user);
    setUserProfile(profile);
  }, [user]);

  const getOrderDisplayName = useCallback(() => {
    if (!userProfile) return '';
    if (userProfile.isAnonymous) return userProfile.guestDisplayName || userProfile.displayName || '';
    return userProfile.displayName || '';
  }, [userProfile]);

  const getOrderPhone = useCallback(() => {
    if (!userProfile) return '';
    if (userProfile.isAnonymous) return userProfile.guestPhone || userProfile.phone || '';
    return userProfile.phone || userProfile.guestPhone || '';
  }, [userProfile]);

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      role,
      authLoading,
      signInAsGuest,
      signInWithEmail,
      signUpWithEmail,
      sendPhoneOtp,
      verifyPhoneOtp,
      signOut,
      updateUserProfile,
      linkWithEmail,
      getOrderDisplayName,
      getOrderPhone,
    }}>
      <div id="recaptcha-container" style={{ display: 'none' }} />
      {children}
    </AuthContext.Provider>
  );
}

export function messageUserId(msg: { userId?: string; customerId?: string }) {
  return msg.userId || msg.customerId || '';
}
