'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/utils';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = storage.get('azee_cart', []);
    if (savedCart.length > 0) setItems(savedCart);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    storage.set('azee_cart', items);
  }, [items]);

  const addItem = useCallback((product, quantity = 1, variant = null, customization = '') => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.id === product.id && item.variantId === (variant?.id || null) && (item.customization || '') === (customization || '')
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [...prev, {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: variant ? product.price + (variant.price_modifier || 0) : product.price,
        image: product.images?.[0] || '',
        quantity,
        stock: variant?.stock || product.stock,
        variantId: variant?.id || null,
        variantInfo: variant ? `${variant.variant_type}: ${variant.variant_value}` : null,
        customization: customization || '',
      }];
    });
  }, []);

  const removeItem = useCallback((id, variantId = null, customization = '') => {
    setItems(prev => prev.filter(
      item => !(item.id === id && item.variantId === variantId && (item.customization || '') === (customization || ''))
    ));
  }, []);

  const updateQuantity = useCallback((id, quantity, variantId = null, customization = '') => {
    if (quantity < 1) return;
    setItems(prev => prev.map(item => {
      if (item.id === id && item.variantId === variantId && (item.customization || '') === (customization || '')) {
        return { ...item, quantity: Math.min(quantity, item.stock || 99) };
      }
      return item;
    }));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen(prev => !prev), []);

  const applyCoupon = useCallback((couponData) => {
    setCoupon(couponData);
  }, []);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discount = 0;
  if (coupon) {
    if (coupon.discount_type === 'percentage') {
      discount = subtotal * (coupon.discount_value / 100);
    } else {
      discount = coupon.discount_value;
    }
  }

  const shipping = subtotal >= 5000 ? 0 : 200;
  const tax = 0;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <CartContext.Provider value={{
      items,
      isOpen,
      coupon,
      itemCount,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
      applyCoupon,
      removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
