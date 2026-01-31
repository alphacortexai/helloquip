"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Create Context
const CartContext = createContext();

const GUEST_CART_KEY = "heloquip_guest_cart";

// Provider component
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem(GUEST_CART_KEY);
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch (e) {
          console.error("Failed to parse guest cart:", e);
          setCartItems([]);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever cartItems change
  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  // Check if item is already in cart
  function isInCart(productId) {
    return cartItems.some((item) => item.id === productId);
  }

  // Add item or increase quantity if exists
  function addToCart(product, quantity = 1) {
    setCartItems((prevItems) => {
      const index = prevItems.findIndex((item) => item.id === product.id);
      if (index !== -1) {
        // Item exists, increase quantity
        const updated = [...prevItems];
        updated[index].quantity += quantity;
        return updated;
      } else {
        // New item - store essential product info
        return [...prevItems, { 
          id: product.id,
          name: product.name,
          price: product.price,
          discount: product.discount || 0,
          imageUrl: product.imageUrl || product.image,
          sku: product.sku || "",
          quantity: quantity,
          addedAt: new Date().toISOString()
        }];
      }
    });
  }

  // Remove item from cart by id
  function removeFromCart(id) {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }

  // Update item quantity by delta (+1 or -1)
  function updateItemQuantity(id, delta) {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + delta;
            if (newQuantity < 1) return null; // remove if quantity < 1
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean);
    });
  }

  // Set specific quantity for an item
  function setItemQuantity(id, quantity) {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.id === id) {
          return { ...item, quantity };
        }
        return item;
      });
    });
  }

  // Clear entire cart
  function clearCart() {
    setCartItems([]);
  }

  // Get cart items for transfer to Firebase (after login)
  function getCartForTransfer() {
    return cartItems.map((item) => ({
      ...item,
      addedAt: item.addedAt || new Date().toISOString()
    }));
  }

  // Cart count
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Total amount calculation (with discount support)
  const totalAmount = cartItems.reduce((sum, item) => {
    const price = item.discount > 0 
      ? item.price * (1 - item.discount / 100) 
      : item.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        isLoaded,
        addToCart,
        removeFromCart,
        updateItemQuantity,
        setItemQuantity,
        clearCart,
        isInCart,
        getCartForTransfer,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook to use the cart context easily
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
