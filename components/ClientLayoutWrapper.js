// 'use client';

// import Navbar from '@/components/Navbar';
// import Footer from '@/components/Footer';
// import { usePathname } from "next/navigation";
// import { Toaster } from "sonner";

// export default function ClientLayoutWrapper({ children }) {
//   const pathname = usePathname();

//   const hideNavbarOn = ["/register", "/login"]; // add pages here

//   return (
//     <>
//        {!hideNavbarOn.includes(pathname) && <Navbar />}
//       <main>{children}</main>
//        <Toaster richColors position="top-center" />

//       {/* Bottom Nav */}
//       <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t border-gray-200 z-50">
//         <div className="flex justify-between items-center px-4 py-2 text-xs text-gray-600">
//           {[
//             { label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6H5v-6h6z" },
//             { label: "Categories", icon: "M4 6h16M4 12h16M4 18h16" },
//             { label: "Messenger", icon: "M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" },
//             { label: "Cart", icon: "M3 3h18v2H3V3zm2 4h14l1.6 9.59a2 2 0 01-2 2.41H7.4a2 2 0 01-2-2.41L7 7z" },
//             { label: "My Account", icon: "M5.121 17.804A8.002 8.002 0 0112 15a8.002 8.002 0 016.879 2.804M12 7a4 4 0 100 8 4 4 0 000-8z" },
//           ].map((item, idx) => (
//             <button key={idx} className="flex flex-col items-center flex-1 hover:text-blue-500">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
//               </svg>
//               {item.label}
//             </button>
//           ))}
//         </div>
//       </nav>

//       {!hideNavbarOn.includes(pathname) &&  <Footer />}
     
//     </>
//   );
// }

"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "sonner";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const hideNavbarOn = ["/register", "/login"];
  const hideFooterOn = ["/order", "/categories"];

  const showNavbar = !hideNavbarOn.includes(pathname);
  const showFooter = !hideFooterOn.includes(pathname);

  const navItems = [
    { label: "Home", href: "/", icon: "M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6H5v-6h6z" },
    { label: "Categories", href: "/categories", icon: "M4 6h16M4 12h16M4 18h16" },
    { label: "Messenger", href: "/messenger", icon: "M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" },
    { label: "Orders", href: "/order", icon: "M3 3h18v2H3V3zm2 4h14l1.6 9.59a2 2 0 01-2 2.41H7.4a2 2 0 01-2-2.41L7 7z" },
    { label: "My Account", href: "/account", icon: "M5.121 17.804A8.002 8.002 0 0112 15a8.002 8.002 0 016.879 2.804M12 7a4 4 0 100 8 4 4 0 000-8z" },
  ];

  return (
    <>
      {showNavbar && <Navbar />}
      
      <main>{children}</main>
      
      <Toaster richColors position="top-center" />

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t border-gray-200 z-50">
        <div className="flex justify-between items-center px-4 py-2 text-xs text-gray-600">
          {navItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center flex-1 hover:text-blue-500 ${
                pathname === item.href ? "text-blue-600 font-medium" : ""
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {showFooter && <Footer />}
    </>
  );
}
