import type { CustomerView } from '../context/StoreContext';

interface Props {
  currentView: CustomerView;
  onNavigate: (view: CustomerView) => void;
}

const tabs: { view: CustomerView; icon: string; label: string }[] = [
  { view: 'home',    icon: 'home',         label: 'Home'    },
  { view: 'search',  icon: 'search',       label: 'Search'  },
  { view: 'history', icon: 'receipt_long', label: 'Orders'  },
  { view: 'profile', icon: 'person',       label: 'Profile' },
];

export default function BottomNav({ currentView, onNavigate }: Props) {
  return (
    <nav className="bottom-nav glass-nav" role="navigation" aria-label="Main navigation">
      {tabs.map(({ view, icon, label }) => {
        const isActive = currentView === view || (view === 'profile' && currentView === 'login');

        return (
          <button
            key={view}
            id={`nav-${view}`}
            className={`bottom-nav__item ripple-btn ${isActive ? 'bottom-nav__item--active' : ''}`}
            onClick={() => onNavigate(view)}
            aria-label={label}
            style={{ flexDirection: 'column', gap: '3px', padding: '10px 12px' }}
          >
            <span className={`material-symbols-outlined ${isActive ? 'fill-1' : ''}`} style={{ fontSize: '22px' }}>
              {icon}
            </span>
            <span className="bottom-nav__label" style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              opacity: isActive ? 1 : 0.55,
              transition: 'opacity 0.2s ease',
              lineHeight: 1,
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
