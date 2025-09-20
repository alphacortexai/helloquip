"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CustomerExperienceService } from '@/lib/customerExperienceService';

export default function RecommendationAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    usersWithViews: 0,
    usersWithWishlist: 0,
    usersWithComparisons: 0,
    totalViews: 0,
    totalWishlistItems: 0,
    totalComparisons: 0,
    topCategories: [],
    topManufacturers: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [userRecommendations, setUserRecommendations] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all collections in parallel
      const [
        recentViewsSnapshot,
        wishlistSnapshot,
        comparisonsSnapshot,
        trendingSnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'recentViews')),
        getDocs(collection(db, 'wishlist')),
        getDocs(collection(db, 'productComparisons')),
        getDocs(collection(db, 'trendingProducts'))
      ]);

      // Process recent views
      const recentViews = recentViewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Process wishlist
      const wishlistItems = wishlistSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Process comparisons
      const comparisons = comparisonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate analytics
      const uniqueUsers = new Set();
      const usersWithViews = new Set();
      const usersWithWishlist = new Set();
      const usersWithComparisons = new Set();
      const categoryCounts = {};
      const manufacturerCounts = {};

      // Analyze recent views
      recentViews.forEach(view => {
        uniqueUsers.add(view.userId);
        usersWithViews.add(view.userId);
        
        if (view.productCategory) {
          categoryCounts[view.productCategory] = (categoryCounts[view.productCategory] || 0) + 1;
        }
        if (view.productManufacturer) {
          manufacturerCounts[view.productManufacturer] = (manufacturerCounts[view.productManufacturer] || 0) + 1;
        }
      });

      // Analyze wishlist
      wishlistItems.forEach(item => {
        uniqueUsers.add(item.userId);
        usersWithWishlist.add(item.userId);
      });

      // Analyze comparisons
      comparisons.forEach(comparison => {
        uniqueUsers.add(comparison.id); // comparison.id is the userId
        usersWithComparisons.add(comparison.id);
      });

      // Get top categories and manufacturers
      const topCategories = Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([category, count]) => ({ category, count }));

      const topManufacturers = Object.entries(manufacturerCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([manufacturer, count]) => ({ manufacturer, count }));

      // Get recent activity (last 20 views)
      const recentActivity = recentViews
        .sort((a, b) => b.viewedAt?.toDate() - a.viewedAt?.toDate())
        .slice(0, 20);

      setAnalytics({
        totalUsers: uniqueUsers.size,
        usersWithViews: usersWithViews.size,
        usersWithWishlist: usersWithWishlist.size,
        usersWithComparisons: usersWithComparisons.size,
        totalViews: recentViews.length,
        totalWishlistItems: wishlistItems.length,
        totalComparisons: comparisons.length,
        topCategories,
        topManufacturers,
        recentActivity
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      setSelectedUser(userId);
      
      // Fetch user's data
      const [recentViews, wishlist, comparisons, recommendations] = await Promise.all([
        CustomerExperienceService.getRecentlyViewed(userId, 10),
        CustomerExperienceService.getUserWishlist(userId),
        CustomerExperienceService.getComparisonList(userId),
        CustomerExperienceService.getPersonalizedRecommendations(userId, 5)
      ]);

      setUserDetails({
        recentViews,
        wishlist,
        comparisons,
        recommendations
      });
      setUserRecommendations(recommendations);

    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const testRecommendationLogic = async (userId) => {
    try {
      console.log('🧪 Testing recommendation logic for user:', userId);
      
      // Get user's viewing history
      const recentViews = await CustomerExperienceService.getRecentlyViewed(userId, 20);
      console.log('📊 User viewing history:', recentViews);

      // Analyze patterns
      const viewedCategories = new Set();
      const viewedManufacturers = new Set();
      const viewedProductIds = new Set();

      recentViews.forEach(view => {
        if (view.productCategory) viewedCategories.add(view.productCategory);
        if (view.productManufacturer) viewedManufacturers.add(view.productManufacturer);
        viewedProductIds.add(view.productId);
      });

      console.log('🎯 Extracted patterns:', {
        categories: Array.from(viewedCategories),
        manufacturers: Array.from(viewedManufacturers),
        viewedProductIds: Array.from(viewedProductIds)
      });

      // Get recommendations
      const recommendations = await CustomerExperienceService.getPersonalizedRecommendations(userId, 5);
      console.log('💡 Generated recommendations:', recommendations);

      setUserRecommendations(recommendations);

    } catch (error) {
      console.error('Error testing recommendation logic:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommendation System Analytics</h2>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Users with Views</h3>
          <p className="text-2xl font-bold text-blue-600">{analytics.usersWithViews}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Users with Wishlist</h3>
          <p className="text-2xl font-bold text-red-600">{analytics.usersWithWishlist}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Users with Comparisons</h3>
          <p className="text-2xl font-bold text-purple-600">{analytics.usersWithComparisons}</p>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Product Views</h3>
          <p className="text-2xl font-bold text-green-600">{analytics.totalViews}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Wishlist Items</h3>
          <p className="text-2xl font-bold text-red-600">{analytics.totalWishlistItems}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Comparisons</h3>
          <p className="text-2xl font-bold text-purple-600">{analytics.totalComparisons}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Categories */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Viewed Categories</h3>
          <div className="space-y-2">
            {analytics.topCategories.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.category}</span>
                <span className="text-sm font-medium text-gray-900">{item.count} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Manufacturers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Viewed Manufacturers</h3>
          <div className="space-y-2">
            {analytics.topManufacturers.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.manufacturer}</span>
                <span className="text-sm font-medium text-gray-900">{item.count} views</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Analysis Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Analysis</h3>
        
        {/* Recent Activity */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">Recent Activity (Last 20 Views)</h4>
          <div className="max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Viewed</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.recentActivity.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-4 py-2 text-sm text-gray-900 font-mono">
                      {activity.userId.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {activity.productName || 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {activity.productCategory || 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {activity.productManufacturer || 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {activity.viewCount || 1}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {activity.viewedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <button
                        onClick={() => fetchUserDetails(activity.userId)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Analyze
                      </button>
                      <button
                        onClick={() => testRecommendationLogic(activity.userId)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Test Logic
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Details */}
        {selectedUser && userDetails && (
          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">
              User Analysis: {selectedUser.slice(0, 8)}...
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded">
                <h5 className="text-sm font-medium text-blue-800">Recent Views</h5>
                <p className="text-lg font-bold text-blue-900">{userDetails.recentViews.length}</p>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <h5 className="text-sm font-medium text-red-800">Wishlist Items</h5>
                <p className="text-lg font-bold text-red-900">{userDetails.wishlist.length}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <h5 className="text-sm font-medium text-purple-800">Comparisons</h5>
                <p className="text-lg font-bold text-purple-900">{userDetails.comparisons.products.length}</p>
              </div>
            </div>

            {/* User's Recommendations */}
            {userRecommendations.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Generated Recommendations:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {userRecommendations.map((rec, index) => (
                    <div key={index} className="border rounded p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h6 className="text-sm font-medium text-gray-900 line-clamp-2">{rec.name}</h6>
                        <span className={`text-xs px-2 py-1 rounded ${
                          rec.recommendationReason === 'Similar category' ? 'bg-blue-100 text-blue-800' :
                          rec.recommendationReason === 'Same manufacturer' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {rec.recommendationReason}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Category: {rec.category}</p>
                      <p className="text-xs text-gray-600">Manufacturer: {rec.manufacturer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
