// "use client";
// import { useEffect, useState } from "react";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { useRouter } from "next/navigation";
// import CategoryForm from "./components/CategoryForm";
// import CategoryList from "./components/CategoryList";
// import { app } from "@/lib/firebase";

// export default function CategoryDashboard() {
//   const [loading, setLoading] = useState(true);
//   const auth = getAuth(app);
//   const router = useRouter();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (!user) router.push("/admin/login");
//       else setLoading(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
//       {/* <CategoryForm /> */}
//       <CategoryList />
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import CategoryForm from "./components/CategoryForm";
import CategoryList from "./components/CategoryList";
import { app } from "@/lib/firebase";
import withAdminAuth from "../../utils/withAdminAuth"; // Adjust the path based on your file structure

function CategoryDashboard() {
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      {/* <CategoryForm /> */}
      <CategoryList />
    </div>
  );
}

export default withAdminAuth(CategoryDashboard);
