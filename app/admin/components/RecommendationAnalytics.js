"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, where, doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CustomerExperienceService } from '@/lib/customerExperienceService';
import UserTrackingAnalytics from './UserTrackingAnalytics';

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
  const [categoryMap, setCategoryMap] = useState({});
  const [userMap, setUserMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [resetting, setResetting] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [trackingDataKey, setTrackingDataKey] = useState(0);

  /** Delete all documents in a collection in batches (Firestore limit 500 per batch). */
  const deleteCollection = async (collectionName) => {
    const colRef = collection(db, collectionName);
    const batchSize = 500;
    let totalDeleted = 0;
    let hasMore = true;
    while (hasMore) {
      const q = query(colRef, limit(batchSize));
      const snapshot = await getDocs(q);
      if (snapshot.empty) break;
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      totalDeleted += snapshot.docs.length;
      if (snapshot.docs.length < batchSize) hasMore = false;
    }
    return totalDeleted;
  };

  const clearAllTrackingData = async () => {
    if (!resetConfirm) return;
    try {
      setResetting(true);
      const collections = ['userPageViews', 'userClicks', 'userProductViews', 'userNavigation'];
      const counts = {};
      for (const name of collections) {
        counts[name] = await deleteCollection(name);
      }
      setResetConfirm(false);
      setTrackingDataKey((k) => k + 1); // Remount UserTrackingAnalytics so it refetches
      await fetchAnalytics();
      alert(`Tracking data cleared.\n\nDeleted: ${collections.map((c) => `${c}: ${counts[c]}`).join(', ')}`);
    } catch (error) {
      console.error('Error clearing tracking data:', error);
      alert('Failed to clear tracking data: ' + (error.message || String(error)));
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    setCurrentPage(1); // Reset to first page when analytics refresh
  }, []);

  // Fetch category and user mappings
  useEffect(() => {
    const fetchMappings = async () => {
      try {
        // Fetch all categories
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const catMap = {};
        categoriesSnapshot.forEach((doc) => {
          const data = doc.data();
          catMap[doc.id] = data.name || 'Unknown Category';
          // Also map by name for reverse lookup
          if (data.name) {
            catMap[data.name] = data.name;
          }
        });
        setCategoryMap(catMap);

        // Fetch all users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usrMap = {};
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          // Use name, email, or fallback to ID
          const displayName = data.name || data.email || data.address?.email || doc.id;
          usrMap[doc.id] = {
            name: displayName,
            email: data.email || data.address?.email || null,
            id: doc.id
          };
        });
        setUserMap(usrMap);
      } catch (error) {
        console.error('Error fetching mappings:', error);
      }
    };
    fetchMappings();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all collections in parallel
      const [
        recentViewsSnapshot,
        wishlistSnapshot,
        comparisonsSnapshot,
        trendingSnapshot,
        categoriesSnapshot,
        usersSnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'recentViews')),
        getDocs(collection(db, 'wishlist')),
        getDocs(collection(db, 'productComparisons')),
        getDocs(collection(db, 'trendingProducts')),
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'users'))
      ]);

      // Build category map
      const catMap = {};
      categoriesSnapshot.forEach((doc) => {
        const data = doc.data();
        catMap[doc.id] = data.name || 'Unknown Category';
      });
      setCategoryMap(catMap);

      // Build user map
      const usrMap = {};
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const displayName = data.name || data.email || data.address?.email || doc.id;
        usrMap[doc.id] = {
          name: displayName,
          email: data.email || data.address?.email || null,
          id: doc.id
        };
      });
      setUserMap(usrMap);

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

      // Helper function to normalize user IDs (trim whitespace, convert to string, filter invalid)
      const normalizeUserId = (userId) => {
        if (!userId) return null;
        const normalized = String(userId).trim();
        // Filter out empty strings, 'guest', 'anonymous', 'null', 'undefined'
        if (!normalized || normalized === 'guest' || normalized === 'anonymous' || normalized === 'null' || normalized === 'undefined') {
          return null;
        }
        return normalized;
      };

      // Calculate analytics - track by actual user IDs with normalization
      const uniqueUsers = new Set();
      const usersWithViews = new Set();
      const usersWithWishlist = new Set();
      const usersWithComparisons = new Set();
      const categoryCounts = {};
      const manufacturerCounts = {};

      // Analyze recent views
      recentViews.forEach(view => {
        const userId = normalizeUserId(view.userId);
        if (userId) {
          uniqueUsers.add(userId);
          usersWithViews.add(userId);
        }
        
        if (view.productCategory) {
          categoryCounts[view.productCategory] = (categoryCounts[view.productCategory] || 0) + 1;
        }
        if (view.productManufacturer) {
          manufacturerCounts[view.productManufacturer] = (manufacturerCounts[view.productManufacturer] || 0) + 1;
        }
      });

      // Analyze wishlist
      wishlistItems.forEach(item => {
        const userId = normalizeUserId(item.userId);
        if (userId) {
          uniqueUsers.add(userId);
          usersWithWishlist.add(userId);
        }
      });

      // Analyze comparisons - document ID is the userId for productComparisons collection
      comparisons.forEach(comparison => {
        // For productComparisons, the document ID IS the userId
        const userId = normalizeUserId(comparison.userId || comparison.id);
        if (userId) {
          uniqueUsers.add(userId);
          usersWithComparisons.add(userId);
        }
      });

      // Get top categories and manufacturers with names
      const topCategories = Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([categoryId, count]) => ({ 
          categoryId,
          category: catMap[categoryId] || categoryId || 'Unknown Category',
          count 
        }));

      const topManufacturers = Object.entries(manufacturerCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([manufacturer, count]) => ({ manufacturer, count }));

      // Get recent activity (last 50 views) with enriched data, then group by user
      const allActivity = recentViews
        .sort((a, b) => {
          const aTime = a.viewedAt?.toDate?.() || new Date(0);
          const bTime = b.viewedAt?.toDate?.() || new Date(0);
          return bTime - aTime;
        })
        .map((activity) => {
          const userId = normalizeUserId(activity.userId);
          
          // Get user info - check if it's an anonymous user or registered user
          let userInfo = usrMap[userId];
          if (!userInfo) {
            // Check if it's an anonymous user
            if (userId && userId.startsWith('anonymous_')) {
              userInfo = { name: 'Anonymous User', email: null, id: userId };
            } else if (userId && userId.length > 20) {
              // Likely a Firebase Auth UID, try to fetch from users collection
              userInfo = { name: userId.slice(0, 12) + '...', email: null, id: userId };
            } else {
              userInfo = { name: userId || 'Unknown User', email: null, id: userId };
            }
          }
          
          // Try to get category name - check if it's an ID or name
          let categoryName = 'Unknown Category';
          if (activity.productCategory) {
            const catId = activity.productCategory;
            // First check if it's a direct ID match
            if (catMap[catId]) {
              categoryName = catMap[catId];
            } else {
              // Try to find by name match (in case category was stored as name)
              const foundEntry = Object.entries(catMap).find(([id, name]) => 
                name === catId || id === catId
              );
              categoryName = foundEntry ? foundEntry[1] : (catId || 'Unknown Category');
            }
          }
          
          return {
            ...activity,
            userId: userId || activity.userId,
            userName: userInfo.name,
            userEmail: userInfo.email,
            categoryName
          };
        })
        .filter(activity => activity.userId); // Filter out invalid users

      // Group by user and take most recent activity per user
      // Use a Map to ensure we only keep one entry per user (the most recent one)
      const userActivityMap = new Map();
      
      // Sort all activities by date first (most recent first)
      const sortedActivities = [...allActivity].sort((a, b) => {
        const aTime = a.viewedAt?.toDate?.() || new Date(0);
        const bTime = b.viewedAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
      
      // Only keep the first (most recent) activity for each user
      // Use normalized userId as key to prevent duplicates
      sortedActivities.forEach(activity => {
        const normalizedId = normalizeUserId(activity.userId);
        if (normalizedId && !userActivityMap.has(normalizedId)) {
          userActivityMap.set(normalizedId, {
            ...activity,
            userId: normalizedId // Ensure consistent userId
          });
        }
      });
      
      // Convert to array and sort again by date (most recent first)
      const recentActivity = Array.from(userActivityMap.values())
        .sort((a, b) => {
          const aTime = a.viewedAt?.toDate?.() || new Date(0);
          const bTime = b.viewedAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });

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
      
      // Try to get user info from Firebase Auth or users collection
      let userInfo = userMap[userId] || { name: userId, email: null, id: userId };
      
      // If userId looks like Firebase Auth UID, try to get from users collection
      if (!userMap[userId] && userId.length > 20) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const data = userDoc.data();
            userInfo = {
              name: data.name || data.email || data.address?.email || userId,
              email: data.email || data.address?.email || null,
              id: userId
            };
          }
        } catch (err) {
          console.warn('Could not fetch user details:', err);
        }
      }
      
      // Fetch user's data
      const [recentViews, wishlist, comparisons, recommendations] = await Promise.all([
        CustomerExperienceService.getRecentlyViewed(userId, 10),
        CustomerExperienceService.getUserWishlist(userId),
        CustomerExperienceService.getComparisonList(userId),
        CustomerExperienceService.getPersonalizedRecommendations(userId, 5)
      ]);

      setUserDetails({
        userInfo,
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

      {/* Tracking data management */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Tracking data</h3>
        <p className="text-sm text-gray-600 mb-3">
          Clear all user tracking data (page views, clicks, product views, navigation) from the database. This cannot be undone.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {!resetConfirm ? (
            <button
              type="button"
              onClick={() => setResetConfirm(true)}
              disabled={resetting}
              className="px-4 py-2 text-sm font-medium text-amber-800 bg-amber-100 border border-amber-300 rounded-md hover:bg-amber-200 disabled:opacity-50"
            >
              Clear all tracking data
            </button>
          ) : (
            <>
              <span className="text-sm text-gray-600">Are you sure?</span>
              <button
                type="button"
                onClick={clearAllTrackingData}
                disabled={resetting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {resetting ? 'Clearing…' : 'Yes, clear all'}
              </button>
              <button
                type="button"
                onClick={() => setResetConfirm(false)}
                disabled={resetting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* User Tracking Analytics Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed User Tracking Analytics</h3>
        <UserTrackingAnalytics key={trackingDataKey} />
      </div>

    </div>
  );
}
