import { useState } from 'react';
import { useAuth, mapFirebaseAuthError } from '../../context/AuthContext';
import type { CustomerView } from '../../context/types';
import { addToast } from '../../utils/toast';

interface Props {
  onNavigate: (view: CustomerView) => void;
  returnTo?: CustomerView;
}

type AuthTab = 'guest' | 'email' | 'phone';
type EmailMode = 'signin' | 'signup';

export default function LoginView({ onNavigate, returnTo = 'home' }: Props) {
  const {
    user,
    signInAsGuest,
    signInWithEmail,
    signUpWithEmail,
    linkWithEmail,
    sendPhoneOtp,
    verifyPhoneOtp,
    authLoading,
  } = useAuth();

  const isLinking = user?.isAnonymous ?? false;

  const [tab, setTab] = useState<AuthTab>(isLinking ? 'email' : 'guest');
  const [emailMode, setEmailMode] = useState<EmailMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSuccess = () => {
    addToast('Welcome to Kwa Gavo!', 'success', 'check_circle');
    onNavigate(returnTo);
  };

  const handleGuest = async () => {
    setLoading(true);
    setError('');
    try {
      if (user?.isAnonymous) {
        handleSuccess();
        return;
      }
      await signInAsGuest();
      handleSuccess();
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLinking) {
        if (!displayName.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        await linkWithEmail(email, password, displayName.trim());
      } else if (emailMode === 'signup') {
        if (!displayName.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName.trim());
      } else {
        await signInWithEmail(email, password);
      }
      handleSuccess();
    } catch (err: unknown) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendPhoneOtp(phone);
      setOtpSent(true);
      addToast('Verification code sent', 'success', 'sms');
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyPhoneOtp(otp);
      handleSuccess();
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="app-view app-view--inset" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50dvh' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }}>progress_activity</span>
      </main>
    );
  }

  return (
    <main className="app-view app-view--inset fade-in-up">
      <div style={{ marginBottom: '24px' }}>
        <button
          className="ripple-btn"
          onClick={() => onNavigate('home')}
          style={{ background: 'transparent', border: 'none', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px', padding: 0 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back_ios_new</span>
          Back
        </button>
        <h1 className="font-headline-lg-mobile shimmer-text" style={{ color: 'var(--color-on-surface)' }}>
          {isLinking ? 'Save Your Session' : 'Welcome'}
        </h1>
        <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
          {isLinking
            ? 'Create an account to keep your orders and earn rewards'
            : 'Sign in to order, track, and save your cravings'}
        </p>
      </div>

      <div className="glass-panel" style={{ display: 'flex', padding: '4px', borderRadius: 'var(--radius-full)', marginBottom: '24px', border: '1px solid rgba(200, 150, 168, 0.15)' }}>
        {(isLinking ? ['email', 'phone'] as AuthTab[] : ['guest', 'email', 'phone'] as AuthTab[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(''); setOtpSent(false); }}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 'var(--radius-full)',
              background: tab === t ? 'var(--color-primary-container)' : 'transparent',
              color: tab === t ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '12px',
            }}
          >
            {t === 'guest' ? 'Guest' : t === 'email' ? 'Email' : 'Phone'}
          </button>
        ))}
      </div>

      {error && (
        <p className="font-label-md" style={{ color: 'var(--color-error)', marginBottom: '16px', textAlign: 'center' }}>{error}</p>
      )}

      {tab === 'guest' && !isLinking && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-card)', textAlign: 'center' }}>
          <span className="material-symbols-outlined fill-1" style={{ fontSize: '48px', color: 'var(--color-primary)', marginBottom: '12px' }}>person</span>
          <h2 className="font-headline-md" style={{ color: 'var(--color-on-surface)', marginBottom: '8px' }}>Continue as Guest</h2>
          <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '20px', fontSize: '14px' }}>
            Order and track your current session. Past orders won't be saved.
          </p>
          <button
            onClick={handleGuest}
            disabled={loading}
            className="cart-checkout-btn ripple-btn"
            style={{ width: '100%', opacity: loading ? 0.6 : 1 }}
          >
            <span className="font-label-md" style={{ textTransform: 'uppercase', fontWeight: 700 }}>
              {user?.isAnonymous ? 'Continue' : 'Continue as Guest'}
            </span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      )}

      {tab === 'email' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-card)' }}>
          {!isLinking && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setEmailMode('signin')}
                style={{
                  flex: 1, padding: '8px', borderRadius: 'var(--radius-full)', border: 'none',
                  background: emailMode === 'signin' ? 'var(--color-tertiary-fixed)' : 'rgba(255,255,255,0.05)',
                  color: emailMode === 'signin' ? 'var(--color-on-tertiary-fixed)' : 'var(--color-on-surface-variant)',
                  fontWeight: 'bold', fontSize: '13px',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setEmailMode('signup')}
                style={{
                  flex: 1, padding: '8px', borderRadius: 'var(--radius-full)', border: 'none',
                  background: emailMode === 'signup' ? 'var(--color-tertiary-fixed)' : 'rgba(255,255,255,0.05)',
                  color: emailMode === 'signup' ? 'var(--color-on-tertiary-fixed)' : 'var(--color-on-surface-variant)',
                  fontWeight: 'bold', fontSize: '13px',
                }}
              >
                Sign Up
              </button>
            </div>
          )}
          <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(isLinking || emailMode === 'signup') && (
              <input
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="manager-login__input"
                style={{ width: '100%' }}
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="manager-login__input"
              style={{ width: '100%' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="manager-login__input"
              style={{ width: '100%' }}
            />
            <button type="submit" disabled={loading} className="cart-checkout-btn ripple-btn" style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.6 : 1 }}>
              <span className="font-label-md" style={{ textTransform: 'uppercase', fontWeight: 700 }}>
                {isLinking ? 'Create Account' : emailMode === 'signup' ? 'Create Account' : 'Sign In'}
              </span>
              <span className="material-symbols-outlined">login</span>
            </button>
          </form>
        </div>
      )}

      {tab === 'phone' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-card)' }}>
          {!otpSent ? (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', marginBottom: '4px' }}>
                Enter your phone number (e.g. 0712345678)
              </p>
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="manager-login__input"
                style={{ width: '100%' }}
              />
              <button type="submit" disabled={loading} className="cart-checkout-btn ripple-btn" style={{ width: '100%', opacity: loading ? 0.6 : 1 }}>
                <span className="font-label-md" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Send Code</span>
                <span className="material-symbols-outlined">sms</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>
                Enter the 6-digit code sent to {phone}
              </p>
              <input
                type="text"
                placeholder="Verification code"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
                maxLength={6}
                className="manager-login__input"
                style={{ width: '100%', letterSpacing: '0.3em', textAlign: 'center', fontSize: '20px' }}
              />
              <button type="submit" disabled={loading} className="cart-checkout-btn ripple-btn" style={{ width: '100%', opacity: loading ? 0.6 : 1 }}>
                <span className="font-label-md" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Verify & Sign In</span>
                <span className="material-symbols-outlined">verified</span>
              </button>
              <button
                type="button"
                onClick={() => { setOtpSent(false); setOtp(''); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-on-surface-variant)', fontSize: '13px', cursor: 'pointer' }}
              >
                Change phone number
              </button>
            </form>
          )}
        </div>
      )}
    </main>
  );
}

