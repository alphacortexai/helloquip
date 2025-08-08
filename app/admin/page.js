

"use client";

import { useState, useEffect, useRef } from "react";
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
import AdminChatPanel from "./chat/page";
import SummaryCard from "./components/SummaryCard";
import DraftsList from "./components/DraftsList";
import { useRouter } from "next/navigation";
import QuotationViewer from "./components/QuotationViewer";
import FeedbackManager from "./components/FeedbackManager";

import {
  CubeIcon,
  PencilSquareIcon,
  TagIcon,
  ListBulletIcon,
  BuildingStorefrontIcon,
  FireIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  UserCircleIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

const tabs = [
  { 
    id: "createProduct", 
    icon: <CubeIcon className="w-5 h-5" />, 
    label: "Add Product",
    description: "Create new products",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100"
  },
  { 
    id: "editProducts", 
    icon: <PencilSquareIcon className="w-5 h-5" />, 
    label: "Edit Products",
    description: "Modify existing products",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-100"
  },
  { 
    id: "createCategory", 
    icon: <TagIcon className="w-5 h-5" />, 
    label: "Add Category",
    description: "Create product categories",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-100"
  },
  { 
    id: "manageCategories", 
    icon: <ListBulletIcon className="w-5 h-5" />, 
    label: "Categories",
    description: "Manage all categories",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-100"
  },
  { 
    id: "createShop", 
    icon: <BuildingStorefrontIcon className="w-5 h-5" />, 
    label: "New Shop",
    description: "Add shop locations",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-100"
  },
  { 
    id: "selectTrending", 
    icon: <FireIcon className="w-5 h-5" />, 
    label: "Set Trending",
    description: "Select trending products",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-100"
  },
  { 
    id: "viewTrending", 
    icon: <FireIcon className="w-5 h-5" />, 
    label: "View Trending",
    description: "View trending products",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-100"
  },
  { 
    id: "manageShipments", 
    icon: <TruckIcon className="w-5 h-5" />, 
    label: "Shipments",
    description: "Manage orders & shipping",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-100"
  },
  { 
    id: "manageSubCategories", 
    icon: <TagIcon className="w-5 h-5" />, 
    label: "Sub Categories",
    description: "Manage sub-categories",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-100"
  },
  { 
    id: "editSubCategories", 
    icon: <PencilSquareIcon className="w-5 h-5" />, 
    label: "Edit Categories",
    description: "Modify category structure",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100"
  },
  { 
    id: "chats", 
    icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />, 
    label: "Chat",
    description: "Customer support chat",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-100"
  },
  { 
    id: "drafts", 
    icon: <ChartBarIcon className="w-5 h-5" />, 
    label: "Draft Products",
    description: "Manage draft products",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100"
  },
  { 
    id: "quatations", 
    icon: <Cog6ToothIcon className="w-5 h-5" />, 
    label: "Quotations",
    description: "View customer quotations",
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-100"
  },
  { 
    id: "feedback", 
    icon: <ChatBubbleLeftIcon className="w-5 h-5" />, 
    label: "Feedback",
    description: "Manage customer feedback",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-100"
  },
];

function AdminDashboard({ currentAdminUid }) {
  const [view, setView] = useState(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAccountAction = (action) => {
    setAccountDropdownOpen(false);
    switch (action) {
      case 'settings':
        // TODO: Implement settings page
        alert('Settings page coming soon!');
        break;
      case 'profile':
        // TODO: Implement profile page
        alert('Profile page coming soon!');
        break;
      default:
        break;
    }
  };

  const openChatForUser = (userId) => {
    router.push(`/admin/chat?userId=${userId}`);
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
      case "quatations":
        return <QuotationViewer />
      case "feedback":
        return <FeedbackManager />
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Cog6ToothIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {view ? "Admin Panel" : "HelloQuip Admin"}
                </h1>
                <p className="text-xs text-gray-500">
                  {view ? "Manage your store" : "Store management system"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500">
                <UserGroupIcon className="w-3 h-3" />
                <span>Admin</span>
              </div>
              
              {/* Account Settings Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
                >
                  <UserCircleIcon className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Account</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 transition-all duration-200 z-50 ${
                  accountDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}>
                  <div className="py-1">
                    <button 
                      onClick={() => handleAccountAction('settings')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <CogIcon className="w-4 h-4 mr-2" />
                      Settings
                    </button>
                    <button 
                      onClick={() => handleAccountAction('profile')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <UserCircleIcon className="w-4 h-4 mr-2" />
                      Profile
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <LogoutButton isDropdown={true} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view ? (
          <>
            {/* Back Button */}
            <div className="mb-4">
              <button
                onClick={() => setView(null)}
                className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>

            {/* Section Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800 capitalize">
                  {view.replace(/([A-Z])/g, ' $1').trim()}
                </h2>
                <p className="text-xs text-gray-600 mt-1">
                  {tabs.find(tab => tab.id === view)?.description || "Manage this section"}
                </p>
              </div>
              <div className="p-4">
                {renderSection()}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Welcome Section */}
            <div className="mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Welcome back!</h2>
                    <p className="text-sm text-gray-600">
                      Manage your HelloQuip store with our admin tools
                    </p>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Cog6ToothIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`group relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${tab.bgColor} ${tab.borderColor} hover:border-opacity-100`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 ${tab.bgColor} rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
                      <div className={tab.color}>
                        {tab.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-sm font-medium text-gray-800 mb-1 group-hover:text-gray-900 transition-colors">
                      {tab.label}
                    </h3>
                    
                    <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors leading-tight">
                      {tab.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Summary Cards */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-3">Store Overview</h3>
              <SummaryCard />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default withAdminAuth(AdminDashboard);
