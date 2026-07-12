import { useState, useCallback, lazy, Suspense } from 'react';
import './styles/global.css';
import './styles/components.css';
import './styles/responsive.css';
import { useAuth } from './context/AuthContext';
import { useStore } from './context/StoreContext';
import { AppProviders } from './context/AppProviders';
import type { CustomerView, ManagerView, Product } from './context/StoreContext';
import TopAppBar from './components/TopAppBar';
import BottomNav from './components/BottomNav';
import ConfettiCanvas from './components/ConfettiCanvas';
import AmbientOrbs from './components/AmbientOrbs';
import ToastContainer from './components/ToastContainer';
import HomeSkeleton from './components/HomeSkeleton';
import WhatsAppButton from './components/WhatsAppButton';

/* Customer Views — lazy loaded */
const HomeView = lazy(() => import('./views/HomeView'));
const ProductDetailView = lazy(() => import('./views/ProductDetailView'));
const CartView = lazy(() => import('./views/CartView'));
const PreOrderView = lazy(() => import('./views/PreOrderView'));
const OrderConfirmView = lazy(() => import('./views/OrderConfirmView'));
const OrderTrackingView = lazy(() => import('./views/OrderTrackingView'));
const OrderHistoryView = lazy(() => import('./views/OrderHistoryView'));
const SearchView = lazy(() => import('./views/SearchView'));
const LoginView = lazy(() => import('./views/auth/LoginView'));
const GuestProfileView = lazy(() => import('./views/profile/GuestProfileView'));
const CustomerProfileView = lazy(() => import('./views/profile/CustomerProfileView'));
const LoyaltyView = lazy(() => import('./views/LoyaltyView'));

/* Manager Views — separate lazy chunk group */
const DashboardView = lazy(() => import('./views/manager/DashboardView'));
const OrdersManageView = lazy(() => import('./views/manager/OrdersManageView'));
const MenuManageView = lazy(() => import('./views/manager/MenuManageView'));
const CustomersView = lazy(() => import('./views/manager/CustomersView'));
const MessagingView = lazy(() => import('./views/manager/MessagingView'));

const AUTH_REQUIRED: CustomerView[] = ['profile', 'preorder', 'history', 'tracking'];

