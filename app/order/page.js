"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CenteredCard from "@/components/CenteredCard";
import ConvertToQuotationButton from "@/components/ConvertToQuotationButton";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ContactButtons from "@/components/ContactButtons";



const regionsData = [
  {
    region: "Kampala",
    area: [
      "Bunga",
      "Kampala Central Division",
      "Kampala Nakawa Division",
      "Kasubi",
      "Kireka",
      "Kitintale",
      "Nakasero",
      "Wandegeya",
      "Bakuli",
      "Banda",
      "Biina",
      "Bugolobi",
      "Bukasa",
      "Bukesa",
      "Bukoto",
      "Bulenga",
      "Bunamwaya",
      "Busega",
      "Butabika",
      "Buwate",
      "Buziga",
      "Bwaise",
      "Bweyogerere",
      "Central Business District",
      "Down Town Kampala",
      "Ggaba",
      "Kabalagala",
      "Kabojja",
      "Kabowa",
      "Kabuusu",
      "Kagoma",
      "Kalerwe",
      "Kampala Industrial Area",
      "Kamwokya",
      "Kansanga",
      "Kanyanya",
      "Katwe",
      "Kavule",
      "Kawaala",
      "kawanda / Kagoma",
      "Kawempe",
      "Kazo",
      "Kibiri",
      "Kibuli",
      "Kibuye",
      "Kigowa",
      "Kikaya",
      "Kikoni",
      "Kinawataka",
      "Kira",
      "Kirinya",
      "Kirombe",
      "Kisaasi",
      "Kisenyi",
      "Kisugu",
      "Kitante",
      "Kitebi",
      "Kitende",
      "Kiwatule",
      "Kololo",
      "Komamboga",
      "Kulambiro",
      "Kyaliwajjala",
      "Kyambogo",
      "Kyanja",
      "Kyebando",
      "Kyengera",
      "Lubowa",
      "Lubya",
      "Lugala",
      "Lugoba",
      "Lugogo",
      "Lusaze",
      "Luwafu",
      "Luzira",
      "Lweza",
      "Maganjo",
      "Makerere",
      "Makindye",
      "Masanafu",
      "Mbalwa",
      "Mbuya",
      "Mengo",
      "Mpanga",
      "Mpererwe",
      "Mulago",
      "Munyonyo",
      "Mutundwe",
      "Mutungo",
      "Muyenga",
      "Naalya",
      "Nabisunsa",
      "Nabweru",
      "Naguru",
      "Najjanankumbi",
      "Najjera",
      "Nakawa",
      "Nakivubo",
      "Nalukolongo",
      "Namasuba",
      "Namirembe",
      "Namugongo",
      "Namungoona",
      "Namuwongo",
      "Nankulabye",
      "Nasser Road",
      "Nateete",
      "Ndeeba",
      "Ndejje",
      "Nsambya",
      "Ntinda",
      "Nyanama",
      "Old Kampala",
      "Rubaga",
      "Salaama",
      "Seguku",
      "Sonde",
      "Wakaliga",
      "Wankulukuku",
      "Zana"
    ],
  },
  {
    region: "Wakiso",
    area: [
      "Nansana",
      "Kira Municipality",
      "Kasangati",
      "Kajjansi",
      "Busukuma",
      "Ssabagabo",
      "Kyengera",
      "Kajjansi Town Council",
    ],
  },
  {
    region: "Eastern Region",
    area: [
      "Bugembe",
      "Bugiri",
      "Busia",
      "Buwenge",
      "Iganga",
      "Irundu",
      "Jinja",
      "Kagulu",
      "Kamuli",
      "Kidera",
      "Kumi",
      "Mbale",
      "Mbikko",
      "Namungalwa",
      "Pallisa",
      "Serere",
      "Sironko",
      "Soroti",
      "Tororo"
    ],
  },
  {
    region: "Entebbe Area",
    area: [
      "Abayita Ababiri",
      "Akright City - Entebbe",
      "Banga",
      "Bugonga",
      "Entebbe Market Area",
      "Entebbe Town",
      "Katabi",
      "Kisubi",
      "Kitala",
      "Kitende",
      "Kitoro",
      "Kitubulu",
      "Kiwafu - entebbe",
      "Lunyo",
      "Manyago",
      "Nakiwogo",
      "Namulanda",
      "Nkumba",
      "Nsamizi"
    ],
  },
  {
    region: "Northern Region",
    area: [
      "Adjumani",
      "Arua",
      "Gulu",
      "Kalongo",
      "Kamdini",
      "Kitgum",
      "Koboko",
      "Lira",
      "Moyo",
      "Nebbi",
      "Oyam",
      "Pader",
      "Patongo"
    ],
  },
  {
    region: "Rest of Central Region",
    area: [
      "Busunju",
      "Bwikwe",
      "Gayaza",
      "Kajjansi",
      "Kalagi",
      "Kasangati",
      "Kayunga",
      "Kiboga",
      "Kikajjo",
      "lugazi",
      "Luweero",
      "Masaka",
      "Matugga",
      "Mityana",
      "Mpigi",
      "Mubende",
      "Mukono / Town Area",
      "Namanve",
      "Nsangi",
      "Nsasa",
      "Nyendo",
      "Seeta",
      "Wakiso",
      "wampewo"
    ],
  },
  {
    region: "Western Region",
    area: [
      "Bushenyi",
      "Bweyale",
      "Hoima",
      "Ibanda",
      "Kabale",
      "Kabarole (Fort Portal)",
      "Kagadi",
      "Kasese",
      "Kisoro",
      "Kyegegwa",
      "Kyenjojo",
      "Masindi",
      "Mbarara"
    ],
  },
];

