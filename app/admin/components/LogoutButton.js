// // import { getAuth, signOut } from "firebase/auth";

// // function LogoutButton() {
// //   const auth = getAuth();
// //   const router = useRouter();

// //   const handleLogout = async () => {
// //     await signOut(auth);
// //     router.push("/admin/login");
// //   };

// //   return (
// //     <button
// //       onClick={handleLogout}
// //       className="bg-red-500 text-white px-3 py-1 rounded"
// //     >
// //       Logout
// //     </button>
// //   );
// // }

// "use client";

// import { getAuth, signOut } from "firebase/auth";

// function LogoutButton() {
//   const auth = getAuth();
//   const router = useRouter();

//   const handleLogout = async () => {
//     await signOut(auth);
//     router.push("/admin/login");
//   };

//   return (
//     <button
//       onClick={handleLogout}
//       className="bg-red-500 text-white px-3 py-1 rounded"
//     >
//       Logout
//     </button>
//   );
// }


"use client";

import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "@/lib/firebase"; // ensure this matches your Firebase config path

export default function LogoutButton() {
  const auth = getAuth(app);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded"
    >
      Logout
    </button>
  );
}
