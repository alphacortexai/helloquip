"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { UserGroupIcon } from "@heroicons/react/24/outline";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const ref = collection(db, "users");
        const snap = await getDocs(ref);
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        list.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? a.createdAt ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? b.createdAt ?? 0;
          return bTime - aTime;
        });
        setUsers(list);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gray-200 rounded-lg" />
          <div className="h-6 bg-gray-200 rounded w-48" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <UserGroupIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500">
            {users.length} registered {users.length === 1 ? "user" : "users"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email / Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600 truncate max-w-[180px]">
                      {user.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {user.email || user.address?.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.address && typeof user.address === "object"
                        ? [
                            user.address.street,
                            user.address.city,
                            user.address.country,
                          ]
                            .filter(Boolean)
                            .join(", ") || "—"
                        : user.address || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