const mapCartItemsToOrderItems = (cartItems) =>
  cartItems.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    description: item.price,
    sop: item.sop || "",
    category: item.category || "",
    imageUrl: item.imageUrl || "",
    quantity: item.quantity || 1,
  }));

const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

export default function OrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [address, setAddress] = useState({
    fullName: "",
    area: "",
    city: "",
    phoneNumber: "",
  });
  const [editing, setEditing] = useState(false);


  useEffect(() => {
  const auth = getAuth();
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) return router.push("/login");
    setUserId(user.uid);

    const userSnap = await getDoc(doc(db, "users", user.uid));
    const userAddress = userSnap.exists() ? userSnap.data().address || {} : {};
    setAddress(userAddress);

    const cartRef = collection(db, "carts", user.uid, "items");
    const cartSnap = await getDocs(cartRef);
    const items = cartSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setCartItems(items);

    const order = {
      id: "order-firebase",
      items,
      address: userAddress,
      amount: calculateTotal(items),
      date: new Date().toISOString(),
    };
    setOrders(items.length ? [order] : []);
    setLoading(false); // ✅ Done loading
  });

  return () => unsubscribe();
}, [router]);




  const updateQuantity = async (productId, delta) => {
    const item = cartItems.find((item) => item.id === productId);
    if (!item) return;
    const newQty = Math.max(1, (item.quantity || 1) + delta);
    const ref = doc(db, "carts", userId, "items", productId);
    await updateDoc(ref, { quantity: newQty });
    const updatedCart = cartItems.map((i) =>
      i.id === productId ? { ...i, quantity: newQty } : i
    );
    setCartItems(updatedCart);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === "order-firebase"
          ? { ...o, items: updatedCart, amount: calculateTotal(updatedCart) }
          : o
      )
    );
  };

  const removeItem = async (productId) => {
    await deleteDoc(doc(db, "carts", userId, "items", productId));
    const updatedCart = cartItems.filter((item) => item.id !== productId);
    setCartItems(updatedCart);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === "order-firebase"
          ? { ...o, items: updatedCart, amount: calculateTotal(updatedCart) }
          : o
      )
    );
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  // const saveAddress = () => {
  //   setOrders((prev) => prev.map((o) => ({ ...o, address })));
  //   setEditing(false);
  // };

  const saveAddress = async () => {
    if (!userId) return;

    // Save to order state
    setOrders((prev) => prev.map((o) => ({ ...o, address })));
    setEditing(false);

    // Persist to Firestore
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { address });
  };


  const isAddressComplete = (addr) => {
    return addr.fullName && addr.phoneNumber && addr.city && addr.area;
  };


  const placeOrder = async () => {
    if (!isAddressComplete(address)) {
      alert("🚫 Please fill in all shipping address fields before placing an order.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !cartItems.length) return router.push("/login");

    const userSnap = await getDoc(doc(db, "users", user.uid));
    const userData = userSnap.exists() ? userSnap.data() : {};
    const finalAddress = {
      fullName: address.fullName || userData.fullName || "N/A",
      area: address.area || "N/A",
      city: address.city || "N/A",
      phoneNumber: address.phoneNumber || user.phoneNumber || "N/A",
    };

    const orderData = {
      userId: user.uid,
      userEmail: user.email || "N/A",
      userName: user.displayName || userData.fullName || "N/A",
      userPhone: user.phoneNumber || userData.phoneNumber || "N/A",
      address: finalAddress,
      items: mapCartItemsToOrderItems(cartItems),
      totalAmount: calculateTotal(cartItems),
      status: "Pending",
      paymentMethod: "Cash on Delivery",
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, "orders"), orderData);
    const cartRef = collection(db, "carts", user.uid, "items");
    const snap = await getDocs(cartRef);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    setCartItems([]);
    setOrders([]);
    router.push("/shipments");
  };


  const selectedRegion = regionsData.find((r) => r.region === address.city);

  return (
    <div className="flex flex-col px-0 py-6 min-h-screen">
      {loading ? (
        <CenteredCard message="⏳ Loading your orders..." />
      ) : orders.length === 0 ? (
        <CenteredCard
          title="No Orders Yet"
          message="Your cart is currently empty. Explore products to get started!"
        >
          <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            🛍️ Browse Products
          </Link>
        </CenteredCard>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="mb-16">
            <div className="bg-white p-4  shadow-sm">
              <h1 className="text-lg font-semibold mb-1">Order Summary</h1>
              <ul>
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center mb-3 border-b pb-3">
                  <Image
                    src={
                      typeof item.imageUrl === "object"
                        ? decodeURIComponent(item.imageUrl["200x200"])
                        : decodeURIComponent(item.imageUrl)
                    }
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded"
                  />
                    <div className="ml-4 flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      <p className="text-sm text-gray-700">Price: UGX {item.price.toLocaleString()}</p>
                      <div className="flex items-center mt-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 bg-gray-200 rounded-l">-</button>
                        <span className="px-3 py-1 border-t border-b">{item.quantity || 1}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 bg-gray-200 rounded-r">+</button>
                        <button onClick={() => removeItem(item.id)} className="ml-4 px-2 py-1 bg-red-400 text-white rounded">Remove</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-green-500 text-xl mt-4">Total: UGX {order.amount.toLocaleString()}</p>
            </div>

            <div className="mt-4 p-4 bg-white rounded shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>
              <div className="space-y-2">
                <input
                  name="fullName"
                  value={address.fullName}
                  onChange={(e) => {
                    handleAddressChange(e);
                    setEditing(true);
                  }}
                  placeholder="Full Name"
                  className="w-full border border-gray-300 p-2 rounded bg-white"
                />
                <select
                  name="city"
                  value={address.city}
                  onChange={(e) => {
                    handleAddressChange(e);
                    setAddress((prev) => ({
                      ...prev,
                      city: e.target.value,
                      area: "", // reset area when region changes
                    }));
                    setEditing(true);
                  }}
                  className="w-full border border-gray-300 p-2 rounded bg-white"
                >
                  <option value="">Select Region</option>
                  {regionsData.map((r) => (
                    <option key={r.region} value={r.region}>
                      {r.region}
                    </option>
                  ))}
                </select>
                <select
                  name="area"
                  value={address.area}
                  onChange={(e) => {
                    handleAddressChange(e);
                    setEditing(true);
                  }}
                  disabled={!address.city}
                  className="w-full border border-gray-300 p-2 rounded bg-white"
                >
                  <option value="">Select Area</option>
                  {selectedRegion?.area.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <input
                  name="phoneNumber"
                  value={address.phoneNumber}
                  onChange={(e) => {
                    handleAddressChange(e);
                    setEditing(true);
                  }}
                  placeholder="Phone Number"
                  className="w-full border border-gray-300 p-2 rounded bg-white"
                />

                {editing && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        saveAddress();
                        setEditing(false);
                      }}
                      className="w-full bg-green-600 text-white py-2 rounded"
                    >
                      💾 Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-4 mt-4 shadow-sm">
              <button onClick={placeOrder} className="w-full bg-blue-600 text-white px-6 py-3 rounded text-base font-semibold">🛒 Place Order</button>
            

            {isAddressComplete(address) ? (
              <ConvertToQuotationButton
                cartItems={cartItems}
                address={address}
                userId={userId}
                userData={{
                  fullName: address.fullName,
                  phoneNumber: address.phoneNumber,
                }}
              />
            ) : (
              <p className="text-red-500 mt-2 text-sm">Please complete your address above to generate a quotation.</p>
            )}

            
            </div>

            <div className="bg-white p-4 mt-4 shadow-sm text-center">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <ContactButtons phoneNumber="+256700000000" />
            </div>


          <div className="mt-4 px-4">
            <Link
              href="/"
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded text-base font-semibold transition"
            >
              🛍️ Back to Shop
            </Link>
          </div>



          </div>
        ))
      )}
    </div>
  );
}
