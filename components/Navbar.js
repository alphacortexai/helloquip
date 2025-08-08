"use client";

import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import SearchBar from "@/components/SearchBar";
import { collection, onSnapshot } from "firebase/firestore";
import { ShoppingCartIcon, ChatBubbleLeftEllipsisIcon, BellIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState(0);
  const dropdownRef = useRef();

  const showSearch = ["/category", "/shop", "/search"].some((path) => pathname.startsWith(path)) || pathname === "/";

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Listen for cart count realtime updates if user logged in
  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }
    const itemsRef = collection(db, "carts", user.uid, "items");
    const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
      setCartCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for unread messages sent to this user
  useEffect(() => {
    if (!user) {
      setUnreadMessages(0);
      return;
    }

    const q = collection(db, "messages");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.to === user.uid && !data.read) {
          count++;
        }
      });
      setUnreadMessages(count);
    });

    return () => unsubscribe();
  }, [user]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/register");
    } catch (error) {
      console.error("Logout error", error.message);
    }
  };



  return (
    <>
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <h1
                className="text-3xl md:text-3xl font-extrabold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors pr-0.5"
                onClick={() => router.push("/")}
              >
                HelloQuip
              </h1>
            </div>

            {/* Search Bar - Desktop */}
            {showSearch && (
              <div className="flex-1 hidden md:block max-w-4xl mx-8">
                <SearchBar />
              </div>
            )}

            {/* User Actions */}
            <div className="flex items-center gap-0 relative" ref={dropdownRef}>
              {/* Notifications */}
              <button className="relative text-gray-600 hover:text-blue-600 focus:outline-none p-2 hover:bg-blue-50 rounded-lg transition-colors">
                <BellIcon className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Cart Icon */}
              {user && cartCount > 0 && (
                <button
                  onClick={() => router.push("/order")}
                  className="relative text-gray-600 hover:text-blue-600 focus:outline-none p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="View cart"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">
                    {cartCount}
                  </span>
                </button>
              )}

              {/* Message Icon */}
              {user && unreadMessages > 0 && (
                <button
                  onClick={() => router.push("/messenger")}
                  className="relative text-gray-600 hover:text-blue-600 focus:outline-none p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="View messages"
                >
                  <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
                  <span className="absolute top-1 right-1 bg-green-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">
                    {unreadMessages}
                  </span>
                </button>
              )}

              {/* User Avatar or Sign In */}
              {user ? (
                <>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <img
                      src={user.photoURL || "/default-avatar.png"}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="hidden lg:block text-sm font-medium text-gray-700">
                      {user.displayName || "User"}
                    </span>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.photoURL || "/default-avatar.png"}
                            alt="User"
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {user.displayName || "User"}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            router.push("/account");
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          Account Details
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            router.push("/order");
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          My Orders
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => router.push("/register")}
                  className="bg-blue-600 text-white hover:bg-blue-700 transition-colors px-4 py-2 text-sm rounded-lg font-medium"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Search Bar - Mobile */}
          {showSearch && (
            <div className="block md:hidden mt-1">
              <SearchBar />
            </div>
          )}
        </div>
      </header>
    </>
  );
}
