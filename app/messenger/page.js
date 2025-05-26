"use client";

import { useEffect, useState, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function UserMessenger() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const chatId = `admin_${user.uid}`;

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [user]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    await addDoc(collection(db, "messages"), {
      from: user.uid,
      to: "admin",
      text: input.trim(),
      timestamp: serverTimestamp(),
      chatId: `admin_${user.uid}`,
    });

    setInput("");
  };

  if (!user) return <p>Please log in to see your messages.</p>;

  return (
    <div className="max-w-md mx-auto flex flex-col h-[80vh] border rounded p-4 bg-white relative">
        <h2 className="text-xl font-semibold mb-4">HelloQuip Chat</h2>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-28 flex flex-col space-y-1">
        {messages.length === 0 && (
            <p className="text-gray-500 text-center mt-4">No messages yet.</p>
        )}

        {messages.map((msg) => {
            const isAdmin = msg.from === "admin";
            return (
            <div
                key={msg.id}
                className={`px-4 py-2 max-w-[70%] break-words text-sm ${
                isAdmin
                    ? "bg-gray-200 text-gray-800 self-start ml-2 rounded-tl-md rounded-tr-md rounded-br-md rounded-bl-none"
                    : "bg-blue-600 text-white self-end mr-2 rounded-tl-md rounded-tr-md rounded-bl-md rounded-br-none"
                }`}
                style={{ alignSelf: isAdmin ? "flex-start" : "flex-end" }}
            >
                {msg.text}
            </div>
            );
        })}

        <div ref={messagesEndRef} />
        </div>

        {/* Input - stick to bottom */}
        <div className="absolute bottom-10 left-4 right-4 bg-white flex items-center gap-2">
        <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
            }
            }}
        />
        <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition text-sm font-medium"
        >
            Send
        </button>
        </div>
    </div>
);


}
