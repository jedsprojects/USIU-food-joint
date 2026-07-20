import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useStore } from '../../context/StoreContext';
import type { Customer } from '../../context/types';

export default function CustomersView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { orders } = useStore();

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const snap = await getDocs(collection(db, 'users'));
        
        // Group orders by userId for aggregation
        const userStats: Record<string, { count: number; spent: number; lastDate: string }> = {};
        orders.forEach(o => {
          if (!o.userId || o.status === 'cancelled') return;
          const current = userStats[o.userId] || { count: 0, spent: 0, lastDate: '' };
          current.count += 1;
          current.spent += o.total;
          if (!current.lastDate || new Date(o.createdAt) > new Date(current.lastDate)) {
            current.lastDate = o.createdAt;
          }
          userStats[o.userId] = current;
        });

        const custData: Customer[] = snap.docs
          .map(d => {
            const data = d.data();
            const uid = d.id;
            
            // Skip admins
            if (data.role === 'admin') return null;

            const stats = userStats[uid] || { count: 0, spent: 0, lastDate: '' };
            
            // Format last visit date
            let lastVisitFormatted = 'No orders yet';
            if (stats.lastDate) {
              const dObj = new Date(stats.lastDate);
              lastVisitFormatted = dObj.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
            } else if (data.createdAt) {
              const dObj = new Date(data.createdAt);
              lastVisitFormatted = 'Registered ' + dObj.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
            }

            return {
              id: uid,
              name: data.displayName || data.guestDisplayName || (data.isAnonymous ? 'Guest Customer' : data.email?.split('@')[0] || 'Unknown User'),
              phone: data.phone || data.guestPhone || 'Not provided',
              email: data.email || (data.isAnonymous ? 'Guest Account' : 'No email'),
              avatar: data.avatarUrl || '',
              orders: stats.count,
              totalSpent: Math.round(stats.spent),
              lastVisit: lastVisitFormatted,
              loyaltyPoints: data.loyaltyPoints || 0,
              tier: data.tier || 'Gavo Regular'
            } as Customer;
          })
          .filter((c): c is Customer => c !== null);

        // Sort by total spent, then orders, then name
        custData.sort((a, b) => b.totalSpent - a.totalSpent || b.orders - a.orders || a.name.localeCompare(b.name));
        
        setCustomers(custData);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, [orders]);

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

