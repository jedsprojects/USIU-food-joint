import { useStore } from '../../context/StoreContext';

export default function DashboardView() {
  const { todayRevenue, todayOrders, avgPrepTime, orders, weeklyStats } = useStore();

  // Calculate order counts per status
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing' || o.status === 'approved').length;
  const readyCount = orders.filter(o => o.status === 'ready' || o.status === 'out_for_delivery').length;
  const completedCount = orders.filter(o => o.status === 'delivered').length;

  // Render SVG bar graph for weekly revenue
  const maxRevenue = Math.max(...weeklyStats.map(s => s.revenue), 1);
  const chartHeight = 100;
  
  return (
    <div className="dashboard-view fade-in-up" style={{ paddingBottom: '40px' }}>
      <div className="dashboard-view__header">
        <h2 className="font-headline-md" style={{ color: '#fff' }}>Business Overview</h2>
        <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>Real-time business performance analytics</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid rgba(255,177,196,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)' }}>Live Revenue</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary)', fontSize: '18px' }}>payments</span>
          </div>
          <h3 className="font-headline-lg-mobile" style={{ color: '#fff', fontSize: '24px' }}>Ksh {todayRevenue}</h3>
          <span className="font-label-md" style={{ color: '#4caf50', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>trending_up</span> +14.2% vs yesterday
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid rgba(255,177,196,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)' }}>Active Orders</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '18px' }}>receipt</span>
          </div>
          <h3 className="font-headline-lg-mobile" style={{ color: '#fff', fontSize: '24px' }}>{todayOrders}</h3>
          <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '11px', display: 'block', marginTop: '4px' }}>
            {pendingCount} pending • {preparingCount} preparing
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid rgba(255,177,196,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)' }}>Avg Prep Time</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary-fixed)', fontSize: '18px' }}>hourglass_empty</span>
          </div>
          <h3 className="font-headline-lg-mobile" style={{ color: '#fff', fontSize: '24px' }}>{avgPrepTime} mins</h3>
          <span className="font-label-md" style={{ color: '#4caf50', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>check_circle</span> −2.4m under limit
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid rgba(255,177,196,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)' }}>Rating</span>
            <span className="material-symbols-outlined fill-1" style={{ color: 'var(--color-tertiary)', fontSize: '18px' }}>star</span>
          </div>
          <h3 className="font-headline-lg-mobile" style={{ color: '#fff', fontSize: '24px' }}>4.85 / 5</h3>
          <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '11px', display: 'block', marginTop: '4px' }}>
            From 642 reviews this month
          </span>
        </div>
      </div>

      {/* Active Pipeline Statuses */}
      <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid rgba(255,177,196,0.1)', marginBottom: '24px' }}>
        <h3 className="font-headline-md" style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Status Pipeline</h3>
        <div className="pipeline-grid">
          <div className="pipeline-grid__cell">
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{pendingCount}</span>
            <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '10px', textTransform: 'uppercase', marginTop: '4px' }}>Pending</p>
          </div>
          <div className="pipeline-grid__cell">
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-tertiary-fixed)' }}>{preparingCount}</span>
            <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '10px', textTransform: 'uppercase', marginTop: '4px' }}>Kitchen</p>
          </div>
          <div className="pipeline-grid__cell">
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2196f3' }}>{readyCount}</span>
            <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '10px', textTransform: 'uppercase', marginTop: '4px' }}>Dispatch</p>
          </div>
          <div className="pipeline-grid__cell">
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>{completedCount}</span>
            <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '10px', textTransform: 'uppercase', marginTop: '4px' }}>Done</p>
          </div>
        </div>
      </div>

      {/* SVG Revenue Graph */}
      <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid rgba(255,177,196,0.1)', marginBottom: '24px' }}>
        <h3 className="font-headline-md" style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Weekly Sales Performance</h3>

        <div className="dashboard-chart">
          <div className="dashboard-chart__bars">
            {weeklyStats.map((stat, i) => {
              const height = (stat.revenue / maxRevenue) * chartHeight;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    width: '24px',
                    height: `${height}px`,
                    background: 'linear-gradient(180deg, var(--color-tertiary) 0%, var(--color-primary) 100%)',
                    borderRadius: '4px 4px 0 0',
                    boxShadow: '0 4px 10px rgba(255,177,196,0.15)',
                    position: 'relative'
                  }}>
                    <div style={{ position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', background: '#1c1b1a', color: 'var(--color-tertiary)', padding: '2px 4px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      Ksh {stat.revenue}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="dashboard-chart__labels">
            {weeklyStats.map((stat, i) => (
              <span key={i} className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', width: '24px', textAlign: 'center', fontSize: '11px', flex: 1 }}>
                {stat.date}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap / Busiest Hours */}
      <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid rgba(255,177,196,0.1)' }}>
        <h3 className="font-headline-md" style={{ color: '#fff', fontSize: '16px', marginBottom: '8px' }}>🔥 Busiest Hours Heatmap</h3>
        <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', marginBottom: '16px' }}>Peak rush typically is during lunchtime (12:00 PM – 1:30 PM).</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { hour: '11 AM – 12 PM', load: '30%', color: 'rgba(200, 150, 168, 0.2)' },
            { hour: '12 PM – 1 PM', load: '95%', color: 'var(--color-primary)' },
            { hour: '1 PM – 2 PM', load: '85%', color: 'var(--color-tertiary-fixed)' },
            { hour: '2 PM – 3 PM', load: '40%', color: 'rgba(200, 150, 168, 0.4)' },
          ].map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="font-label-md" style={{ color: 'var(--color-on-surface)', width: '90px', fontSize: '12px' }}>{h.hour}</span>
              <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: h.load, height: '100%', background: h.color, borderRadius: 'var(--radius-full)' }} />
              </div>
              <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', width: '32px', fontSize: '11px', textAlign: 'right' }}>{h.load}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

