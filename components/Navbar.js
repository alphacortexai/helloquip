// export default function Navbar() {
//   return (
//     <header className="bg-white shadow sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
//         <h1 className="text-2xl font-extrabold text-blue-700">HelloQuip</h1>
//         <button className="text-gray-700 hover:text-blue-600">
//           <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//               d="M5.121 17.804A8.002 8.002 0 0112 15a8.002 8.002 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//           </svg>
//         </button>
//       </div>
//     </header>
//   );
// }





// "use client";

// import { useEffect, useState } from "react";
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { useRouter } from "next/navigation";
// import { auth } from "@/lib/firebase"; // or relative path: '../../lib/firebase'




// console.log("AUTH INSTANCE:", auth); // 👈 Add this


// export default function Navbar() {
//   const router = useRouter();
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });

//     return () => unsubscribe();
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
//     <header className="bg-white shadow sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
//         <h1 className="text-2xl font-extrabold text-blue-700">HelloQuip</h1>

//         {user ? (
//           <div className="flex items-center gap-4">
//             {user.photoURL && (
//               <img
//                 src={user.photoURL}
//                 alt="User Avatar"
//                 className="w-8 h-8 rounded-full"
//               />
//             )}
//             <span className="text-sm text-gray-700">
//               {user.displayName || user.email}
//             </span>
//             <button
//               onClick={handleLogout}
//               className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
//             >
//               Sign Out
//             </button>
//           </div>
//         ) : (
//           <button
//             onClick={() => router.push("/register")}
//             className="text-blue-600 hover:underline text-sm"
//           >
//             Sign In
//           </button>
//         )}
//       </div>
//     </header>
//   );
// }





"use client";

import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

import SearchBar from "@/components/SearchBar";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
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
      {/* Navbar */}
      {/* <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-blue-700">HelloQuip</h1>
          <div>
               <SearchBar />
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <img
                src={user.photoURL || "/default-avatar.png"}
                alt="Avatar"
                className="w-8 h-8 rounded-full cursor-pointer"
                onClick={() => setMenuOpen(true)}
              />
              <button
                onClick={() => setMenuOpen(true)}
                className="text-gray-700 text-2xl focus:outline-none"
              >
                ⋮
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/register")}
              className="text-blue-600 hover:underline text-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </header> */}

      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-blue-700">HelloQuip</h1>
          </div>

          {/* Search Bar - Visible on sm and up */}
          <div className="flex-1 hidden sm:block">
            <SearchBar />
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <img
                  src={user.photoURL || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full cursor-pointer"
                  onClick={() => setMenuOpen(true)}
                />
                <button
                  onClick={() => setMenuOpen(true)}
                  className="text-gray-700 text-2xl focus:outline-none"
                >
                  ⋮
                </button>
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
      {/* Search bar on small screens */}
      <div className="block sm:hidden px-4 pb-2">
        <SearchBar />
      </div>
    </header>


      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-lg font-semibold">Account</h2>
          <button
            className="text-gray-500 text-2xl"
            onClick={() => setMenuOpen(false)}
          >
            &times;
          </button>
        </div>

        <div className="p-4">
          {user ? (
            <>
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={user.photoURL || "/default-avatar.png"}
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    {user.displayName || "User"}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
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
                className="w-full text-left py-2 mt-2 text-sm text-red-600 hover:underline"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/register");
              }}
              className="w-full py-2 text-sm text-blue-600 hover:underline"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </>
  );
}
