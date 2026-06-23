import { useState } from 'react';
import type { CustomerView, Product } from '../context/StoreContext';
import { useStore } from '../context/StoreContext';
import { addToast } from '../utils/toast';
import OptimizedImage from '../components/OptimizedImage';

interface Props { onNavigate: (view: CustomerView, product?: Product) => void; }

export default function CartView({ onNavigate }: Props) {
  const { cart, updateQty, removeFromCart, cartTotal, promoCode, promoDiscount, applyPromo, removePromo, products } = useStore();
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const deliveryFee = 14.00;
  const grandTotal = cartTotal + deliveryFee - promoDiscount;

  // Upsell: items not in cart
  const upsells = products.filter(p => p.available && !cart.some(c => c.product.id === p.id)).slice(0, 3);

  if (cart.length === 0) {
    return (
      <main className="cart-view cart-view--empty app-view fade-in-up">
        <div className="cart-empty">
          <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--color-primary-container)', opacity: 0.5 }}>shopping_bag</span>
          <h2 className="font-headline-md" style={{ color: 'var(--color-on-surface)', marginTop: '24px' }}>Your cart is empty</h2>
          <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '8px' }}>Add some gourmet indulgences to get started.</p>
          <button className="cart-browse-btn ripple-btn" onClick={() => onNavigate('home')}>Browse Menu</button>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-view app-view fade-in-up">
      <div className="cart-header">
        <h1 className="font-headline-lg-mobile" style={{ color: 'var(--color-on-surface)' }}>Your Indulgence</h1>
        <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>Review your curated selection</p>
      </div>

      {/* Cart Items */}
      <div className="cart-items">
        {cart.map(({ product, quantity }) => (
          <div key={product.id} className="cart-item glass-panel">
            <div className="cart-item__img-wrap"><OptimizedImage src={product.image} alt={product.name} className="cart-item__img" preset="cart" /></div>
            <div className="cart-item__info">
              <h3 className="font-headline-md cart-item__name" style={{ color: 'var(--color-primary-fixed)' }}>{product.name}</h3>
              <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)' }}>{product.category}</p>
            </div>
            <div className="cart-item__controls">
              <span className="font-price-display" style={{ color: 'var(--color-tertiary-fixed)' }}>${(product.price * quantity).toFixed(2)}</span>
              <div className="qty-stepper">
                <button className="qty-btn ripple-btn" onClick={() => quantity === 1 ? removeFromCart(product.id) : updateQty(product.id, -1)}>
                  {quantity === 1 ? <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span> : '−'}
                </button>
                <span className="font-label-md qty-count">{String(quantity).padStart(2, '0')}</span>
                <button className="qty-btn ripple-btn" onClick={() => updateQty(product.id, 1)}>+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code */}
      <div className="promo-section">
        {promoCode ? (
          <div className="promo-applied">
            <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary)', fontSize: '20px' }}>local_offer</span>
            <span className="font-label-md" style={{ color: 'var(--color-tertiary)' }}>{promoCode} applied (−${promoDiscount.toFixed(2)})</span>
            <button onClick={removePromo} style={{ color: 'var(--color-error)', marginLeft: 'auto' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>
        ) : (
          <div className="promo-input-row">
            <input className="promo-input font-body-md" placeholder="Promo code" value={promoInput} onChange={e => setPromoInput(e.target.value)} />
            <button className="promo-apply-btn font-label-md ripple-btn" onClick={() => {
              const err = applyPromo(promoInput);
              if (err) {
                setPromoError(err);
                addToast(err, 'error', 'error');
              } else {
                setPromoError('');
                setPromoInput('');
                addToast('Promo code applied! 🎉', 'success', 'local_offer');
              }
            }}>Apply</button>
          </div>
        )}
        {promoError && <p className="font-label-md" style={{ color: 'var(--color-error)', marginTop: '4px', fontSize: '12px' }}>{promoError}</p>}
      </div>

      {/* Upsell */}
      {upsells.length > 0 && (
        <div className="upsell-section">
          <h4 className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>You might also like</h4>
          <div className="upsell-scroll scroll-hide">
            {upsells.map(p => (
              <div key={p.id} className="upsell-card" onClick={() => onNavigate('detail', p)}>
                <OptimizedImage src={p.image} alt={p.name} className="upsell-card__img" preset="cart" />
                <span className="font-label-md" style={{ color: 'var(--color-on-surface)', fontSize: '12px' }}>{p.name}</span>
                <span className="font-label-md" style={{ color: 'var(--color-tertiary-fixed)', fontSize: '12px' }}>${p.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Panel */}
      <div className="cart-summary">
        <div className="cart-summary__row cart-summary__row--border">
          <span className="font-label-md" style={{ color: 'var(--color-on-primary-container)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Subtotal</span>
          <span className="font-price-display" style={{ color: 'var(--color-on-surface)' }}>${cartTotal.toFixed(2)}</span>
        </div>
        {promoDiscount > 0 && (
          <div className="cart-summary__row cart-summary__row--border">
            <span className="font-label-md" style={{ color: 'var(--color-tertiary)', textTransform: 'uppercase' }}>Promo ({promoCode})</span>
            <span className="font-price-display" style={{ color: 'var(--color-tertiary)' }}>−${promoDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="cart-summary__row cart-summary__row--border">
          <div>
            <span className="font-label-md" style={{ color: 'var(--color-on-primary-container)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>Delivery Charge</span>
            <span style={{ fontSize: '10px', color: 'var(--color-primary-fixed)', opacity: 0.6 }}>Express Gourmet Handling</span>
          </div>
          <span className="font-price-display" style={{ color: 'var(--color-on-surface)' }}>${deliveryFee.toFixed(2)}</span>
        </div>
        <div className="cart-summary__total">
          <div>
            <p className="font-label-md" style={{ color: 'var(--color-primary-fixed)', textTransform: 'uppercase' }}>Total Amount</p>
            <h2 className="font-headline-xl" style={{ color: 'var(--color-on-surface)' }}>USD {grandTotal.toFixed(2)}</h2>
          </div>
        </div>
        <button className="cart-checkout-btn ripple-btn" onClick={() => onNavigate('preorder')}>
          <span className="font-label-md" style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>Continue</span>
          <div className="cart-checkout-arrows">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
          </div>
        </button>
      </div>
    </main>
  );
}
