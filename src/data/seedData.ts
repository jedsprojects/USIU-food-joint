import type { Product, Customer, Order, Message, DailyStats } from '../context/types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'velvet-signature', name: 'The Velvet Signature',
    subtitle: 'Double-aged beef, truffle aioli, gold-leafed brioche.',
    price: 24.00, category: 'Burgers', badge: 'Seasonal Special', available: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgYtfrcdT6SlneXTT8B3Nfb2vm0aMSgjRggQ9z9tVsSTqMtC9CQH2zorPhTkRhwrGyQwsl7s0eutnhyWf3s_urSJdxObQeXpPb0d04exdPyBS9akbRHl6W4Iui7Sld9KrG1_DD2we5e1zcEpljbwsnNiab3sXEO-hd88ojh5JRHkuIaJmWVngBDA-NL_LQVNHmN6_hwebVcjGgJ4VxeuWUW9QR0kLSKH0fdyFwATD19v5Mlt56gWB6ht597nNE1KCaoUi6smY0G3UP',
    rating: 4.9, reviews: 120, calories: 850, prepTime: '15 – 20 mins', portion: 'Single Patty (250g)',
    chefNote: 'Our signature Velvet Swirl burger is crafted with hand-massaged Wagyu beef, infused with a hint of smoked paprika and rosemary. We layer this over a bed of slow-caramelized onions and top it with our secret Velvet Truffle Aioli, all encased in a toasted, artisanal gold-leaf brioche bun.',
  },
  {
    id: 'midnight-truffle', name: 'Midnight Truffle',
    subtitle: 'Dark chocolate, raspberry, gold leaf.',
    price: 12.00, category: 'Desserts', available: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlYkR7N3bPyjibthWHU-lS_cRIe_vzWhjAQuZ4BgJhzqftXOjtiweoJVvCTdml_lpnItS8YdtGzDyhH18V0yE25VhLjCSLiTRadOZRLOFKMAt-8mHPZFeuhsK13UFgJ2RHJ56PO9AfdSo2QhyDHUIITEtQVvX7EUsxABC-zXI9TlGlHIogMeCf_5oMiQfCxZnpWU_DjdpZc3hp7UAtQBIJyP2JQHqKCFqxowdFSoBfbFueOgrhdmmjRFZL2bZj7GJtg42pGZL0oadk',
    rating: 4.8, reviews: 88, calories: 420, prepTime: '5 mins', portion: '1 slice (180g)',
    chefNote: 'A decadent midnight truffle cake layered with dark Valrhona chocolate ganache and fresh raspberries, crowned with edible 24k gold leaf.',
  },
  {
    id: 'golden-fries', name: 'Golden Fries',
    subtitle: 'Edible gold dust, truffle salt, aioli.',
    price: 8.00, category: 'Sides', available: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDS8d8AYBZTeTC-_27tVjgfiwlFWE48XQoNRbSmmb0AxLwFHSWfJvYelapVZA3EO30xwLT0BHbsNBZLRuYj9MQnZdJGWX-uo9vQgQJOuENjteMBIbF0zn2x8bRDh7HVTNCJkC7j9ez2258ZvbzRDrt92m-CeusxmGUJ4pFIDyECKKn50MTx3MB1G-UJh61PDx3X2Zzvs6yMx_FqJ-QSTE1wiGYBYkQvrsufu8p_YxkwXHnxuAwT7gNPVWNe_orIfwaMrq_8YnqZKpVy',
    rating: 4.7, reviews: 215, calories: 390, prepTime: '8 mins', portion: 'Large (300g)',
    chefNote: 'House-cut russet potatoes, twice-fried to a perfect crisp, then dusted with edible gold and our signature truffle-infused Himalayan pink salt.',
  },
  {
    id: 'floral-soda', name: 'Floral Soda',
    subtitle: 'Hibiscus, elderflower, fresh mint.',
    price: 6.00, category: 'Drinks', available: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQA8MhIRKKQD0qXmJx7t2ryM0sK8-cSa_ecG34opBp0RBOoHZY9mVUUw5PjyVyTdS_j4Ia3MXYBSzPuULb2EgSO6FhePQ7r_l54QNzto7NncudFTfGqcPiQ7kp-V9mKM5SOk9m2Dy6opgYsAYklLD2hr74m-l8qec0llN1umWFXLGbW6MFU8H3L_aBhnkSq1r5EMS20ra2WbKvALJCaXaLVwjdZ77zpJbgGdG2teJXfGs9CNozF7oOVgNrAfkMx76y01Umr7QgoWlE',
    rating: 4.6, reviews: 143, calories: 85, prepTime: '3 mins', portion: '350ml',
    chefNote: 'A sparkling artisanal soda blending dried hibiscus flowers and elderflower liqueur, topped with fresh hand-picked mint.',
  },
  {
    id: 'wagyu-slider', name: 'Wagyu Slider',
    subtitle: 'Caramelized onions, premium cream cheese.',
    price: 16.00, category: 'Burgers', available: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaWGeF5acctW1nuWnyDq6e4dKjHLhKxpqWodrBul9YacOiGhigyncbzgVuoGO-uhwAbm0S7f45HLrJlMH9OZNrAVP919wNOHNainj7JuOjMWKzMlhI0GSloiopQOk9sZfRgQ7TLUrmCks7lhguf11aUg52E4fXEv9JBWYEuKxZGdfaQMXsE9omFYb1sfgjqkP9-c-NR1J6CBkuomdNVgZd3eTyfrPTEvvHAi0ziQ7XOiuTGZNuZtaJe_lFt1hLHnr9HDTUahodMbGQ',
    rating: 4.9, reviews: 176, calories: 520, prepTime: '12 mins', portion: '2 sliders (200g)',
    chefNote: 'Japanese A5 Wagyu beef sliders with slow-caramelized Vidalia onions and truffle-whipped cream cheese on a house-baked potato roll.',
  },
  {
    id: 'velvet-shake', name: 'Velvet Shake',
    subtitle: 'Vanilla bean, salted caramel, whipped gold.',
    price: 10.00, category: 'Drinks', available: true, isDrop: true, dropExpiresAt: '2026-06-23T23:59:00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlizJV3VOMqUrHzY0rbwGwt8IV91uij5HpY-CbdZfDOVfd9608u-tM1aAyKBV99LjzPkR69c_RDN-uCmZqoFIoWITv3brGT13vcUMkdCg50JpXdZYLCS6w1TrYS_BkfbtUOcE9ZHBGeB8vTi483cLQxbt3nVvmZybXbB5cVCG71-oI25YgXfb99qWbiNULt7dTfSxfhV4XaMAQ0NJgc6Ok7epiKUYMXOY9CzhixdzFiMo14nJR6isIrn2uKX3AWuiio6a0O46rRw4w',
    rating: 5.0, reviews: 42, calories: 580, prepTime: '5 mins', portion: '500ml',
    chefNote: 'Limited edition! Madagascar vanilla bean shake swirled with house-made salted caramel and topped with 24k edible gold whipped cream.',
    badge: '🔥 TODAY\'S DROP',
  },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Aisha Kamau', phone: '+254 712 345 678', email: 'aisha@email.com', avatar: '', orders: 23, totalSpent: 1245.00, lastVisit: '2026-06-22', loyaltyPoints: 2340, tier: 'Velvet VIP' },
  { id: 'c2', name: 'Julian Montgomery', phone: '+1 (555) 012-3456', email: 'julian@email.com', avatar: '', orders: 8, totalSpent: 420.00, lastVisit: '2026-06-21', loyaltyPoints: 840, tier: 'Gold Crumb' },
  { id: 'c3', name: 'Sofia Rosales', phone: '+254 798 765 432', email: 'sofia@email.com', avatar: '', orders: 3, totalSpent: 98.50, lastVisit: '2026-06-20', loyaltyPoints: 190, tier: 'Crumbler' },
  { id: 'c4', name: 'Daniel Ochieng', phone: '+254 700 111 222', email: 'daniel@email.com', avatar: '', orders: 15, totalSpent: 780.00, lastVisit: '2026-06-22', loyaltyPoints: 1560, tier: 'Gold Crumb' },
  { id: 'c5', name: 'Emma Chen', phone: '+1 (555) 987-6543', email: 'emma@email.com', avatar: '', orders: 41, totalSpent: 2100.00, lastVisit: '2026-06-22', loyaltyPoints: 4200, tier: 'Velvet VIP' },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-001', code: 'VE-4821', status: 'preparing', type: 'pickup',
    items: [{ product: INITIAL_PRODUCTS[0], quantity: 1 }, { product: INITIAL_PRODUCTS[2], quantity: 2 }],
    subtotal: 40.00, deliveryFee: 0, total: 40.00, scheduledTime: '12:30 PM',
    createdAt: '2026-06-22T09:00:00Z', updatedAt: '2026-06-22T09:05:00Z',
    customer: { name: 'Aisha Kamau', phone: '+254 712 345 678' },
    queuePosition: 2, estimatedMins: 12,
  },
  {
    id: 'ord-002', code: 'VE-4822', status: 'pending', type: 'delivery',
    items: [{ product: INITIAL_PRODUCTS[1], quantity: 3 }],
    subtotal: 36.00, deliveryFee: 12.00, total: 48.00,
    createdAt: '2026-06-22T09:08:00Z', updatedAt: '2026-06-22T09:08:00Z',
    customer: { name: 'Julian Montgomery', phone: '+1 (555) 012-3456', address: '422 Artisan Way, Suite 802' },
    estimatedMins: 35,
  },
  {
    id: 'ord-003', code: 'VE-4820', status: 'ready', type: 'pickup',
    items: [{ product: INITIAL_PRODUCTS[4], quantity: 1 }, { product: INITIAL_PRODUCTS[3], quantity: 2 }],
    subtotal: 28.00, deliveryFee: 0, total: 28.00, scheduledTime: '12:15 PM',
    createdAt: '2026-06-22T08:45:00Z', updatedAt: '2026-06-22T09:10:00Z',
    customer: { name: 'Sofia Rosales', phone: '+254 798 765 432' },
    queuePosition: 0, estimatedMins: 0,
  },
  {
    id: 'ord-004', code: 'VE-4819', status: 'delivered', type: 'delivery',
    items: [{ product: INITIAL_PRODUCTS[0], quantity: 2 }, { product: INITIAL_PRODUCTS[5], quantity: 1 }],
    subtotal: 58.00, deliveryFee: 12.00, total: 70.00,
    createdAt: '2026-06-22T07:30:00Z', updatedAt: '2026-06-22T08:20:00Z',
    customer: { name: 'Daniel Ochieng', phone: '+254 700 111 222', address: '88 Fifth Avenue, Floor 14' },
    estimatedMins: 0,
  },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1', customerId: 'c1', customerName: 'Aisha Kamau', orderId: 'ord-001',
    messages: [
      { sender: 'customer', text: 'Hey, can I add extra truffle aioli?', time: '9:02 AM' },
      { sender: 'staff', text: 'Absolutely! We\'ll add it at no extra charge 🎉', time: '9:03 AM' },
      { sender: 'customer', text: 'You guys are the best!', time: '9:03 AM' },
    ],
  },
  {
    id: 'msg-2', customerId: 'c2', customerName: 'Julian Montgomery',
    messages: [
      { sender: 'customer', text: 'What time do you close today?', time: '8:45 AM' },
      { sender: 'staff', text: 'We\'re open until 10 PM tonight!', time: '8:46 AM' },
    ],
  },
];

export const MOCK_STATS: DailyStats[] = [
  { date: 'Mon', revenue: 1240, orders: 42 },
  { date: 'Tue', revenue: 980, orders: 35 },
  { date: 'Wed', revenue: 1580, orders: 51 },
  { date: 'Thu', revenue: 1120, orders: 38 },
  { date: 'Fri', revenue: 2100, orders: 67 },
  { date: 'Sat', revenue: 2450, orders: 78 },
  { date: 'Sun', revenue: 1890, orders: 62 },
];

export const PROMO_CODES: Record<string, { discount: number; type: 'fixed' | 'percent'; label: string }> = {
  'VELVET10': { discount: 10, type: 'percent', label: '10% off' },
  'NEWCRUMB': { discount: 5, type: 'fixed', label: '$5 off' },
  'GOLDLEAF': { discount: 15, type: 'percent', label: '15% off' },
};
