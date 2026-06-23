import type { Product, CustomerView } from '../context/StoreContext';
import { useStore } from '../context/StoreContext';
import OptimizedImage from '../components/OptimizedImage';

interface Props { product: Product; onNavigate: (view: CustomerView) => void; }

export default function ProductDetailView({ product, onNavigate }: Props) {
  const { addToCart } = useStore();
  const handleAdd = () => { addToCart(product); onNavigate('cart'); };

  return (
    <div className="detail-view app-view--detail fade-in-up">
      <div className="detail-view__hero">
        <div className="detail-view__category-row">
          <span className="badge badge--ghost">{product.category}</span>
          <h2 className="font-headline-lg-mobile" style={{ color: 'var(--color-on-surface)' }}>Signature {product.category}</h2>
        </div>
        <div className="detail-view__card">
          <div className="detail-view__floating-img"><OptimizedImage src={product.image} alt={product.name} preset="detail" /></div>
          <div className="detail-view__card-body">
            <div className="detail-view__card-header">
              <div>
                <h3 className="font-headline-md" style={{ color: 'var(--color-on-secondary)' }}>{product.name}</h3>
                <p className="font-body-md" style={{ color: 'var(--color-on-secondary-fixed-variant)', marginTop: '4px' }}>{product.subtitle}</p>
              </div>
              <span className="font-price-display" style={{ color: 'var(--color-primary-container)', flexShrink: 0 }}>${product.price.toFixed(2)}</span>
            </div>
            {product.rating && (
              <div className="detail-view__rating">
                <span className="material-symbols-outlined fill-1" style={{ color: 'var(--color-primary-container)', fontSize: '18px' }}>star</span>
                <span className="font-label-md" style={{ color: 'var(--color-on-secondary)' }}>{product.rating} ({product.reviews} reviews)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="detail-view__section">
        <h4 className="font-headline-md" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-sm)' }}>Specification</h4>
        <div className="spec-card">
          <SpecRow icon="restaurant" label="Portion Size" value={product.portion || '—'} />
          <SpecRow icon="local_fire_department" label="Calories" value={product.calories ? `${product.calories} kcal` : '—'} divider />
          <SpecRow icon="schedule" label="Preparation Time" value={product.prepTime || '—'} divider last />
        </div>
      </section>

      {product.chefNote && (
        <section className="detail-view__section">
          <h4 className="font-headline-md" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-sm)' }}>Chef's Note</h4>
          <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.75 }}>{product.chefNote}</p>
        </section>
      )}

      <div className="detail-view__cta-wrap">
        <button className="detail-view__cta-btn ripple-btn" onClick={handleAdd} id="add-to-cart-btn">
          <span className="material-symbols-outlined fill-1">shopping_bag</span>
          ADD TO CART — ${product.price.toFixed(2)}
        </button>
      </div>
    </div>
  );
}

function SpecRow({ icon, label, value, divider, last }: { icon: string; label: string; value: string; divider?: boolean; last?: boolean }) {
  return (
    <div className={`spec-row ${!last && divider ? 'spec-row--divider' : ''}`}>
      <div>
        <p className="font-label-md" style={{ color: 'var(--color-on-secondary-fixed-variant)', textTransform: 'uppercase' }}>{label}</p>
        <p className="font-body-lg" style={{ color: 'var(--color-on-secondary)' }}>{value}</p>
      </div>
      <span className="material-symbols-outlined" style={{ color: 'var(--color-primary-container)' }}>{icon}</span>
    </div>
  );
}
