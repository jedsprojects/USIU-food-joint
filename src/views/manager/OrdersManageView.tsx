import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { OrderStatus } from '../../context/StoreContext';

export default function OrdersManageView() {
  const { orders, updateOrderStatus } = useStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'completed'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'pending') return o.status === 'pending';
    if (filter === 'preparing') return o.status === 'preparing' || o.status === 'approved';
    if (filter === 'ready') return o.status === 'ready' || o.status === 'out_for_delivery';
    if (filter === 'completed') return o.status === 'delivered' || o.status === 'cancelled';
    return true;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'var(--color-primary)';
      case 'approved': return 'var(--color-tertiary)';
      case 'preparing': return 'var(--color-tertiary-fixed)';
      case 'ready': return '#4caf50';
      case 'out_for_delivery': return '#2196f3';
      case 'delivered': return 'var(--color-on-surface-variant)';
      case 'cancelled': return 'var(--color-error)';
      default: return '#fff';
    }
  };

  const getNextStatus = (status: OrderStatus): { label: string; status: OrderStatus } | null => {
    switch (status) {
      case 'pending': return { label: 'Approve Order', status: 'approved' };
      case 'approved': return { label: 'Start Preparing', status: 'preparing' };
      case 'preparing': return { label: 'Mark Ready', status: 'ready' };
      case 'ready': return { label: 'Out for Delivery / Complete', status: 'delivered' };
      case 'out_for_delivery': return { label: 'Mark Completed', status: 'delivered' };
      default: return null;
    }
  };

  const handleAction = (orderId: string, nextStatus: OrderStatus) => {
    updateOrderStatus(orderId, nextStatus);
  };

  return (
    <div className="fade-in-up" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 className="font-headline-md" style={{ color: '#fff' }}>Order Management</h2>
        <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>Process and track incoming guest orders</p>
      </div>

      {/* Pipeline Status Filter Tabs */}
      <div className="category-chips scroll-hide" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
        {(['all', 'pending', 'preparing', 'ready', 'completed'] as const).map(tab => (
          <button
            key={tab}
            className={`category-chip ${filter === tab ? 'category-chip--active' : ''}`}
            onClick={() => setFilter(tab)}
            style={{ padding: '8px 16px', fontSize: '12px', textTransform: 'capitalize' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="orders-grid">
        {filteredOrders.length > 0 ? filteredOrders.map(order => {
          const isSelected = selectedOrderId === order.id;
          const next = getNextStatus(order.status);
          
          return (
            <div 
              key={order.id} 
              className="glass-panel" 
              style={{ 
                borderRadius: 'var(--radius-card)', 
                border: isSelected ? '1px solid var(--color-primary)' : '1px solid rgba(200, 150, 168, 0.1)',
                padding: '16px',
                transition: 'all 0.3s ease',
                background: isSelected ? 'var(--color-surface-container-low)' : 'var(--color-surface-container-lowest)'
              }}
            >
              {/* Order Row Overview */}
              <div 
                onClick={() => setSelectedOrderId(isSelected ? null : order.id)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="font-headline-md" style={{ color: '#fff', fontSize: '16px' }}>#{order.code}</span>
                    <span className="badge" style={{ 
                      fontSize: '9px', 
                      background: 'rgba(255,255,255,0.02)', 
                      color: getStatusColor(order.status),
                      border: `1px solid ${getStatusColor(order.status)}`,
                      padding: '2px 8px'
                    }}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px', fontSize: '12px' }}>
                    {order.customer.name} • {order.type === 'pickup' ? `🚶 Pickup (${order.scheduledTime || 'ASAP'})` : '🛵 Delivery'}
                  </p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <span className="font-price-display" style={{ color: 'var(--color-tertiary-fixed)', fontSize: '16px', display: 'block' }}>Ksh {order.total}</span>
                    <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '10px' }}>{order.items.length} items</span>
                  </div>
                  <span className="material-symbols-outlined" style={{ 
                    color: 'var(--color-on-surface-variant)', 
                    transform: isSelected ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s' 
                  }}>
                    expand_more
                  </span>
                </div>
              </div>

              {/* Order Expanded Details */}
              {isSelected && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(200, 150, 168, 0.1)' }}>
                  {/* Items List */}
                  <div style={{ marginBottom: '16px' }}>
                    <p className="font-label-md" style={{ color: 'var(--color-primary-fixed-dim)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Items Summary</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '4px 0' }}>
                        <span style={{ color: '#fff' }}>
                          <span style={{ color: 'var(--color-tertiary)', fontWeight: 'bold', marginRight: '6px' }}>{item.quantity}x</span>
                          {item.product.name}
                        </span>
                        <span style={{ color: 'var(--color-on-surface-variant)' }}>Ksh {item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Customer / Location Info */}
                  <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
                    <p className="font-label-md" style={{ color: 'var(--color-primary-fixed-dim)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px' }}>Customer / Destination</p>
                    <p style={{ color: '#fff' }}>{order.customer.name} ({order.customer.phone})</p>
                    {order.customer.address && <p style={{ marginTop: '2px' }}>📍 {order.customer.address}</p>}
                  </div>

                  {/* Payment Info */}
                  {order.mpesaScreenshot && (
                    <div style={{ marginBottom: '16px' }}>
                      <p className="font-label-md" style={{ color: 'var(--color-primary-fixed-dim)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>M-Pesa Verification</p>
                      <a href={order.mpesaScreenshot} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
                        <img 
                          src={order.mpesaScreenshot} 
                          alt="M-Pesa Screenshot" 
                          style={{ 
                            width: '120px', 
                            height: 'auto', 
                            borderRadius: 'var(--radius-md)', 
                            border: '1px solid var(--color-tertiary-fixed)',
                            cursor: 'zoom-in',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                          }} 
                        />
                      </a>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,177,196,0.05)', paddingTop: '12px' }}>
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <button 
                        onClick={() => handleAction(order.id, 'cancelled')}
                        className="ripple-btn"
                        style={{ 
                          padding: '8px 16px', 
                          borderRadius: 'var(--radius-full)', 
                          background: 'rgba(244, 67, 54, 0.1)', 
                          color: '#f44336',
                          border: '1px solid rgba(244, 67, 54, 0.2)',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    
                    {next && (
                      <button 
                        onClick={() => handleAction(order.id, next.status)}
                        className="ripple-btn"
                        style={{ 
                          padding: '8px 20px', 
                          borderRadius: 'var(--radius-full)', 
                          background: 'var(--color-tertiary-fixed)', 
                          color: 'var(--color-on-tertiary-fixed)',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        {next.label}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        }) : (
          <div style={{ textAlign: 'center', padding: '48px 16px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-card)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-on-surface-variant)', opacity: 0.4 }}>assignment</span>
            <p className="font-headline-md" style={{ color: 'var(--color-on-surface)', marginTop: '16px' }}>No orders in this phase</p>
            <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '8px' }}>Pipeline is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}

