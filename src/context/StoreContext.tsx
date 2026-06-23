import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { db } from '../config/firebase';
import {
  collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc,
  query, where,
} from 'firebase/firestore';
import { addToast } from '../utils/toast';
import { useAuth, messageUserId } from './AuthContext';
import { stripUndefined, mapFirestoreError } from '../utils/firestore';
import type { AppMode, Product, CartItem, OrderStatus, OrderType, Order, Customer, Message, DailyStats, AppNotification } from './types';
export * from './types';
import type { SeedStatus } from '../utils/seedFirebase';

export interface PromoCode {
  discount: number;
  type: 'fixed' | 'percent';
  label: string;
}

const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'approved', 'preparing', 'ready', 'out_for_delivery'];
const TERMINAL_STATUSES: OrderStatus[] = ['delivered', 'cancelled'];

function genOrderCode() { return `VE-${Math.floor(1000 + Math.random() * 9000)}`; }

interface StoreContextValue {
  isLoading: boolean;
  seedStatus: SeedStatus;
  firestoreError: string | null;

  mode: AppMode;
  setMode: (m: AppMode) => void;

  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleAvailability: (id: string) => void;

  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQty: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  promoCode: string;
  promoDiscount: number;
  applyPromo: (code: string) => string | null;
  removePromo: () => void;

  orders: Order[];
  activeOrder: Order | null;
  placeOrder: (type: OrderType, scheduledTime?: string, mpesaScreenshot?: string, deliveryAddress?: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setActiveOrder: (o: Order | null) => void;
  visibleOrders: Order[];

  customers: Customer[];
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;

  messages: Message[];
  sendMessage: (userId: string, text: string, sender: 'staff' | 'customer', customerName?: string) => void;

  loyaltyPoints: number;
  loyaltyTier: string;
  streakDays: number;

  weeklyStats: DailyStats[];
  todayRevenue: number;
  todayOrders: number;
  avgPrepTime: number;

  showConfetti: boolean;
  triggerConfetti: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile, role, getOrderDisplayName, getOrderPhone } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [seedStatus, setSeedStatus] = useState<SeedStatus>('idle');
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const menuToastShown = useRef(false);
  const emptyMenuToastShown = useRef(false);
  const [mode, setMode] = useState<AppMode>('customer');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([]);
  const [promoCodes, setPromoCodes] = useState<Record<string, PromoCode>>({});
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const loyaltyPoints = userProfile?.loyaltyPoints ?? 0;
  const loyaltyTier = userProfile?.tier ?? 'Crumbler';
  const streakDays = userProfile?.streakDays ?? 0;

  const isAdmin = role === 'admin';
  const isGuest = role === 'guest';

  const visibleOrders = isGuest
    ? (activeOrder && !TERMINAL_STATUSES.includes(activeOrder.status) ? [activeOrder] : [])
    : orders.filter(o => !user || o.userId === user.uid || !o.userId);

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    const stopLoading = () => setIsLoading(false);

    const onError = (label: string) => (err: unknown) => {
      const message = mapFirestoreError(err);
      console.error(`Firestore ${label} listener error:`, err);
      setFirestoreError(message);
      stopLoading();
    };

