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
import Link from "next/link";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

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
  const [userOrders, setUserOrders] = useState([]);

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
        // Subscribe to this user's orders
        try {
          const q = query(
            collection(db, "orders"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          onSnapshot(q, (snap) => {
            const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setUserOrders(orders);
          });
        } catch {}
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

  // Check only the visible fields for completeness (name and phone only)
  const isAddressIncomplete = ["fullName", "phoneNumber"].some(
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
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                name="fullName"
                value={address.fullName || ""}
                onChange={handleAddressChange}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={address.phoneNumber || ""}
                onChange={handleAddressChange}
                placeholder="Enter your phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
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
            <p>{address.phoneNumber}</p>

            {isAddressIncomplete && (
              <p className="mt-2 text-red-600 text-sm">
                Your delivery address is incomplete. Please{" "}
                <button
                  onClick={() => setEditing(true)}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  add your full name and phone number
                </button>{" "}
                to complete it.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Orders Section */}
      <div className="pt-4 border-t space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">My Orders</h2>
          <Link href="/order?tab=submitted" className="text-sm text-blue-600 hover:underline">Go to Orders</Link>
        </div>
        {userOrders.length === 0 ? (
          <p className="text-sm text-gray-500">You have no submitted orders yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
            {userOrders.slice(0,5).map((o) => (
              <li key={o.id} className="p-3 flex items-center justify-between"> 
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Order #{o.id.slice(0,6).toUpperCase()}</p>
                  <p className="text-gray-600">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : o.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {o.status || 'pending'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AccountDetailsPage;
