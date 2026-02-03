

"use client";

import { useState, useEffect, useRef } from "react";
import withAdminAuth from "../utils/withAdminAuth";

import ProductForm from "./components/ProductForm";
import LogoutButton from "./components/LogoutButton";
import CategoryForm from "@/components/CategoryForm";
import CategoryList from "./components/CategoryList";
import ShopForm from "./components/ShopForm";
import ShopManager from "./components/ShopManager";
import CreateShopForm from "./components/CreateShopForm";
import TrendingProductSelector from "./components/TrendingProductSelector";
import TrendingProductList from "./components/TrendingProductList";
import TrendingFromViews from "./components/TrendingFromViews";
import ProductSearch from "./components/ProductSearch";
import EditProducts from "./components/EditProducts";
import OrderManager from "./components/OrderManager";
import SubCategoryForm from "./components/SubCategoryForm";
import EditSubCategoryForm from "./components/EditSubCategoryForm";
import SummaryCard from "./components/SummaryCard";
import DraftsList from "./components/DraftsList";
import Analytics from "./components/Analytics";
import { useRouter, useSearchParams } from "next/navigation";
import QuotationViewer from "./components/QuotationViewer";
import QuoteRequestManager from "./components/QuoteRequestManager";
import FeedbackManager from "./components/FeedbackManager";
import AdminNotifications from "./components/AdminNotifications";
import UserMessenger from "./components/UserMessenger";
import AdminUserChat from "./components/AdminUserChat";
import DisplaySettings from "./components/DisplaySettings";
import CarouselSettings from "./components/CarouselSettings";
import LegalSettings from "./components/LegalSettings";
import NotificationTracker from "./components/NotificationTracker";
import LatestProductsViewer from "./components/LatestProductsViewer";
import RecommendationAnalytics from "./components/RecommendationAnalytics";
import IntelligentAnalysis from "./components/IntelligentAnalysis";
import ProductControl from "./components/ProductControl";
import ProductSuggestions from "./components/ProductSuggestions";
import ProductReorder from "./components/ProductReorder";
import CompanyInfoSettings from "./components/CompanyInfoSettings";
import QuickActionsSettings from "./components/QuickActionsSettings";
import AdminUsers from "./components/AdminUsers";
import CachedLogo from "@/components/CachedLogo";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc } from "firebase/firestore";

