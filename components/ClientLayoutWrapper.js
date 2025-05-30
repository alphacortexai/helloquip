// "use client";

// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import { usePathname, useRouter } from "next/navigation";
// import { Toaster } from "sonner";
// import { useEffect, useState } from "react";
// import { onAuthStateChanged, getAuth } from "firebase/auth";

// export default function ClientLayoutWrapper({ children }) {
//   const pathname = usePathname();
//   const router = useRouter();

//   const hideNavbarOn = ["/register", "/login"];
//   const hideFooterOn = ["/order", "/categories", "/register", "/messenger", "/account", "/admin"];

//   // Define paths where the mobile nav should be hidden
//   const hideMobileNavOn = ["/admin", "/login", "/register"];

//   const showNavbar = !hideNavbarOn.includes(pathname);
//   const showFooter = !hideFooterOn.includes(pathname);
//   const auth = getAuth();

//   const [user, setUser] = useState(null);
//   const [orderCount, setOrderCount] = useState(0);

//   const showMobileNav = user && !hideMobileNavOn.includes(pathname);

//   const navItems = [
//     { label: "Home", href: "/", icon: "M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6H5v-6h6z" },
//     { label: "Categories", href: "/categories", icon: "M4 6h16M4 12h16M4 18h16" },
//     { label: "Messenger", href: "/messenger", icon: "M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" },
//     { label: "Orders", href: "/order", icon: "M3 3h18v2H3V3zm2 4h14l1.6 9.59a2 2 0 01-2 2.41H7.4a2 2 0 01-2-2.41L7 7z" },
//     { label: "My Account", href: "/account", icon: "M5.121 17.804A8.002 8.002 0 0112 15a8.002 8.002 0 016.879 2.804M12 7a4 4 0 100 8 4 4 0 000-8z" },
//   ];

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, [auth]);

//   useEffect(() => {
//     const storedItems = JSON.parse(localStorage.getItem("orderItems") || "[]");
//     setOrderCount(storedItems.length);
//   }, []);

//   return (
//     <>
//       {showNavbar && <Navbar />}
//       <main>{children}</main>
//       <Toaster richColors position="top-center" />

//       {/* Mobile Bottom Navigation */}
//       {showMobileNav && (
//         <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t border-gray-200 z-50">
//           <div className="flex justify-between items-center px-4 py-2 text-xs text-gray-600">
//             {navItems.map((item, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => router.push(item.href)}
//                 className={`relative flex flex-col items-center flex-1 hover:text-blue-500 ${
//                   pathname === item.href ? "text-blue-600 font-medium" : ""
//                 }`}
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-6 w-6 mb-1"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d={item.icon}
//                   />
//                 </svg>
//                 {item.label}
//                 {item.label === "Orders" && orderCount > 0 && (
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
import { collection, onSnapshot, query, where } from "firebase/firestore";
// import { db } from "@/firebase";  // Make sure you import your Firestore db instance
import { db } from "@/lib/firebase";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const hideNavbarOn = ["/register", "/login"];
  const hideFooterOn = ["/order", "/categories", "/register", "/messenger", "/account", "/admin"];
  const hideMobileNavOn = ["/admin", "/login", "/register"];

  const showNavbar = !hideNavbarOn.includes(pathname);
  const showFooter = !hideFooterOn.includes(pathname);
  const auth = getAuth();

  const [user, setUser] = useState(null);
  const [orderCount, setOrderCount] = useState(0);

  const showMobileNav = user && !hideMobileNavOn.includes(pathname);

  const navItems = [
    { label: "Home", href: "/", icon: "M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6H5v-6h6z" },
    { label: "Categories", href: "/categories", icon: "M4 6h16M4 12h16M4 18h16" },
    { label: "Messenger", href: "/messenger", icon: "M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" },
    { label: "Orders", href: "/order", icon: "M3 3h18v2H3V3zm2 4h14l1.6 9.59a2 2 0 01-2 2.41H7.4a2 2 0 01-2-2.41L7 7z" },
    { label: "My Account", href: "/account", icon: "M5.121 17.804A8.002 8.002 0 0112 15a8.002 8.002 0 016.879 2.804M12 7a4 4 0 100 8 4 4 0 000-8z" },
  ];

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  // Listen for real-time updates on orders for the current user
  // useEffect(() => {
  //   if (!user) {
  //     setOrderCount(0);
  //     return;
  //   }

  //   // Reference to the user's orders collection (adjust this to your Firestore structure)
  //   // For example, if your orders are in a collection "orders" and each order has a userId field:
  //   const ordersRef = collection(db, "orders");
  //   const q = query(ordersRef, where("userId", "==", user.uid));

  //   const unsubscribe = onSnapshot(q, (snapshot) => {
  //     setOrderCount(snapshot.size);
  //   });

  //   return () => unsubscribe();
  // }, [user]);
  // Listen for real-time updates on cart items for the current user
  useEffect(() => {
    if (!user) {
      setOrderCount(0);
      return;
    }

    // Reference to the user's cart items subcollection
    const itemsRef = collection(db, "carts", user.uid, "items");

    const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
      setOrderCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [user]);


  return (
    <>
      {showNavbar && <Navbar />}
      <main>{children}</main>
      <Toaster richColors position="top-center" />

      {/* Mobile Bottom Navigation */}
      {showMobileNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t border-gray-200 z-50">
          <div className="flex justify-between items-center px-4 py-2 text-xs text-gray-600">
            {navItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => router.push(item.href)}
                className={`relative flex flex-col items-center flex-1 hover:text-blue-500 ${
                  pathname === item.href ? "text-blue-600 font-medium" : ""
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mb-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
                {item.label === "Orders" && orderCount > 0 && (
                  <span className="absolute top-0 right-3 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {orderCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>
      )}

      {showFooter && <Footer />}
    </>
  );
}
