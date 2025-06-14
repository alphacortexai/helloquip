// "use client";

// import { useEffect, useState, useRef } from "react";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import {
//   collection,
//   query,
//   where,
//   orderBy,
//   onSnapshot,
//   addDoc,
//   deleteDoc,
//   doc,
//   serverTimestamp,
//   getDoc,
// } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { ArrowLeft, SendHorizonal } from "lucide-react";

// export default function UserMessenger() {
//   const [user, setUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribeAuth();
//   }, []);

//   useEffect(() => {
//     if (!user) return;

//     const chatId = `admin_${user.uid}`;
//     const q = query(
//       collection(db, "messages"),
//       where("chatId", "==", chatId),
//       orderBy("timestamp", "asc")
//     );

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       setMessages(msgs);

//       setTimeout(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//       }, 100);
//     });

//     return () => unsubscribe();
//   }, [user]);

//   const extractProductId = (text) => {
//     const regex = /#([\w-]+)/;
//     const match = text.match(regex);
//     return match ? match[1] : null;
//   };

//   const fetchProductById = async (productId) => {
//     try {
//       const productDoc = await getDoc(doc(db, "products", productId));
//       if (productDoc.exists()) {
//         return { id: productId, ...productDoc.data() };
//       }
//     } catch (err) {
//       console.error("Error fetching product:", err);
//     }
//     return null;
//   };

//   const sendMessage = async () => {
//     if (!input.trim() || !user) return;

//     const chatId = `admin_${user.uid}`;
//     await addDoc(collection(db, "messages"), {
//       from: user.uid,
//       to: "admin",
//       text: input.trim(),
//       timestamp: serverTimestamp(),
//       chatId,
//     });

//     const productId = extractProductId(input.trim());
//     if (productId) {
//       const product = await fetchProductById(productId);
//       if (product) {
//         await addDoc(collection(db, "messages"), {
//           from: "admin",
//           to: user.uid,
//           type: "product_card",
//           product,
//           timestamp: serverTimestamp(),
//           chatId,
//         });
//       }
//     }

//     setInput("");
//   };

//   const handleRemoveProductCard = async (msgId) => {
//     try {
//       await deleteDoc(doc(db, "messages", msgId));
//     } catch (err) {
//       console.error("Failed to remove product card:", err);
//     }
//   };

//   if (!user) return <p>Please log in to see your messages.</p>;

//   return (
//     <div className="max-w-md mx-auto flex flex-col h-[90vh] bg-white relative rounded-xl overflow-hidden shadow-sm">
//       {/* Chat header */}
//       <div className="flex items-center gap-3 p-4 bg-white shadow-md">
//         <button
//           onClick={() => window.history.back()}
//           className="text-gray-500 hover:text-gray-700 transition"
//         >
//           <ArrowLeft size={22} />
//         </button>
//         <h2 className="text-lg font-semibold text-gray-800">HelloQuip Chat</h2>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto px-4 pt-2 pb-32 flex flex-col space-y-2">
//         {messages.length === 0 && (
//           <p className="text-gray-400 text-center mt-4">No messages yet.</p>
//         )}

//         {messages.map((msg) => {
//           const isAdmin = msg.from === "admin";

//           if (msg.type === "product_card" && msg.product) {
//             const p = msg.product;
//             return (
//               <div
//                 key={msg.id}
//                 className="relative max-w-[70%] bg-green-100 rounded-xl p-3 flex gap-2 self-start ml-2 shadow-sm"
//               >
//                 <button
//                   onClick={() => handleRemoveProductCard(msg.id)}
//                   className="absolute top-1 right-2 text-gray-400 hover:text-red-500"
//                   aria-label="Remove product card"
//                 >
//                   &times;
//                 </button>
//                 <img
//                   src={p.imageUrl}
//                   alt={p.name}
//                   className="w-12 h-12 object-cover rounded"
//                 />
//                 <div className="flex flex-col text-sm text-gray-800">
//                   <p className="font-semibold">{p.name}</p>
//                   <p className="text-xs text-green-700 font-semibold">
//                     UGX {parseInt(p.price).toLocaleString()}
//                   </p>
//                   <p className="text-xs truncate max-w-xs">{p.description}</p>
//                   <p className="text-xs text-gray-500">Product ID: {p.id}</p>
//                 </div>
//               </div>
//             );
//           }

//           return (
//             <div
//               key={msg.id}
//               className={`px-4 py-2 max-w-[70%] break-words text-sm ${
//                 isAdmin
//                   ? "bg-gray-100 text-gray-800 self-start ml-2 rounded-xl shadow-sm"
//                   : "bg-blue-600 text-white self-end mr-2 rounded-xl shadow-sm"
//               }`}
//             >
//               {msg.text}
//             </div>
//           );
//         })}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Smooth WhatsApp-style input */}
//       <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-3 py-2 bg-transparent">
//        <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-md rounded-full px-5 py-3">

