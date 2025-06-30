

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
import SubCategoryForm from "./components/SubCategoryForm";
import EditSubCategoryForm from "./components/EditSubCategoryForm";
import AdminChatPanel from "./chat/page"; // Uncommented to enable Chat view
import SummaryCard from "./components/SummaryCard";
import DraftsList from "./components/DraftsList";
import { useRouter } from "next/navigation"; // ← Add this line




import {
  CubeIcon,
  PencilSquareIcon,
  TagIcon,
  ListBulletIcon,
  BuildingStorefrontIcon,
  FireIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";


const tabs = [
  { id: "createProduct", icon: <CubeIcon className="w-6 h-6" />, label: "Add Product" },
  { id: "editProducts", icon: <PencilSquareIcon className="w-6 h-6" />, label: "Edit Products" },
  { id: "createCategory", icon: <TagIcon className="w-6 h-6" />, label: "Add Category" },
  { id: "manageCategories", icon: <ListBulletIcon className="w-6 h-6" />, label: "Categories" },
  { id: "createShop", icon: <BuildingStorefrontIcon className="w-6 h-6" />, label: "New Shop" },
  { id: "selectTrending", icon: <FireIcon className="w-6 h-6" />, label: "Set Trending" },
  { id: "viewTrending", icon: <FireIcon className="w-6 h-6 text-red-500" />, label: "View Trending" },
  { id: "manageShipments", icon: <TruckIcon className="w-6 h-6" />, label: "Shipments" },
  { id: "manageSubCategories", icon: <TruckIcon className="w-6 h-6" />, label: "Sub Categories" },
  { id: "editSubCategories", icon: <TruckIcon className="w-6 h-6" />, label: "Edit Categories" },
  { id: "chats", icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />, label: "Chat" },
  { id: "drafts", icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />, label: "Draft Products" },
];



function AdminDashboard({ currentAdminUid }) {
  const [view, setView] = useState(null); // null = show dashboard
  const router = useRouter(); // ← Add this inside your component

  
  const openChatForUser = (userId) => {
    router.push(`/admin/chat?userId=${userId}`); 
    // This assumes you have a page or tab at /admin/chat that loads AdminChatPanel component
  };

  const renderSection = () => {
    switch (view) {
      case "createProduct":
        return <ProductForm />;
      case "editProducts":
        return <EditProducts currentAdminUid={currentAdminUid} />;
      case "createCategory":
        return <CategoryForm />;
      case "manageCategories":
        return <CategoryList />;
      case "createShop":
        return <ShopForm currentUserId={currentAdminUid} />;
      case "selectTrending":
        return <TrendingProductSelector />;
      case "viewTrending":
        return <TrendingProductList />;
      case "manageShipments":
        return <OrderManager />;
      case "manageSubCategories":
        return <SubCategoryForm />;
      case "editSubCategories":
        return <EditSubCategoryForm />;
      case "drafts":
        return <DraftsList />;
      case "chats":
         return <AdminChatPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {view ? "Admin View" : "Admin Dashboard"}
        </h1>
        {/* <LogoutButton /> */}
      </div>

      {view ? (
        <>
          <button
            onClick={() => setView(null)}
            className="mb-4 rounded-2xl text-lg text-blue-600 hover:underline"
          >
            ← Return to Dashboard
          </button>

            <div className="h-auto overflow-y-auto">
              {renderSection()}
            </div>

        </>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition border border-gray-200"
            >
              {tab.icon}
              <span className="text-xs mt-1 text-gray-600 text-center">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {!view && <SummaryCard />}



    </div>
  );
}

export default withAdminAuth(AdminDashboard);
