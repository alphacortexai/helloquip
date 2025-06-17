// "use client";
// import { useState, useEffect } from "react";
// import { db } from "@/lib/firebase";
// import { collection, addDoc, getDocs } from "firebase/firestore";

// export default function SubCategoryForm({ onSuccess }) {
//   const [name, setName] = useState("");
//   const [parentId, setParentId] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       const snapshot = await getDocs(collection(db, "categories"));
//       const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setCategories(list);
//     };
//     fetchCategories();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!parentId) return alert("Please select a parent category.");
//     if (!name.trim()) return alert("Please enter a subcategory name.");

//     setLoading(true);
//     try {
//       await addDoc(collection(db, "categories"), {
//         name: name.trim(),
//         parentId,
//         imageUrl: "", // Optional: or omit this field
//       });

//       onSuccess && onSuccess();
//       setName("");
//       setParentId("");
//     } catch (err) {
//       console.error("Error adding subcategory:", err);
//       alert("Failed to create subcategory.");
//     }
//     setLoading(false);
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="max-w-md mx-auto bg-white p-6 rounded-lg shadow space-y-5"
//     >
//       <h2 className="text-lg font-semibold text-gray-700">Create Subcategory</h2>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
//         <select
//           value={parentId}
//           onChange={(e) => setParentId(e.target.value)}
//           className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
//           disabled={loading}
//           required
//         >
//           <option value="">-- Select Parent --</option>
//           {categories.map((cat) => (
//             <option key={cat.id} value={cat.id}>
//               {cat.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Name</label>
//         <input
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="Enter subcategory name"
//           className="w-full border border-gray-300 rounded-md px-3 py-2"
//           disabled={loading}
//           required
//         />
//       </div>

//       <button
//         type="submit"
//         disabled={loading}
//         className={`w-full flex justify-center items-center gap-2 bg-green-600 text-white py-3 rounded-md font-semibold transition-opacity ${
//           loading ? "opacity-70 cursor-not-allowed" : "hover:bg-green-700"
//         }`}
//       >
//         {loading ? "Creating..." : "Create Subcategory"}
//       </button>
//     </form>
//   );
// }




"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { toast } from "sonner";

export default function SubCategoryForm({ onSuccess }) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(list);
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!parentId) return toast.warning("Please select a parent category.");
    if (!name.trim()) return toast.warning("Please enter a subcategory name.");

    setLoading(true);
    try {
      await addDoc(collection(db, "categories"), {
        name: name.trim(),
        parentId,
        imageUrl: "", // Optional
      });

      toast.success("Subcategory created successfully!");
      onSuccess && onSuccess();
      setName("");
      setParentId("");
    } catch (err) {
      console.error("Error adding subcategory:", err);
      toast.error("Failed to create subcategory.");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded-lg shadow space-y-5"
    >
      <h2 className="text-lg font-semibold text-gray-700">Create Subcategory</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
          disabled={loading}
          required
        >
          <option value="">-- Select Parent --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter subcategory name"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          disabled={loading}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center items-center gap-2 bg-green-600 text-white py-3 rounded-md font-semibold transition-opacity ${
          loading ? "opacity-70 cursor-not-allowed" : "hover:bg-green-700"
        }`}
      >
        {loading ? "Creating..." : "Create Subcategory"}
      </button>
    </form>
  );
}