import {
  CubeIcon,
  PencilSquareIcon,
  TagIcon,
  ListBulletIcon,
  BuildingStorefrontIcon,
  FireIcon,
  TruckIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  UserCircleIcon,
  CogIcon,
  BellIcon,
  StarIcon,
  ArrowsUpDownIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// Organized menu structure
const menuGroups = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Squares2X2Icon,
    items: [
      { 
        id: null, 
        label: "Store Overview",
        description: "View store statistics and metrics"
      },
      { 
        id: "analytics", 
        label: "Analytics & Insights",
        description: "Revenue, orders, and user growth charts"
      }
    ]
  },
  {
    id: "products",
    label: "Products",
    icon: CubeIcon,
    items: [
      { 
        id: "createProduct", 
        label: "Add Product",
        description: "Create new products"
      },
      { 
        id: "editProducts", 
        label: "Edit Products",
        description: "Modify existing products"
      },
      { 
        id: "productSearch", 
        label: "Search Products",
        description: "Find by name, SKU, shop, attributes"
      },
      { 
        id: "drafts", 
        label: "Draft Products",
        description: "Manage draft products"
      },
      { 
        id: "latestProducts", 
        label: "Latest Products",
        description: "View recently uploaded products"
      },
      { 
        id: "reorderProducts", 
        label: "Reorder Products",
        description: "Shuffle and set product display order"
      }
    ]
  },
  {
    id: "categories",
    label: "Categories",
    icon: TagIcon,
    items: [
      { 
        id: "createCategory", 
        label: "Add Category",
        description: "Create product categories"
      },
      { 
        id: "manageCategories", 
        label: "Manage Categories",
        description: "Manage all categories"
      },
      { 
        id: "manageSubCategories", 
        label: "Sub Categories",
        description: "Manage sub-categories"
      },
      { 
        id: "editSubCategories", 
        label: "Edit Categories",
        description: "Modify category structure"
      }
    ]
  },
  {
    id: "orders",
    label: "Orders & Shipping",
    icon: TruckIcon,
    items: [
      { 
        id: "manageShipments", 
        label: "Manage Orders",
        description: "Manage orders & shipping"
      }
    ]
  },
  {
    id: "shops",
    label: "Shops",
    icon: BuildingStorefrontIcon,
    items: [
      { 
        id: "createShop", 
        label: "New Shop",
        description: "Add shop locations"
      },
      { 
        id: "manageShops", 
        label: "Manage Shops",
        description: "Edit and delete shops"
      }
    ]
  },
  {
    id: "trending",
    label: "Trending",
    icon: FireIcon,
    items: [
      { 
        id: "selectTrending", 
        label: "Set Trending",
        description: "Select trending products"
      },
      { 
        id: "viewTrending", 
        label: "View Trending",
        description: "View trending products"
      },
      { 
        id: "trendingFromViews", 
        label: "Auto Trending (Views)",
        description: "Pick top viewed products"
      }
    ]
  },
  {
    id: "recommendations",
    label: "Recommendations",
    icon: ChartBarIcon,
    items: [
      { 
        id: "recommendationAnalytics", 
        label: "Recommendation Analytics",
        description: "View and manage recommendation system"
      },
      { 
        id: "intelligentAnalysis", 
        label: "Intelligent Analysis",
        description: "AI report on trends, behaviour, and improvements"
      },
      { 
        id: "productSuggestions", 
        label: "Product Suggestions",
        description: "Suggest products for recommendations"
      }
    ]
  },
  {
    id: "quotations",
    label: "Quotations",
    icon: DocumentTextIcon,
    items: [
      { 
        id: "quoteRequests", 
        label: "Quote Requests",
        description: "Manage quote requests from users"
      },
      { 
        id: "quatations", 
        label: "View Quotations",
        description: "View customer quotations"
      }
    ]
  },
  {
    id: "communication",
    label: "Communication",
    icon: ChatBubbleLeftIcon,
    items: [
      { 
        id: "adminChat", 
        label: "Admin Chat",
        description: "Chat with users directly"
      },
      { 
        id: "userMessenger", 
        label: "User Messenger",
        description: "Send notifications to users"
      },
      { 
        id: "feedback", 
        label: "Feedback",
        description: "Manage customer feedback"
      },
      { 
        id: "notifications", 
        label: "Notifications",
        description: "Admin alerts & new orders"
      }
    ]
  },
  {
    id: "settings",
    label: "Settings",
    icon: Cog6ToothIcon,
    items: [
      { 
        id: "adminUsers", 
        label: "Users",
        description: "View registered users"
      },
      { 
        id: "displaySettings", 
        label: "Display Settings",
        description: "Configure product display options"
      },
      { 
        id: "carouselSettings", 
        label: "Carousel Settings",
        description: "Choose trending or custom images"
      },
      { 
        id: "productControl", 
        label: "Product Control",
        description: "Control product display settings"
      },
      { 
        id: "legal", 
        label: "Privacy & Terms",
        description: "Edit privacy policy and terms of service"
      },
      { 
        id: "companyInfo", 
        label: "Company Info",
        description: "Info for AI chat assistant"
      },
      { 
        id: "notificationTracker", 
        label: "Notification Tracker",
        description: "Track FCM and in-app notifications"
      },
      { 
        id: "quickActionsSettings", 
        label: "Quick Actions",
        description: "Choose up to 8 items to show on dashboard"
      }
    ]
  }
];

// Flat list of all menu items (excluding Store Overview) for quick actions
const allMenuItemsForQuickActions = menuGroups.flatMap((group) =>
  group.items
    .filter((item) => item.id != null)
    .map((item) => ({ id: item.id, label: item.label, groupLabel: group.label }))
);

