"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ChatLogsPage() {
  const [chatLogs, setChatLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      fetchChatLogs();
    });

    return () => unsubscribe();
  }, [router]);

  const fetchChatLogs = async () => {
    try {
      const q = query(
        collection(db, "chat_logs"),
        orderBy("timestamp", "desc"),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChatLogs(logs);
    } catch (error) {
      console.error("Error fetching chat logs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Logs</h1>
          <p className="text-gray-600">Monitor AI customer service conversations</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Conversations ({chatLogs.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {chatLogs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No chat logs found yet.
              </div>
            ) : (
              chatLogs.map((log) => (
                <div key={log.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                          User Message:
                        </h3>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-800">{log.userMessage}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                          AI Response:
                        </h3>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-800 whitespace-pre-line">
                            {log.aiResponse}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Session ID: {log.sessionId}</span>
                        <span>
                          {log.timestamp?.toDate?.()
                            ? log.timestamp.toDate().toLocaleString()
                            : log.createdAt || "Unknown time"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


