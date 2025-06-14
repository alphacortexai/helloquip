

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

function UserAvatar({ label }) {
  const initials = label
    ? label
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
      {initials}
    </div>
  );
}

export default function AdminChatPanel() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [view, setView] = useState("list");
  const messagesEndRef = useRef(null);

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
      <div className="h-[600px] rounded overflow-hidden bg-white shadow-sm border border-gray-200 p-3 overflow-y-auto">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Users</h3>
        {users.length === 0 ? (
          <p className="text-sm text-gray-500">No users found</p>
        ) : (
          <div className="flex flex-col gap-1">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserClick(user)}
                className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 relative"
              >
                <UserAvatar label={user.name} />
                <span>{user.name}</span>
                {user.unreadCount > 0 && (
                  <span className="absolute right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {user.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] rounded overflow-hidden bg-white shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 p-3 border-b border-gray-200 bg-gray-50">
        <button
          onClick={handleBack}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          ← Back
        </button>
        <UserAvatar label={selectedUser.name} />
        <h3 className="font-semibold text-gray-700">{selectedUser.name}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-white">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center mt-4">No messages yet</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`relative px-4 py-2 text-sm max-w-[70%] shadow-sm break-words ${
              msg.from === "admin"
                ? "bg-blue-600 text-white self-end rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                : "bg-gray-200 text-gray-800 self-start rounded-tl-lg rounded-tr-lg rounded-br-lg"
            }`}
          >
            {msg.text}
            {msg.from === "admin" && (
              <span className="absolute bottom-1 right-2 text-xs flex items-center gap-1">
                {msg.read ? (
                  <CheckCheck size={14} className="text-blue-300" />
                ) : (
                  <Check size={14} className="text-gray-300" />
                )}
              </span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 flex gap-2 bg-white border-t border-gray-200">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700"
        >
          Send Msg
        </button>
      </div>
    </div>
  );
}