function ViewSlide({ children, viewKey }: { children: React.ReactNode; viewKey: string }) {
  return (
    <div
      key={viewKey}
      style={{
        animation: 'fade-in-up 0.45s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {children}
    </div>
  );
}

function AppInner() {
  const { user, role, authLoading, signInAsGuest } = useAuth();
  const { isLoading, showConfetti } = useStore();
  const [customerView, setCustomerView] = useState<CustomerView>('home');
  const [managerView, setManagerView] = useState<ManagerView>('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<CustomerView[]>([]);
  const [loginReturnTo, setLoginReturnTo] = useState<CustomerView>('home');

  const navCustomer = useCallback((view: CustomerView, product?: Product) => {
    if (view === 'preorder' && !user) {
      // Auto-sign in as guest to prevent login wall friction
      signInAsGuest()
        .then(() => {
          setHistory(prev => [...prev, customerView]);
          if (product) setSelectedProduct(product);
          setCustomerView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch((err) => {
          console.error('Auto guest login failed:', err);
          setLoginReturnTo(view);
          setHistory(prev => [...prev, customerView]);
          setCustomerView('login');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      return;
    }
    if (AUTH_REQUIRED.includes(view) && !user) {
      setLoginReturnTo(view);
      setHistory(prev => [...prev, customerView]);
      setCustomerView('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setHistory(prev => [...prev, customerView]);
    if (product) setSelectedProduct(product);
    setCustomerView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [user, customerView, signInAsGuest]);

  const goBack = () => {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory(h => h.slice(0, -1));
      setCustomerView(prev);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const managerViewLabels: Record<ManagerView, string> = {
    dashboard: 'Dashboard',
    orders: 'Orders',
    menu: 'Menu',
    customers: 'Customers',
    messaging: 'Messaging',
    settings: 'Settings',
  };

  const homeLoading = authLoading || (customerView === 'home' && isLoading);

  if (role === 'admin') {
    return (
      <>
        {showConfetti && <ConfettiCanvas />}
        <AmbientOrbs />
        <ToastContainer />
        <div className="manager-shell">
          <div className="manager-header">
            <div className="manager-header__brand">
              <div className="manager-header__title-row">
                <img src="/kwagavo/logo.jpg" alt="Kwa Gavo" className="manager-header__logo" style={{ borderRadius: '50%' }} />
                <span className="manager-header__badge">ADMIN</span>
              </div>
              <p className="manager-header__subtitle font-label-md">{managerViewLabels[managerView]}</p>
            </div>
            <div className="manager-header__live">
              <span className="live-dot" />
              <span className="manager-header__live-text">LIVE</span>
            </div>
          </div>
          <nav className="manager-tabs scroll-hide">
            {(['dashboard', 'orders', 'menu', 'customers', 'messaging'] as ManagerView[]).map(v => (
              <button
                key={v}
                className={`manager-tab ripple-btn ${managerView === v ? 'manager-tab--active' : ''}`}
                onClick={() => setManagerView(v)}
                aria-label={managerViewLabels[v]}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {v === 'dashboard' ? 'bar_chart' : v === 'orders' ? 'receipt_long' : v === 'menu' ? 'restaurant_menu' : v === 'customers' ? 'group' : 'chat'}
                </span>
                <span className="manager-tab__label">{managerViewLabels[v]}</span>
              </button>
            ))}
          </nav>
          <main className="manager-content">
            <Suspense fallback={<HomeSkeleton />}>
              <ViewSlide viewKey={managerView}>
                {managerView === 'dashboard' && <DashboardView />}
                {managerView === 'orders' && <OrdersManageView />}
                {managerView === 'menu' && <MenuManageView />}
                {managerView === 'customers' && <CustomersView />}
                {managerView === 'messaging' && (
                  <MessagingView onExit={() => setManagerView('dashboard')} />
                )}
              </ViewSlide>
            </Suspense>
          </main>
        </div>
      </>
    );
  }

  const hideBottomNav = ['detail', 'preorder', 'confirm', 'tracking', 'login'].includes(customerView);
  const showShell = !authLoading && customerView !== 'login';

  return (
    <>
      {showConfetti && <ConfettiCanvas />}
      <AmbientOrbs />
      <ToastContainer />
      {showShell && (
        <TopAppBar onNavigate={navCustomer} showBack={customerView !== 'home'} onBack={goBack} />
      )}
      <Suspense fallback={<HomeSkeleton />}>
        <ViewSlide viewKey={customerView}>
          {homeLoading && customerView === 'home' && <HomeSkeleton />}
          {!homeLoading && customerView === 'home' && <HomeView onNavigate={navCustomer} />}
          {customerView === 'detail' && selectedProduct && <ProductDetailView product={selectedProduct} onNavigate={navCustomer} />}
          {customerView === 'cart' && <CartView onNavigate={navCustomer} />}
          {customerView === 'preorder' && <PreOrderView onNavigate={navCustomer} />}
          {customerView === 'confirm' && <OrderConfirmView onNavigate={navCustomer} />}
          {customerView === 'tracking' && <OrderTrackingView onNavigate={navCustomer} />}
          {customerView === 'history' && <OrderHistoryView onNavigate={navCustomer} />}
          {customerView === 'search' && <SearchView onNavigate={navCustomer} />}
          {customerView === 'login' && <LoginView onNavigate={navCustomer} returnTo={loginReturnTo} />}
          {customerView === 'loyalty' && <LoyaltyView />}
          {customerView === 'profile' && role === 'guest' && <GuestProfileView onNavigate={navCustomer} />}
          {customerView === 'profile' && role === 'customer' && <CustomerProfileView onNavigate={navCustomer} />}
          {customerView === 'profile' && !user && <LoginView onNavigate={navCustomer} returnTo="profile" />}
        </ViewSlide>
      </Suspense>
      {showShell && <WhatsAppButton />}
      {showShell && !hideBottomNav && <BottomNav currentView={customerView} onNavigate={navCustomer} />}
    </>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppInner />
    </AppProviders>
  );
}
