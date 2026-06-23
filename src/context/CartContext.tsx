import React, { createContext, useContext, useState, useCallback } from 'react';

/* ==========================================
   TYPES
   ========================================== */
export type ViewName = 'home' | 'detail' | 'cart' | 'delivery';

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
}

export interface CartItem {
  product: Product;
  quantity: number;
}

/* ==========================================
   DATA
   ========================================== */
export const PRODUCTS: Product[] = [
  {
    id: 'velvet-signature',
    name: 'The Velvet Signature',
    subtitle: 'Double-aged beef, truffle aioli, gold-leafed brioche.',
    price: 24.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgYtfrcdT6SlneXTT8B3Nfb2vm0aMSgjRggQ9z9tVsSTqMtC9CQH2zorPhTkRhwrGyQwsl7s0eutnhyWf3s_urSJdxObQeXpPb0d04exdPyBS9akbRHl6W4Iui7Sld9KrG1_DD2we5e1zcEpljbwsnNiab3sXEO-hd88ojh5JRHkuIaJmWVngBDA-NL_LQVNHmN6_hwebVcjGgJ4VxeuWUW9QR0kLSKH0fdyFwATD19v5Mlt56gWB6ht597nNE1KCaoUi6smY0G3UP',
    category: 'Burgers',
    badge: 'Seasonal Special',
    rating: 4.9,
    reviews: 120,
    calories: 850,
    prepTime: '15 – 20 mins',
    portion: 'Single Patty (250g)',
    chefNote: 'Our signature Velvet Swirl burger is crafted with hand-massaged Wagyu beef, infused with a hint of smoked paprika and rosemary. We layer this over a bed of slow-caramelized onions and top it with our secret Velvet Truffle Aioli, all encased in a toasted, artisanal gold-leaf brioche bun.',
  },
  {
    id: 'midnight-truffle',
    name: 'Midnight Truffle',
    subtitle: 'Dark chocolate, raspberry, gold leaf.',
    price: 12.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlYkR7N3bPyjibthWHU-lS_cRIe_vzWhjAQuZ4BgJhzqftXOjtiweoJVvCTdml_lpnItS8YdtGzDyhH18V0yE25VhLjCSLiTRadOZRLOFKMAt-8mHPZFeuhsK13UFgJ2RHJ56PO9AfdSo2QhyDHUIITEtQVvX7EUsxABC-zXI9TlGlHIogMeCf_5oMiQfCxZnpWU_DjdpZc3hp7UAtQBIJyP2JQHqKCFqxowdFSoBfbFueOgrhdmmjRFZL2bZj7GJtg42pGZL0oadk',
    category: 'Desserts',
    rating: 4.8,
    reviews: 88,
    calories: 420,
    prepTime: '5 mins',
    portion: '1 slice (180g)',
    chefNote: 'A decadent midnight truffle cake layered with dark Valrhona chocolate ganache and fresh raspberries, crowned with edible 24k gold leaf. A celebration of indulgence in every bite.',
  },
  {
    id: 'golden-fries',
    name: 'Golden Fries',
    subtitle: 'Edible gold dust, truffle salt, aioli.',
    price: 8.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDS8d8AYBZTeTC-_27tVjgfiwlFWE48XQoNRbSmmb0AxLwFHSWfJvYelapVZA3EO30xwLT0BHbsNBZLRuYj9MQnZdJGWX-uo9vQgQJOuENjteMBIbF0zn2x8bRDh7HVTNCJkC7j9ez2258ZvbzRDrt92m-CeusxmGUJ4pFIDyECKKn50MTx3MB1G-UJh61PDx3X2Zzvs6yMx_FqJ-QSTE1wiGYBYkQvrsufu8p_YxkwXHnxuAwT7gNPVWNe_orIfwaMrq_8YnqZKpVy',
    category: 'Sides',
    rating: 4.7,
    reviews: 215,
    calories: 390,
    prepTime: '8 mins',
    portion: 'Large (300g)',
    chefNote: 'House-cut russet potatoes, twice-fried to a perfect crisp, then dusted with edible gold and our signature truffle-infused Himalayan pink salt. Served with our velvety house aioli.',
  },
  {
    id: 'floral-soda',
    name: 'Floral Soda',
    subtitle: 'Hibiscus, elderflower, fresh mint.',
    price: 6.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQA8MhIRKKQD0qXmJx7t2ryM0sK8-cSa_ecG34opBp0RBOoHZY9mVUUw5PjyVyTdS_j4Ia3MXYBSzPuULb2EgSO6FhePQ7r_l54QNzto7NncudFTfGqcPiQ7kp-V9mKM5SOk9m2Dy6opgYsAYklLD2hr74m-l8qec0llN1umWFXLGbW6MFU8H3L_aBhnkSq1r5EMS20ra2WbKvALJCaXaLVwjdZ77zpJbgGdG2teJXfGs9CNozF7oOVgNrAfkMx76y01Umr7QgoWlE',
    category: 'Drinks',
    rating: 4.6,
    reviews: 143,
    calories: 85,
    prepTime: '3 mins',
    portion: '350ml',
    chefNote: 'A sparkling artisanal soda blending dried hibiscus flowers and St-Germain elderflower liqueur, topped with fresh hand-picked mint and a citrus wedge. Refreshingly sophisticated.',
  },
  {
    id: 'wagyu-slider',
    name: 'Wagyu Slider',
    subtitle: 'Caramelized onions, premium cream cheese.',
    price: 16.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaWGeF5acctW1nuWnyDq6e4dKjHLhKxpqWodrBul9YacOiGhigyncbzgVuoGO-uhwAbm0S7f45HLrJlMH9OZNrAVP919wNOHNainj7JuOjMWKzMlhI0GSloiopQOk9sZfRgQ7TLUrmCks7lhguf11aUg52E4fXEv9JBWYEuKxZGdfaQMXsE9omFYb1sfgjqkP9-c-NR1J6CBkuomdNVgZd3eTyfrPTEvvHAi0ziQ7XOiuTGZNuZtaJe_lFt1hLHnr9HDTUahodMbGQ',
    category: 'Burgers',
    rating: 4.9,
    reviews: 176,
    calories: 520,
    prepTime: '12 mins',
    portion: '2 sliders (200g)',
    chefNote: 'Japanese A5 Wagyu beef sliders with slow-caramelized Vidalia onions and a generous smear of truffle-whipped cream cheese on a house-baked potato roll. Small bites, enormous flavor.',
  },
];

export const DELIVERY_FEE = 14.00;

/* ==========================================
   CART CONTEXT
   ========================================== */
interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product) => void;
  updateQty: (productId: string, delta: number) => void;
  removeItem: (productId: string) => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQty = useCallback((productId: string, delta: number) => {
    setItems(prev =>
      prev
        .map(i => i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeItem, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}
