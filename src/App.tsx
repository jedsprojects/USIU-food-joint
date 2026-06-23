import { useState, useCallback } from 'react';
import './styles/global.css';
import './styles/responsive.css';
import './styles/components.css';
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

/* Customer Views */
import HomeView from './views/HomeView';
import ProductDetailView from './views/ProductDetailView';
import CartView from './views/CartView';
import PreOrderView from './views/PreOrderView';
import OrderConfirmView from './views/OrderConfirmView';
import OrderTrackingView from './views/OrderTrackingView';
import OrderHistoryView from './views/OrderHistoryView';
import SearchView from './views/SearchView';
import LoginView from './views/auth/LoginView';
import GuestProfileView from './views/profile/GuestProfileView';
import CustomerProfileView from './views/profile/CustomerProfileView';

/* Manager Views */
import DashboardView from './views/manager/DashboardView';
import OrdersManageView from './views/manager/OrdersManageView';
import MenuManageView from './views/manager/MenuManageView';
import CustomersView from './views/manager/CustomersView';
import MessagingView from './views/manager/MessagingView';

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
  const { user, role, authLoading } = useAuth();
  const { isLoading, showConfetti } = useStore();
  const [customerView, setCustomerView] = useState<CustomerView>('home');
  const [managerView, setManagerView] = useState<ManagerView>('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<CustomerView[]>([]);
  const [loginReturnTo, setLoginReturnTo] = useState<CustomerView>('home');

  const navCustomer = useCallback((view: CustomerView, product?: Product) => {
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
  }, [user, customerView]);

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

  if (authLoading) {
    return (
      <>
        <AmbientOrbs />
        <ToastContainer />
        <HomeSkeleton />
      </>
    );
  }

  if (role === 'admin') {
    return (
      <>
        {showConfetti && <ConfettiCanvas />}
        <AmbientOrbs />
        <ToastContainer />
        <div className="manager-shell">
          <div className="manager-header">
            <div className="manager-header__brand">
              <h1 className="manager-header__title font-headline-lg-mobile">
                Velvet Crumbs{' '}
                <span className="manager-header__badge">ADMIN</span>
              </h1>
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
            <ViewSlide viewKey={managerView}>
              {managerView === 'dashboard' && <DashboardView />}
              {managerView === 'orders' && <OrdersManageView />}
              {managerView === 'menu' && <MenuManageView />}
              {managerView === 'customers' && <CustomersView />}
              {managerView === 'messaging' && (
                <MessagingView onExit={() => setManagerView('dashboard')} />
              )}
            </ViewSlide>
          </main>
        </div>
      </>
    );
  }

  const hideBottomNav = ['detail', 'preorder', 'confirm', 'tracking', 'login'].includes(customerView);

  return (
    <>
      {showConfetti && <ConfettiCanvas />}
      <AmbientOrbs />
      <ToastContainer />
      {customerView !== 'login' && (
        <TopAppBar onNavigate={navCustomer} showBack={customerView !== 'home'} onBack={goBack} />
      )}
      <ViewSlide viewKey={customerView}>
        {customerView === 'home' && (isLoading ? <HomeSkeleton /> : <HomeView onNavigate={navCustomer} />)}
        {customerView === 'detail' && selectedProduct && <ProductDetailView product={selectedProduct} onNavigate={navCustomer} />}
        {customerView === 'cart' && <CartView onNavigate={navCustomer} />}
        {customerView === 'preorder' && <PreOrderView onNavigate={navCustomer} />}
        {customerView === 'confirm' && <OrderConfirmView onNavigate={navCustomer} />}
        {customerView === 'tracking' && <OrderTrackingView onNavigate={navCustomer} />}
        {customerView === 'history' && <OrderHistoryView onNavigate={navCustomer} />}
        {customerView === 'search' && <SearchView onNavigate={navCustomer} />}
        {customerView === 'login' && <LoginView onNavigate={navCustomer} returnTo={loginReturnTo} />}
        {customerView === 'profile' && role === 'guest' && <GuestProfileView onNavigate={navCustomer} />}
        {customerView === 'profile' && role === 'customer' && <CustomerProfileView onNavigate={navCustomer} />}
        {customerView === 'profile' && !user && <LoginView onNavigate={navCustomer} returnTo="profile" />}
      </ViewSlide>
      {!hideBottomNav && <BottomNav currentView={customerView} onNavigate={navCustomer} />}
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
