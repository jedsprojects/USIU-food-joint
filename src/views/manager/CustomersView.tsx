import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { Customer } from '../../context/types';

export default function CustomersView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const snap = await getDocs(collection(db, 'customers'));
        const custData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
        setCustomers(custData);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  return (
    <div className="fade-in-up" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 className="font-headline-md" style={{ color: '#fff' }}>Customer CRM</h2>
        <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>Track guest profiles, loyalty metrics, and lifetime value</p>
      </div>

      {/* Customer List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-block skeleton-block--card" style={{ height: '80px', borderRadius: 'var(--radius-card)' }} />
          ))
        ) : customers.length === 0 ? (
          <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', textAlign: 'center', padding: '40px' }}>No customers found.</p>
        ) : (
          customers.map(customer => (
            <div key={customer.id} className="glass-panel" style={{ 
              padding: '16px', 
              borderRadius: 'var(--radius-card)', 
              border: '1px solid rgba(200, 150, 168, 0.1)',
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
                <span className="font-price-display" style={{ color: '#fff', fontSize: '18px', display: 'block' }}>Ksh {customer.totalSpent}</span>
                <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '11px' }}>
                  {customer.orders} orders • {customer.loyaltyPoints} pts
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

