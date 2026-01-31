"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useCart } from "@/components/CartContext";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCartIcon, TrashIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

// Helper to get preferred image URL
const getPreferredImageUrl = (imageUrl) => {
  if (!imageUrl) return "/fallback.jpg";
  
  if (typeof imageUrl === "string") {
    try {
      return decodeURIComponent(imageUrl);
    } catch {
      return imageUrl;
    }
  }
  
  if (typeof imageUrl === "object") {
    const preferred = imageUrl["200x200"] || imageUrl["original"] || Object.values(imageUrl)[0];
    try {
      return decodeURIComponent(preferred);
    } catch {
      return preferred;
    }
  }
  
  return "/fallback.jpg";
};

export default function CartPage() {
  const router = useRouter();
  const { cartItems, cartCount, removeFromCart, updateItemQuantity, totalAmount, clearCart } = useCart();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // If user is logged in, redirect to order page
      if (currentUser) {
        router.push("/order");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleCheckout = () => {
    // Redirect to register with a redirect back to order page
    // The order page will handle transferring the cart
    router.push("/register?redirect=/order&fromCart=true");
  };

  const formatPrice = (price) => {
    return `UGX ${Number(price).toLocaleString()}`;
  };

  const getItemPrice = (item) => {
    if (item.discount > 0) {
      return item.price * (1 - item.discount / 100);
    }
    return item.price;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is logged in, they'll be redirected
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          {cartCount > 0 && (
            <span className="text-sm text-gray-500">
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">
              Browse our products and add items to your cart to get started.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4 flex gap-4">
                  {/* Product Image */}
                  <Link href={`/product/${item.id}`} className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={getPreferredImageUrl(item.imageUrl)}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.id}`}>
                      <h3 className="font-medium text-gray-900 truncate hover:text-blue-600">
                        {item.name}
                      </h3>
                    </Link>
                    {item.sku && (
                      <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      {item.discount > 0 ? (
                        <>
                          <span className="font-semibold text-gray-900">
                            {formatPrice(getItemPrice(item))}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                            -{item.discount}%
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold text-gray-900">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateItemQuantity(item.id, -1)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-l-lg transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium text-gray-700 min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItemQuantity(item.id, 1)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-r-lg transition-colors"
                        aria-label="Increase quantity"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatPrice(totalAmount)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Shipping and taxes will be calculated at checkout.
              </p>
              
              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                Proceed to Checkout
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                You'll need to sign in or create an account to complete your order.
              </p>

              {/* Continue Shopping */}
              <Link
                href="/"
                className="block w-full text-center mt-3 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Clear Cart */}
            <div className="text-center">
              <button
                onClick={clearCart}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
