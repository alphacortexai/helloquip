// "use client";

// import { useEffect, useState } from "react";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { useRouter } from "next/navigation";

// import ProductForm from "./components/ProductForm";
// import LogoutButton from "./components/LogoutButton";
// import CategoryForm from "@/components/CategoryForm";
// import CategoryList from "./components/CategoryList";
// import ShopForm from "./components/ShopForm";
// import TrendingProductSelector from "./components/TrendingProductSelector";
// import TrendingProductList from "./components/TrendingProductList";
// import EditProducts from "./components/EditProducts"; // 👈 new component

// export default function AdminDashboard() {
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("createProduct");
//   const [currentAdminUid, setCurrentAdminUid] = useState(null);

//   const router = useRouter();
//   const auth = getAuth();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (!user) {
//         router.push("/admin/login");
//       } else {
//         setCurrentAdminUid(user.uid);
//         setLoading(false);
//       }
//     });
//     return () => unsubscribe();
//   }, [auth, router]);

//   if (loading) return <p>Loading...</p>;

//   const refreshShopList = () => {
//     // optional: implement if you want to reload shops after creation
//   };

//   return (
//     <div className="p-8 max-w-5xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Admin Dashboard</h1>
//         <LogoutButton />
//       </div>

//       {/* Tabs */}
//       <div className="mb-8 flex flex-wrap space-x-4 border-b">
//         {[
//           { id: "createProduct", label: "Create Product" },
//           { id: "editProducts", label: "Edit Products" },
//           { id: "createCategory", label: "Create Category" },
//           { id: "manageCategories", label: "Manage Categories" },
//           { id: "createShop", label: "Create Shop" },
//           { id: "selectTrending", label: "Select Trending Products" },
//           { id: "viewTrending", label: "Trending Products" },
//         ].map((tab) => (
//           <button
//             key={tab.id}
//             onClick={() => setActiveTab(tab.id)}
//             className={`py-2 px-4 -mb-px font-semibold border-b-2 ${
//               activeTab === tab.id
//                 ? "border-blue-600 text-blue-600"
//                 : "border-transparent text-gray-600 hover:text-blue-600"
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Tab Content */}
//       {activeTab === "createProduct" && (
//         <section>
//           <h2 className="text-xl font-semibold mb-4">Create Product</h2>
//           <ProductForm />
//         </section>
//       )}

//       {activeTab === "editProducts" && currentAdminUid && (
//         <section>
//           <h2 className="text-xl font-semibold mb-4">Edit Products</h2>
//           <EditProducts currentAdminUid={currentAdminUid} />
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

//       {activeTab === "createShop" && (
//         <section>
//           <h2 className="text-xl font-semibold mb-4">Create Shop</h2>
//           <ShopForm currentUserId={currentAdminUid} onShopCreated={refreshShopList} />
//         </section>
//       )}

//       {activeTab === "selectTrending" && (
//         <section>
//           <h2 className="text-xl font-semibold mb-4">Select Trending Products</h2>
//           <TrendingProductSelector />
//         </section>
//       )}

//       {activeTab === "viewTrending" && (
//         <section>
//           <h2 className="text-xl font-semibold mb-4">Trending Products</h2>
//           <TrendingProductList />
//         </section>
//       )}
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import withAdminAuth from "../utils/withAdminAuth";


import ProductForm from "./components/ProductForm";
import LogoutButton from "./components/LogoutButton";
import CategoryForm from "@/components/CategoryForm";
import CategoryList from "./components/CategoryList";
import ShopForm from "./components/ShopForm";
import TrendingProductSelector from "./components/TrendingProductSelector";
import TrendingProductList from "./components/TrendingProductList";
import EditProducts from "./components/EditProducts";

function AdminDashboard({ currentAdminUid }) {
  const [activeTab, setActiveTab] = useState("createProduct");

  const refreshShopList = () => {
    // Optional: implement if you want to reload shops after creation
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <LogoutButton />
      </div>

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap space-x-4 border-b">
        {[
          { id: "createProduct", label: "Create Product" },
          { id: "editProducts", label: "Edit Products" },
          { id: "createCategory", label: "Create Category" },
          { id: "manageCategories", label: "Manage Categories" },
          { id: "createShop", label: "Create Shop" },
          { id: "selectTrending", label: "Select Trending Products" },
          { id: "viewTrending", label: "Trending Products" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-4 -mb-px font-semibold border-b-2 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "createProduct" && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Create Product</h2>
          <ProductForm />
        </section>
      )}

      {activeTab === "editProducts" && currentAdminUid && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Edit Products</h2>
          <EditProducts currentAdminUid={currentAdminUid} />
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

      {activeTab === "createShop" && (
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

export default withAdminAuth(AdminDashboard);
