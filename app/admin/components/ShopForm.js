// "use client";

// import { useState } from "react";
// import { db } from "@/lib/firebase";
// import { collection, addDoc } from "firebase/firestore";

// export default function ShopForm({ onShopCreated }) {
//   const [shopName, setShopName] = useState("");
//   const [description, setDescription] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!shopName.trim()) return alert("Shop name is required");
//     setLoading(true);

//     try {
//       await addDoc(collection(db, "shops"), {
//         name: shopName.trim(),
//         description: description.trim(),
//         createdAt: new Date(),
//       });
//       alert("Shop created successfully!");
//       setShopName("");
//       setDescription("");
//       if (onShopCreated) onShopCreated(); // callback to refresh shop list
//     } catch (error) {
//       alert("Error creating shop: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow-md rounded-md space-y-4">
//       <h2 className="text-lg font-semibold">Create New Shop</h2>

//       <input
//         type="text"
//         placeholder="Shop name"
//         value={shopName}
//         onChange={(e) => setShopName(e.target.value)}
//         className="w-full p-2 border rounded"
//         required
//       />

//       <textarea
//         placeholder="Description (optional)"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         className="w-full p-2 border rounded"
//       />

//       <button
//         type="submit"
//         disabled={loading}
//         className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
//       >
//         {loading ? "Creating..." : "Create Shop"}
//       </button>
//     </form>
//   );
// }


"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function ShopForm({ currentUserId, onShopCreated }) {
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shopName.trim()) return alert("Shop name is required");
    setLoading(true);

    try {
      await addDoc(collection(db, "shops"), {
        name: shopName.trim(),
        description: description.trim(),
        createdBy: currentUserId,  // <--- Assign current user here
        createdAt: new Date(),
      });
      alert("Shop created successfully!");
      setShopName("");
      setDescription("");
      if (onShopCreated) onShopCreated(); // callback to refresh shop list
    } catch (error) {
      alert("Error creating shop: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow-md rounded-md space-y-4">
      <h2 className="text-lg font-semibold">Create New Shop</h2>

      <input
        type="text"
        placeholder="Shop name"
        value={shopName}
        onChange={(e) => setShopName(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Shop"}
      </button>
    </form>
  );
}
