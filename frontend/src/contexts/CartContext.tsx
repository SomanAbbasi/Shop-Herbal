import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Cart } from '@/types';
import { cartService } from '@/services/cartService';
import { toast } from 'sonner';

interface CartContextType {
  cart: Cart | null;
  cartItemsCount: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeCartItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);

  const cartItemsCount = cart?.totalItems || 0;

  const fetchCart = useCallback(async () => {
    try {
      const response = await cartService.getCart();
      if (response.status) {
        setCart(response.data);
      }
    } catch {
      // Silently fail - user might not be logged in
    }
  }, []);

  const addToCart = async (productId: string, quantity: number) => {
    const response = await cartService.addToCart({ productId, quantity });
    if (response.status) {
      setCart(response.data);
      toast.success('Item added to cart');
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    const response = await cartService.updateCartItem({ productId, quantity });
    if (response.status) {
      setCart(response.data);
    }
  };

  const removeCartItem = async (productId: string) => {
    const response = await cartService.removeCartItem(productId);
    if (response.status) {
      setCart(response.data);
      toast.success('Item removed from cart');
    }
  };

  const clearCart = async () => {
    const response = await cartService.clearCart();
    if (response.status) {
      setCart(null);
      toast.success('Cart cleared');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItemsCount,
        fetchCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
