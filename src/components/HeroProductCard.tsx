import type { KeyboardEvent } from 'react';
import type { Product, CustomerView } from '../context/StoreContext';
import OptimizedImage from './OptimizedImage';

interface Props {
  product: Product;
  onNavigate: (view: CustomerView, product?: Product) => void;
  onAddToCart: (product: Product) => void;
  priority?: boolean;
}

export default function HeroProductCard({ product, onNavigate, onAddToCart, priority }: Props) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigate('detail', product);
    }
  };

  return (
    <div
      className="hero-card cinematic-shadow"
      onClick={() => onNavigate('detail', product)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <OptimizedImage
        className="hero-card__img"
        src={product.image}
        alt={product.name}
        preset="hero"
        priority={priority}
      />
      <div className="hero-card__vignette" />
      <div className="hero-card__panel glass-card">
        <div className="hero-card__info">
          {product.badge && <span className="badge badge--gold">{product.badge}</span>}
          <h4 className="hero-card__title font-headline-lg-mobile">{product.name}</h4>
          <p className="hero-card__subtitle font-body-md">{product.subtitle}</p>
        </div>
        <div className="hero-card__actions">
          <span className="hero-card__price font-price-display">${product.price.toFixed(2)}</span>
          <button
            className="hero-add-btn ripple-btn"
            aria-label={`Add ${product.name} to cart`}
            onClick={e => { e.stopPropagation(); onAddToCart(product); }}
          >
            <span className="material-symbols-outlined fill-1">shopping_bag</span>
          </button>
        </div>
      </div>
    </div>
  );
}
