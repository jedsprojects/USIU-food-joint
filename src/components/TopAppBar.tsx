import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import type { CustomerView } from '../context/StoreContext';
import OptimizedImage from './OptimizedImage';

interface Props {
  onNavigate?: (view: CustomerView) => void;
  showBack?: boolean;
  onBack?: () => void;
}

export default function TopAppBar({ onNavigate, showBack, onBack }: Props) {
  const { cartCount } = useStore();
  const { user, userProfile } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProfileClick = () => {
    if (!user) {
      onNavigate?.('login');
    } else {
      onNavigate?.('profile');
    }
  };

  const avatarContent = userProfile?.avatarUrl ? (
    <OptimizedImage src={userProfile.avatarUrl} alt="User avatar" preset="avatar" />
  ) : (
    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary)' }}>person</span>
  );

  return (
    <header
      className="top-app-bar"
      style={{
        background: scrolled
          ? 'rgba(18, 8, 14, 0.92)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255, 177, 196, 0.1)' : '1px solid transparent',
        transition: 'background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {showBack ? (
        <button className="top-app-bar__icon-btn ripple-btn" onClick={onBack} aria-label="Go back">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
      ) : (
        <button className="top-app-bar__icon-btn ripple-btn" aria-label="Open menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
      )}

      <button
        type="button"
        className="top-app-bar__logo-btn ripple-btn"
        onClick={() => onNavigate?.('home')}
        aria-label="Go to home"
      >
        <img src="/food_b.png" alt="USIU Food Joint" className="top-app-bar__logo" />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className="top-app-bar__icon-btn ripple-btn"
          onClick={() => onNavigate?.('cart')}
          aria-label="View cart"
          style={{ position: 'relative' }}
        >
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>shopping_bag</span>
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '16px',
              height: '16px',
              background: 'linear-gradient(135deg, var(--color-tertiary) 0%, #ffc843 100%)',
              color: 'var(--color-on-tertiary)',
              fontSize: '9px',
              fontWeight: 700,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-sans)',
              boxShadow: '0 2px 6px rgba(233,195,73,0.4)',
              animation: 'scale-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>
              {cartCount}
            </span>
          )}
        </button>

        <button
          className="top-app-bar__avatar ripple-btn"
          aria-label="Profile"
          onClick={handleProfileClick}
          style={{
            boxShadow: '0 0 0 2px rgba(255, 177, 196, 0.3)',
            transition: 'box-shadow 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {avatarContent}
        </button>
      </div>
    </header>
  );
}
