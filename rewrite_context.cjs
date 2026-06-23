const fs = require('fs');

const path = './src/context/StoreContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
content = content.replace(
  "import React, { createContext, useContext, useState, useCallback } from 'react';",
  `import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';\nimport { db, isFirebaseConfigured } from '../config/firebase';\nimport { collection, onSnapshot, doc, setDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';`
);

// 2. Add useEffect inside StoreProvider
const hookInjection = `
  // Firebase Real-time listeners
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const unsubProducts = onSnapshot(collection(db, 'products'), snapshot => {
      if (!snapshot.empty) {
        const prodData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(prodData);
      }
    });

    const unsubOrders = onSnapshot(collection(db, 'orders'), snapshot => {
      if (!snapshot.empty) {
        const orderData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        orderData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(orderData);
        setActiveOrder(prev => {
          if (!prev) return null;
          return orderData.find(o => o.id === prev.id) || prev;
        });
      }
    });

    const unsubMessages = onSnapshot(collection(db, 'messages'), snapshot => {
      if (!snapshot.empty) {
        const msgData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        setMessages(msgData);
      }
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubMessages();
    };
  }, []);

`;

content = content.replace(
  `  const streakDays = 3;`,
  `  const streakDays = 3;\n\n${hookInjection}`
);

// 3. Products
content = content.replace(
  `  const addProduct = useCallback((p: Omit<Product, 'id'>) => {\n    setProducts(prev => [...prev, { ...p, id: \`prod-\${Date.now()}\` }]);\n  }, []);`,
  `  const addProduct = useCallback(async (p: Omit<Product, 'id'>) => {\n    if (isFirebaseConfigured && db) {\n      await addDoc(collection(db, 'products'), p);\n    } else {\n      setProducts(prev => [...prev, { ...p, id: \`prod-\${Date.now()}\` }]);\n    }\n  }, []);`
);

content = content.replace(
  `  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {\n    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));\n  }, []);`,
  `  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {\n    if (isFirebaseConfigured && db) {\n      await updateDoc(doc(db, 'products', id), updates);\n    } else {\n      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));\n    }\n  }, []);`
);

content = content.replace(
  `  const deleteProduct = useCallback((id: string) => {\n    setProducts(prev => prev.filter(p => p.id !== id));\n  }, []);`,
  `  const deleteProduct = useCallback(async (id: string) => {\n    if (isFirebaseConfigured && db) {\n      await deleteDoc(doc(db, 'products', id));\n    } else {\n      setProducts(prev => prev.filter(p => p.id !== id));\n    }\n  }, []);`
);

content = content.replace(
  `  const toggleAvailability = useCallback((id: string) => {\n    setProducts(prev => prev.map(p => p.id === id ? { ...p, available: !p.available } : p));\n  }, []);`,
  `  const toggleAvailability = useCallback(async (id: string) => {\n    if (isFirebaseConfigured && db) {\n      const p = products.find(x => x.id === id);\n      if (p) await updateDoc(doc(db, 'products', id), { available: !p.available });\n    } else {\n      setProducts(prev => prev.map(p => p.id === id ? { ...p, available: !p.available } : p));\n    }\n  }, [products]);`
);

// 4. placeOrder
const originalPlaceOrder = `  const placeOrder = useCallback((type: OrderType, scheduledTime?: string): Order => {
    const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const deliveryFee = type === 'delivery' ? 12.00 : 0;
    const discount = promoDiscount;
    const order: Order = {
      id: genOrderId(), code: genOrderCode(), items: [...cart],
      subtotal, deliveryFee, total: subtotal + deliveryFee - discount,
      status: 'pending', type, scheduledTime,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      customer: { name: 'You', phone: '+254 712 345 678' },
      queuePosition: Math.floor(Math.random() * 4) + 1,
      estimatedMins: type === 'pickup' ? Math.floor(Math.random() * 10) + 8 : Math.floor(Math.random() * 15) + 20,
      promoCode: promoCode || undefined,
      promoDiscount: discount > 0 ? discount : undefined,
    };
    setOrders(prev => [order, ...prev]);
    setActiveOrder(order);
    setCart([]);
    setPromoCode(''); setPromoDiscount(0);
    return order;
  }, [cart, promoCode, promoDiscount]);`;

