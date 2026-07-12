export type CustomerView = 'home' | 'detail' | 'cart' | 'preorder' | 'confirm' | 'tracking' | 'history' | 'search' | 'loyalty' | 'profile' | 'login';
export type ManagerView = 'dashboard' | 'orders' | 'menu' | 'customers' | 'messaging' | 'settings';
export type AppMode = 'customer' | 'manager';

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  category: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  calories?: number;
  prepTime?: string;
  portion?: string;
  chefNote?: string;
  contains?: string[];
  available: boolean;
  isDrop?: boolean;
  dropExpiresAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  extras?: string[];
}

export type OrderStatus = 'pending' | 'approved' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type OrderType = 'pickup' | 'delivery';

export interface Order {
  id: string;
  code: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  type: OrderType;
  scheduledTime?: string;
  createdAt: string;
  updatedAt: string;
  customer: { name: string; phone: string; address?: string };
  userId?: string;
  isGuest?: boolean;
  queuePosition?: number;
  estimatedMins?: number;
  promoCode?: string;
  promoDiscount?: number;
  mpesaScreenshot?: string;
}

export type UserRole = 'customer' | 'admin';
export type AppRole = 'guest' | 'customer' | 'admin' | null;

export interface UserProfile {
  uid: string;
  role: UserRole;
  displayName: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  isAnonymous: boolean;
  guestDisplayName?: string;
  guestPhone?: string;
  loyaltyPoints: number;
  tier: 'Gavo Regular' | 'Smocha Legend' | 'Gavo Boss';
  streakDays: number;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  type: 'order' | 'admin' | 'reward';
  createdAt: string;
  orderId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  orders: number;
  totalSpent: number;
  lastVisit: string;
  loyaltyPoints: number;
  tier: 'Gavo Regular' | 'Smocha Legend' | 'Gavo Boss';
}

export interface Message {
  id: string;
  customerId?: string;
  userId?: string;
  customerName: string;
  messages: { sender: 'staff' | 'customer'; text: string; time: string }[];
  orderId?: string;
  updatedAt?: string;
}

export interface DailyStats {
  date: string;
  revenue: number;
  orders: number;
}
