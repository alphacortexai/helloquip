"use client";

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { CustomerExperienceService } from '@/lib/customerExperienceService';
import { getProductImageUrl } from '@/lib/imageUtils';
import Link from 'next/link';
import { 
  UserIcon, 
  ShoppingBagIcon, 
  HeartIcon, 
  ClockIcon,
  ScaleIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function CustomerDashboard() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    recentOrders: [],
    wishlistItems: [],
    recentlyViewed: [],
    comparisonList: { products: [] },
    stats: {
      totalOrders: 0,
      wishlistCount: 0,
      recentlyViewedCount: 0,
      comparisonCount: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await CustomerExperienceService.getCustomerDashboardData(user.uid);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (item) => {
    console.log('🔍 Dashboard item data:', item);
    // Use enriched product data if available, otherwise fall back to stored data
    const product = item.product || {
      imageUrl: item.productImage
    };
    const imageUrl = getProductImageUrl(product, "200x200");
    console.log('📸 Dashboard image URL:', imageUrl);
    return imageUrl;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your dashboard.</p>
          <Link href="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.displayName || user.email}!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingBagIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Wishlist Items</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.wishlistCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recently Viewed</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.recentlyViewedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ScaleIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Comparison List</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.comparisonCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/wishlist" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <HeartIcon className="h-6 w-6 text-red-500 mr-2" />
              <span className="text-sm font-medium">View Wishlist</span>
            </Link>
            <Link href="/compare" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ScaleIcon className="h-6 w-6 text-purple-500 mr-2" />
              <span className="text-sm font-medium">Compare Products</span>
            </Link>
            <Link href="/order" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <PlusIcon className="h-6 w-6 text-green-500 mr-2" />
              <span className="text-sm font-medium">New Order</span>
            </Link>
            <Link href="/feedback" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <UserIcon className="h-6 w-6 text-blue-500 mr-2" />
              <span className="text-sm font-medium">Leave Feedback</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <Link href="/shipments" className="text-blue-600 text-sm hover:text-blue-700">View All</Link>
            </div>
            {dashboardData.recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            ) : (
              <div className="space-y-3">
                {dashboardData.recentOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          UGX {order.totalAmount?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Wishlist</h3>
              <Link href="/wishlist" className="text-blue-600 text-sm hover:text-blue-700">View All</Link>
            </div>
            {dashboardData.wishlistItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No items in wishlist</p>
            ) : (
              <div className="space-y-3">
                {dashboardData.wishlistItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={getImageUrl(item)}
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.productName}
                      </p>
                      <p className="text-sm text-gray-500">
                        UGX {item.productPrice?.toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href={`/product/${item.productId}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recently Viewed */}
        {dashboardData.recentlyViewed.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recently Viewed</h3>
                <Link href="/dashboard" className="text-blue-600 text-sm hover:text-blue-700">View All</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {dashboardData.recentlyViewed.slice(0, 6).map((item) => (
                  <Link
                    key={item.id}
                    href={`/product/${item.productId}`}
                    className="group block"
                  >
                    <img
                      src={getImageUrl(item)}
                      alt={item.product?.name || item.productName}
                      className="w-full h-24 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                    />
                    <p className="text-xs text-gray-900 mt-1 line-clamp-2 group-hover:text-blue-600">
                      {item.product?.name || item.productName}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
