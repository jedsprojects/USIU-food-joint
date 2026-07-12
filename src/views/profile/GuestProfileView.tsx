import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import type { CustomerView, UserProfile } from '../../context/types';
import { addToast } from '../../utils/toast';
import { stripUndefined, mapFirestoreError } from '../../utils/firestore';

interface Props {
  onNavigate: (view: CustomerView) => void;
}

export default function GuestProfileView({ onNavigate }: Props) {
  const { userProfile, updateUserProfile, signOut } = useAuth();
  const { activeOrder, notifications, markNotificationRead } = useStore();
  const [guestName, setGuestName] = useState(userProfile?.guestDisplayName || '');
  const [guestPhone, setGuestPhone] = useState(userProfile?.guestPhone || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      Promise.resolve().then(() => {
        setGuestName(userProfile.guestDisplayName || '');
        setGuestPhone(userProfile.guestPhone || '');
      });
    }
  }, [userProfile]);

  const handleSaveGuestInfo = async () => {
    if (!guestName.trim()) {
      addToast('Name is required for orders', 'error', 'error');
      return;
    }
    setSaving(true);
    try {
      const updates = stripUndefined({
        guestDisplayName: guestName.trim(),
        guestPhone: guestPhone.trim() || undefined,
      } as Record<string, unknown>);
      await updateUserProfile(updates as Partial<UserProfile>);
      addToast('Order info saved', 'success', 'check_circle');
    } catch (err) {
      addToast(mapFirestoreError(err), 'error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const hasActiveOrder = activeOrder && !['delivered', 'cancelled'].includes(activeOrder.status);

  return (
    <main className="app-view app-view--inset fade-in-up">
      <div style={{ marginBottom: '24px' }}>
        <p className="font-label-md" style={{ color: 'var(--color-primary-fixed-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px', opacity: 0.7 }}>Guest session</p>
        <h1 className="font-headline-lg-mobile" style={{ color: 'var(--color-on-surface)' }}>Profile</h1>
      </div>

      {hasActiveOrder && (
        <div
          className="glass-panel ripple-btn"
          onClick={() => onNavigate('tracking')}
          style={{ padding: '16px', borderRadius: 'var(--radius-card)', marginBottom: '20px', cursor: 'pointer', border: '1px solid rgba(255,177,196,0.2)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="material-symbols-outlined fill-1" style={{ color: 'var(--color-primary)', fontSize: '28px' }}>local_shipping</span>
            <div style={{ flex: 1 }}>
              <p className="font-label-md" style={{ color: 'var(--color-tertiary)' }}>Active Order</p>
              <p className="font-headline-md" style={{ color: 'var(--color-on-surface)', fontSize: '16px' }}>#{activeOrder!.code}</p>
            </div>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-on-surface-variant)' }}>chevron_right</span>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-card)', marginBottom: '20px' }}>
        <h3 className="font-headline-md" style={{ color: 'var(--color-on-surface)', fontSize: '16px', marginBottom: '12px' }}>Your Order Name</h3>
        <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', marginBottom: '12px' }}>
          This name helps staff identify your order at pickup.
        </p>
        <input
          type="text"
          placeholder="Name for your order"
          value={guestName}
          onChange={e => setGuestName(e.target.value)}
          className="manager-login__input"
          style={{ width: '100%', marginBottom: '12px' }}
        />
        <input
          type="tel"
          placeholder="Phone (optional, for follow-up)"
          value={guestPhone}
          onChange={e => setGuestPhone(e.target.value)}
          className="manager-login__input"
          style={{ width: '100%', marginBottom: '12px' }}
        />
        <button onClick={handleSaveGuestInfo} disabled={saving} className="cart-checkout-btn ripple-btn" style={{ width: '100%', opacity: saving ? 0.6 : 1 }}>
          <span className="font-label-md" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Save Info</span>
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-card)', marginBottom: '20px' }}>
        <h3 className="font-headline-md" style={{ color: 'var(--color-on-surface)', fontSize: '16px', marginBottom: '12px' }}>
          Notifications
          {notifications.filter(n => !n.read).length > 0 && (
            <span style={{ marginLeft: '8px', background: 'var(--color-primary)', color: 'var(--color-on-primary)', borderRadius: '50%', padding: '2px 7px', fontSize: '11px' }}>
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </h3>
        {notifications.length === 0 ? (
          <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>No notifications yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.slice(0, 10).map(n => (
              <div
                key={n.id}
                onClick={() => !n.read && markNotificationRead(n.id)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-xl)',
                  background: n.read ? 'rgba(255,255,255,0.03)' : 'rgba(255,177,196,0.08)',
                  border: '1px solid rgba(255,177,196,0.1)',
                  cursor: n.read ? 'default' : 'pointer',
                }}
              >
                <p className="font-label-md" style={{ color: 'var(--color-on-surface)', fontWeight: n.read ? 400 : 700 }}>{n.title}</p>
                <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', marginTop: '2px' }}>{n.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-card)', marginBottom: '20px', textAlign: 'center', border: '1px solid var(--color-tertiary)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--color-tertiary)', marginBottom: '8px' }}>upgrade</span>
        <h3 className="font-headline-md" style={{ color: 'var(--color-on-surface)', marginBottom: '8px' }}>Create an Account</h3>
        <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', marginBottom: '16px' }}>
          Sign up to save order history, earn rewards, and message the team.
        </p>
        <button onClick={() => onNavigate('login')} className="cart-checkout-btn ripple-btn" style={{ width: '100%' }}>
          <span className="font-label-md" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Sign Up / Sign In</span>
        </button>
      </div>

      <button
        onClick={() => signOut()}
        style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 'var(--radius-full)', color: 'var(--color-error)', fontWeight: 'bold', cursor: 'pointer' }}
      >
        End Guest Session
      </button>
    </main>
  );
}
