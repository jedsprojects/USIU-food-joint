import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { Product, CustomerView } from '../context/StoreContext';
import OptimizedImage from '../components/OptimizedImage';
import HeroProductCard from '../components/HeroProductCard';
import { usePreloadImage } from '../hooks/usePreloadImage';
import { IMAGE_PRESETS } from '../utils/imageUrl';
import { getTimeGreeting } from '../utils/greeting';

interface Props { onNavigate: (view: CustomerView, product?: Product) => void; }

const CATEGORIES = ['All', 'Burgers', 'Sides', 'Drinks', 'Desserts'];
const TIER_MAX_POINTS = 2500;

export default function HomeView({ onNavigate }: Props) {
  const [activeCategory, setActiveCategory] = useState('All');
  const { products, addToCart, loyaltyPoints, loyaltyTier, streakDays, isLoading, firestoreError } = useStore();

  const available = products.filter(p => p.available);
  const drops = available.filter(p => p.isDrop);
  const primaryDrop = drops[0];
  const featured = available.find(p => p.badge && !p.isDrop) || available[0];
  const filtered = activeCategory === 'All'
    ? available.filter(p => p.id !== featured?.id)
    : available.filter(p => p.category === activeCategory && p.id !== featured?.id);

  const menuEmpty = !isLoading && products.length === 0;
  const isPermissionError =
    firestoreError?.toLowerCase().includes('permission') ||
    firestoreError?.toLowerCase().includes('insufficient');

  const loyaltyProgress = Math.min(100, (loyaltyPoints / TIER_MAX_POINTS) * 100);

  usePreloadImage(
    featured?.image,
    IMAGE_PRESETS.hero.width,
    [...IMAGE_PRESETS.hero.srcSet],
  );
  usePreloadImage(
    primaryDrop?.image,
    IMAGE_PRESETS.hero.width,
    [...IMAGE_PRESETS.hero.srcSet],
  );

  return (
    <main className="home-view app-view fade-in-up">

      <section className="home-hero stagger-children" aria-label="Featured">

        {/* Loyalty Bar */}
        <div className="loyalty-bar" onClick={() => onNavigate('loyalty')} role="button" tabIndex={0}>
          <div className="loyalty-bar__row">
            <div className="loyalty-bar__left">
              <span className="material-symbols-outlined fill-1 loyalty-bar__icon">workspace_premium</span>
              <span className="loyalty-bar__tier font-label-md shimmer-text">{loyaltyTier}</span>
              <span className="loyalty-bar__divider">•</span>
              <span className="loyalty-bar__points font-label-md">{loyaltyPoints.toLocaleString()} pts</span>
            </div>
            <div className="loyalty-bar__right">
              <div className="streak-badge">
                <span className="material-symbols-outlined fill-1 streak-badge__icon">local_fire_department</span>
                {streakDays}-day streak
              </div>
              <span className="material-symbols-outlined loyalty-bar__chevron">chevron_right</span>
            </div>
          </div>
          <div className="loyalty-bar__progress" aria-hidden="true">
            <div className="loyalty-bar__progress-fill" style={{ width: `${loyaltyProgress}%` }} />
          </div>
        </div>

        {/* Greeting */}
        <section className="home-hero__greeting">
          <p className="home-hero__eyebrow">{getTimeGreeting()} ✦</p>
          <h2 className="home-hero__headline font-headline-lg">Gourmet Moments,</h2>
          <p className="home-hero__tagline font-body-lg">Served with indulgence.</p>
        </section>

        {/* Categories + featured promos */}
        <div className="home-hero__promos">
          <section className="home-hero__categories category-chips scroll-hide">
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

          {(primaryDrop || featured) && (
            <div className="home-featured-stack">
              {primaryDrop && (
                <section className="home-view__section home-view__section--drops">
                  <div className="home-hero__featured-header">
                    <h3 className="font-headline-md home-hero__featured-title">Today&apos;s Drop</h3>
                  </div>
                  <HeroProductCard
                    product={primaryDrop}
                    onNavigate={onNavigate}
                    onAddToCart={addToCart}
                  />
                </section>
              )}

              {featured && (
                <section className="home-view__section home-view__section--hero">
                  <div className="home-hero__featured-header">
                    <h3 className="font-headline-md shimmer-text home-hero__featured-title">Flavor of the Week</h3>
                    <button className="see-all-btn ripple-btn" onClick={() => onNavigate('search')}>
                      See All <span className="material-symbols-outlined see-all-btn__icon">arrow_forward</span>
                    </button>
                  </div>
                  <HeroProductCard
                    product={featured}
                    onNavigate={onNavigate}
                    onAddToCart={addToCart}
                    priority
                  />
                </section>
              )}
            </div>
          )}
        </div>
      </section>

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