// Legacy tabs array for backward compatibility
const tabs = [
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
    id: "manageShops", 
    icon: <BuildingStorefrontIcon className="w-5 h-5" />, 
    label: "Manage Shops",
    description: "Edit and delete shops",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-100"
  },
  { 
    id: "selectTrending", 
    icon: <FireIcon className="w-5 h-5" />, 
    label: "Set Trending",
    description: "Select trending products",
    color: "text-[#2e4493]",
    bgColor: "bg-[#e5f3fa]",
    borderColor: "border-[#e5f3fa]"
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
    id: "productSearch", 
    icon: <TagIcon className="w-5 h-5" />, 
    label: "Search Products",
    description: "Find by name, SKU, shop, attributes",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-100"
  },
  { 
    id: "trendingFromViews", 
    icon: <FireIcon className="w-5 h-5" />, 
    label: "Auto Trending (Views)",
    description: "Pick top viewed products",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-100"
  },
  { 
    id: "manageShipments", 
    icon: <TruckIcon className="w-5 h-5" />, 
    label: "Shipments",
    description: "Manage orders & shipping",
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-100"
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
    id: "drafts", 
    icon: <ChartBarIcon className="w-5 h-5" />, 
    label: "Draft Products",
    description: "Manage draft products",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100"
  },
  { 
    id: "recommendationAnalytics", 
    icon: <ChartBarIcon className="w-5 h-5" />, 
    label: "Recommendation Analytics",
    description: "View and manage recommendation system",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-100"
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
    id: "quoteRequests", 
    icon: <Cog6ToothIcon className="w-5 h-5" />, 
    label: "Quote Requests",
    description: "Manage quote requests from users",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100"
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

  { 
    id: "notifications", 
    icon: <BellIcon className="w-5 h-5" />, 
    label: "Notifications",
    description: "Admin alerts & new orders",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-100"
  },
    { 
    id: "userMessenger", 
    icon: <ChatBubbleLeftIcon className="w-5 h-5" />, 
    label: "User Messenger",
    description: "Send notifications to users",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100"
  },
  { 
    id: "adminChat", 
    icon: <ChatBubbleLeftIcon className="w-5 h-5" />, 
    label: "Admin Chat",
    description: "Chat with users directly",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-100"
  },
  { 
    id: "displaySettings", 
    icon: <CogIcon className="w-5 h-5" />, 
    label: "Display Settings",
    description: "Configure product display options",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-100"
  },
  { 
    id: "carouselSettings", 
    icon: <CogIcon className="w-5 h-5" />, 
    label: "Carousel Settings",
    description: "Choose trending or custom images",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100"
  },
  {
    id: "notificationTracker",
    icon: <BellIcon className="w-5 h-5" />,
    label: "Notification Tracker",
    description: "Track FCM and in-app notifications",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-100"
  },
  {
    id: "latestProducts",
    icon: <CubeIcon className="w-5 h-5" />,
    label: "Latest Products",
    description: "View recently uploaded products",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-100"
  },
  {
    id: "productControl",
    icon: <Cog6ToothIcon className="w-5 h-5" />,
    label: "Control",
    description: "Control product display settings",
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-100"
  },
  { 
    id: "intelligentAnalysis",
    icon: <ChartBarIcon className="w-5 h-5" />,
    label: "Intelligent Analysis",
    description: "AI report on trends, behaviour, and improvements",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-100"
  },
  { 
    id: "productSuggestions",
    icon: <StarIcon className="w-5 h-5" />,
    label: "Product Suggestions",
    description: "Suggest products for recommendations",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-100"
  },
  {
    id: "reorderProducts",
    icon: <ArrowsUpDownIcon className="w-5 h-5" />,
    label: "Reorder Products",
    description: "Shuffle and set product display order",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-100"
  },
  {
    id: "legal",
    icon: <DocumentTextIcon className="w-5 h-5" />,
    label: "Privacy & Terms",
    description: "Edit privacy policy and terms of service",
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-100"
  },
  {
    id: "companyInfo",
    icon: <InformationCircleIcon className="w-5 h-5" />,
    label: "Company Info",
    description: "Info for AI chat assistant",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-100"
  },
];

