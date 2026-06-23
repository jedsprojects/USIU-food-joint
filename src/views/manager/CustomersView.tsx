import { useStore } from '../../context/StoreContext';

export default function CustomersView() {
  const { customers } = useStore();

  return (
    <div className="fade-in-up" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 className="font-headline-md" style={{ color: '#fff' }}>Customer CRM</h2>
        <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>Track guest profiles, loyalty metrics, and lifetime value</p>
      </div>

      {/* Customer List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {customers.map(customer => (
          <div key={customer.id} className="glass-panel" style={{ 
            padding: '16px', 
            borderRadius: 'var(--radius-card)', 
            border: '1px solid rgba(255, 177, 196, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            {/* Avatar or Initials */}
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: 'var(--color-primary-container)', 
              color: 'var(--color-on-primary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              {customer.name.split(' ').map(n => n[0]).join('')}
            </div>

            {/* Profile Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h4 className="font-headline-md" style={{ fontSize: '16px', color: '#fff' }}>{customer.name}</h4>
                <span className="badge badge--gold" style={{ fontSize: '8px', padding: '2px 8px' }}>{customer.tier}</span>
              </div>
              <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '2px', fontSize: '12px' }}>
                {customer.phone} • {customer.email}
              </p>
              <p className="font-label-md" style={{ color: 'var(--color-tertiary-fixed)', marginTop: '4px', fontSize: '11px' }}>
                Last Visit: {customer.lastVisit}
              </p>
            </div>

            {/* Stats Summary */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span className="font-price-display" style={{ color: '#fff', fontSize: '18px', display: 'block' }}>${customer.totalSpent.toFixed(2)}</span>
              <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '11px' }}>
                {customer.orders} orders • {customer.loyaltyPoints} pts
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