    unsubs.push(
      onSnapshot(
        collection(db, 'products'),
        snapshot => {
          const prodData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
          setProducts(prodData);
          setSeedStatus('done');
          stopLoading();
        },
        onError('products'),
      ),
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'promoCodes'),
        snapshot => {
          const codes: Record<string, PromoCode> = {};
          snapshot.docs.forEach(d => {
            codes[d.id] = d.data() as PromoCode;
          });
          setPromoCodes(codes);
        },
        onError('promoCodes'),
      ),
    );

    const timeout = setTimeout(stopLoading, 8000);

    return () => {
      unsubs.forEach(unsub => unsub());
      clearTimeout(timeout);
    };
  }, []);

  // Admin-only listeners — deferred until admin role is confirmed
  useEffect(() => {
    if (!isAdmin) {
      setCustomers([]);
      setWeeklyStats([]);
      return;
    }

    const unsubs: (() => void)[] = [];
    const onError = (label: string) => (err: unknown) => {
      console.error(`Firestore ${label} listener error:`, err);
      setFirestoreError(mapFirestoreError(err));
    };

    unsubs.push(
      onSnapshot(
        collection(db, 'messages'),
        snapshot => {
          const msgData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message));
          setMessages(msgData);
        },
        onError('messages'),
      ),
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'customers'),
        snapshot => {
          const custData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
          setCustomers(custData);
        },
        onError('customers'),
      ),
    );

    unsubs.push(
      onSnapshot(
        doc(db, 'weeklyStats', 'current'),
        snapshot => {
          const days = snapshot.data()?.days as DailyStats[] | undefined;
          setWeeklyStats(days ?? []);
        },
        onError('weeklyStats'),
      ),
    );

    return () => unsubs.forEach(unsub => unsub());
  }, [isAdmin]);

  // Customer messages — deferred until authenticated non-admin user
  useEffect(() => {
    if (isAdmin) return;

    if (!user || isGuest) {
      setMessages([]);
      return;
    }

    const unsub = onSnapshot(
      collection(db, 'messages'),
      snapshot => {
        const msgData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message));
        setMessages(msgData);
      },
      err => {
        console.error('Firestore messages listener error:', err);
        setFirestoreError(mapFirestoreError(err));
      },
    );

    return unsub;
  }, [user, isAdmin, isGuest]);

  // User-scoped orders listener
  useEffect(() => {
    if (!user) {
      setOrders([]);
      setActiveOrder(null);
      return;
    }

    const onError = (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Firestore orders listener error:', err);
      setFirestoreError(message);
      if (message.toLowerCase().includes('index')) {
        addToast('Firestore index building. Orders may load slowly.', 'error', 'cloud_off');
      }
    };

    const ordersRef = isAdmin
      ? collection(db, 'orders')
      : query(collection(db, 'orders'), where('userId', '==', user.uid));

    const unsub = onSnapshot(
      ordersRef,
      snapshot => {
        const orderData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        orderData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(orderData);

        setActiveOrder(prev => {
          if (prev) {
            const updated = orderData.find(o => o.id === prev.id);
            if (updated) {
              if (isGuest && TERMINAL_STATUSES.includes(updated.status)) return null;
              return updated;
            }
            return prev;
          }
          if (isGuest) {
            const active = orderData.find(o => ACTIVE_STATUSES.includes(o.status));
            return active ?? null;
          }
          return null;
        });
      },
      onError,
    );

    return unsub;
  }, [user, isAdmin, isGuest]);

  // Notifications listener
  useEffect(() => {
    if (!user || isAdmin) {
      setNotifications([]);
      return;
    }

    const notifQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
    );

    const unsub = onSnapshot(notifQuery, snapshot => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(items);
    }, err => {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Notifications listener error:', err);
      if (message.toLowerCase().includes('index')) {
        addToast('Firestore index building. Notifications may load slowly.', 'error', 'cloud_off');
      }
    });

    return unsub;
  }, [user, isAdmin]);

  useEffect(() => {
    if (!menuToastShown.current && products.length > 0 && seedStatus === 'done') {
      menuToastShown.current = true;
      addToast('Menu loaded', 'success', 'restaurant_menu');
    }
  }, [products.length, seedStatus]);

  useEffect(() => {
    if (emptyMenuToastShown.current || isLoading || products.length > 0) return;

    emptyMenuToastShown.current = true;
    const isPermissionError =
      firestoreError?.toLowerCase().includes('permission') ||
      firestoreError?.toLowerCase().includes('insufficient');

    if (isPermissionError) {
      addToast(
        'Cannot read Firestore. Publish security rules in Firebase Console.',
        'error',
        'cloud_off',
      );
    } else {
      addToast('Menu is empty. Run npm run seed.', 'error', 'restaurant_menu');
    }
  }, [isLoading, products.length, firestoreError]);

  const addProduct = useCallback(async (p: Omit<Product, 'id'>) => {
    await addDoc(collection(db, 'products'), p);
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    await updateDoc(doc(db, 'products', id), updates);
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
  }, []);

  const toggleAvailability = useCallback(async (id: string) => {
    const p = products.find(x => x.id === id);
    if (p) await updateDoc(doc(db, 'products', id), { available: !p.available });
  }, [products]);

  const addToCart = useCallback((product: Product) => {
    let isExisting = false;
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        isExisting = true;
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });

    if (isExisting) {
      addToast(`Added another ${product.name}`, 'success', 'shopping_bag');
    } else {
      addToast(`${product.name} added to bag`, 'success', 'shopping_bag');
    }
  }, []);

  const updateQty = useCallback((productId: string, delta: number) => {
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => { setCart([]); setPromoCode(''); setPromoDiscount(0); }, []);

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const applyPromo = useCallback((code: string): string | null => {
    const upper = code.toUpperCase().trim();
    const promo = promoCodes[upper];
    if (!promo) return 'Invalid promo code';
    setPromoCode(upper);
    const raw = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    setPromoDiscount(promo.type === 'percent' ? raw * promo.discount / 100 : promo.discount);
    return null;
  }, [cart, promoCodes]);

  const removePromo = useCallback(() => { setPromoCode(''); setPromoDiscount(0); }, []);

  const placeOrder = useCallback(async (
    type: OrderType,
    scheduledTime?: string,
    mpesaScreenshot?: string,
    deliveryAddress?: string,
  ) => {
    if (!user) throw new Error('Must be signed in to place an order');

    const displayName = getOrderDisplayName();
    const phone = getOrderPhone();
    if (!displayName.trim()) throw new Error('Name is required');

    const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const deliveryFee = type === 'delivery' ? 12.00 : 0;
    const discount = promoDiscount;

    const customer: { name: string; phone: string; address?: string } = {
      name: displayName.trim(),
      phone: phone.trim() || 'Not provided',
    };
    if (type === 'delivery' && deliveryAddress) customer.address = deliveryAddress;

    const orderData: Record<string, unknown> = {
      code: genOrderCode(),
      items: [...cart],
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee - discount,
      status: 'pending',
      type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer,
      userId: user.uid,
      isGuest: user.isAnonymous,
      queuePosition: Math.floor(Math.random() * 4) + 1,
      estimatedMins: type === 'pickup' ? Math.floor(Math.random() * 10) + 8 : Math.floor(Math.random() * 15) + 20,
    };
    if (scheduledTime) orderData.scheduledTime = scheduledTime;
    if (promoCode) orderData.promoCode = promoCode;
    if (discount > 0) orderData.promoDiscount = discount;
    if (mpesaScreenshot) orderData.mpesaScreenshot = mpesaScreenshot;

    const docRef = await addDoc(collection(db, 'orders'), stripUndefined(orderData));
    const fullOrder = { id: docRef.id, ...orderData } as Order;
    setActiveOrder(fullOrder);
    setCart([]);
    setPromoCode('');
    setPromoDiscount(0);
    return fullOrder;
  }, [cart, promoCode, promoDiscount, user, getOrderDisplayName, getOrderPhone]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const updates: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (status === 'ready' || status === 'delivered') {
      updates.queuePosition = 0;
      updates.estimatedMins = 0;
    }
    await updateDoc(doc(db, 'orders', orderId), updates);

    const order = orders.find(o => o.id === orderId);
    if (order?.userId && status !== 'pending') {
      const statusLabels: Record<string, string> = {
        approved: 'Your order has been confirmed!',
        preparing: 'Your order is being prepared.',
        ready: 'Your order is ready!',
        out_for_delivery: 'Your order is on the way!',
        delivered: 'Enjoy your meal!',
        cancelled: 'Your order was cancelled.',
      };
      if (statusLabels[status]) {
        await addDoc(collection(db, 'notifications'), {
          userId: order.userId,
          title: `Order #${order.code}`,
          body: statusLabels[status],
          read: false,
          type: 'order',
          orderId: orderId,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }, [orders]);

  const sendMessage = useCallback(async (userId: string, text: string, sender: 'staff' | 'customer', customerName?: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    const existing = messages.find(m => messageUserId(m) === userId);
    if (existing) {
      const newMsgs = [...existing.messages, { sender, text, time }];
      await updateDoc(doc(db, 'messages', existing.id), { messages: newMsgs });
    } else {
      const cust = customers.find(c => c.id === userId);
      await addDoc(collection(db, 'messages'), {
        userId,
        customerId: userId,
        customerName: customerName || cust?.name || userProfile?.displayName || 'Customer',
        messages: [{ sender, text, time }],
      });
    }
  }, [customers, messages, userProfile]);

  const markNotificationRead = useCallback(async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  }, []);

  const todayOrders = orders.filter(o => o.status !== 'cancelled').length;
  const todayRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const avgPrepTime = 14;

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  return (
    <StoreContext.Provider value={{
      isLoading,
      seedStatus,
      firestoreError,
      mode, setMode,
      products, addProduct, updateProduct, deleteProduct, toggleAvailability,
      cart, addToCart, updateQty, removeFromCart, clearCart, cartTotal, cartCount,
      promoCode, promoDiscount, applyPromo, removePromo,
      orders, activeOrder, placeOrder, updateOrderStatus, setActiveOrder, visibleOrders,
      customers, notifications, markNotificationRead,
      messages, sendMessage,
      loyaltyPoints, loyaltyTier, streakDays,
      weeklyStats, todayRevenue, todayOrders, avgPrepTime,
      showConfetti, triggerConfetti,
    }}>
      {children}
    </StoreContext.Provider>
  );
}