function AdminDashboard({ currentAdminUid }) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [view, setView] = useState(initialTab || null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const [unreadAdminCount, setUnreadAdminCount] = useState(0);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const adminNotifRef = useRef(null);
  const [userName, setUserName] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({ dashboard: true });
  const [quickActionIds, setQuickActionIds] = useState([]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close Account dropdown if clicked outside
      if (accountDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
      // Close Notifications dropdown if clicked outside
      if (adminDropdownOpen && adminNotifRef.current && !adminNotifRef.current.contains(event.target)) {
        setAdminDropdownOpen(false);
      }
    };

    // Use click event for more reliable detection
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [accountDropdownOpen, adminDropdownOpen]);

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
  
  

  // Keep URL in sync with selected tab so back/forward works
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if ((view || null) !== (currentTab || null)) {
      const url = view ? `/admin?tab=${encodeURIComponent(view)}` : "/admin";
      router.push(url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    // Only update state if it differs to prevent loops
    if ((currentTab || null) !== (view || null)) {
      setView(currentTab || null);
    }
  }, [searchParams]);

  // Listen for unread admin notifications
  useEffect(() => {
    const q = query(
      collection(db, "adminNotifications"),
      where("read", "==", false)
    );
    const unsub = onSnapshot(q, (snap) => {
      setUnreadAdminCount(snap.size);
    });
    return () => unsub();
  }, []);

  // Fetch recent admin notifications for header dropdown
  useEffect(() => {
    const q = query(
      collection(db, "adminNotifications"),
      orderBy("timestamp", "desc"),
      limit(10)
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAdminNotifications(items);
    });
    return () => unsub();
  }, []);

  // Get current user's name
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Use displayName if available, otherwise use email name part, or fallback to "Admin"
        const name = user.displayName || 
                     (user.email ? user.email.split("@")[0] : null) || 
                     "Admin";
        setUserName(name);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load quick actions when dashboard is shown (so they appear after saving)
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "quickActions"));
        console.log("Quick actions loaded:", snap.exists() ? snap.data() : "not found");
        if (snap.exists() && Array.isArray(snap.data().itemIds)) {
          const ids = snap.data().itemIds.slice(0, 8);
          console.log("Setting quick action IDs:", ids);
          setQuickActionIds(ids);
        } else {
          console.log("No quick actions found or invalid format");
          setQuickActionIds([]);
        }
      } catch (e) {
        console.error("Quick actions load failed:", e);
        setQuickActionIds([]);
      }
    };
    
    // Load on mount and whenever view becomes null (dashboard)
    if (view === null) {
      load();
    }
  }, [view]); // Re-run when view changes so returning to dashboard shows latest quick actions


  const markAllAdminNotifsRead = async () => {
    const unread = adminNotifications.filter((n) => !n.read);
    for (const n of unread) {
      try { await updateDoc(doc(db, 'adminNotifications', n.id), { read: true }); } catch {}
    }
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
        return <CreateShopForm currentUserId={currentAdminUid} />;
      case "manageShops":
        return <ShopManager currentAdminUid={currentAdminUid} />;
      case "selectTrending":
        return <TrendingProductSelector />;
      case "viewTrending":
        return <TrendingProductList />;
      case "productSearch":
        return <ProductSearch />;
      case "trendingFromViews":
        return <TrendingFromViews />;
      case "manageShipments":
        return <OrderManager />;
      case "manageSubCategories":
        return <SubCategoryForm />;
      case "editSubCategories":
        return <EditSubCategoryForm />;
      case "drafts":
        return <DraftsList />;
      case "recommendationAnalytics":
        return <RecommendationAnalytics />;
      case "intelligentAnalysis":
        return <IntelligentAnalysis />;
      case "quatations":
        return <QuotationViewer />;
      case "quoteRequests":
        return <QuoteRequestManager />;
      case "feedback":
        return <FeedbackManager />

      case "notifications":
        return <AdminNotifications />;
      case "userMessenger":
        return <UserMessenger />;
      case "adminChat":
        return (
          <div className="w-full max-w-4xl mx-auto">
            <AdminUserChat />
          </div>
        );
      case "displaySettings":
        return <DisplaySettings />;
      case "carouselSettings":
        return <CarouselSettings />;
      case "notificationTracker":
        return <NotificationTracker />;
      case "latestProducts":
        return <LatestProductsViewer />;
      case "productControl":
        return <ProductControl />;
      case "productSuggestions":
        return <ProductSuggestions />;
      case "reorderProducts":
        return <ProductReorder />;
      case "legal":
      case "privacyPolicy":
        return <LegalSettings />;
      case "companyInfo":
        return <CompanyInfoSettings />;
      case "analytics":
        return <Analytics />;
      case "quickActionsSettings":
        return <QuickActionsSettings allMenuItems={allMenuItemsForQuickActions} />;
      case "adminUsers":
        return <AdminUsers />;
      default:
        return null;
    }
  };

  // Get current section info
  const getCurrentSectionInfo = () => {
    if (!view) return { label: "Store Overview", description: "View store statistics and metrics" };
    for (const group of menuGroups) {
      const item = group.items.find(i => i.id === view);
      if (item) return item;
    }
    return { label: view, description: "" };
  };

  const currentSection = getCurrentSectionInfo();

  return (
    <div className="min-h-screen bg-gray-50 flex" data-page="admin">
      <style dangerouslySetInnerHTML={{__html: `
        .admin-sidebar-nav::-webkit-scrollbar {
          width: 8px;
        }
        .admin-sidebar-nav::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .admin-sidebar-nav::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .admin-sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
      {/* Mobile Sidebar Overlay - Clickable area to close sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static left-0 z-50
        w-64 bg-white border-r border-gray-200
        h-screen max-h-screen
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <CachedLogo 
              variant="default"
              className="h-8 w-auto"
            />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 admin-sidebar-nav min-h-0" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}>
          {menuGroups.map((group) => {
            const GroupIcon = group.icon;
            const isExpanded = expandedGroups[group.id];
            const hasActiveItem =
              (!view && group.id === "dashboard") ||
              group.items.some((item) => item.id === view);

            return (
              <div key={group.id} className="mb-1">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedGroups((prev) => ({
                      ...prev,
                      [group.id]: !prev[group.id],
                    }))
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                    hasActiveItem
                      ? "text-blue-700 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {GroupIcon && (
                      <GroupIcon className="w-4 h-4 text-gray-400" />
                    )}
                    {group.label}
                  </span>
                  {isExpanded ? (
                    <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-0.5">
                    {group.items.map((item) => {
                      const isActive =
                        item.id === view || (!view && item.id === null);
                      return (
                        <button
                          key={item.id || "dashboard"}
                          onClick={() => {
                            setView(item.id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center px-5 py-1.5 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.id === "notifications" &&
                            unreadAdminCount > 0 && (
                              <span className="ml-2 bg-red-600 text-white text-[10px] rounded-full min-w-[18px] h-4 px-1.5 flex items-center justify-center">
                                {unreadAdminCount}
                              </span>
                            )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className="text-xs text-gray-500 text-center">
            Admin Dashboard v1.0
              
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
                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
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
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:blur-0 blur-md' : ''}`}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>

              {/* Page Title - smaller on mobile, no sub text */}
              <div className="flex-1 min-w-0 ml-4 lg:ml-0 overflow-hidden">
                <h1 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 break-words" title={currentSection.label}>
                  {currentSection.label}
                </h1>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500">
                  <UserGroupIcon className="w-4 h-4" />
                  <span>Admin</span>
                </div>

                {/* Admin Notifications Dropdown */}
                <div className="relative" ref={adminNotifRef}>
                  <button
                    onClick={() => setAdminDropdownOpen((o) => !o)}
                    className="relative inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 hover:bg-gray-50"
                    aria-label="Admin notifications"
                  >
                    <BellIcon className="w-5 h-5 text-gray-700" />
                    {unreadAdminCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                        {unreadAdminCount}
                      </span>
                    )}
                  </button>
                  {adminDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                        <span className="text-sm font-semibold">Admin Notifications</span>
                        <button onClick={markAllAdminNotifsRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                      </div>
                      <div className="max-h-80 overflow-auto">
                        {adminNotifications.length === 0 ? (
                          <div className="p-4 text-sm text-gray-500">No notifications</div>
                        ) : (
                          <ul className="divide-y divide-gray-100">
                            {adminNotifications.map((n) => (
                              <li key={n.id} className="p-3">
                                <button
                                  className="text-left w-full"
                                  onClick={async () => {
                                    try { await updateDoc(doc(db, 'adminNotifications', n.id), { read: true }); } catch {}
                                    setAdminDropdownOpen(false);
                                    const target = n.orderId ? `/admin?tab=manageShipments&orderId=${n.orderId}` : '/admin?tab=manageShipments';
                                    router.push(target);
                                  }}
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{n.title || 'New Notification'}</p>
                                      <p className="text-sm text-gray-600">{n.text}</p>
                                      {n.timestamp?.toDate && (
                                        <p className="text-xs text-gray-400 mt-1">{n.timestamp.toDate().toLocaleString()}</p>
                                      )}
                                    </div>
                                    {!n.read && (
                                      <span className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700 ml-2">new</span>
                                    )}
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
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
                  {accountDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className={view === "recommendationAnalytics" || view === "intelligentAnalysis" ? "px-2 sm:px-4 py-1" : "px-4 sm:px-6 lg:px-8 py-2 sm:py-2"}>
            {view ? (
              view === "recommendationAnalytics" || view === "intelligentAnalysis" ? (
                renderSection()
              ) : (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-4 sm:p-6">
                    {renderSection()}
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-2">
                {/* Welcome Section */}
                <div className="bg-white rounded-lg border border-gray-200 px-3 py-2 sm:px-4 sm:py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
                        Welcome back{userName ? `, ${userName}` : ""}!
                      </h2>
                    </div>
                    <div className="hidden lg:block flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Squares2X2Icon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Store Overview */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                  {/* Quick Actions - Right before Store Overview content */}
                  {quickActionIds.length > 0 && (
                    <div className="mb-4 pb-3 border-b border-gray-200">
                      <div className="flex flex-wrap gap-1.5">
                        {quickActionIds.map((id) => {
                          let item = null;
                          for (const group of menuGroups) {
                            const found = group.items.find((i) => i.id === id);
                            if (found) {
                              item = found;
                              break;
                            }
                          }
                          if (!item) {
                            console.warn("Quick action item not found for ID:", id);
                            return null;
                          }
                          return (
                            <button
                              key={item.id}
                              onClick={() => setView(item.id)}
                              className="px-2.5 py-1.5 rounded-md border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 text-xs font-medium text-gray-700 hover:text-blue-700 transition-colors whitespace-nowrap"
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Store Overview</h3>
                  <SummaryCard />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminDashboard);
