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


import OrderManager from "./components/OrderManager";


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
          // Add to tabs
          { id: "manageShipments", label: "Manage Shipments" },
           { id: "chats", label: "Chat w User" },

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

    {activeTab === "chat" && <AdminChatPanel />}


      {activeTab === "manageShipments" && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Manage Shipments</h2>
          <OrderManager />
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
