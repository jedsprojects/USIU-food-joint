import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import type { CustomerView } from '../../context/types';
import { addToast } from '../../utils/toast';
import { stripUndefined, mapFirestoreError } from '../../utils/firestore';
import { uploadImage } from '../../utils/cloudinary';
import LoyaltyView from '../LoyaltyView';

interface Props {
  onNavigate: (view: CustomerView) => void;
}

type ProfileTab = 'profile' | 'rewards' | 'notifications' | 'messages';

export default function CustomerProfileView({ onNavigate }: Props) {
  const { user, userProfile, updateUserProfile, signOut } = useAuth();
  const { notifications, markNotificationRead, messages, sendMessage } = useStore();
  const [tab, setTab] = useState<ProfileTab>('profile');
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [chatText, setChatText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile?.displayName, userProfile?.phone]);

  const uid = user?.uid || '';
  const thread = messages.find(m => (m.userId || m.customerId) === uid);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = stripUndefined({
        displayName: displayName.trim(),
        phone: phone.trim() || undefined,
      } as Record<string, unknown>);
      await updateUserProfile(updates);
      addToast('Profile updated', 'success', 'check_circle');
    } catch (err) {
      addToast(mapFirestoreError(err), 'error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'food-joint/avatars');
      await updateUserProfile({ avatarUrl: url });
      addToast('Photo updated', 'success', 'check_circle');
    } catch {
      addToast('Failed to upload photo', 'error', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim() || !uid) return;
    await sendMessage(uid, chatText.trim(), 'customer', displayName || userProfile?.displayName);
    setChatText('');
    addToast('Message sent', 'success', 'send');
  };

  const tabs: { id: ProfileTab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'rewards', label: 'Rewards', icon: 'workspace_premium' },
    { id: 'notifications', label: 'Alerts', icon: 'notifications' },
    { id: 'messages', label: 'Messages', icon: 'chat' },
  ];

  return (
    <main className="app-view app-view--inset fade-in-up">
      <div style={{ marginBottom: '20px' }}>
        <h1 className="font-headline-lg-mobile shimmer-text" style={{ color: 'var(--color-on-surface)' }}>My Profile</h1>
      </div>

      <div className="scroll-hide" style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="ripple-btn"
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: tab === t.id ? 'var(--color-primary-container)' : 'rgba(255,255,255,0.05)',
              color: tab === t.id ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 'bold',
              fontSize: '12px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{t.icon}</span>
            {t.label}
            {t.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
              <span style={{ background: 'var(--color-primary)', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-card)', marginBottom: '16px', textAlign: 'center' }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 12px', overflow: 'hidden', cursor: 'pointer', position: 'relative', border: '2px solid rgba(255,177,196,0.3)' }}
            >
              {userProfile?.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--color-primary)' }}>person</span>
                </div>
              )}
              {uploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
            <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '12px', marginBottom: '16px' }}>Tap to change photo</p>

            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="manager-login__input"
              style={{ width: '100%', marginBottom: '12px' }}
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="manager-login__input"
              style={{ width: '100%', marginBottom: '12px' }}
            />
            {userProfile?.email && (
              <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', marginBottom: '12px' }}>
                {userProfile.email}
              </p>
            )}
            <button onClick={handleSave} disabled={saving} className="cart-checkout-btn ripple-btn" style={{ width: '100%', opacity: saving ? 0.6 : 1 }}>
              <span className="font-label-md" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Save Changes</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate('history')}
            className="glass-panel ripple-btn"
            style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-card)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,177,196,0.1)', cursor: 'pointer', background: 'rgba(30,14,20,0.75)' }}
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>receipt_long</span>
            <span className="font-label-md" style={{ color: 'var(--color-on-surface)', flex: 1, textAlign: 'left' }}>View Order History</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-on-surface-variant)' }}>chevron_right</span>
          </button>

          <button
            onClick={() => signOut()}
            style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 'var(--radius-full)', color: 'var(--color-error)', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      )}

      {tab === 'rewards' && <LoyaltyView onNavigate={onNavigate} />}

      {tab === 'notifications' && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-card)' }}>
          {notifications.length === 0 ? (
            <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', textAlign: 'center', padding: '24px' }}>No notifications yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.map(n => (
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p className="font-label-md" style={{ color: 'var(--color-on-surface)', fontWeight: n.read ? 400 : 700 }}>{n.title}</p>
                    <span className="badge badge--ghost" style={{ fontSize: '10px' }}>{n.type}</span>
                  </div>
                  <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', marginTop: '4px' }}>{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'messages' && (
        <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-card)', display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
          <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '12px' }}>Message the Velvet Crumbs team</p>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px' }}>
            {thread?.messages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.sender === 'customer' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'customer' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.sender === 'customer' ? 'var(--color-primary-container)' : 'rgba(255,255,255,0.08)',
                  color: 'var(--color-on-surface)',
                  fontSize: '14px',
                }}>
                  {msg.text}
                </div>
                <p className="font-label-md" style={{ fontSize: '10px', color: 'var(--color-on-surface-variant)', marginTop: '2px', textAlign: msg.sender === 'customer' ? 'right' : 'left' }}>{msg.time}</p>
              </div>
            ))}
            {!thread && (
              <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', textAlign: 'center', padding: '24px' }}>No messages yet. Say hello!</p>
            )}
          </div>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Type a message..."
              value={chatText}
              onChange={e => setChatText(e.target.value)}
              className="manager-login__input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="ripple-btn" style={{ padding: '10px 16px', borderRadius: 'var(--radius-full)', background: 'var(--color-tertiary-fixed)', border: 'none', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-on-tertiary-fixed)' }}>send</span>
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