//           <input
//             type="text"
//             placeholder="Type a message..."
//             className="flex-1 text-base bg-transparent outline-none text-gray-800 placeholder-gray-400"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") {
//                 e.preventDefault();
//                 sendMessage();
//               }
//             }}
//           />
//           <button
//             onClick={sendMessage}
//             className="text-blue-600 hover:text-blue-800 transition"
//           >
//             <SendHorizonal size={20} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Check, CheckCheck } from "lucide-react";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, SendHorizonal } from "lucide-react";

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

  async function markMessagesAsRead(unreadMessages) {
    for (const msg of unreadMessages) {
      if (!msg.read && msg.to === user.uid) {
        const msgRef = doc(db, "messages", msg.id);
        await updateDoc(msgRef, { read: true });
      }
    }
  }

  useEffect(() => {
    if (!user) return;

    const chatId = `admin_${user.uid}`;
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      const unreadMessages = msgs.filter(
        (msg) => msg.to === user.uid && !msg.read
      );
      if (unreadMessages.length > 0) {
        await markMessagesAsRead(unreadMessages);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const extractProductId = (text) => {
    const regex = /#([\w-]+)/;
    const match = text.match(regex);
    return match ? match[1] : null;
  };

  const fetchProductById = async (productId) => {
    try {
      const productDoc = await getDoc(doc(db, "products", productId));
      if (productDoc.exists()) {
        return { id: productId, ...productDoc.data() };
      }
    } catch (err) {
      console.error("Error fetching product:", err);
    }
    return null;
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const chatId = `admin_${user.uid}`;
    await addDoc(collection(db, "messages"), {
      from: user.uid,
      to: "admin",
      text: input.trim(),
      timestamp: serverTimestamp(),
      chatId,
      read: false,
    });

    const productId = extractProductId(input.trim());
    if (productId) {
      const product = await fetchProductById(productId);
      if (product) {
        await addDoc(collection(db, "messages"), {
          from: "admin",
          to: user.uid,
          type: "product_card",
          product,
          timestamp: serverTimestamp(),
          chatId,
          read: false,
        });
      }
    }

    setInput("");
  };

  const handleRemoveProductCard = async (msgId) => {
    try {
      await deleteDoc(doc(db, "messages", msgId));
    } catch (err) {
      console.error("Failed to remove product card:", err);
    }
  };

  if (!user) return <p>Please log in to see your messages.</p>;

  return (
    <div className="max-w-md mx-auto flex flex-col h-[90vh] bg-white relative rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 p-4 bg-white shadow-md">
        <button
          onClick={() => window.history.back()}
          className="text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">HelloQuip Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-32 flex flex-col space-y-2">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-4">No messages yet.</p>
        )}

        {messages.map((msg) => {
          const isSentByUser = msg.from === user.uid;
          const isProductCard = msg.type === "product_card" && msg.product;

          if (isProductCard) {
            const p = msg.product;
            return (
              <div
                key={msg.id}
                className="relative max-w-[70%] bg-green-100 rounded-xl p-3 flex gap-2 self-start ml-2 shadow-sm"
              >
                <button
                  onClick={() => handleRemoveProductCard(msg.id)}
                  className="absolute top-1 right-2 text-gray-400 hover:text-red-500"
                  aria-label="Remove product card"
                >
                  &times;
                </button>
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex flex-col text-sm text-gray-800">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-green-700 font-semibold">
                    UGX {parseInt(p.price).toLocaleString()}
                  </p>
                  <p className="text-xs truncate max-w-xs">{p.description}</p>
                  <p className="text-xs text-gray-500">Product ID: {p.id}</p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`px-4 py-2 max-w-[70%] break-words text-sm ${
                isSentByUser
                  ? "bg-[#dcf8c6] text-gray-900 self-end mr-2 rounded-xl shadow-sm"
                  : "bg-gray-100 text-gray-800 self-start ml-2 rounded-xl shadow-sm"
              } relative`}
            >
              {msg.text}

              {isSentByUser && (
                <span className="absolute bottom-1 right-2 text-xs">
                  {msg.read ? (
                    <CheckCheck size={14} className="text-blue-500" />
                  ) : (
                    <CheckCheck size={14} className="text-gray-400" />
                  )}
                </span>
              )}

            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-3 py-2 bg-transparent">
        <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-md rounded-full px-5 py-3">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 text-base bg-transparent outline-none text-gray-800 placeholder-gray-400"
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
            className="text-blue-600 hover:text-blue-800 transition"
          >
            <SendHorizonal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
