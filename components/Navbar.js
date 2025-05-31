// "use client";

// import { useEffect, useState, useRef } from "react";
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { useRouter, usePathname } from "next/navigation";
// import { auth } from "@/lib/firebase";
// import SearchBar from "@/components/SearchBar";

// export default function Navbar() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [user, setUser] = useState(null);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const dropdownRef = useRef();

//   const showSearch = ["/category", "/shop", "/search"].some((path) =>
//     pathname.startsWith(path)
//   ) || pathname === "/";

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   // Close dropdown if clicked outside
//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setMenuOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       router.push("/register");
//     } catch (error) {
//       console.error("Logout error", error.message);
//     }
//   };

//   return (
//     <>
//       <header className="bg-white shadow sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
//           {/* Logo */}
//           <div className="flex items-center gap-2">
//             <h1 className="text-2xl font-extrabold text-blue-700">HelloQuip</h1>
//           </div>

//           {/* Search Bar - Visible on sm and up */}
//           {showSearch && (
//             <div className="flex-1 hidden sm:block">
//               <SearchBar />
//             </div>
//           )}

//           {/* User Actions */}
//           <div className="flex items-center gap-3 relative" ref={dropdownRef}>
//             {user ? (
//               <>
//                 <img
//                   src={user.photoURL || "/default-avatar.png"}
//                   alt="Avatar"
//                   className="w-8 h-8 rounded-full cursor-pointer"
//                   onClick={() => setMenuOpen(!menuOpen)}
//                 />

//                 {menuOpen && (
//                   <div className="absolute right-0 mt-52 w-50 bg-gray-100 rounded-xl z-50 p-4 shadow-lg">
//                     <div className="flex items-center space-x-3 mb-3">
//                       <img
//                         src={user.photoURL || "/default-avatar.png"}
//                         alt="User"
//                         className="w-10 h-10 rounded-full"
//                       />
//                       <div>
//                         <p className="font-semibold text-gray-800">
//                           {user.displayName || "User"}
//                         </p>
//                         <p className="text-sm text-gray-500 truncate overflow-hidden whitespace-nowrap max-w-[100px]">
//                           {user.email}
//                         </p>
//                       </div>
//                     </div>

//                     <button
//                       onClick={() => {
//                         setMenuOpen(false);
//                         router.push("/account");
//                       }}
//                       className="w-full text-left py-2 text-sm text-blue-600 hover:underline"
//                     >
//                       Account Details
//                     </button>

//                     <button
//                       onClick={handleLogout}
//                       className="w-full text-left py-2 mt-1 text-sm text-red-600 hover:underline"
//                     >
//                       Sign Out
//                     </button>
//                   </div>
//                 )}

//               </>
//             ) : (
//               <button
//                 onClick={() => router.push("/register")}
//                 className="text-blue-600 hover:underline text-sm"
//               >
//                 Sign In
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Search Bar - Visible on small screens */}
//         {showSearch && (
//           <div className="block sm:hidden px-4 pb-2">
//             <SearchBar />
//           </div>
//         )}
//       </header>
//     </>
//   );
// }




"use client";

import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import SearchBar from "@/components/SearchBar";
import { collection, onSnapshot } from "firebase/firestore";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef();

  const showSearch = ["/category", "/shop", "/search"].some((path) =>
    pathname.startsWith(path)
  ) || pathname === "/";

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
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-blue-700 cursor-pointer" onClick={() => router.push('/')}>HelloQuip</h1>
          </div>

          {/* Search Bar - Visible on sm and up */}
          {showSearch && (
            <div className="flex-1 hidden sm:block">
              <SearchBar />
            </div>
          )}

          {/* User Actions */}
          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            {/* Cart Icon */}
            {user && (
              <button
                onClick={() => router.push("/order")}
                className="relative text-gray-600 hover:text-blue-600 focus:outline-none"
                aria-label="View cart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.2 6M17 13l1.2 6M6 19a2 2 0 11-4 0 2 2 0 014 0zm13 0a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* User Avatar or Sign In */}
            {user ? (
              <>
                <img
                  src={user.photoURL || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full cursor-pointer"
                  onClick={() => setMenuOpen(!menuOpen)}
                />

                {menuOpen && (
                  <div className="absolute right-0 mt-52 w-50 bg-gray-100 rounded-xl z-50 p-4 shadow-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={user.photoURL || "/default-avatar.png"}
                        alt="User"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {user.displayName || "User"}
                        </p>
                        <p className="text-sm text-gray-500 truncate overflow-hidden whitespace-nowrap max-w-[100px]">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        router.push("/account");
                      }}
                      className="w-full text-left py-2 text-sm text-blue-600 hover:underline"
                    >
                      Account Details
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left py-2 mt-1 text-sm text-red-600 hover:underline"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => router.push("/register")}
                className="text-blue-600 hover:underline text-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Search Bar - Visible on small screens */}
        {showSearch && (
          <div className="block sm:hidden px-4 pb-2">
            <SearchBar />
          </div>
        )}
      </header>
    </>
  );
}
