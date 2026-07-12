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
  const { cartCount, loyaltyPoints, loyaltyTier, streakDays } = useStore();
  const { user, userProfile, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const handleMenuClick = (view: CustomerView) => {
    setDrawerOpen(false);
    onNavigate?.(view);
  };

  const handleSignOutClick = async () => {
    setDrawerOpen(false);
    await signOut();
    onNavigate?.('home');
  };

  const avatarContent = userProfile?.avatarUrl ? (
    <OptimizedImage src={userProfile.avatarUrl} alt="User avatar" preset="avatar" />
  ) : (
    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary)' }}>person</span>
  );

  return (
    <>
      <header
        className="top-app-bar"
        style={{
          background: scrolled
            ? 'rgba(22, 12, 16, 0.88)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(200, 150, 168, 0.08)' : '1px solid transparent',
          transition: 'background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease',
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
        }}
      >
        {showBack ? (
          <button className="top-app-bar__icon-btn ripple-btn" onClick={onBack} aria-label="Go back">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
        ) : (
          <button
            className="top-app-bar__icon-btn ripple-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation drawer"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        )}

        <button
          type="button"
          className="top-app-bar__logo-btn ripple-btn"
          onClick={() => onNavigate?.('home')}
          aria-label="Go to home"
        >
          <img src="/kwagavo/logo.jpg" alt="Kwa Gavo" className="top-app-bar__logo" style={{ borderRadius: '50%' }} />
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
                background: 'linear-gradient(135deg, var(--color-tertiary) 0%, var(--color-tertiary-fixed) 100%)',
                color: 'var(--color-on-tertiary)',
                fontSize: '9px',
                fontWeight: 700,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-sans)',
                boxShadow: '0 2px 6px rgba(180,150,60,0.25)',
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
              boxShadow: '0 0 0 2px rgba(200, 150, 168, 0.2)',
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

      {/* Navigation Drawer Overlay */}
      <div
        className={`nav-drawer-overlay ${drawerOpen ? 'nav-drawer-overlay--open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Navigation Drawer */}
      <nav className={`nav-drawer ${drawerOpen ? 'nav-drawer--open' : ''}`} aria-label="Side menu">
        <div className="nav-drawer__header">
          <div className="nav-drawer__brand">
            <img src="/kwagavo/logo.jpg" alt="Kwa Gavo" className="nav-drawer__logo" style={{ borderRadius: '50%' }} />
          </div>
          <button
            className="nav-drawer__close-btn ripple-btn"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="nav-drawer__content scroll-hide">
          {/* Profile Section */}
          <div className="nav-drawer__profile-section">
            <div className="nav-drawer__profile-info">
              <div className="nav-drawer__avatar">
                {avatarContent}
              </div>
              <div className="nav-drawer__user-details">
                <span className="nav-drawer__name font-label-md">
                  {user ? (userProfile?.displayName || user.displayName || 'Gavo Guest') : 'Welcome Guest'}
                </span>
                <span className="nav-drawer__role font-label-md">
                  {user ? (userProfile?.email || user.email || 'Gavo Loyal Customer') : 'Gavo Fan Club'}
                </span>
              </div>
            </div>

            {user && (
              <div className="nav-drawer__loyalty" onClick={() => handleMenuClick('loyalty')} role="button" tabIndex={0}>
                <div className="nav-drawer__loyalty-details">
                  <span className="nav-drawer__loyalty-tier shimmer-text font-label-md">{loyaltyTier}</span>
                  <span className="nav-drawer__loyalty-points font-label-md">{loyaltyPoints.toLocaleString()} pts</span>
                </div>
                <div className="streak-badge" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
                  <span className="material-symbols-outlined fill-1 streak-badge__icon">local_fire_department</span>
                  {streakDays}-day streak
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="nav-drawer__menu">
            <button className="nav-drawer__menu-item ripple-btn" onClick={() => handleMenuClick('home')}>
              <span className="material-symbols-outlined nav-drawer__menu-item-icon">home</span>
              Home
            </button>
            <button className="nav-drawer__menu-item ripple-btn" onClick={() => handleMenuClick('search')}>
              <span className="material-symbols-outlined nav-drawer__menu-item-icon">search</span>
              Explore Menu
            </button>
            {user && (
              <>
                <button className="nav-drawer__menu-item ripple-btn" onClick={() => handleMenuClick('loyalty')}>
                  <span className="material-symbols-outlined nav-drawer__menu-item-icon">workspace_premium</span>
                  Rewards & Benefits
                </button>
                <button className="nav-drawer__menu-item ripple-btn" onClick={() => handleMenuClick('history')}>
                  <span className="material-symbols-outlined nav-drawer__menu-item-icon">receipt_long</span>
                  Order History
                </button>
                <button className="nav-drawer__menu-item ripple-btn" onClick={() => handleMenuClick('profile')}>
                  <span className="material-symbols-outlined nav-drawer__menu-item-icon">settings</span>
                  Settings & Profile
                </button>
              </>
            )}
            {!user && (
              <button className="nav-drawer__menu-item ripple-btn" onClick={() => handleMenuClick('login')}>
                <span className="material-symbols-outlined nav-drawer__menu-item-icon">login</span>
                Sign In / Sign Up
              </button>
            )}
          </div>
        </div>

        {user && (
          <div className="nav-drawer__footer">
            <button className="nav-drawer__signout-btn ripple-btn" onClick={handleSignOutClick}>
              <span className="material-symbols-outlined">logout</span>
              Sign Out
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
