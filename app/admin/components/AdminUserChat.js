


"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";

export default function AdminChatPanel() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const searchParams = useSearchParams();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const messagesSnap = await getDocs(collection(db, "messages"));
      const userMap = new Map();

      messagesSnap.forEach((doc) => {
        const msg = doc.data();
        if (msg.from !== "admin") {
          userMap.set(msg.from, msg.userEmail || msg.from); // Prefer email, fallback to UID
        } else if (msg.to !== "admin") {
          userMap.set(msg.to, msg.userEmail || msg.to);
        }
      });

      const formatted = Array.from(userMap.entries()).map(([id, label]) => ({
        id,
        label,
      }));

      setUsers(formatted);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const userIdFromURL = searchParams.get("userId");
    if (userIdFromURL) {
      const user = users.find((u) => u.id === userIdFromURL);
      if (user) setSelectedUser(user);
    }
  }, [searchParams, users]);

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", `admin_${selectedUser.id}`),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsub();
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedUser) return;

    await addDoc(collection(db, "messages"), {
      from: "admin",
      to: selectedUser.id,
      text: input.trim(),
      timestamp: new Date(),
      chatId: `admin_${selectedUser.id}`,
    });

    setInput("");
  };

  return (
    <div className="flex h-[600px] rounded overflow-hidden bg-white shadow-sm">
      {/* User List */}
      <div className="w-1/3 p-3 overflow-y-auto bg-gray-50">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Users</h3>
        {users.length === 0 && <p className="text-sm text-gray-500">No users found</p>}
        {users.map((user) => (
          <button
            key={user.id}
            className={`block w-full text-left px-3 py-2 text-sm rounded-lg mb-1 transition ${
              selectedUser?.id === user.id
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            onClick={() => setSelectedUser(user)}
          >
            {user.label}
          </button>
        ))}
      </div>

      {/* Chat View */}
      <div className="w-2/3 flex flex-col">
        {selectedUser ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-white">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`px-4 py-2 text-sm max-w-[70%] shadow-sm ${
                    msg.from === "admin"
                      ? "bg-blue-600 text-white self-end rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                      : "bg-gray-200 text-gray-800 self-start rounded-tl-lg rounded-tr-lg rounded-br-lg"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 flex gap-2 bg-white">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition"
              >
                Send Msg
              </button>
            </div>
          </>
        ) : (
          <div className="p-4 text-gray-500">Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
}
