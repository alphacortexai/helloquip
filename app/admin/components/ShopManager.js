"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, deleteDoc, getDoc } from "firebase/firestore";
import ShopForm from "./ShopForm";
import CreateShopForm from "./CreateShopForm";

export default function ShopManager({ currentAdminUid }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingShop, setEditingShop] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    fetchShops();
  }, [currentAdminUid]);

  const fetchShops = async () => {
    try {
      // Remove the createdBy filter to allow all admins to see all shops
      const q = query(collection(db, "shops"));
      const snapshot = await getDocs(q);
      const shopList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShops(shopList);

      // Fetch user names for all unique createdBy IDs
      const uniqueUserIds = [...new Set(shopList.map(shop => shop.createdBy).filter(Boolean))];
      await fetchUserNames(uniqueUserIds);
    } catch (error) {
      console.error("Error fetching shops:", error);
    } finally {
      setLoading(false);
    }
  };

         const fetchUserNames = async (userIds) => {
         try {
           const names = {};
           for (const userId of userIds) {
             try {
               // Get the user document directly by ID (since user ID is the document ID)
               const userDocRef = doc(db, "users", userId);
               const userDocSnap = await getDoc(userDocRef);
               
                               if (userDocSnap.exists()) {
                  const userData = userDocSnap.data();
                  // Get the name field from the user document
                  names[userId] = userData.name || userId;
                } else {
                  names[userId] = userId; // Fallback to ID if user not found
                }
             } catch (error) {
               console.warn(`Error fetching user ${userId}:`, error);
               names[userId] = userId; // Fallback to ID
             }
           }
                       setUserNames(names);
         } catch (error) {
           console.error("Error fetching user names:", error);
         }
       };

  const handleDelete = async (shopId, shopName) => {
    if (confirm(`Are you sure you want to delete "${shopName}"? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, "shops", shopId));
        setShops(prev => prev.filter(shop => shop.id !== shopId));
        alert("Shop deleted successfully!");
      } catch (error) {
        console.error("Error deleting shop:", error);
        alert("Error deleting shop. Please try again.");
      }
    }
  };

  const handleEdit = (shop) => {
    setEditingShop(shop);
    setShowCreateForm(false);
  };

  const handleCancelEdit = () => {
    setEditingShop(null);
  };

  const handleEditSuccess = () => {
    setEditingShop(null);
    fetchShops(); // Refresh the list
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchShops(); // Refresh the list
  };

  if (loading) {
    return <div className="p-4">Loading shops...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Manage Shops</h2>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingShop(null);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          + Create New Shop
        </button>
      </div>

      {/* Create Shop Form */}
      {showCreateForm && (
        <div className="mb-6">
          <CreateShopForm
            currentUserId={currentAdminUid}
            onShopCreated={handleCreateSuccess}
          />
          <button
            onClick={() => setShowCreateForm(false)}
            className="mt-3 text-sm text-gray-600 underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Edit Shop Form */}
      {editingShop && (
        <div className="mb-6">
          <ShopForm
            shopId={editingShop.id}
            onSuccess={handleEditSuccess}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      {/* Shops List */}
      {!showCreateForm && !editingShop && (
        <div className="space-y-4">
          {shops.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No shops found. Create your first shop to get started.</p>
            </div>
          ) : (
            shops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {shop.name}
                    </h3>
                    {shop.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {shop.description}
                      </p>
                    )}
                    <div className="text-xs text-gray-500">
                      Created: {shop.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                      {shop.updatedAt && (
                        <span className="ml-4">
                          Updated: {shop.updatedAt?.toDate?.()?.toLocaleDateString()}
                        </span>
                      )}
                                                   {shop.createdBy && (
                               <div className="mt-1">
                                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                   Created by: {userNames[shop.createdBy] ? `(${userNames[shop.createdBy]})` : shop.createdBy}
                                 </span>
                               </div>
                             )}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(shop)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(shop.id, shop.name)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
