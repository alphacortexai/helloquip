// "use client";

// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import { usePathname, useRouter } from "next/navigation";
// import { Toaster } from "sonner";
// import { useEffect, useState } from "react";
// import { onAuthStateChanged, getAuth } from "firebase/auth";
// import { collection, onSnapshot } from "firebase/firestore";
// import { db } from "@/lib/firebase";

// // Import Heroicons React components
// import {
//   HomeIcon,
//   Squares2X2Icon,
//   ChatBubbleLeftEllipsisIcon,
//   ShoppingBagIcon,
//   UserCircleIcon,
// } from "@heroicons/react/24/outline";

// export default function ClientLayoutWrapper({ children }) {
//   const pathname = usePathname();
//   const router = useRouter();

//   const hideNavbarOn = ["/register", "/login", "/messenger"];
//   const hideFooterOn = ["/order", "/categories", "/register", "/messenger", "/account", "/admin"];
//   const hideMobileNavOn = ["/admin", "/login", "/register", "/messenger"];

//   const showNavbar = !hideNavbarOn.includes(pathname);
//   const showFooter = !hideFooterOn.includes(pathname);
//   const auth = getAuth();

//   const [user, setUser] = useState(null);
//   const [orderCount, setOrderCount] = useState(0);

//   const showMobileNav = user && !hideMobileNavOn.includes(pathname);

//   // Replace icons with Heroicons components
//   const navItems = [
//     { label: "Home", href: "/", Icon: HomeIcon },
//     { label: "Categories", href: "/categories", Icon: Squares2X2Icon },
//     { label: "Messenger", href: "/messenger", Icon: ChatBubbleLeftEllipsisIcon },
//     { label: "Orders", href: "/order", Icon: ShoppingBagIcon },
//     { label: "My Account", href: "/account", Icon: UserCircleIcon },
//   ];

//   // Auth listener
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, [auth]);

//   // Cart items count listener
//   useEffect(() => {
//     if (!user) {
//       setOrderCount(0);
//       return;
//     }

//     const itemsRef = collection(db, "carts", user.uid, "items");

//     const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
//       setOrderCount(snapshot.size);
//     });

//     return () => unsubscribe();
//   }, [user]);

//   return (
//     <>
//       {showNavbar && <Navbar />}
//       <main>{children}</main>
//       <Toaster richColors position="top-center" />

//       {/* Mobile Bottom Navigation */}
//       {showMobileNav && (
//         <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t border-gray-200 z-50">
//           <div className="flex justify-between items-center px-4 py-2 text-xs text-gray-600">
//             {navItems.map(({ label, href, Icon }, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => router.push(href)}
//                 className={`relative flex flex-col items-center flex-1 hover:text-blue-500 ${
//                   pathname === href ? "text-blue-600 font-medium" : ""
//                 }`}
//               >
//                 <Icon className="h-6 w-6 mb-1" aria-hidden="true" />
//                 {label}
//                 {label === "Orders" && orderCount > 0 && (
//                   <span className="absolute top-0 right-3 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
//                     {orderCount}
//                   </span>
//                 )}
//               </button>
//             ))}
//           </div>
//         </nav>
//       )}

//       {showFooter && <Footer />}
//     </>
//   );
// }







