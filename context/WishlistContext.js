'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/utils';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const { user } = useAuth();

  // Load wishlist
  useEffect(() => {
    if (user) {
      loadWishlistFromDB();
    } else {
      const savedWishlist = storage.get('azee_wishlist', []);
      setItems(savedWishlist);
    }
  }, [user]);

  const loadWishlistFromDB = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('wishlist')
        .select('product_id, products(*)')
        .eq('user_id', user.id);
      if (data) {
        setItems(data.map(item => item.product_id));
      }
    } catch (error) {
      console.error('Wishlist load error:', error);
    }
  };

  const addToWishlist = useCallback(async (productId) => {
    if (user) {
      try {
        await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId });
      } catch (error) {
        console.error('Wishlist add error:', error);
      }
    }
    setItems(prev => {
      const updated = prev.includes(productId) ? prev : [...prev, productId];
      if (!user) storage.set('azee_wishlist', updated);
      return updated;
    });
  }, [user]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (user) {
      try {
        await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
      } catch (error) {
        console.error('Wishlist remove error:', error);
      }
    }
    setItems(prev => {
      const updated = prev.filter(id => id !== productId);
      if (!user) storage.set('azee_wishlist', updated);
      return updated;
    });
  }, [user]);

  const toggleWishlist = useCallback(async (productId) => {
    if (items.includes(productId)) {
      await removeFromWishlist(productId);
      return false;
    } else {
      await addToWishlist(productId);
      return true;
    }
  }, [items, addToWishlist, removeFromWishlist]);

  const isInWishlist = useCallback((productId) => {
    return items.includes(productId);
  }, [items]);

  return (
    <WishlistContext.Provider value={{
      items,
      itemCount: items.length,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
