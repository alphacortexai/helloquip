

// "use client";

// import { useEffect, useState, useRef } from "react";
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   orderBy,
//   addDoc,
//   onSnapshot,
//   updateDoc,
//   doc,
// } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { Check, CheckCheck } from "lucide-react";

// function UserAvatar({ label }) {
//   const initials = label
//     ? label
//         .split(" ")
//         .map((w) => w[0])
//         .slice(0, 2)
//         .join("")
//         .toUpperCase()
//     : "?";

//   return (
//     <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
//       {initials}
//     </div>
//   );
// }

// export default function AdminChatPanel() {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [view, setView] = useState("list");
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       const messagesSnap = await getDocs(collection(db, "messages"));
//       const userMap = new Map();

//       messagesSnap.forEach((doc) => {
//         const msg = doc.data();
//         const isFromAdmin = msg.from === "admin";
//         const userId = isFromAdmin ? msg.to : msg.from;
//         if (userId !== "admin") {
//           const existing = userMap.get(userId) || { unreadCount: 0 };
//           const isUnread = !msg.read && msg.to === "admin";
//           userMap.set(userId, {
//             id: userId,
//             email: msg.userEmail || userId,
//             unreadCount: existing.unreadCount + (isUnread ? 1 : 0),
//           });
//         }
//       });

//       setUsers(Array.from(userMap.values()));
//     };

//     fetchUsers();
//   }, []);

//   useEffect(() => {
//     if (!selectedUser) {
//       setMessages([]);
//       return;
//     }

//     const q = query(
//       collection(db, "messages"),
//       where("chatId", "==", `admin_${selectedUser.id}`),
//       orderBy("timestamp", "asc")
//     );

//     const unsub = onSnapshot(q, async (snapshot) => {
//       const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       setMessages(msgs);

//       // Mark unread messages from user as read
//       const unreadMsgs = msgs.filter(
//         (msg) => msg.from === selectedUser.id && !msg.read
//       );

//       for (const msg of unreadMsgs) {
//         await updateDoc(doc(db, "messages", msg.id), { read: true });
//       }

//       setTimeout(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//       }, 100);
//     });

//     return () => unsub();
//   }, [selectedUser]);

//   const sendMessage = async () => {
//     if (!input.trim() || !selectedUser) return;

//     await addDoc(collection(db, "messages"), {
//       from: "admin",
//       to: selectedUser.id,
//       text: input.trim(),
//       chatId: `admin_${selectedUser.id}`,
//       timestamp: new Date(),
//       read: false,
//     });

//     setInput("");
//   };

//   const handleUserClick = (user) => {
//     setSelectedUser(user);
//     setView("chat");
//   };

//   const handleBack = () => {
//     setSelectedUser(null);
//     setView("list");
//   };

//   if (view === "list") {
//     return (
//       <div className="h-[600px] rounded overflow-hidden bg-white shadow-sm border border-gray-200 p-3 overflow-y-auto">
//         <h3 className="font-semibold text-gray-700 mb-3 text-sm">Users</h3>
//         {users.length === 0 ? (
//           <p className="text-sm text-gray-500">No users found</p>
//         ) : (
//           <div className="flex flex-col gap-1">
//             {users.map((user) => (
//               <button
//                 key={user.id}
//                 onClick={() => handleUserClick(user)}
//                 className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 relative"
//               >
//                 <UserAvatar label={user.email} />
//                 <span>{user.email}</span>
//                 {user.unreadCount > 0 && (
//                   <span className="absolute right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
//                     {user.unreadCount}
//                   </span>
//                 )}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-[600px] rounded overflow-hidden bg-white shadow-sm border border-gray-200">
//       <div className="flex items-center gap-3 p-3 border-b border-gray-200 bg-gray-50">
//         <button
//           onClick={handleBack}
//           className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
//         >
//           ← Back
//         </button>
//         <UserAvatar label={selectedUser.email} />
//         <h3 className="font-semibold text-gray-700">{selectedUser.email}</h3>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-white">
//         {messages.length === 0 && (
//           <p className="text-gray-500 text-center mt-4">No messages yet</p>
//         )}
//         {messages.map((msg) => (
//           <div
//             key={msg.id}
//             className={`relative px-4 py-2 text-sm max-w-[70%] shadow-sm break-words ${
//               msg.from === "admin"
//                 ? "bg-blue-600 text-white self-end rounded-tl-lg rounded-tr-lg rounded-bl-lg"
//                 : "bg-gray-200 text-gray-800 self-start rounded-tl-lg rounded-tr-lg rounded-br-lg"
//             }`}
//           >
//             {msg.text}
//             {msg.from === "admin" && (
//               <span className="absolute bottom-1 right-2 text-xs flex items-center gap-1">
//                 {msg.read ? (
//                   <CheckCheck size={14} className="text-blue-300" />
//                 ) : (
//                   <Check size={14} className="text-gray-300" />
//                 )}
//               </span>
//             )}
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       <div className="p-3 flex gap-2 bg-white border-t border-gray-200">
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Type your message..."
//           className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           onKeyDown={(e) => {
//             if (e.key === "Enter") sendMessage();
//           }}
//         />
//         <button
//           onClick={sendMessage}
//           className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700"
//         >
//           Send Msg
//         </button>
//       </div>
//     </div>
//   );
// }






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
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Check, CheckCheck } from "lucide-react";