"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Import Heroicons React components
import {
  HomeIcon,
  Squares2X2Icon,
  ChatBubbleLeftEllipsisIcon,
  ShoppingCartIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const hideNavbarOn = ["/register", "/login", "/messenger", "/admin"];
  const hideFooterOn = ["/order", "/categories", "/register", "/messenger", "/account", "/admin", "/admin/chat"];
  const hideMobileNavOn = ["/admin", "/login", "/register", "/messenger"];

  const showNavbar = !hideNavbarOn.includes(pathname) && !pathname.startsWith('/admin');
  const showFooter = !hideFooterOn.includes(pathname) && !pathname.startsWith('/admin');
  const auth = getAuth();

  const [user, setUser] = useState(null);
  const [orderCount, setOrderCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const showMobileNav = user && !hideMobileNavOn.includes(pathname) && !pathname.startsWith('/admin');

  const navItems = [
    { label: "Home", href: "/", icon: HomeIcon },
    { label: "Categories", href: "/categories", icon: Squares2X2Icon },
    { label: "Messenger", href: "/messenger", icon: ChatBubbleLeftEllipsisIcon },
    { label: "Orders", href: "/order", icon: ShoppingCartIcon },
    { label: "My Account", href: "/account", icon: UserCircleIcon },
  ];

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  // Listen for real-time updates on cart items for the current user
  useEffect(() => {
    if (!user) {
      setOrderCount(0);
      return;
    }
    const itemsRef = collection(db, "carts", user.uid, "items");
    const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
      setOrderCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for unread messages count for the current user (exclude system/notification)
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

  // --- Scroll position save/restore across navigations ---
  // Prefer manual scroll restoration to avoid browser default conflicts
  useEffect(() => {
    if (typeof window === 'undefined' || !('scrollRestoration' in window.history)) return;
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      try { window.history.scrollRestoration = prev; } catch {}
    };
  }, []);
  // Save current scroll position for the current pathname
  useEffect(() => {
    const saveScrollPosition = () => {
      try {
        sessionStorage.setItem(`scroll:${pathname}`, String(window.scrollY));
      } catch {}
    };

    // Save on unload and when this component unmounts or pathname changes
    window.addEventListener('beforeunload', saveScrollPosition);
    return () => {
      saveScrollPosition();
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, [pathname]);

  // Restore saved scroll position when mounting a pathname
  useEffect(() => {
    // If a previous navigation requested forcing scroll to top (e.g., after login), do that and skip restoration
    try {
      const forceTop = sessionStorage.getItem('forceScrollTop');
      if (forceTop === '1') {
        sessionStorage.removeItem('forceScrollTop');
        window.scrollTo(0, 0);
        return;
      }
    } catch {}

    // If URL has a hash, try to scroll to the anchor element first (precise restore)
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const id = hash.slice(1);
      const tryAnchor = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ block: 'center' });
          return true;
        }
        return false;
      };
      // Try a few times to account for async content
      const tries = [0, 80, 180, 350, 600, 1000];
      let done = false;
      const timers = tries.map((ms) => setTimeout(() => {
        if (!done && tryAnchor()) done = true;
      }, ms));
      return () => timers.forEach(clearTimeout);
    }

    // Fallback to numeric scroll position restore
    const key = `scroll:${pathname}`;
    const raw = (() => { try { return sessionStorage.getItem(key); } catch { return null; } })();
    const targetY = raw ? parseInt(raw, 10) : 0;
    if (Number.isNaN(targetY) || targetY <= 0) {
      // No saved position: ensure we start at the very top
      window.scrollTo(0, 0);
      return;
    }

    const attempts = [0, 80, 160, 300, 500, 800, 1200, 1600, 2200, 3000, 4000, 5000];
    let cancelled = false;
    const tryScroll = (y) => {
      if (cancelled) return;
      if (Math.abs(window.scrollY - y) > 4) window.scrollTo(0, y);
    };
    const timers = attempts.map((ms) => setTimeout(() => tryScroll(targetY), ms));
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [pathname]);





  return (
    <>
      {showNavbar && <Navbar />}
      {/* Spacer for fixed navbar height so content isn't hidden (mobile has taller header with search) */}
      {showNavbar && <div className="h-[96px] md:h-[72px]"></div>}
      <main>
        {/* Suppress global LoadingScreen when returning from a product page */}
        {(() => {
          try {
            const returning = sessionStorage.getItem('returnFromProduct') === '1';
            if (returning) {
              sessionStorage.removeItem('returnFromProduct');
              // Render children directly (LoadingScreen logic inside pages should check this too)
              return children;
            }
          } catch {}
          return children;
        })()}
      </main>
      <Toaster richColors position="top-center" />

      {/* Mobile Bottom Navigation */}
      {showMobileNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t border-gray-200 z-100 md:hidden">
          <div className="flex justify-between items-center px-4 py-4 text-xs text-gray-600">
            {navItems.map(({ label, href, icon: Icon }, idx) => (
              <button
                key={idx}
                onClick={() => router.push(href)}
                className={`relative flex flex-col items-center flex-1 hover:text-blue-500 ${
                  pathname === href ? "text-blue-600 font-medium" : ""
                }`}
              >
                <Icon className="h-6 w-6 mb-1" aria-hidden="true" />
                {label}

                {/* Badge for Orders */}
                {label === "Orders" && orderCount > 0 && (
                  <span className="absolute top-0 right-3 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">
                    {orderCount}
                  </span>
                )}

                {/* Badge for Messenger */}
                {label === "Messenger" && unreadMessages > 0 && (
                  <span className="absolute top-0 right-3 bg-green-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">
                    {unreadMessages}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>
      )}

      {showFooter && <Footer />}
      {/* Mobile Footer Spacer - Always show on mobile when footer is hidden */}
      {!showFooter && (
        <div className="block md:hidden h-20"></div>
      )}
    </>
  );
}
