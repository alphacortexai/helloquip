"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getProductImageUrl } from '@/lib/imageUtils';
import { cleanFirebaseUrl } from '@/lib/urlUtils';
import { ChevronDownIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function UserTrackingAnalytics() {
  const [trackingData, setTrackingData] = useState({
    pageViews: [],
    productClicks: [],
    productViews: [],
    navigation: [],
    deviceInfo: {},
    locationInfo: {},
  });
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [clickProducts, setClickProducts] = useState({}); // productId -> { imageUrl, name }
  const [viewProducts, setViewProducts] = useState({}); // productId -> { imageUrl, name } for product views
  const [deviceDropdownOpen, setDeviceDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    userId: true,
    device: true,
    browser: true,
    location: true,
    pageViews: true,
    productClicks: true,
    productViews: true,
    lastActivity: true,
    actions: true,
  });

  const COLUMN_IDS = ['userId', 'device', 'browser', 'location', 'pageViews', 'productClicks', 'productViews', 'lastActivity', 'actions'];
  const visibleColumns = COLUMN_IDS.filter((id) => columnVisibility[id]);

  const toggleColumn = (id) => {
    setColumnVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const showAllColumns = () => {
    setColumnVisibility(Object.fromEntries(COLUMN_IDS.map((id) => [id, true])));
  };
  const hideAllColumns = () => {
    setColumnVisibility(Object.fromEntries(COLUMN_IDS.map((id) => [id, false])));
  };

  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);

      // Fetch all tracking collections
      const [pageViewsSnap, clicksSnap, productViewsSnap, navSnap] = await Promise.all([
        getDocs(query(collection(db, 'userPageViews'), orderBy('createdAt', 'desc'), limit(100))),
        getDocs(query(collection(db, 'userClicks'), orderBy('createdAt', 'desc'), limit(100))),
        getDocs(query(collection(db, 'userProductViews'), orderBy('createdAt', 'desc'), limit(100))),
        getDocs(query(collection(db, 'userNavigation'), orderBy('createdAt', 'desc'), limit(100))),
      ]);

      const pageViewsRaw = pageViewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const pageViews = pageViewsRaw.filter(p => !(p.path || p.pagePath || "").startsWith("/admin"));
      const clicks = clicksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const productViews = productViewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const navigation = navSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Group by user
      const userMap = new Map();
      
      [...pageViews, ...clicks, ...productViews, ...navigation].forEach(item => {
        const userId = item.userId;
        if (!userId) return;

        if (!userMap.has(userId)) {
          userMap.set(userId, {
            userId,
            pageViews: [],
            clicks: [],
            productViews: [],
            navigation: [],
            deviceInfo: item.deviceInfo || {},
            locationInfo: item.locationInfo || {},
            lastActivity: null,
          });
        }

        const userData = userMap.get(userId);
        if (item.path) userData.pageViews.push(item);
        if (item.type === 'product_click' || item.type === 'button_click') userData.clicks.push(item);
        if (item.type === 'product_view') userData.productViews.push(item);
        if (item.type === 'navigation' || item.type === 'page_hidden' || item.type === 'page_visible') {
          userData.navigation.push(item);
        }

        // Update device/location info if newer
        if (item.deviceInfo) userData.deviceInfo = item.deviceInfo;
        if (item.locationInfo) userData.locationInfo = item.locationInfo;

        // Track last activity
        const itemTime = item.createdAt?.toDate?.() || item.timestamp?.toDate?.() || new Date(0);
        if (!userData.lastActivity || itemTime > userData.lastActivity) {
          userData.lastActivity = itemTime;
        }
      });

      // Convert to array and sort by last activity
      const users = Array.from(userMap.values())
        .sort((a, b) => {
          const aTime = a.lastActivity || new Date(0);
          const bTime = b.lastActivity || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });

      setTrackingData({
        users,
        totalUsers: users.length,
        totalPageViews: pageViews.length,
        totalClicks: clicks.length,
        totalProductViews: productViews.length,
        totalNavigation: navigation.length,
      });

    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const user = trackingData.users?.find(u => u.userId === userId);
      if (user) {
        setSelectedUserId(userId);
        setUserDetails(user);
        setClickProducts({});
        setViewProducts({});
        setDeviceDropdownOpen(false);
        setLocationDropdownOpen(false);

        const fetchProductMap = async (productIds) => {
          const productMap = {};
          await Promise.all(
            productIds.map(async (productId) => {
              try {
                const snap = await getDoc(doc(db, 'products', productId));
                if (!snap.exists()) {
                  productMap[productId] = { name: null, imageUrl: '/fallback.jpg' };
                  return;
                }
                const data = snap.data();
                const product = { id: productId, ...data };
                let imageUrl = getProductImageUrl(product, '200x200');
                if (imageUrl && typeof imageUrl === 'string' && imageUrl.includes('firebasestorage')) {
                  imageUrl = cleanFirebaseUrl(imageUrl) || imageUrl;
                }
                productMap[productId] = {
                  name: data.name || data.productName || data.title || 'Unknown',
                  imageUrl: imageUrl || '/fallback.jpg',
                };
              } catch (e) {
                productMap[productId] = { name: null, imageUrl: '/fallback.jpg' };
              }
            })
          );
          return productMap;
        };

        // Fetch product data for product_click items
        const productClicks = (user.clicks || []).filter(c => c.type === 'product_click' && c.productId);
        const clickIds = [...new Set(productClicks.map(c => c.productId))];
        setClickProducts(await fetchProductMap(clickIds));

        // Fetch product data for product_view items (visited /product/... pages)
        const productViews = user.productViews || [];
        const viewIds = [...new Set(productViews.filter(v => v.productId).map(v => v.productId))];
        setViewProducts(await fetchProductMap(viewIds));
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const getDeviceType = (deviceInfo) => {
    if (!deviceInfo?.userAgent) return 'Unknown';
    const ua = deviceInfo.userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile';
    if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet';
    return 'Desktop';
  };

  const getBrowserInfo = (deviceInfo) => {
    if (!deviceInfo?.userAgent) return 'Unknown';
    const ua = deviceInfo.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading tracking data...</p>
      </div>
    );
  }

  const paginatedUsers = trackingData.users?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  const closeDetails = () => {
    setSelectedUserId(null);
    setUserDetails(null);
  };

  return (
    <div className="space-y-6">
      {/* When viewing details, hide table and show only the modal */}
      {!selectedUserId && (
        <>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-xs font-medium text-blue-800">Total Users Tracked</h4>
          <p className="text-2xl font-bold text-blue-900">{trackingData.totalUsers || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-xs font-medium text-green-800">Page Views</h4>
          <p className="text-2xl font-bold text-green-900">{trackingData.totalPageViews || 0}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="text-xs font-medium text-purple-800">Product Clicks</h4>
          <p className="text-2xl font-bold text-purple-900">{trackingData.totalClicks || 0}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="text-xs font-medium text-orange-800">Product Views</h4>
          <p className="text-2xl font-bold text-orange-900">{trackingData.totalProductViews || 0}</p>
        </div>
        <div className="bg-pink-50 p-4 rounded-lg">
          <h4 className="text-xs font-medium text-pink-800">Navigation Events</h4>
          <p className="text-2xl font-bold text-pink-900">{trackingData.totalNavigation || 0}</p>
        </div>
      </div>

      {/* Users list: toolbar + table or cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
          <h4 className="text-md font-medium text-gray-700">
            Tracked Users ({trackingData.totalUsers || 0})
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            {/* View mode toggle */}
            <div className="flex rounded-lg border border-gray-300 p-0.5 bg-gray-100">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'table' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'cards' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Cards
              </button>
            </div>
            {/* Column filters dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColumnFilters((v) => !v)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50"
              >
                Columns
                <span className="text-xs text-gray-500">({visibleColumns.length})</span>
              </button>
              {showColumnFilters && (
                <>
                  <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setShowColumnFilters(false)} />
                  <div className="absolute right-0 mt-1 z-20 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                    <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase">Show columns</div>
                    {COLUMN_IDS.map((id) => (
                      <label key={id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={columnVisibility[id]}
                          onChange={() => toggleColumn(id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm capitalize">
                          {id === 'userId' ? 'User ID' : id === 'pageViews' ? 'Page Views' : id === 'productClicks' ? 'Product Clicks' : id === 'productViews' ? 'Product Views' : id === 'lastActivity' ? 'Last Activity' : id}
                        </span>
                      </label>
                    ))}
                    <div className="border-t mt-2 pt-2 px-3 flex gap-2">
                      <button type="button" onClick={showAllColumns} className="text-xs text-blue-600 hover:underline">Show all</button>
                      <button type="button" onClick={hideAllColumns} className="text-xs text-gray-500 hover:underline">Hide all</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            {trackingData.totalUsers > itemsPerPage && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  Page {currentPage} of {Math.ceil((trackingData.totalUsers || 0) / itemsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil((trackingData.totalUsers || 0) / itemsPerPage), prev + 1))}
                  disabled={currentPage >= Math.ceil((trackingData.totalUsers || 0) / itemsPerPage)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {visibleColumns.length === 0 && (
          <p className="text-sm text-amber-600 py-2">Select at least one column to display (use Columns filter).</p>
        )}

        {viewMode === 'table' && visibleColumns.length > 0 && (
          <div
            className="user-tracking-table-scroll overflow-x-auto overflow-y-visible -mx-2 sm:mx-0 rounded-lg border border-gray-200"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db #f3f4f6',
            }}
          >
            <style jsx>{`
              .user-tracking-table-scroll::-webkit-scrollbar { height: 10px; }
              .user-tracking-table-scroll::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 0 0 8px 8px; }
              .user-tracking-table-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 5px; }
              .user-tracking-table-scroll::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
            `}</style>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {columnVisibility.userId && (
                    <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">User ID</th>
                  )}
                  {columnVisibility.device && <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>}
                  {columnVisibility.browser && <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Browser</th>}
                  {columnVisibility.location && <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>}
                  {columnVisibility.pageViews && <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page Views</th>}
                  {columnVisibility.productClicks && <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Clicks</th>}
                  {columnVisibility.productViews && <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Views</th>}
                  {columnVisibility.lastActivity && <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>}
                  {columnVisibility.actions && <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length} className="px-3 py-6 sm:px-4 text-center text-sm text-gray-500">
                      No tracking data available. Users need to accept cookie consent to be tracked.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50">
                      {columnVisibility.userId && (
                        <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-sm font-mono max-w-[140px] sm:max-w-[200px] truncate" title={user.userId}>
                          {user.userId.startsWith('anonymous_') ? 'Anonymous User' : user.userId.slice(0, 20) + '...'}
                        </td>
                      )}
                      {columnVisibility.device && (
                        <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-600">
                          {getDeviceType(user.deviceInfo)}
                          {user.deviceInfo?.screenWidth && (
                            <div className="text-xs text-gray-500">{user.deviceInfo.screenWidth}x{user.deviceInfo.screenHeight}</div>
                          )}
                        </td>
                      )}
                      {columnVisibility.browser && <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-600">{getBrowserInfo(user.deviceInfo)}</td>}
                      {columnVisibility.location && (
                        <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-600 max-w-[120px] truncate" title={user.locationInfo?.timezone}>
                          {user.locationInfo?.timezone || 'Unknown'}
                          {user.locationInfo?.language && <div className="text-xs text-gray-500 truncate">{user.locationInfo.language}</div>}
                        </td>
                      )}
                      {columnVisibility.pageViews && <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-900 text-center">{user.pageViews.length}</td>}
                      {columnVisibility.productClicks && <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-900 text-center">{user.clicks.length}</td>}
                      {columnVisibility.productViews && <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-900 text-center">{user.productViews.length}</td>}
                      {columnVisibility.lastActivity && (
                        <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-600 whitespace-nowrap">{user.lastActivity ? user.lastActivity.toLocaleDateString() : 'N/A'}</td>
                      )}
                      {columnVisibility.actions && (
                        <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                          <button onClick={() => fetchUserDetails(user.userId)} className="text-blue-600 hover:text-blue-800 font-medium text-sm whitespace-nowrap">
                            View Details
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'cards' && visibleColumns.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginatedUsers.length === 0 ? (
              <div className="col-span-full text-center py-8 text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg">
                No tracking data available. Users need to accept cookie consent to be tracked.
              </div>
            ) : (
              paginatedUsers.map((user) => (
                <div key={user.userId} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    {columnVisibility.userId && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase">User ID</div>
                        <div className="text-sm font-mono truncate" title={user.userId}>
                          {user.userId.startsWith('anonymous_') ? 'Anonymous User' : user.userId.slice(0, 24) + (user.userId.length > 24 ? '...' : '')}
                        </div>
                      </div>
                    )}
                    {columnVisibility.device && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase">Device</div>
                        <div className="text-sm text-gray-900">
                          {getDeviceType(user.deviceInfo)}
                          {user.deviceInfo?.screenWidth && <span className="text-gray-500"> · {user.deviceInfo.screenWidth}x{user.deviceInfo.screenHeight}</span>}
                        </div>
                      </div>
                    )}
                    {columnVisibility.browser && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase">Browser</div>
                        <div className="text-sm text-gray-900">{getBrowserInfo(user.deviceInfo)}</div>
                      </div>
                    )}
                    {columnVisibility.location && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase">Location</div>
                        <div className="text-sm text-gray-900 truncate" title={user.locationInfo?.timezone}>{user.locationInfo?.timezone || 'Unknown'}</div>
                        {user.locationInfo?.language && <div className="text-xs text-gray-500">{user.locationInfo.language}</div>}
                      </div>
                    )}
                    {(columnVisibility.pageViews || columnVisibility.productClicks || columnVisibility.productViews) && (
                      <div className="flex flex-wrap gap-3 pt-1">
                        {columnVisibility.pageViews && (
                          <span className="text-xs"><strong className="text-gray-700">Page Views:</strong> {user.pageViews.length}</span>
                        )}
                        {columnVisibility.productClicks && (
                          <span className="text-xs"><strong className="text-gray-700">Clicks:</strong> {user.clicks.length}</span>
                        )}
                        {columnVisibility.productViews && (
                          <span className="text-xs"><strong className="text-gray-700">Product Views:</strong> {user.productViews.length}</span>
                        )}
                      </div>
                    )}
                    {columnVisibility.lastActivity && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase">Last Activity</div>
                        <div className="text-sm text-gray-900">{user.lastActivity ? user.lastActivity.toLocaleDateString() : 'N/A'}</div>
                      </div>
                    )}
                  </div>
                  {columnVisibility.actions && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => fetchUserDetails(user.userId)}
                        className="w-full sm:w-auto px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-md hover:bg-blue-50"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
        </>
      )}

      {/* User Details – full-screen overlay (jumbotron) with close */}
      {selectedUserId && userDetails && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/60 p-4 sm:p-6"
          onClick={closeDetails}
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-activity-title"
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden my-4 sm:my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky header with title + close */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 sm:px-6 py-4 bg-white border-b border-gray-200">
              <h5 id="detail-activity-title" className="text-lg font-semibold text-gray-900 truncate">
                Detailed Activity: {selectedUserId.startsWith('anonymous_') ? 'Anonymous User' : selectedUserId.slice(0, 24) + (selectedUserId.length > 24 ? '...' : '')}
              </h5>
              <button
                type="button"
                onClick={closeDetails}
                className="flex-shrink-0 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            {/* Scrollable body */}
            <div className="overflow-y-auto max-h-[calc(100vh-8rem)] px-4 sm:px-6 py-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setDeviceDropdownOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-100 transition-colors"
              >
                <h6 className="text-sm font-semibold text-gray-900">Device Information</h6>
                {deviceDropdownOpen ? (
                  <ChevronDownIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </button>
              {deviceDropdownOpen && (
                <div className="px-4 pb-4 pt-0 text-xs space-y-1 border-t border-gray-200">
                  <div><strong>Type:</strong> {getDeviceType(userDetails.deviceInfo)}</div>
                  <div><strong>Browser:</strong> {getBrowserInfo(userDetails.deviceInfo)}</div>
                  <div><strong>Platform:</strong> {userDetails.deviceInfo?.platform || 'Unknown'}</div>
                  <div><strong>Screen:</strong> {userDetails.deviceInfo?.screenWidth}x{userDetails.deviceInfo?.screenHeight}</div>
                  <div><strong>Language:</strong> {userDetails.deviceInfo?.language || 'Unknown'}</div>
                  <div><strong>Timezone:</strong> {userDetails.deviceInfo?.timezone || 'Unknown'}</div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setLocationDropdownOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-100 transition-colors"
              >
                <h6 className="text-sm font-semibold text-gray-900">Location Information</h6>
                {locationDropdownOpen ? (
                  <ChevronDownIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </button>
              {locationDropdownOpen && (
                <div className="px-4 pb-4 pt-0 text-xs space-y-1 border-t border-gray-200">
                  <div><strong>Timezone:</strong> {userDetails.locationInfo?.timezone || 'Unknown'}</div>
                  <div><strong>Language:</strong> {userDetails.locationInfo?.language || 'Unknown'}</div>
                </div>
              )}
            </div>
          </div>

          {/* Page Views */}
          {userDetails.pageViews.length > 0 && (
            <div className="mb-4">
              <h6 className="text-sm font-semibold mb-2">Page Views ({userDetails.pageViews.length})</h6>
              <div className="max-h-40 overflow-y-auto text-xs space-y-1">
                {userDetails.pageViews.slice(0, 10).map((view, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded">
                    <div><strong>Path:</strong> {view.path}</div>
                    <div><strong>Time:</strong> {view.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Clicks - small cards with image */}
          {userDetails.clicks.filter(c => c.type === 'product_click').length > 0 && (
            <div className="mb-4">
              <h6 className="text-sm font-semibold mb-2">
                Product Clicks ({userDetails.clicks.filter(c => c.type === 'product_click').length})
              </h6>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {userDetails.clicks
                  .filter(c => c.type === 'product_click')
                  .slice(0, 20)
                  .map((click, idx) => {
                    const productId = click.productId;
                    const product = clickProducts[productId];
                    const name = (click.productName || product?.name || productId || 'Unknown product').trim() || 'Unknown product';
                    const imgSrc = (product?.imageUrl && product.imageUrl !== '') ? product.imageUrl : '/fallback.jpg';
                    const time = click.createdAt?.toDate?.()?.toLocaleString() || 'N/A';
                    return (
                      <div
                        key={`click-${click.id}-${idx}`}
                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2 min-w-0 max-w-[220px] shadow-sm"
                      >
                        <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                          <img
                            src={imgSrc}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/fallback.jpg'; }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-gray-900 truncate" title={name}>{name}</div>
                          <div className="text-[10px] text-gray-500 truncate">{time}</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Viewed Products (visited /product/... pages) - same card style */}
          {userDetails.productViews && userDetails.productViews.length > 0 && (
            <div className="mb-4">
              <h6 className="text-sm font-semibold mb-2">
                Viewed Products ({userDetails.productViews.length})
              </h6>
              <p className="text-xs text-gray-500 mb-2">Products opened from /product path</p>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {userDetails.productViews
                  .slice(0, 20)
                  .map((view, idx) => {
                    const productId = view.productId;
                    const product = viewProducts[productId];
                    const name = (view.productName || product?.name || productId || 'Unknown product').trim() || 'Unknown product';
                    const imgSrc = (product?.imageUrl && product.imageUrl !== '') ? product.imageUrl : '/fallback.jpg';
                    const time = view.createdAt?.toDate?.()?.toLocaleString() || view.timestamp?.toDate?.()?.toLocaleString() || 'N/A';
                    return (
                      <div
                        key={`view-${view.id || productId}-${idx}`}
                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2 min-w-0 max-w-[220px] shadow-sm"
                      >
                        <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                          <img
                            src={imgSrc}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/fallback.jpg'; }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-gray-900 truncate" title={name}>{name}</div>
                          <div className="text-[10px] text-gray-500 truncate">{time}</div>
                        </div>
                      </div>
                    );
                  })}
          </div>
          </div>
          )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeDetails}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
