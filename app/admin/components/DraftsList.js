// // components/DraftsList.js
// "use client";

// import { useEffect, useState } from "react";
// import { db } from "@/lib/firebase";
// import { collection, getDocs, query, orderBy } from "firebase/firestore";
// import ProductForm from "./ProductForm"; // adjust path if different

// export default function DraftsList() {
//   const [drafts, setDrafts] = useState([]);
//   const [selectedDraft, setSelectedDraft] = useState(null);

//   useEffect(() => {
//     const fetchDrafts = async () => {
//       const q = query(collection(db, "drafts"), orderBy("updatedAt", "desc"));
//       const snapshot = await getDocs(q);
//       const draftList = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setDrafts(draftList);
//     };

//     fetchDrafts();
//   }, []);

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-4">My Draft Products</h2>

//       {/* Draft List */}
//       <ul className="space-y-2 mb-6">
//         {drafts.map(draft => (
//           <li
//             key={draft.id}
//             onClick={() => setSelectedDraft(draft)}
//             className="cursor-pointer p-3 bg-gray-100 rounded-xl hover:bg-blue-100"
//           >
//             {draft.name || "(Untitled Product)"}
//           </li>
//         ))}
//       </ul>

//       {/* Form to edit selected draft */}
//       {selectedDraft && (
//         <>
//           <h3 className="text-xl font-semibold mb-2">Edit Draft</h3>
//           <ProductForm existingProduct={selectedDraft} onSuccess={() => setSelectedDraft(null)} />
//         </>
//       )}
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import ProductForm from "./ProductForm"; // adjust path if different

export default function DraftsList() {
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);

  useEffect(() => {
    const fetchDrafts = async () => {
      const q = query(
        collection(db, "drafts"),
        where("promoted", "!=", true), // 🚀 Exclude promoted drafts
        orderBy("updatedAt", "desc")
      );
      const snapshot = await getDocs(q);
      const draftList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDrafts(draftList);
    };

    fetchDrafts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Draft Products</h2>

      {/* Draft List */}
      <ul className="space-y-2 mb-6">
        {drafts.map(draft => (
          <li
            key={draft.id}
            onClick={() => setSelectedDraft(draft)}
            className="cursor-pointer p-3 bg-gray-100 rounded-xl hover:bg-blue-100"
          >
            {draft.name || "(Untitled Product)"}
          </li>
        ))}
      </ul>

      {/* Form to edit selected draft */}
      {selectedDraft && (
        <>
          <h3 className="text-xl font-semibold mb-2">Edit Draft</h3>
          <ProductForm
            existingProduct={selectedDraft}
            onSuccess={() => setSelectedDraft(null)}
          />
        </>
      )}
    </div>
  );
}
