import { useStore } from '../context/StoreContext';
import type { CustomerView } from '../context/StoreContext';

interface Props {
  onNavigate: (view: CustomerView) => void;
}

export default function OrderConfirmView({ onNavigate }: Props) {
  const { activeOrder } = useStore();

  const order = activeOrder || {
    code: 'KG-4821',
    type: 'pickup',
    scheduledTime: 'ASAP',
    total: 299,
    queuePosition: 2,
    estimatedMins: 12
  };

  // Generate a random-looking 12x12 QR grid representation
  const qrGrid = Array.from({ length: 12 }, (_, r) => 
    Array.from({ length: 12 }, (_, c) => {
      // Create classic QR position detection squares in the corners
      const isCornerSquare = 
        (r < 4 && c < 4) || // Top-left
        (r < 4 && c >= 8) || // Top-right
        (r >= 8 && c < 4);   // Bottom-left
      
      if (isCornerSquare) {
        // Inner borders for corner boxes
        const isBorder = r === 0 || r === 3 || c === 0 || c === 3 || 
                         r === 9 || r === 11 || c === 9 || c === 11 ||
                         (r < 4 && (c === 8 || c === 11)) || (r >= 8 && (c === 0 || c === 3));
        const isCenter = (r === 1 && c === 1) || (r === 2 && c === 2) || (r === 1 && c === 2) || (r === 2 && c === 1) ||
                         (r === 1 && c === 9) || (r === 2 && c === 10) || (r === 1 && c === 10) || (r === 2 && c === 9) ||
                         (r === 9 && c === 1) || (r === 10 && c === 2) || (r === 9 && c === 2) || (r === 10 && c === 1);
        return isBorder || isCenter;
      }
      
      // Random bits for body
      return Math.sin(r * c + 5) > 0;
    })
  );

  return (
    <main className="order-confirm-view app-view app-view--inset fade-in-up" style={{ textAlign: 'center' }}>
      
      {/* Success Animation Container */}
      <div style={{ marginTop: '24px', marginBottom: '24px' }}>
        <div style={{ 
          width: '72px', 
          height: '72px', 
          borderRadius: '50%', 
          background: 'rgba(76, 175, 80, 0.1)', 
          border: '2px solid #4caf50', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 16px auto'
        }}>
          <span className="material-symbols-outlined" style={{ color: '#4caf50', fontSize: '40px', fontWeight: 'bold' }}>check</span>
        </div>
        <h2 className="font-headline-lg-mobile" style={{ color: 'var(--color-on-surface)' }}>Order Confirmed! 🔥</h2>
        <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '6px' }}>Fresh, fast & fire — your order is locked in!</p>
      </div>

      {/* QR Code Card */}
      <div className="glass-panel" style={{ 
        padding: '24px', 
        borderRadius: 'var(--radius-card)', 
        border: '1px solid rgba(200, 150, 168, 0.15)',
        background: 'var(--color-surface-container-low)',
        boxShadow: 'var(--shadow-primary)',
        maxWidth: '320px',
        margin: '0 auto 32px auto'
      }}>
        <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Order Slip Code</span>
        <h1 className="font-headline-xl" style={{ color: 'var(--color-primary-fixed-dim)', fontSize: '32px', margin: '4px 0 16px 0', letterSpacing: '0.05em' }}>{order.code}</h1>

        {/* QR Code Render */}
        <div style={{ 
          background: '#fff', 
          padding: '16px', 
          borderRadius: 'var(--radius-xl)', 
          width: '180px', 
          height: '180px', 
          margin: '0 auto 16px auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1px', width: '100%', height: '100%' }}>
            {qrGrid.flatMap((row, rIdx) => 
              row.map((cell, cIdx) => (
                <div 
                  key={`${rIdx}-${cIdx}`} 
                  style={{ 
                    background: cell ? '#1c1b1a' : '#fff',
                    borderRadius: '1px'
                  }} 
                />
              ))
            )}
          </div>
        </div>

        <p className="font-label-md" style={{ color: 'var(--color-on-surface)', fontSize: '13px', lineHeight: '1.4' }}>
          {order.type === 'pickup' 
            ? 'Present this QR code at the counter to instantly scan and collect your food.' 
            : 'Your delivery rider will scan this code to confirm hand-off.'}
        </p>
      </div>

      {/* Info Rows */}
      <div className="glass-panel" style={{ 
        padding: '16px', 
        borderRadius: 'var(--radius-card)', 
        border: '1px solid rgba(200, 150, 168, 0.05)',
        maxWidth: '320px',
        margin: '0 auto 32px auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        textAlign: 'left'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)' }}>Service Mode</span>
          <span className="font-label-md" style={{ color: 'var(--color-tertiary)', fontWeight: 'bold', textTransform: 'capitalize' }}>{order.type}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)' }}>Scheduled For</span>
          <span className="font-label-md" style={{ color: 'var(--color-on-surface)', fontWeight: 'bold' }}>{order.scheduledTime || 'ASAP'}</span>
        </div>
        {order.type === 'pickup' && order.queuePosition !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)' }}>Queue Number</span>
            <span className="font-label-md" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>#{order.queuePosition} in line</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,177,196,0.1)', paddingTop: '8px' }}>
          <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)' }}>Paid Amount</span>
          <span className="font-price-display" style={{ color: 'var(--color-tertiary-fixed)', fontSize: '16px' }}>Ksh {order.total}</span>
        </div>
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '320px', margin: '0 auto' }}>
        <button 
          onClick={() => onNavigate('tracking')}
          className="cart-checkout-btn ripple-btn" 
          style={{ width: '100%', padding: '16px', background: 'var(--color-primary)' }}
        >
          <span className="font-label-md" style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>Track Order Live</span>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>route</span>
        </button>

        <button 
          onClick={() => onNavigate('home')}
          className="ripple-btn" 
          style={{ 
            width: '100%', 
            padding: '16px', 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid rgba(200, 150, 168, 0.1)', 
            color: 'var(--color-on-surface)',
            borderRadius: 'var(--radius-full)',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          Return to Menu
        </button>
      </div>
    </main>
  );
}

