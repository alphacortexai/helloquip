"use client";

import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth, db } from "@/lib/firebase";
import SearchBar from "@/components/SearchBar";
import CachedLogo from "@/components/CachedLogo";
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc, getDocs } from "firebase/firestore";
import { 
  ShoppingCartIcon, 
  ChatBubbleLeftEllipsisIcon, 
  BellIcon,
  HeartIcon,
  ArrowsRightLeftIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState(0);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notificationItems, setNotificationItems] = useState([]);
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

  // Listen for unread messages
  useEffect(() => {
    if (!user) {
      setUnreadMessages(0);
      return;
    }
    const qMsgs = collection(db, "messages");
    const unsubscribe = onSnapshot(qMsgs, (snapshot) => {
      let count = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.to === user.uid && !data.read && data.type !== "system" && data.type !== "notification") {
          count++;
        }
      });
      setUnreadMessages(count);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for notifications
  useEffect(() => {
    if (!user) {
      setNotifications(0);
      setNotificationItems([]);
      return;
    }
    const qNotifs = query(
      collection(db, "messages"),
      where("to", "==", user.uid),
      where("type", "in", ["system", "notification"])
    );
    const unsubscribe = onSnapshot(qNotifs, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const unread = items.filter((i) => !i.read).length;
      setNotificationItems(items.sort((a,b) => (a.timestamp?.toMillis?.()||0) - (b.timestamp?.toMillis?.()||0)).reverse());
      setNotifications(unread);
    });
    return () => unsubscribe();
  }, [user]);

  // Mark notifications as read
  useEffect(() => {
    const markRead = async () => {
      if (!user || !openNotifications) return;
      const unread = notificationItems.filter((n) => !n.read);
      for (const n of unread) {
        try {
          await updateDoc(doc(db, "messages", n.id), { read: true });
          const notificationsQuery = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid),
            where("messageId", "==", n.id)
          );
          const notificationsSnapshot = await getDocs(notificationsQuery);
          if (!notificationsSnapshot.empty) {
            const notificationDoc = notificationsSnapshot.docs[0];
            await updateDoc(doc(db, "notifications", notificationDoc.id), {
              read: true,
              readAt: new Date(),
            });
          }
        } catch (e) {
          console.warn("Failed to mark notification read", e);
        }
      }
    };
    markRead();
  }, [openNotifications, user, notificationItems]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
        setOpenNotifications(false);
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
    <header className="sticky top-0 z-[100] bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <CachedLogo
                  variant="default"
                  className="h-full w-auto cursor-pointer hover:opacity-80 transition-opacity"
                  priority={true}
                />
              </div>
              <span className="text-xl md:text-2xl font-bold text-[#2e4493] tracking-tight hidden sm:block">
                Heloquip
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="w-full">
                <SearchBar />
              </div>
            </div>
          )}

          {/* Desktop Navigation Actions */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {/* Notifications */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setOpenNotifications(!openNotifications)} 
                className="text-gray-600 hover:text-[#2e4493] transition-colors p-2 rounded-full hover:bg-gray-50 relative group"
              >
                <BellIcon className="w-6 h-6" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              {openNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-50 font-bold text-gray-900">Notifications</div>
                  <div className="max-h-80 overflow-y-auto">
                    {notificationItems.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500 text-center">No notifications</div>
                    ) : (
                      <ul className="divide-y divide-gray-50">
                        {notificationItems.slice(0, 10).map((n) => (
                          <li key={n.id} className="hover:bg-gray-50 transition-colors">
                            <button
                              className="text-left w-full p-4"
                              onClick={() => {
                                setOpenNotifications(false);
                                const target = n.target || (n.orderId ? `/order/${n.orderId}` : "/order?tab=submitted");
                                router.push(target);
                              }}
                            >
                              <p className="font-semibold text-sm text-gray-800">{n.title || 'Update'}</p>
                              <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.text || n.body}</p>
                              {n.timestamp && (
                                <p className="text-[10px] text-gray-400 mt-1">{new Date(n.timestamp.toMillis()).toLocaleString()}</p>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link href="/wishlist" className="text-gray-600 hover:text-[#2e4493] transition-colors p-2 rounded-full hover:bg-gray-50 relative group">
              <HeartIcon className="w-6 h-6" />
            </Link>
            
            <Link href="/compare" className="text-gray-600 hover:text-[#2e4493] transition-colors p-2 rounded-full hover:bg-gray-50 relative group">
              <ArrowsRightLeftIcon className="w-6 h-6" />
            </Link>

            <Link href="/order" className="text-gray-600 hover:text-[#2e4493] transition-colors p-2 rounded-full hover:bg-gray-50 relative group">
              <ShoppingCartIcon className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                    <img
                      src={user.photoURL || "/default-avatar.png"}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 hidden lg:block">
                    {user.displayName?.split(' ')[0] || "Account"}
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || "User"}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/dashboard" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#2e4493] transition-colors">
                        My Dashboard
                      </Link>
                      <Link href="/order" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#2e4493] transition-colors">
                        My Orders
                      </Link>
                      <Link href="/wishlist" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#2e4493] transition-colors">
                        My Wishlist
                      </Link>
                      <Link href="/agent-chat" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#2e4493] transition-colors">
                        AI Agent Chat
                      </Link>
                    </div>
                    <div className="border-t border-gray-50 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/register"
                className="bg-[#2e4493] text-white hover:bg-[#1a2a5e] transition-all px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg active:scale-95"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Buttons */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {showMobileSearch && (
          <div className="md:hidden pb-4 px-2">
            <SearchBar />
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-inner py-4 px-4 space-y-4">
          <nav className="flex flex-col space-y-3">
            <Link href="/" className="text-gray-700 font-medium py-2 border-b border-gray-50">Home</Link>
            <Link href="/categories" className="text-gray-700 font-medium py-2 border-b border-gray-50">Categories</Link>
            <Link href="/order" className="text-gray-700 font-medium py-2 border-b border-gray-50">My Orders</Link>
            <Link href="/wishlist" className="text-gray-700 font-medium py-2 border-b border-gray-50">Wishlist</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-700 font-medium py-2 border-b border-gray-50">Dashboard</Link>
                <button onClick={handleLogout} className="text-red-600 font-bold py-2 text-left">Sign Out</button>
              </>
            ) : (
              <Link href="/register" className="bg-[#2e4493] text-white text-center py-3 rounded-xl font-bold">Sign In / Register</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
