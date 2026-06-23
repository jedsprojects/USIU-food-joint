import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { Product, CustomerView } from '../context/StoreContext';
import OptimizedImage from '../components/OptimizedImage';
import { usePreloadImage } from '../hooks/usePreloadImage';
import { IMAGE_PRESETS } from '../utils/imageUrl';

interface Props { onNavigate: (view: CustomerView, product?: Product) => void; }

const CATEGORIES = ['All', 'Burgers', 'Sides', 'Drinks', 'Desserts'];

export default function HomeView({ onNavigate }: Props) {
  const [activeCategory, setActiveCategory] = useState('All');
  const { products, addToCart, loyaltyPoints, loyaltyTier, streakDays, isLoading, firestoreError } = useStore();

  const available = products.filter(p => p.available);
  const drops = available.filter(p => p.isDrop);
  const featured = available.find(p => p.badge && !p.isDrop) || available[0];
  const filtered = activeCategory === 'All'
    ? available.filter(p => p.id !== featured?.id)
    : available.filter(p => p.category === activeCategory && p.id !== featured?.id);

  const menuEmpty = !isLoading && products.length === 0;
  const isPermissionError =
    firestoreError?.toLowerCase().includes('permission') ||
    firestoreError?.toLowerCase().includes('insufficient');

  usePreloadImage(
    featured?.image,
    IMAGE_PRESETS.hero.width,
    [...IMAGE_PRESETS.hero.srcSet],
  );

  return (
    <main className="home-view app-view fade-in-up">

      {/* Loyalty Bar */}
      <div className="loyalty-bar" onClick={() => onNavigate('loyalty')}>
        <div className="loyalty-bar__left">
          <span className="material-symbols-outlined fill-1" style={{ color: 'var(--color-tertiary)', fontSize: '18px' }}>workspace_premium</span>
          <span className="font-label-md" style={{ color: 'var(--color-tertiary)', letterSpacing: '0.04em' }}>{loyaltyTier}</span>
          <span style={{ color: 'rgba(255,177,196,0.3)', fontSize: '12px' }}>•</span>
          <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', fontWeight: 400 }}>{loyaltyPoints.toLocaleString()} pts</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="streak-badge">🔥 {streakDays}-day streak</div>
          <span className="material-symbols-outlined" style={{ color: 'rgba(255,177,196,0.4)', fontSize: '16px' }}>chevron_right</span>
        </div>
      </div>

      {/* Greeting */}
      <section className="home-view__greeting">
        <p className="font-label-md" style={{ color: 'var(--color-primary-fixed-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px', opacity: 0.7 }}>
          Good afternoon ✦
        </p>
        <h2 className="font-headline-lg" style={{ color: 'var(--color-on-surface)', marginBottom: '4px', lineHeight: 1.15 }}>
          Gourmet Moments,
        </h2>
        <p className="font-body-lg" style={{ color: 'var(--color-on-surface-variant)', fontStyle: 'italic' }}>
          Served with indulgence.
        </p>
      </section>

      {/* Category Chips */}
      <section className="category-chips scroll-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`category-chip ripple-btn ${activeCategory === cat ? 'category-chip--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Today's Drop + Hero Featured */}
      {(drops.length > 0 || featured) && (
        <div className="home-featured-row">
          {drops.length > 0 && (
            <section className="home-view__section home-view__section--drops">
              <div className="home-view__section-header">
                <h3 className="font-headline-md" style={{ color: 'var(--color-on-surface)' }}>🔥 Today's Drop</h3>
                <span className="drop-timer font-label-md">Limited Time</span>
              </div>
              <div className="drops-scroll scroll-hide">
                {drops.map(p => (
                  <div key={p.id} className="drop-card" onClick={() => onNavigate('detail', p)}>
                    <OptimizedImage src={p.image} alt={p.name} className="drop-card__img" preset="dropCard" />
                    <div className="drop-card__overlay" />
                    <div className="drop-card__content">
                      {p.badge && <span className="badge badge--gold" style={{ fontSize: '9px', marginBottom: '6px', display: 'inline-block' }}>{p.badge}</span>}
                      <h4 className="font-headline-lg-mobile" style={{ color: '#fff', fontSize: '19px', marginBottom: '4px', lineHeight: 1.2 }}>{p.name}</h4>
                      <span className="font-price-display" style={{ color: 'var(--color-tertiary-fixed)', fontSize: '20px' }}>${p.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {featured && (
            <section className="home-view__section home-view__section--hero">
              <div className="home-view__section-header">
                <h3 className="font-headline-md shimmer-text" style={{ color: 'var(--color-on-surface)' }}>Flavor of the Week</h3>
                <button className="see-all-btn ripple-btn" onClick={() => onNavigate('search')}>
                  See All <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                </button>
              </div>
              <div className="hero-card" onClick={() => onNavigate('detail', featured)} role="button" tabIndex={0}>
                <OptimizedImage className="hero-card__img" src={featured.image} alt={featured.name} preset="hero" priority />
                <div className="hero-card__gradient" />
                <div className="hero-card__content">
                  <div className="hero-card__info">
                    {featured.badge && <span className="badge badge--gold">{featured.badge}</span>}
                    <h4 className="font-headline-lg-mobile" style={{ color: '#fff', marginBottom: '4px', marginTop: '8px' }}>{featured.name}</h4>
                    <p className="font-body-md" style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '200px', fontSize: '14px' }}>{featured.subtitle}</p>
                  </div>
                  <div className="hero-card__actions">
                    <span className="font-price-display" style={{ color: 'var(--color-tertiary-fixed)' }}>${featured.price.toFixed(2)}</span>
                    <button
                      className="hero-add-btn ripple-btn"
                      onClick={e => { e.stopPropagation(); addToCart(featured); }}
                    >
                      <span className="material-symbols-outlined fill-1">shopping_bag</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Product Grid */}
      <section className="home-view__section">
        <h3 className="font-headline-md" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-md)' }}>Popular Picks</h3>
        <div className="product-grid stagger-children">
          {menuEmpty ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 24px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-primary-container)', opacity: 0.4 }}>
                {isPermissionError ? 'lock' : 'cloud_off'}
              </span>
              <p className="font-headline-md" style={{ color: 'var(--color-on-surface)', marginTop: '12px' }}>
                {isPermissionError ? 'Cannot load menu' : 'Menu is empty'}
              </p>
              <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '8px' }}>
                {isPermissionError
                  ? 'Publish Firestore rules in Firebase Console (see README), then refresh.'
                  : 'Run npm run seed to populate the database, then refresh.'}
              </p>
            </div>
          ) : filtered.length > 0 ? filtered.map(product => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => onNavigate('detail', product)}
              role="button"
              tabIndex={0}
            >
              <div className="product-card__img-wrap">
                <OptimizedImage className="product-card__img" src={product.image} alt={product.name} preset="productCard" />
                {product.isDrop && <span className="product-card__drop-badge">🔥</span>}
              </div>
              <div className="product-card__body">
                <h5 className="font-label-md product-card__name" style={{ color: 'var(--color-on-surface)' }}>{product.name}</h5>
                <div className="product-card__footer">
                  <span className="font-price-display" style={{ fontSize: '18px', color: 'var(--color-on-surface)' }}>${product.price.toFixed(2)}</span>
                  <button
                    className="product-card__add-btn ripple-btn"
                    onClick={e => { e.stopPropagation(); addToCart(product); }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-primary-container)', opacity: 0.4 }}>restaurant_menu</span>
              <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '12px' }}>No items in this category yet.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
