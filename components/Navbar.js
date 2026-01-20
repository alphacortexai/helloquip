"use client";

import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import SearchBar from "@/components/SearchBar";
import CachedLogo from "@/components/CachedLogo";
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc, getDocs } from "firebase/firestore";
import { ShoppingCartIcon, ChatBubbleLeftEllipsisIcon, BellIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
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

  // Listen for unread messages sent to this user (exclude system/notification)
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
        if (
          data.to === user.uid &&
          !data.read &&
          data.type !== "system" &&
          data.type !== "notification"
        ) {
          count++;
        }
      });
      setUnreadMessages(count);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen for notifications (system/notification messages addressed to user)
  useEffect(() => {
    if (!user) {
      setNotifications(0);
      setNotificationItems([]);
      return;
    }
    const qNotifs = query(
      collection(db, "messages"),
      where("to", "==", user.uid),
      where("type", "in", ["system", "notification"]) // Firestore 'in' supports up to 10 values
    );
    const unsubscribe = onSnapshot(qNotifs, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const unread = items.filter((i) => !i.read).length;
      setNotificationItems(items.sort((a,b) => (a.timestamp?.toMillis?.()||0) - (b.timestamp?.toMillis?.()||0)).reverse());
      setNotifications(unread);
    });
    return () => unsubscribe();
  }, [user]);

  // Mark notifications as read when dropdown opens
  useEffect(() => {
    const markRead = async () => {
      if (!user || !openNotifications) return;
      const unread = notificationItems.filter((n) => !n.read);
      for (const n of unread) {
        try {
          // Mark as read in messages collection
          await updateDoc(doc(db, "messages", n.id), { read: true });
          
          // Also mark as read in notifications collection if it exists
          // We need to find the corresponding notification by messageId
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
            console.log("✅ Synced read status to notifications collection:", notificationDoc.id);
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
      <header className="bg-white fixed top-0 left-0 right-0 z-[100] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <CachedLogo
                variant="default"
                className="h-12 md:h-14 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => router.push("/")}
                priority={true}
              />
            </div>

            {/* Search Bar - Desktop */}
            {showSearch && (
              <div className="flex-1 hidden md:block max-w-4xl mx-8">
                <SearchBar />
              </div>
            )}

            {/* User Actions */}
            <div className="flex items-center gap-0 relative" ref={dropdownRef}>
              {/* Notifications - only when logged in */}
              {user && (
                <>
                  <button onClick={() => setOpenNotifications((o) => !o)} className="relative text-gray-600 hover:text-[#2e4493] focus:outline-none p-2 hover:bg-[#e5f3fa] rounded-lg transition-colors" aria-label="Notifications">
                    <BellIcon className="h-6 w-6" />
                    {notifications > 0 && (
                      <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">
                        {notifications}
                      </span>
                    )}
                  </button>
                  {openNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-auto">
                      <div className="p-3 border-b border-gray-100 font-semibold">Notifications</div>
                      {notificationItems.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">No notifications</div>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {notificationItems.slice(0,20).map((n) => (
                            <li key={n.id} className="p-3 text-sm">
                              <button
                                className="text-left w-full"
                                onClick={() => {
                                  setOpenNotifications(false);
                                  const target = n.target || (n.orderId ? `/order/${n.orderId}` : "/order?tab=submitted");
                                  router.push(target);
                                }}
                              >
                                <p className="font-medium text-gray-800">{n.title || 'Update'}</p>
                                <p className="text-gray-600">{n.text || n.body}</p>
                                {n.timestamp && (
                                  <p className="text-xs text-gray-400 mt-1">{new Date(n.timestamp.toMillis()).toLocaleString()}</p>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Cart Icon */}
              {user && cartCount > 0 && (
                <button
                  onClick={() => router.push("/order")}
                  className="relative text-gray-600 hover:text-[#2e4493] focus:outline-none p-2 hover:bg-[#e5f3fa] rounded-lg transition-colors"
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
                  className="relative text-gray-600 hover:text-[#2e4493] focus:outline-none p-2 hover:bg-[#e5f3fa] rounded-lg transition-colors"
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
                    className="flex items-center gap-2 p-2 hover:bg-[#e5f3fa] rounded-lg transition-colors"
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
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#e5f3fa] hover:text-[#2e4493] rounded-lg transition-colors"
                        >
                          Account Details
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            router.push("/dashboard");
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#e5f3fa] hover:text-[#2e4493] rounded-lg transition-colors"
                        >
                          My Dashboard
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            router.push("/order");
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#e5f3fa] hover:text-[#2e4493] rounded-lg transition-colors"
                        >
                          My Orders
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            router.push("/wishlist");
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#e5f3fa] hover:text-[#2e4493] rounded-lg transition-colors"
                        >
                          My Wishlist
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            router.push("/compare");
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#e5f3fa] hover:text-[#2e4493] rounded-lg transition-colors"
                        >
                          Compare Products
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            router.push("/agent-chat");
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#e5f3fa] hover:text-[#2e4493] rounded-lg transition-colors"
                        >
                          Customer Service Chat
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
                  className="bg-[#0865ff] text-white hover:bg-[#075ae6] transition-colors px-4 py-2 text-sm rounded-full font-medium"
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