function UserAvatar({ label, size = "md" }) {
  const initials = label
    ? label
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  };

  return (
    <div className={`rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0 shadow-sm ${sizeClasses[size]}`}>
      {initials}
    </div>
  );
}

export default function AdminChatPanel({ selectedUserId = null }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [view, setView] = useState("list");
  const messagesEndRef = useRef(null);

  // Auto-select user if selectedUserId is provided
  useEffect(() => {
    if (selectedUserId && users.length > 0) {
      const user = users.find(u => u.id === selectedUserId);
      if (user) {
        setSelectedUser(user);
        setView("chat");
      }
    }
  }, [selectedUserId, users]);

  useEffect(() => {
    const fetchUsers = async () => {
      const messagesSnap = await getDocs(collection(db, "messages"));
      const userMap = new Map();
      const userIds = new Set();

      messagesSnap.forEach((doc) => {
        const msg = doc.data();
        const userId = msg.from === "admin" ? msg.to : msg.from;
        if (userId !== "admin") userIds.add(userId);
      });

      const userProfiles = {};
      const usersSnap = await getDocs(collection(db, "users"));
      usersSnap.forEach((doc) => {
        userProfiles[doc.id] = doc.data();
      });

      messagesSnap.forEach((doc) => {
        const msg = doc.data();
        const userId = msg.from === "admin" ? msg.to : msg.from;
        if (userId !== "admin") {
          const existing = userMap.get(userId) || { unreadCount: 0 };
          const isUnread = !msg.read && msg.to === "admin";
          const profile = userProfiles[userId];

          userMap.set(userId, {
            id: userId,
            name: profile?.name || msg.userEmail || userId,
            email: profile?.email || msg.userEmail || userId,
            unreadCount: existing.unreadCount + (isUnread ? 1 : 0),
          });
        }
      });

      setUsers(Array.from(userMap.values()));
    };

    fetchUsers();
  }, []);

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

    const unsub = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);

      const unreadMsgs = msgs.filter(
        (msg) => msg.from === selectedUser.id && !msg.read
      );

      for (const msg of unreadMsgs) {
        await updateDoc(doc(db, "messages", msg.id), { read: true });
      }

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
      chatId: `admin_${selectedUser.id}`,
      timestamp: new Date(),
      read: false,
    });

    setInput("");
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setView("chat");
  };

  const handleBack = () => {
    setSelectedUser(null);
    setView("list");
  };

  if (view === "list") {
    return (
      <div className="h-[600px] md:h-[700px] rounded-lg overflow-hidden bg-white shadow-sm border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
          <h3 className="font-semibold text-white text-lg">Chat with Users</h3>
          <p className="text-blue-100 text-sm">Select a user to start chatting</p>
        </div>
        
        {/* Users List */}
        <div className="p-3 overflow-y-auto h-full">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No conversations yet</p>
              <p className="text-gray-400 text-xs mt-1">Users will appear here when they send messages</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-gray-50 text-gray-700 relative transition-colors border border-transparent hover:border-gray-200"
                >
                  <UserAvatar label={user.name} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.name || user.email}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  {user.unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {user.unreadCount}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] md:h-[700px] rounded-lg overflow-hidden bg-white shadow-sm border border-gray-200">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <UserAvatar label={selectedUser.name} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-lg truncate">{selectedUser.name}</h3>
          <p className="text-green-100 text-sm truncate">{selectedUser.email}</p>
        </div>
        <div className="w-2 h-2 bg-green-300 rounded-full"></div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No messages yet</p>
            <p className="text-gray-400 text-xs mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === "admin" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative px-4 py-3 text-sm max-w-[85%] md:max-w-[70%] break-words rounded-2xl shadow-sm ${
                  msg.from === "admin"
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.from === "admin" && (
                  <div className="absolute bottom-1 right-2 text-xs flex items-center gap-1">
                    {msg.read ? (
                      <CheckCheck size={12} className="text-blue-300" />
                    ) : (
                      <Check size={12} className="text-blue-300" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-3 pr-12 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
}
