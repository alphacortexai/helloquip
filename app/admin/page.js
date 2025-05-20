// "use client";

// import { useEffect, useState } from "react";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { useRouter } from "next/navigation";

// import ProductForm from "./components/ProductForm";
// import LogoutButton from "./components/LogoutButton";
// import CategoryForm from "@/components/CategoryForm";
// import CategoryList from "./components/CategoryList";
// import ShopForm from "./components/ShopForm";
// // You can create a ShopList component later for manage shops tab

// export default function AdminDashboard() {
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("createProduct");
//   const [currentAdminUid, setCurrentAdminUid] = useState(null); // Track current admin user UID

//   const router = useRouter();
//   const auth = getAuth();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (!user) {
//         router.push("/admin/login");
//       } else {
//         setCurrentAdminUid(user.uid); // Save current user UID here
//         setLoading(false);
//       }
//     });
//     return () => unsubscribe();
//   }, [auth, router]);

//   if (loading) return <p>Loading...</p>;

//   // Example callback if you want to refresh shop list or do something on shop creation
//   const refreshShopList = () => {
//     // Implement refresh logic if needed
//   };

//   return (
//     <div className="p-8 max-w-4xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Admin Dashboard</h1>
//         <LogoutButton />
//       </div>

//       {/* Tabs */}
//       <div className="mb-8 flex flex-wrap space-x-4 border-b">
//         <button
//           onClick={() => setActiveTab("createProduct")}
//           className={`py-2 px-4 -mb-px font-semibold border-b-2 ${
//             activeTab === "createProduct"
//               ? "border-blue-600 text-blue-600"
//               : "border-transparent text-gray-600 hover:text-blue-600"
//           }`}
//         >
//           Create Product
//         </button>

//         <button
//           onClick={() => setActiveTab("createCategory")}
//           className={`py-2 px-4 -mb-px font-semibold border-b-2 ${
//             activeTab === "createCategory"
//               ? "border-blue-600 text-blue-600"
//               : "border-transparent text-gray-600 hover:text-blue-600"
//           }`}
//         >
//           Create Category
//         </button>

//         <button
//           onClick={() => setActiveTab("manageCategories")}
//           className={`py-2 px-4 -mb-px font-semibold border-b-2 ${
//             activeTab === "manageCategories"
//               ? "border-blue-600 text-blue-600"
//               : "border-transparent text-gray-600 hover:text-blue-600"
//           }`}
//         >
//           Manage Categories
//         </button>

//         <button
//           onClick={() => setActiveTab("createShop")}
//           className={`py-2 px-4 -mb-px font-semibold border-b-2 ${
//             activeTab === "createShop"
//               ? "border-blue-600 text-blue-600"
//               : "border-transparent text-gray-600 hover:text-blue-600"
//           }`}
//         >
//           Create Shop
//         </button>

//         {/* Placeholder for Manage Shops tab */}
//         {/* <button
//           onClick={() => setActiveTab("manageShops")}
//           className={`py-2 px-4 -mb-px font-semibold border-b-2 ${
//             activeTab === "manageShops"
//               ? "border-blue-600 text-blue-600"
//               : "border-transparent text-gray-600 hover:text-blue-600"
//           }`}
//         >
//           Manage Shops
//         </button> */}
//       </div>

//       {/* Conditional Sections */}
//       {activeTab === "createProduct" && (
//         <section>
//           <h2 className="text-xl font-semibold mb-4">Create Product</h2>
//           <ProductForm />
//         </section>
//       )}

//       {activeTab === "createCategory" && (
//         <section>
//           <h2 className="text-xl font-semibold mb-4">Create Category</h2>
//           <CategoryForm />
//         </section>
//       )}

//       {activeTab === "manageCategories" && (
//         <section>
//           <h2 className="text-xl font-semibold mb-4">Manage Categories</h2>
//           <CategoryList />
//         </section>
//       )}

//       {activeTab === "createShop" && currentAdminUid && (
//         <section>
//           <h2 className="text-xl font-semibold mb-4">Create Shop</h2>
//           <ShopForm currentUserId={currentAdminUid} onShopCreated={refreshShopList} />
//         </section>
//       )}

//       {/* Uncomment and add ShopList component for managing shops */}
//       {/* {activeTab === "manageShops" && (
//         <section>
//           <h2 className="text-xl font-semibold mb-4">Manage Shops</h2>
//           <ShopList />
//         </section>
//       )} */}
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

import ProductForm from "./components/ProductForm";
import LogoutButton from "./components/LogoutButton";
import CategoryForm from "@/components/CategoryForm";
import CategoryList from "./components/CategoryList";
import ShopForm from "./components/ShopForm";
import TrendingProductSelector from "./components/TrendingProductSelector";
import TrendingProductList from "./components/TrendingProductList";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("createProduct");
  const [currentAdminUid, setCurrentAdminUid] = useState(null);

  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login");
      } else {
        setCurrentAdminUid(user.uid);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  if (loading) return <p>Loading...</p>;

  const refreshShopList = () => {
    // Implement refresh logic if needed
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <LogoutButton />
      </div>

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap space-x-4 border-b">
        <button
          onClick={() => setActiveTab("createProduct")}
          className={`py-2 px-4 -mb-px font-semibold border-b-2 ${
            activeTab === "createProduct"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-blue-600"
          }`}
        >
          Create Product
        </button>

        <button
          onClick={() => setActiveTab("createCategory")}
          className={`py-2 px-4 -mb-px font-semibold border-b-2 ${
            activeTab === "createCategory"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-blue-600"
          }`}
        >
          Create Category
        </button>

        <button
          onClick={() => setActiveTab("manageCategories")}
          className={`py-2 px-4 -mb-px font-semibold border-b-2 ${
            activeTab === "manageCategories"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-blue-600"
          }`}
        >
          Manage Categories
        </button>

        <button
          onClick={() => setActiveTab("createShop")}
          className={`py-2 px-4 -mb-px font-semibold border-b-2 ${
            activeTab === "createShop"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-blue-600"
          }`}
        >
          Create Shop
        </button>

        <button
          onClick={() => setActiveTab("selectTrending")}
          className={`py-2 px-4 -mb-px font-semibold border-b-2 ${
            activeTab === "selectTrending"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-blue-600"
          }`}
        >
          Select Trending Products
        </button>

        <button
          onClick={() => setActiveTab("viewTrending")}
          className={`py-2 px-4 -mb-px font-semibold border-b-2 ${
            activeTab === "viewTrending"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-blue-600"
          }`}
        >
          Trending Products
        </button>
      </div>

      {/* Conditional Sections */}
      {activeTab === "createProduct" && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Create Product</h2>
          <ProductForm />
        </section>
      )}

      {activeTab === "createCategory" && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Create Category</h2>
          <CategoryForm />
        </section>
      )}

      {activeTab === "manageCategories" && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Manage Categories</h2>
          <CategoryList />
        </section>
      )}

      {activeTab === "createShop" && currentAdminUid && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Create Shop</h2>
          <ShopForm currentUserId={currentAdminUid} onShopCreated={refreshShopList} />
        </section>
      )}

      {activeTab === "selectTrending" && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Select Trending Products</h2>
          <TrendingProductSelector />
        </section>
      )}

      {activeTab === "viewTrending" && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Trending Products</h2>
          <TrendingProductList />
        </section>
      )}
    </div>
  );
}
