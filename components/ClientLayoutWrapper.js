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

  // Mobile bfcache support: save on pagehide, restore on pageshow (persisted)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePageHide = () => {
      try {
        sessionStorage.setItem(`scroll:${pathname}`, String(window.scrollY));
      } catch {}
    };

    const handlePageShow = (event) => {
      // Only apply on bfcache restores
      if (!event || !event.persisted) return;

      // If there's an anchor hash (e.g., #p-123), let page components perform precise restore
      const hash = window.location.hash;
      if (hash && hash.length > 1) return;

      // Numeric restoration for general pages
      const key = `scroll:${pathname}`;
      let raw = null;
      try { raw = sessionStorage.getItem(key); } catch {}
      const targetY = raw ? parseInt(raw, 10) : 0;
      if (!Number.isFinite(targetY) || targetY <= 0) return;

      // Account for fixed header height on mobile
      let headerOffset = 0;
      try {
        const header = document.querySelector('header');
        headerOffset = header ? header.offsetHeight : 0;
      } catch {}

      const attempts = [0, 80, 160, 300, 500, 800, 1200, 1800];
      let cancelled = false;
      const timers = attempts.map((ms) => setTimeout(() => {
        if (cancelled) return;
        const y = Math.max(0, targetY - Math.max(headerOffset, 80));
        window.scrollTo(0, y);
      }, ms));
      const cleanup = () => { cancelled = true; timers.forEach(clearTimeout); };
      // Auto-clean after last attempt
      setTimeout(() => {
        cleanup();
      }, Math.max(...attempts) + 200);
    };

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [pathname]);

  // Restore via explicit saved numeric position when returning from product (back navigation) - Home only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname !== '/') return;
    const tryNumericRestore = () => {
      let raw = null;
      try { raw = sessionStorage.getItem('restoreScrollY'); } catch {}
      const y = raw ? parseInt(raw, 10) : NaN;
      if (!Number.isFinite(y) || y <= 0) return;
      // Clear it immediately to avoid future unintended restores
      try { sessionStorage.removeItem('restoreScrollY'); } catch {}

      const attempts = [0, 80, 160, 300, 500, 800, 1200, 1800];
      let cancelled = false;
      const timers = attempts.map((ms) => setTimeout(() => {
        if (cancelled) return;
        window.scrollTo(0, y);
      }, ms));
      setTimeout(() => {
        cancelled = true;
        timers.forEach(clearTimeout);
      }, Math.max(...attempts) + 600);
    };

    // On mount of Home, attempt numeric restore once
    tryNumericRestore();
  }, [pathname]);

  // Restore saved scroll position when mounting a pathname
  useEffect(() => {

    // If URL has a hash, try to scroll to the anchor element first (precise restore)
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const id = hash.slice(1);
      const tryAnchor = () => {
        const el = document.getElementById(id);
        if (el) {
          // Prefer a precise scroll that accounts for fixed headers on mobile
          try {
            const rect = el.getBoundingClientRect();
            const header = document.querySelector('header');
            const headerHeight = header ? header.offsetHeight : 0;
            const currentY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            const y = rect.top + currentY - Math.max(headerHeight, 80);
            const scrollingElement = document.scrollingElement || document.documentElement || document.body;
            requestAnimationFrame(() => {
              try { window.scrollTo({ top: y, left: 0, behavior: 'auto' }); } catch {}
              try { scrollingElement.scrollTop = y; } catch {}
              try { document.documentElement.scrollTop = y; } catch {}
              try { document.body.scrollTop = y; } catch {}
            });
          } catch {
            try { el.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch {}
          }
          return true;
        }
        return false;
      };
      // Try multiple times (longer on mobile due to dynamic imports and images)
      const tries = [0, 120, 240, 400, 700, 1000, 1500, 2200, 3000, 4000, 5500];
      let done = false;
      const timers = tries.map((ms) => setTimeout(() => {
        if (!done && tryAnchor()) done = true;
      }, ms));

      // Fallback to numeric restoration if anchor not found after all tries
      const fallbackTimer = setTimeout(() => {
        if (!done) {
          const key = `scroll:${pathname}`;
          let raw = null;
          try { raw = sessionStorage.getItem(key); } catch {}
          const targetY = raw ? parseInt(raw, 10) : 0;
          if (Number.isFinite(targetY) && targetY > 0) {
            window.scrollTo(0, targetY);
          }
        }
      }, Math.max(...tries) + 200);

      return () => { timers.forEach(clearTimeout); clearTimeout(fallbackTimer); };
    }

    // Fallback to numeric scroll position restore
    const key = `scroll:${pathname}`;
    const raw = (() => { try { return sessionStorage.getItem(key); } catch { return null; } })();
    const targetY = raw ? parseInt(raw, 10) : 0;
    if (Number.isNaN(targetY) || targetY <= 0) {
      // Do not force top by default; let the page remain where it is
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

  // Listen for service worker navigation messages (for push notification clicks)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleServiceWorkerMessage = (event) => {
      if (event.data && event.data.type === 'NAVIGATE_TO') {
        const targetUrl = event.data.url;
        console.log('[ClientLayoutWrapper] Received navigation message from SW:', targetUrl);

        try {
          // Use Next.js router for client-side navigation
          router.push(targetUrl);
        } catch (error) {
          console.error('[ClientLayoutWrapper] Error navigating:', error);
          // Fallback to window.location
          window.location.href = targetUrl;
        }
      }
    };

    // Listen for messages from service worker
    window.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      window.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [router]);

  // Global hashchange precise scroll handler (mobile friendly) with gating after first success
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash.length <= 1) return;
      const id = hash.slice(1);
      const attempts = [0, 120, 240, 400, 650, 900, 1300, 1800];
      let done = false;
      const tryAnchor = () => {
        const el = document.getElementById(id);
        if (!el) return false;
        try {
          const header = document.querySelector('header');
          const headerHeight = header ? header.offsetHeight : 0;
          const rect = el.getBoundingClientRect();
          const currentY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          const y = rect.top + currentY - Math.max(headerHeight, 80);
          const scrollingElement = document.scrollingElement || document.documentElement || document.body;
          requestAnimationFrame(() => {
            try { window.scrollTo({ top: y, left: 0, behavior: 'auto' }); } catch {}
            try { scrollingElement.scrollTop = y; } catch {}
            try { document.documentElement.scrollTop = y; } catch {}
            try { document.body.scrollTop = y; } catch {}
          });
          setTimeout(() => {
            const near = Math.abs((window.pageYOffset || document.documentElement.scrollTop || 0) - y) < 2;
            if (!near) {
              try { el.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch {}
            }
          }, 60);
        } catch {}
        return true;
      };
      const timers = attempts.map((ms) => setTimeout(() => {
        if (done) return;
        if (tryAnchor()) done = true;
      }, ms));
      setTimeout(() => { timers.forEach(clearTimeout); }, Math.max(...attempts) + 300);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);





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
