// "use client";

// import { useEffect, useState } from "react";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc, setDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import Image from "next/image";

// const AccountDetailsPage = () => {
//   const [user, setUser] = useState(null);
//   const [address, setAddress] = useState({
//     fullName: "",
//     area: "",
//     city: "",
//     state: "",
//     phoneNumber: "",
//   });
//   const [editing, setEditing] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setUser(user);
//         const docRef = doc(db, "users", user.uid);
//         const docSnap = await getDoc(docRef);
//         if (docSnap.exists()) {
//           const userData = docSnap.data();
//           setAddress(userData.address || address);
//         }
//         setLoading(false);
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const handleAddressChange = (e) => {
//     const { name, value } = e.target;
//     setAddress((prev) => ({ ...prev, [name]: value }));
//   };

//   const saveAddress = async () => {
//     if (!user) return;
//     const docRef = doc(db, "users", user.uid);
//     await setDoc(docRef, { address }, { merge: true });
//     setEditing(false);
//   };

//   const isAddressIncomplete = Object.values(address).some((v) => !v.trim());

//   if (loading) return <p className="p-4">Loading...</p>;

//   return (
//     <div className="max-w-2xl mx-auto p-4 space-y-6">
//       <h1 className="text-xl font-semibold">Account Details</h1>

//       <div className="flex items-center gap-4">
//         <Image
//           src={user.photoURL || "/assets/user.png"}
//           alt="Profile Picture"
//           width={60}
//           height={60}
//           className="rounded-full object-cover"
//         />
//         <div>
//           <p className="font-medium">{user.displayName || "Unnamed User"}</p>
//           <p className="text-gray-600 text-sm">{user.email}</p>
//         </div>
//       </div>

//       <div className="pt-4 border-t space-y-4">
//         <div className="flex justify-between items-center">
//           <h2 className="text-lg font-medium">Delivery Address</h2>
//           {!editing && (
//             <button
//               className="text-blue-600 text-sm font-medium"
//               onClick={() => setEditing(true)}
//             >
//               Edit
//             </button>
//           )}
//         </div>

//         {editing ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {["fullName", "area", "city", "state", "phoneNumber"].map((field) => (
//               <input
//                 key={field}
//                 name={field}
//                 value={address[field]}
//                 onChange={handleAddressChange}
//                 placeholder={field.replace(/([A-Z])/g, " $1")}
//                 className="border border-gray-300 px-3 py-2 rounded-md text-sm"
//               />
//             ))}
//             <div className="col-span-full flex justify-end gap-3">
//               <button
//                 onClick={() => setEditing(false)}
//                 className="px-4 py-2 text-sm text-gray-600 hover:underline"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={saveAddress}
//                 className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="text-sm text-gray-700 space-y-1">
//             <p>{address.fullName}</p>
//             <p>{address.area}</p>
//             <p>{address.city && address.state ? `${address.city}, ${address.state}` : ""}</p>
//             <p>{address.phoneNumber}</p>

//             {isAddressIncomplete && (
//               <p className="mt-2 text-red-600 text-sm">
//                 Your delivery address is incomplete. Please{" "}
//                 <button
//                   onClick={() => setEditing(true)}
//                   className="text-blue-600 underline hover:text-blue-800"
//                 >
//                   add your full name, area, city, state, and phone number
//                 </button>{" "}
//                 to complete it.
//               </p>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AccountDetailsPage;






"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

const AccountDetailsPage = () => {
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState({
    fullName: "",
    area: "",
    city: "",
    phoneNumber: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setAddress(userData.address || address);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const saveAddress = async () => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { address }, { merge: true });
    setEditing(false);
  };

  // Check only the visible fields for completeness
  const isAddressIncomplete = ["fullName", "area", "city", "phoneNumber"].some(
    (key) => !address[key]?.trim()
  );

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold">Account Details</h1>

      <div className="flex items-center gap-4">
        <Image
          src={user?.photoURL || "/assets/user.png"}
          alt="Profile Picture"
          width={60}
          height={60}
          className="rounded-full object-cover"
        />
        <div>
          <p className="font-medium">{user?.displayName || "Unnamed User"}</p>
          <p className="text-gray-600 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="pt-4 border-t space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Delivery Address</h2>
          {!editing && (
            <button
              className="text-blue-600 text-sm font-medium"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["fullName", "city", "area", "phoneNumber"].map((field) => (
              <input
                key={field}
                name={field}
                value={address[field]}
                onChange={handleAddressChange}
                placeholder={field.replace(/([A-Z])/g, " $1")}
                className="border border-gray-300 px-3 py-2 rounded-md text-sm"
              />
            ))}
            <div className="col-span-full flex justify-end gap-3">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={saveAddress}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-700 space-y-1">
            <p>{address.fullName}</p>
            <p>{address.area}</p>
            <p>{address.city}</p>
            <p>{address.phoneNumber}</p>

            {isAddressIncomplete && (
              <p className="mt-2 text-red-600 text-sm">
                Your delivery address is incomplete. Please{" "}
                <button
                  onClick={() => setEditing(true)}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  add your full name, area, city, and phone number
                </button>{" "}
                to complete it.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDetailsPage;