const newPlaceOrder = `  const placeOrder = useCallback(async (type: OrderType, scheduledTime?: string) => {
    const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const deliveryFee = type === 'delivery' ? 12.00 : 0;
    const discount = promoDiscount;
    
    const orderData: any = {
      code: genOrderCode(), items: [...cart],
      subtotal, deliveryFee, total: subtotal + deliveryFee - discount,
      status: 'pending', type,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      customer: { name: 'You', phone: '+254 712 345 678' },
      queuePosition: Math.floor(Math.random() * 4) + 1,
      estimatedMins: type === 'pickup' ? Math.floor(Math.random() * 10) + 8 : Math.floor(Math.random() * 15) + 20,
    };
    if (scheduledTime) orderData.scheduledTime = scheduledTime;
    if (promoCode) orderData.promoCode = promoCode;
    if (discount > 0) orderData.promoDiscount = discount;

    if (isFirebaseConfigured && db) {
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      const fullOrder = { id: docRef.id, ...orderData } as Order;
      setActiveOrder(fullOrder);
      setCart([]);
      setPromoCode(''); setPromoDiscount(0);
      return fullOrder;
    } else {
      const order = { id: genOrderId(), ...orderData } as Order;
      setOrders(prev => [order, ...prev]);
      setActiveOrder(order);
      setCart([]);
      setPromoCode(''); setPromoDiscount(0);
      return order;
    }
  }, [cart, promoCode, promoDiscount]);`;

content = content.replace(originalPlaceOrder, newPlaceOrder);

// 5. updateOrderStatus
const originalUpdateOrder = `  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString(),
      queuePosition: status === 'ready' || status === 'delivered' ? 0 : o.queuePosition,
      estimatedMins: status === 'ready' ? 0 : status === 'delivered' ? 0 : o.estimatedMins,
    } : o));
    setActiveOrder(prev => prev?.id === orderId ? { ...prev, status, updatedAt: new Date().toISOString() } : prev);
  }, []);`;

const newUpdateOrder = `  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    if (isFirebaseConfigured && db) {
      const updates: any = { 
        status, 
        updatedAt: new Date().toISOString()
      };
      if (status === 'ready' || status === 'delivered') {
        updates.queuePosition = 0;
        updates.estimatedMins = 0;
      }
      await updateDoc(doc(db, 'orders', orderId), updates);
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString(),
        queuePosition: status === 'ready' || status === 'delivered' ? 0 : o.queuePosition,
        estimatedMins: status === 'ready' ? 0 : status === 'delivered' ? 0 : o.estimatedMins,
      } : o));
      setActiveOrder(prev => prev?.id === orderId ? { ...prev, status, updatedAt: new Date().toISOString() } : prev);
    }
  }, []);`;

content = content.replace(originalUpdateOrder, newUpdateOrder);

// 6. sendMessage
const originalSendMessage = `  const sendMessage = useCallback((customerId: string, text: string, sender: 'staff' | 'customer') => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setMessages(prev => {
      const existing = prev.find(m => m.customerId === customerId);
      if (existing) {
        return prev.map(m => m.customerId === customerId
          ? { ...m, messages: [...m.messages, { sender, text, time }] } : m);
      }
      const cust = customers.find(c => c.id === customerId);
      return [...prev, { id: \`msg-\${Date.now()}\`, customerId, customerName: cust?.name || 'Customer',
        messages: [{ sender, text, time }] }];
    });
  }, [customers]);`;

const newSendMessage = `  const sendMessage = useCallback(async (customerId: string, text: string, sender: 'staff' | 'customer') => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (isFirebaseConfigured && db) {
      const existing = messages.find(m => m.customerId === customerId);
      if (existing) {
        const newMsgs = [...existing.messages, { sender, text, time }];
        await updateDoc(doc(db, 'messages', existing.id), { messages: newMsgs });
      } else {
        const cust = customers.find(c => c.id === customerId);
        await addDoc(collection(db, 'messages'), {
          customerId,
          customerName: cust?.name || 'Customer',
          messages: [{ sender, text, time }]
        });
      }
    } else {
      setMessages(prev => {
        const existing = prev.find(m => m.customerId === customerId);
        if (existing) {
          return prev.map(m => m.customerId === customerId
            ? { ...m, messages: [...m.messages, { sender, text, time }] } : m);
        }
        const cust = customers.find(c => c.id === customerId);
        return [...prev, { id: \`msg-\${Date.now()}\`, customerId, customerName: cust?.name || 'Customer',
          messages: [{ sender, text, time }] }];
      });
    }
  }, [customers, messages]);`;

content = content.replace(originalSendMessage, newSendMessage);

// 7. Update placeOrder interface to return Promise<Order> instead of Order
content = content.replace(
  `placeOrder: (type: OrderType, scheduledTime?: string) => Order;`,
  `placeOrder: (type: OrderType, scheduledTime?: string) => Promise<Order>;`
);

fs.writeFileSync(path, content, 'utf8');
console.log('StoreContext rewritten successfully!');
