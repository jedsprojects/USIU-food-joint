import { useStore } from '../context/StoreContext';
import type { CustomerView, Order } from '../context/StoreContext';
import { addToast } from '../utils/toast';

interface Props {
  onNavigate: (view: CustomerView) => void;
}

export default function OrderHistoryView({ onNavigate }: Props) {
  const { orders, addToCart } = useStore();

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart(item.product);
      }
    });
    addToast('Order added to cart 🛒', 'success', 'shopping_bag');
    onNavigate('cart');
  };

  const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
    pending:          { color: 'var(--color-primary)',           bg: 'rgba(255,177,196,0.08)', label: 'Pending'          },
    approved:         { color: 'var(--color-tertiary)',          bg: 'rgba(233,195,73,0.1)',   label: 'Confirmed'        },
    preparing:        { color: 'var(--color-tertiary-fixed)',    bg: 'rgba(233,195,73,0.1)',   label: 'In Kitchen'       },
    ready:            { color: '#4caf50',                       bg: 'rgba(76,175,80,0.1)',    label: 'Ready! 🎉'         },
    out_for_delivery: { color: '#2196f3',                       bg: 'rgba(33,150,243,0.1)',   label: 'On the way 🛵'    },
    delivered:        { color: 'rgba(255,255,255,0.3)',          bg: 'rgba(255,255,255,0.03)', label: 'Delivered ✓'      },
    cancelled:        { color: 'var(--color-error)',             bg: 'rgba(255,80,80,0.08)',   label: 'Cancelled'        },
  };

  const isActive = (status: string) =>
    ['pending','approved','preparing','ready','out_for_delivery'].includes(status);

  return (
    <main className="order-history-view app-view app-view--inset fade-in-up">
      <div style={{ marginBottom: '24px' }}>
        <p className="font-label-md" style={{ color: 'var(--color-primary-fixed-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px', opacity: 0.7 }}>Order history ✦</p>
        <h1 className="font-headline-lg-mobile" style={{ color: 'var(--color-on-surface)' }}>My Orders</h1>
        <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>Track your cravings and order history</p>
      </div>

      {orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="stagger-children">
          {orders.map(order => {
            const meta = STATUS_META[order.status] ?? STATUS_META['pending'];
            const active = isActive(order.status);
            return (
              <div
                key={order.id}
                style={{
                  borderRadius: '24px',
                  padding: '16px',
                  border: `1px solid ${active ? 'rgba(255,177,196,0.2)' : 'rgba(255,177,196,0.07)'}`,
                  background: 'rgba(30,14,20,0.75)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: active ? '0 4px 20px rgba(107,13,51,0.25)' : 'none',
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ color: 'var(--color-on-surface-variant)', display: 'block', fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                      {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ color: 'var(--color-primary-fixed-dim)', fontSize: '20px', fontFamily: 'var(--font-serif)', fontWeight: 600, marginTop: '2px', display: 'block' }}>#{order.code}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: meta.bg, color: meta.color,
                      border: `1px solid ${meta.color}40`,
                      fontSize: '11px', fontWeight: 700, padding: '4px 10px',
                      borderRadius: '100px', letterSpacing: '0.04em', fontFamily: 'var(--font-sans)',
                    }}>
                      {active && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.color, animation: 'pulse-glow 1.5s infinite', display: 'inline-block', flexShrink: 0 }} />}
                      {meta.label}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-sans)' }}>
                      {order.type === 'pickup' ? '🏪 Pickup' : '🛵 Delivery'}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ borderTop: '1px solid rgba(255,177,196,0.06)', borderBottom: '1px solid rgba(255,177,196,0.06)', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: 'linear-gradient(135deg, var(--color-tertiary) 0%, #ffc843 100%)',
                          color: '#1a0a05', fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 800,
                          width: '22px', height: '22px', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>{item.quantity}×</span>
                        <span style={{ color: 'var(--color-on-surface)', fontSize: '14px', fontFamily: 'var(--font-sans)' }}>{item.product.name}</span>
                      </div>
                      <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                        Ksh {item.product.price * item.quantity}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '12px', fontFamily: 'var(--font-sans)', opacity: 0.6 }}>+{order.items.length - 3} more items</span>
                  )}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '10px', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>Total</span>
                    <span style={{ color: '#fff', fontSize: '20px', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>Ksh {order.total}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {active && (
                      <button onClick={() => onNavigate('tracking')} className="ripple-btn" style={{
                        padding: '9px 16px', borderRadius: '100px',
                        background: 'var(--color-primary-container)',
                        color: 'var(--color-on-primary-container)',
                        border: '1px solid rgba(255,177,196,0.2)',
                        fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-sans)',
                        display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '0.04em',
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4caf50', animation: 'pulse-glow 1.5s infinite', display: 'inline-block' }} />
                        Track
                      </button>
                    )}
                    <button onClick={() => handleReorder(order)} className="ripple-btn" style={{
                      padding: '9px 18px', borderRadius: '100px',
                      background: 'linear-gradient(135deg, var(--color-tertiary-fixed) 0%, #ffd452 100%)',
                      color: 'var(--color-on-tertiary-fixed)', border: 'none',
                      fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-sans)',
                      letterSpacing: '0.06em', boxShadow: '0 4px 12px rgba(233,195,73,0.25)',
                    }}>
                      Reorder
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '56px 24px', background: 'rgba(28,14,20,0.6)', borderRadius: '28px', border: '1px solid rgba(255,177,196,0.08)' }}>
          <span className="material-symbols-outlined float-anim" style={{ fontSize: '52px', color: 'var(--color-primary)', opacity: 0.5 }}>receipt_long</span>
          <h2 className="font-headline-md" style={{ color: 'var(--color-on-surface)', marginTop: '20px' }}>No orders yet</h2>
          <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '8px', lineHeight: 1.6 }}>Your delicious history is<br />waiting to be written.</p>
          <button className="cart-browse-btn ripple-btn" onClick={() => onNavigate('home')} style={{ marginTop: '20px' }}>Order Now</button>
        </div>
      )}
    </main>
  );
}
