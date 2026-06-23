import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { CustomerView } from '../context/StoreContext';

interface Props {
  onNavigate: (view: CustomerView) => void;
}

export default function OrderTrackingView({ onNavigate }: Props) {
  const { activeOrder, orders, sendMessage, messages } = useStore();
  const [showChat, setShowChat] = useState(false);
  const [chatText, setChatText] = useState('');

  const order = activeOrder || orders[0] || null;

  if (!order) {
    return (
      <main className="order-tracking-view app-view app-view--inset fade-in-up">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50dvh',
          gap: '16px',
          textAlign: 'center',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-on-surface-variant)' }}>
            receipt_long
          </span>
          <h2 className="font-headline-md" style={{ color: 'var(--color-on-surface)' }}>No active order</h2>
          <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
            Place an order to track its status here.
          </p>
          <button
            className="btn btn--primary ripple-btn"
            onClick={() => onNavigate('home')}
            style={{ marginTop: '8px' }}
          >
            Browse Menu
          </button>
        </div>
      </main>
    );
  }

  const statuses = ['pending', 'approved', 'preparing', 'ready', 'delivered'];
  const statusLabels = {
    pending: 'Order Placed',
    approved: 'Confirmed',
    preparing: 'Preparing',
    ready: order.type === 'pickup' ? 'Ready to Collect' : 'Out for Delivery',
    delivered: 'Enjoyed'
  };

  const getStatusIndex = (status: string) => {
    if (status === 'out_for_delivery') return 3;
    const idx = statuses.indexOf(status);
    return idx === -1 ? 2 : idx;
  };

  const currentIndex = getStatusIndex(order.status);

  const customerId = 'c1';
  const thread = messages.find(m => m.customerId === customerId);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    sendMessage(customerId, chatText, 'customer');
    setChatText('');
  };

  return (
    <main className="order-tracking-view app-view app-view--inset fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="font-headline-lg-mobile" style={{ color: 'var(--color-on-surface)' }}>Track Order</h1>
          <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>Real-time updates for #{order.code}</p>
        </div>
        <button 
          onClick={() => setShowChat(!showChat)}
          className="ripple-btn"
          style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '50%', 
            background: 'var(--color-primary-container)', 
            color: 'var(--color-on-primary-container)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span className="material-symbols-outlined">chat</span>
        </button>
      </div>

      {/* Chat Drawer / Overlay */}
      {showChat && (
        <div className="glass-panel" style={{ 
          position: 'fixed', 
          bottom: '100px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '90%', 
          maxWidth: '400px', 
          maxHeight: '360px', 
          zIndex: 100, 
          borderRadius: 'var(--radius-card)', 
          border: '1px solid var(--color-primary)', 
          background: 'var(--color-surface)',
          boxShadow: 'var(--shadow-nav)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Chat Header */}
          <div style={{ background: 'var(--color-primary-container)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-label-md" style={{ color: 'var(--color-on-primary-container)', fontWeight: 'bold' }}>Chat with kitchen / courier</span>
            <button onClick={() => setShowChat(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-on-primary-container)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>
          {/* Chat Messages */}
          <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {thread ? thread.messages.map((m, i) => (
              <div key={i} style={{ 
                alignSelf: m.sender === 'customer' ? 'flex-end' : 'flex-start',
                background: m.sender === 'customer' ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
                color: m.sender === 'customer' ? '#fff' : 'var(--color-on-surface)',
                padding: '8px 12px',
                borderRadius: '16px',
                maxWidth: '75%',
                fontSize: '13px'
              }}>
                <p>{m.text}</p>
                <span style={{ fontSize: '9px', opacity: 0.6, float: 'right', marginTop: '4px', marginLeft: '6px' }}>{m.time}</span>
              </div>
            )) : (
              <p style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)', fontSize: '12px', marginTop: '20px' }}>No messages yet. Ask anything about your order!</p>
            )}
          </div>
          {/* Chat Input */}
          <form onSubmit={handleSendChat} style={{ display: 'flex', padding: '8px', borderTop: '1px solid rgba(255,177,196,0.1)' }}>
            <input 
              type="text" 
              placeholder="Ask for extra sauce, delivery details..." 
              value={chatText}
              onChange={e => setChatText(e.target.value)}
              style={{ flex: 1, background: 'var(--color-surface-container)', border: 'none', padding: '8px 12px', borderRadius: 'var(--radius-xl)', color: '#fff', fontSize: '13px', outline: 'none' }}
            />
            <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--color-tertiary)', marginLeft: '8px' }}>
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      )}

      {/* Main Status Panel */}
      <div className="glass-panel" style={{ 
        padding: '20px', 
        borderRadius: 'var(--radius-card)', 
        border: '1px solid rgba(255, 177, 196, 0.15)',
        background: 'linear-gradient(180deg, var(--color-surface-container-low) 0%, rgba(130, 33, 68, 0.1) 100%)',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        {order.type === 'pickup' ? (
          <div>
            <span className="badge badge--gold" style={{ marginBottom: '8px' }}>🚶 Pickup Slot</span>
            {order.status === 'ready' ? (
              <h2 className="font-headline-xl" style={{ color: '#4caf50', fontStyle: 'italic' }}>Your order is READY!</h2>
            ) : (
              <h2 className="font-headline-xl" style={{ color: '#fff', fontStyle: 'italic' }}>Ready in ~{order.estimatedMins} mins</h2>
            )}
            <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '8px' }}>
              {order.status === 'ready' 
                ? `Walk to the counter and show code #${order.code}`
                : `You are #${order.queuePosition} in queue. Refreshing live...`}
            </p>
          </div>
        ) : (
          <div>
            <span className="badge badge--gold" style={{ marginBottom: '8px' }}>🚴 Delivery Mode</span>
            {['ready', 'out_for_delivery'].includes(order.status) ? (
              <h2 className="font-headline-xl" style={{ color: 'var(--color-tertiary)', fontStyle: 'italic' }}>Rider Out For Delivery</h2>
            ) : order.status === 'delivered' ? (
              <h2 className="font-headline-xl" style={{ color: '#4caf50', fontStyle: 'italic' }}>Delivered & Enjoyed!</h2>
            ) : (
              <h2 className="font-headline-xl" style={{ color: '#fff', fontStyle: 'italic' }}>Arriving in ~{order.estimatedMins} mins</h2>
            )}
            <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '8px' }}>
              {order.status === 'delivered' 
                ? 'Thank you for dining with Velvet Crumbs.' 
                : 'Our gourmet rider is handling your order with care.'}
            </p>
          </div>
        )}
      </div>

      {/* Styled Route Map for Delivery */}
      {order.type === 'delivery' && (
        <div className="glass-panel" style={{ 
          height: '180px', 
          borderRadius: 'var(--radius-card)', 
          border: '1px solid rgba(255, 177, 196, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '24px',
          background: '#120d0f'
        }}>
          {/* SVG Map Illustration */}
          <svg style={{ width: '100%', height: '100%' }}>
            {/* Curved Path */}
            <path d="M 40 120 Q 150 40, 200 120 T 360 60" fill="transparent" stroke="rgba(255, 177, 196, 0.2)" strokeWidth="4" strokeDasharray="6, 6" />
            <path d="M 40 120 Q 150 40, 200 120 T 360 60" fill="transparent" stroke="var(--color-primary)" strokeWidth="4" strokeDasharray="300" strokeDashoffset={currentIndex > 3 ? '0' : currentIndex === 3 ? '120' : '240'} style={{ transition: 'stroke-dashoffset 2s ease-in-out' }} />
            
            {/* Kitchen Icon */}
            <circle cx="40" cy="120" r="16" fill="var(--color-surface-container-high)" stroke="var(--color-primary)" strokeWidth="2" />
            <text x="40" y="124" fontFamily="Material Symbols Outlined" fontSize="16" fill="var(--color-primary)" textAnchor="middle">restaurant</text>
            
            {/* Customer Home Icon */}
            <circle cx="350" cy="60" r="16" fill="var(--color-surface-container-high)" stroke="var(--color-tertiary)" strokeWidth="2" />
            <text x="350" y="64" fontFamily="Material Symbols Outlined" fontSize="16" fill="var(--color-tertiary)" textAnchor="middle">home</text>

            {/* Rider Moving Marker */}
            {currentIndex >= 2 && currentIndex < 4 && (
              <g style={{ 
                transform: currentIndex === 3 ? 'translate(200px, 120px)' : 'translate(100px, 80px)', 
                transition: 'transform 2s ease-in-out' 
              }}>
                <circle cx="0" cy="0" r="12" fill="var(--color-tertiary)" />
                <text x="0" y="4" fontFamily="Material Symbols Outlined" fontSize="12" fill="#fff" textAnchor="middle">delivery_dining</text>
              </g>
            )}
          </svg>
          <div style={{ position: 'absolute', bottom: '8px', left: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px' }}>
            <span className="font-label-md" style={{ fontSize: '10px', color: '#fff' }}>GPS Tracking Active</span>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="glass-panel" style={{ 
        padding: '24px 20px', 
        borderRadius: 'var(--radius-card)', 
        border: '1px solid rgba(255, 177, 196, 0.1)',
        background: 'var(--color-surface-container-low)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
          
          {/* Vertical connector line */}
          <div style={{ 
            position: 'absolute', 
            left: '15px', 
            top: '12px', 
            bottom: '12px', 
            width: '2px', 
            background: 'var(--color-surface-container-highest)', 
            zIndex: 1 
          }} />
          <div style={{ 
            position: 'absolute', 
            left: '15px', 
            top: '12px', 
            height: `${(currentIndex / 4) * 100}%`, 
            width: '2px', 
            background: 'var(--color-primary)', 
            zIndex: 2,
            transition: 'height 0.5s ease-in-out'
          }} />

          {/* Timeline Steps */}
          {statuses.map((status, index) => {
            const isDone = index < currentIndex;
            const isActive = index === currentIndex;
            
            return (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 10 }}>
                {/* Timeline circle */}
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: isActive 
                    ? 'var(--color-primary)' 
                    : isDone 
                      ? 'var(--color-primary-container)' 
                      : 'var(--color-surface-container-highest)',
                  border: isActive ? '3px solid rgba(255,177,196,0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <span className="material-symbols-outlined" style={{ 
                    fontSize: '16px', 
                    color: isActive ? '#fff' : isDone ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)' 
                  }}>
                    {status === 'pending' ? 'receipt' : 
                     status === 'approved' ? 'verified_user' : 
                     status === 'preparing' ? 'soup_kitchen' : 
                     status === 'ready' ? (order.type === 'pickup' ? 'store' : 'local_shipping') : 'restaurant'}
                  </span>
                </div>

                {/* Text labels */}
                <div>
                  <h4 className="font-headline-md" style={{ 
                    fontSize: '15px', 
                    color: isActive ? 'var(--color-primary-fixed-dim)' : isDone ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)'
                  }}>
                    {(statusLabels as Record<string, string>)[status]}
                  </h4>
                  {isActive && (
                    <p className="font-body-md" style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
                      {status === 'pending' && 'We are sending your order details to the kitchen.'}
                      {status === 'approved' && 'Kitchen approved! Chef is reviewing instructions.'}
                      {status === 'preparing' && 'Ingredients prepped. Cooking is in progress.'}
                      {status === 'ready' && (order.type === 'pickup' ? 'Counter verified. Grab your bag!' : 'Courier is flying to your location.')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
