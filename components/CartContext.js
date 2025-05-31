"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Create Context
const CartContext = createContext();

// Provider component
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cartItems");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    }
  }, []);

  // Save cart to localStorage whenever cartItems change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Add item or increase quantity if exists
  function addToCart(product) {
    setCartItems((prevItems) => {
      const index = prevItems.findIndex((item) => item.id === product.id);
      if (index !== -1) {
        // Item exists, increase quantity
        const updated = [...prevItems];
        updated[index].quantity += 1;
        return updated;
      } else {
        // New item
        return [...prevItems, { ...product, quantity: 1 }];
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

  // Clear entire cart
  function clearCart() {
    setCartItems([]);
  }

  // Total amount calculation
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateItemQuantity,
        clearCart,
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
