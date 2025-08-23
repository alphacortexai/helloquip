"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, getDoc, deleteDoc, updateDoc, setDoc, addDoc, serverTimestamp, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import CenteredCard from "@/components/CenteredCard";
import ContactButtons from "@/components/ContactButtons";
import ConvertToQuotationButton from "@/components/ConvertToQuotationButton";
import RequestQuoteButton from "@/components/RequestQuoteButton";

function cleanFirebaseUrl(url) {
  if (!url || typeof url !== "string") return "";

  try {
    let cleaned = decodeURIComponent(decodeURIComponent(url));
    const [baseUrl, queryStr] = cleaned.split("?");
    const reEncodedPath = encodeURIComponent(baseUrl.split("/o/")[1]);
    return `https://firebasestorage.googleapis.com/v0/b/${baseUrl.split("/b/")[1].split("/")[0]}/o/${reEncodedPath}?${queryStr}`;
  } catch (err) {
    console.warn("Failed to clean Firebase URL:", url);
    return url;
  }
}

function getImageSrc(item) {
  if (typeof item.imageUrl === "string") {
    return cleanFirebaseUrl(item.imageUrl);
  }
  if (typeof item.imageUrl === "object" && item.imageUrl["200x200"]) {
    return cleanFirebaseUrl(item.imageUrl["200x200"]);
  }
  if (typeof item.imageUrl === "object" && item.imageUrl.original) {
    return cleanFirebaseUrl(item.imageUrl.original);
  }
  return "";
}

function calculateTotal(items) {
  return items.reduce((total, item) => {
    const price = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
    return total + price * (item.quantity || 1);
  }, 0);
}

function isAddressComplete(address) {
  return address.fullName && address.area && address.city && address.phoneNumber;
}

export default function OrderClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "cart"; // cart | submitted
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]); // submitted orders list
  const [address, setAddress] = useState({
    fullName: "",
    area: "",
    city: "",
    phoneNumber: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Ensure all address values are strings to prevent controlled/uncontrolled input errors
  const safeAddress = {
    fullName: address.fullName || "",
    area: address.area || "",
    city: address.city || "",
    phoneNumber: address.phoneNumber || "",
  };

  // Address data
  const regionsData = [
    { region: "Kampala", area: [
      "Bunga","Kampala Central Division","Kampala Nakawa Division","Kasubi","Kireka","Kitintale","Nakasero","Wandegeya","Bakuli","Banda","Biina","Bugolobi","Bukasa","Bukesa","Bukoto","Bulenga","Bunamwaya","Busega","Butabika","Buwate","Buziga","Bwaise","Bweyogerere","Central Business District","Down Town Kampala","Ggaba","Kabalagala","Kabojja","Kabowa","Kabuusu","Kagoma","Kalerwe","Kampala Industrial Area","Kamwokya","Kansanga","Kanyanya","Katwe","Kavule","Kawaala","kawanda / Kagoma","Kawempe","Kazo","Kibiri","Kibuli","Kibuye","Kigowa","Kikaya","Kikoni","Kinawataka","Kira","Kirinya","Kirombe","Kisaasi","Kisenyi","Kisugu","Kitante","Kitebi","Kitende","Kiwatule","Kololo","Komamboga","Kulambiro","Kyaliwajjala","Kyambogo","Kyanja","Kyebando","Kyengera","Lubowa","Lubya","Lugala","Lugoba","Lugogo","Lusaze","Luwafu","Luzira","Lweza","Maganjo","Makerere","Makindye","Masanafu","Mbalwa","Mbuya","Mengo","Mpanga","Mpererwe","Mulago","Munyonyo","Mutundwe","Mutungo","Muyenga","Naalya","Nabisunsa","Nabweru","Naguru","Najjanankumbi","Najjera","Nakawa","Nakivubo","Nalukolongo","Namasuba","Namirembe","Namugongo","Namungoona","Namuwongo","Nankulabye","Nasser Road","Nateete","Ndeeba","Ndejje","Nsambya","Ntinda","Nyanama","Old Kampala","Rubaga","Salaama","Seguku","Sonde","Wakaliga","Wankulukuku","Zana"
    ]},
    { region: "Wakiso", area: ["Nansana","Kira Municipality","Kasangati","Kajjansi","Busukuma","Ssabagabo","Kyengera","Kajjansi Town Council"]},
    { region: "Eastern Region", area: ["Bugembe","Bugiri","Busia","Buwenge","Iganga","Irundu","Jinja","Kagulu","Kamuli","Kidera","Kumi","Mbale","Mbikko","Namungalwa","Pallisa","Serere","Sironko","Soroti","Tororo"]},
    { region: "Entebbe Area", area: ["Abayita Ababiri","Akright City - Entebbe","Banga","Bugonga","Entebbe Market Area","Entebbe Town","Katabi","Kisubi","Kitala","Kitende","Kitoro","Kitubulu","Kiwafu - entebbe","Lunyo","Manyago","Nakiwogo","Namulanda","Nkumba","Nsamizi"]},
    { region: "Northern Region", area: ["Adjumani","Arua","Gulu","Kalongo","Kamdini","Kitgum","Koboko","Lira","Moyo","Nebbi","Oyam","Pader","Patongo"]},
    { region: "Rest of Central Region", area: ["Busunju","Bwikwe","Gayaza","Kajjansi","Kalagi","Kasangati","Kayunga","Kiboga","Kikajjo","lugazi","Luweero","Masaka","Matugga","Mityana","Mpigi","Mubende","Mukono / Town Area","Namanve","Nsangi","Nsasa","Nyendo","Seeta","Wakiso","wampewo"]},
    { region: "Western Region", area: ["Bushenyi","Bweyale","Hoima","Ibanda","Kabale","Kabarole (Fort Portal)","Kagadi","Kasese","Kisoro","Kyegegwa","Kyenjojo","Masindi","Mbarara"]},
  ];

  const selectedRegion = regionsData.find(region => region.region === address.city);
  const availableAreas = selectedRegion ? selectedRegion.area : [];
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/register");
      setUserId(user.uid);

      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userAddress = userSnap.exists() ? userSnap.data().address || {} : {};
      setAddress(userAddress);

      const cartRef = collection(db, "carts", user.uid, "items");
      const cartSnap = await getDocs(cartRef);
      const items = cartSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCartItems(items);

      // Load submitted orders for this user
      try {
        const ordersSnap = await getDocs(
          query(
            collection(db, "orders"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          )
        );
        const submitted = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOrders(submitted);
      } catch (e) {
        console.warn("Failed to load submitted orders", e);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const updateQuantity = async (itemId, change) => {
    if (!userId) return;

    const itemRef = doc(db, "carts", userId, "items", itemId);
    const itemSnap = await getDoc(itemRef);

    if (!itemSnap.exists()) return;

    const currentQuantity = itemSnap.data().quantity || 1;
    const newQuantity = Math.max(1, currentQuantity + change);

    await updateDoc(itemRef, { quantity: newQuantity });

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

    setOrders((prev) =>
      prev.map((order) => ({
        ...order,
        items: order.items.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ),
        amount: calculateTotal(
          order.items.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        ),
      }))
    );
  };

  const removeItem = async (itemId) => {
    if (!userId) return;

    try {
      await deleteDoc(doc(db, "carts", userId, "items", itemId));
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      setOrders((prev) =>
        prev.map((order) => ({
          ...order,
          items: order.items.filter((item) => item.id !== itemId),
          amount: calculateTotal(order.items.filter((item) => item.id !== itemId)),
        }))
      );
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const placeOrder = async () => {
    if (isPlacingOrder) return;
    if (!isAddressComplete(address)) {
      toast.error("Please complete your address information");
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty. Please add at least one item.");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    if (paymentMethod !== "cod") {
      setShowPaymentModal(true);
      toast.error("Selected payment method is not available yet. Please use Cash on Delivery.");
      return;
    }

    try {
      setIsPlacingOrder(true);
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const selectedPayment = paymentMethod; // guaranteed 'cod' here
      const orderData = {
        userId,
        items: cartItems,
        address,
        totalAmount: calculateTotal(cartItems),
        status: "pending",
        createdAt: new Date().toISOString(),
        // enrich for admin visibility
        userName: address.fullName || undefined,
        userEmail: currentUser?.email || undefined,
        userPhone: address.phoneNumber || undefined,
        paymentMethod: selectedPayment,
        paymentStatus: selectedPayment === "cod" ? "unpaid" : "pending",
      };

      const orderRef = doc(collection(db, "orders"));
      await setDoc(orderRef, orderData);

      // Clear cart
      for (const item of cartItems) {
        await deleteDoc(doc(db, "carts", userId, "items", item.id));
      }

      toast.success("Order placed successfully!");

      // Immediately redirect user - notifications will happen in background
      router.push("/");

      // Send notifications in background (non-blocking)
      (async () => {
        try {
          const userRef = doc(db, "users", userId);
          const userDoc = await getDoc(userRef);
          const fcmToken = userDoc.exists() ? userDoc.data().fcmToken : null;
          const title = "Order Submitted";
          const body = `Your order ${orderRef.id.slice(0,6).toUpperCase()} has been submitted. We'll update you shortly.`;

          if (fcmToken) {
            try {
              const origin = typeof window !== 'undefined' ? window.location.origin : '';
              const deepLink = `${origin}/order/${orderRef.id}`;
              const res = await fetch('/api/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fcmToken, title, body, target: `/order/${orderRef.id}`, link: deepLink })
              });
              let info = null;
              try { info = await res.json(); } catch {}
              if (!res.ok) {
                console.warn('/api/send-notification failed', info || res.statusText);
              }
            } catch (e) {
              console.warn('FCM request error', e);
            }
          }

          // Always create in-app notification
          try {
            await addDoc(collection(db, "messages"), {
              from: "system",
              to: userId,
              title,
              text: body,
              timestamp: serverTimestamp(),
              chatId: `system_${userId}`,
              type: "notification",
              orderId: orderRef.id,
              target: `/order/${orderRef.id}`,
              read: false,
            });
          } catch (e) {
            console.warn('Failed to write in-app notification', e);
          }

          // Also create an admin notification card
          try {
            const auth2 = getAuth();
            const currentUser2 = auth2.currentUser;
            const customerName = address.fullName || currentUser2?.displayName || currentUser2?.email || "Customer";
            const shortId = orderRef.id.slice(0,6).toUpperCase();
            const itemsSummary = cartItems.map((it) => `${it.name} x ${it.quantity||1}`).slice(0,3);
            const extra = cartItems.length > 3 ? ` and ${cartItems.length-3} more` : "";
            const adminTitle = `New order submitted by ${customerName}`;
            const adminText = `${customerName} submitted order ${shortId} (${itemsSummary.join(", ")}${extra}) totaling UGX ${calculateTotal(cartItems).toLocaleString()}.`;
            await addDoc(collection(db, "adminNotifications"), {
              type: "order_submitted",
              orderId: orderRef.id,
              userId,
              title: adminTitle,
              text: adminText,
              totalAmount: calculateTotal(cartItems),
              timestamp: serverTimestamp(),
              read: false,
              target: `/admin?tab=manageShipments`,
            });
          } catch {}
        } catch (notifyErr) {
          console.warn('Background notification failed:', notifyErr);
        }
      })();
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const saveAddress = async () => {
    if (!userId) return;

    try {
      await updateDoc(doc(db, "users", userId), { address });
      setEditing(false);
      toast.success("Address saved successfully");
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
    }
  };

  if (loading) {
    return <CenteredCard message="⏳ Loading your orders..." />;
  }

  const hasCart = cartItems.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Summary</h1>
          <p className="text-gray-600">Review your items and complete your order</p>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => { setActiveTab("cart"); router.push("/order?tab=cart"); }}
            className={`px-3 py-2 rounded-md text-sm border ${activeTab === 'cart' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
          >
            Orders to be Submitted ({cartItems.length})
          </button>
          <button
            onClick={() => { setActiveTab("submitted"); router.push("/order?tab=submitted"); }}
            className={`px-3 py-2 rounded-md text-sm border ${activeTab === 'submitted' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
          >
            Submitted Orders ({orders.length})
          </button>
        </div>

        {activeTab === 'submitted' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            {orders.length === 0 ? (
              <p className="text-sm text-gray-600">You have no submitted orders.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {orders.map((o) => (
                  <li key={o.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order #{o.id.slice(0,6).toUpperCase()}</p>
                      <p className="text-xs text-gray-600">{new Date(o.createdAt).toLocaleString()}</p>
                      {o.paymentMethod && (
                        <p className="text-xs text-gray-600 mt-0.5">Payment: {o.paymentMethod.toUpperCase()} ({o.paymentStatus || 'pending'})</p>
                      )}
                      </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : o.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {o.status || 'pending'}
                      </span>
                      <Link href={`/order/${o.id}`} className="text-xs text-blue-600 hover:underline">View</Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Cart Items ({cartItems.length})</h2>
              </div>
              
                 <div className="divide-y divide-gray-200">
                 {cartItems.map((item) => (
                   <div key={item.id} className="p-4 md:p-6">
                     <div className="flex items-start space-x-3 md:space-x-4">
                       <div className="flex-shrink-0">
                         <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden">
                           <Image
                             src={getImageSrc(item)}
                             alt={item.name}
                             width={80}
                             height={80}
                             className="w-full h-full object-cover"
                           />
                         </div>
                       </div>
                       
                       <div className="flex-1 min-w-0">
                         <div className="flex items-start justify-between">
                           <div className="flex-1">
                             <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                             <div className="flex items-center space-x-2 md:space-x-4 text-xs md:text-sm text-gray-500">
                               <span>SKU: {item.sku}</span>
                               {item.shopName && <span className="hidden md:inline">Shop: {item.shopName}</span>}
                             </div>
                           </div>
                           
                           <div className="text-right ml-2 md:ml-4">
                               <div className="text-xs text-gray-400 mb-1">
                                 (Unit Price: UGX {(item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price).toLocaleString()} X {(item.quantity || 1)}pcs)
                               </div>
                               <div className="text-base md:text-lg font-semibold text-gray-900">
                                 UGX {((item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price) * (item.quantity || 1)).toLocaleString()}
                               </div>
                               {item.discount > 0 && (
                                 <div className="text-xs md:text-sm text-gray-500 line-through">
                                   UGX {(item.price * (item.quantity || 1)).toLocaleString()}
                                 </div>
                               )}
                             </div>
                         </div>
                         
                         <div className="flex items-center justify-between mt-3 md:mt-4">
                           <div className="flex items-center space-x-1 md:space-x-2">
                             <button
                               onClick={() => updateQuantity(item.id, -1)}
                               className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm"
                             >
                               -
                             </button>
                             <span className="w-8 md:w-12 text-center font-medium text-sm">{item.quantity || 1}</span>
                             <button
                               onClick={() => updateQuantity(item.id, 1)}
                               className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm"
                             >
                               +
                             </button>
                           </div>
                           
                           <button
                             onClick={() => removeItem(item.id)}
                             className="text-red-600 hover:text-red-700 text-xs md:text-sm font-medium transition-colors"
                           >
                             Remove
                           </button>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Sidebar - Address & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">UGX {calculateTotal(cartItems).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-green-600">UGX {calculateTotal(cartItems).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={safeAddress.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <select
                    value={safeAddress.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value, area: "" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a region</option>
                    {regionsData.map((region) => (
                      <option key={region.region} value={region.region}>
                        {region.region}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <select
                    value={safeAddress.area}
                    onChange={(e) => setAddress({ ...address, area: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!safeAddress.city}
                  >
                    <option value="">Select an area</option>
                    {availableAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={safeAddress.phoneNumber}
                    onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <button
                  onClick={saveAddress}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Address
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="space-y-2 text-sm">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={paymentMethod}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPaymentMethod(val);
                    if (val && val !== 'cod') {
                      setShowPaymentModal(true);
                    }
                  }}
                >
                  <option value="" disabled>
                    Select a payment method
                  </option>
                  <option value="cod">Cash on Delivery (Recommended)</option>
                  <option value="card">Card (Visa / MasterCard)</option>
                  <option value="mtn">MTN Mobile Money</option>
                  <option value="airtel">Airtel Money</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Transfer</option>
                </select>
                <p className="text-xs text-gray-500">Only Cash on Delivery is supported at the moment.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <button
                onClick={placeOrder}
                disabled={isPlacingOrder || !isAddressComplete(address) || paymentMethod !== 'cod' || cartItems.length === 0}
                className="w-full bg-[#2e4493] text-white py-3 px-4 rounded-md hover:bg-[#131a2f] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold mb-4"
              >
                {isPlacingOrder ? '⏳ Placing…' : '🛒 Place Order'}
              </button>

              {isAddressComplete(address) ? (
                <>
                  <ConvertToQuotationButton
                    cartItems={cartItems}
                    address={address}
                    userId={userId}
                    userData={{
                      fullName: address.fullName,
                      phoneNumber: address.phoneNumber,
                    }}
                  />
                  <RequestQuoteButton
                    cartItems={cartItems}
                    address={address}
                    userId={userId}
                  />
                </>
              ) : (
                <p className="text-red-500 text-sm text-center">Please complete your address to generate a quotation.</p>
              )}
            </div>

            {/* Help Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Need Help?</h3>
              <ContactButtons phoneNumber="+256700000000" />
            </div>

            {/* Back to Shop */}
            <div className="text-center">
              <Link
                href="/"
                className="inline-block bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3 rounded-md font-medium transition-colors"
              >
                🛍️ Back to Shop
              </Link>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Payment Coming Soon Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-sm w-full mx-4 text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Payment Method Coming Soon</h4>
            <p className="text-sm text-gray-600 mb-4">The selected payment option is not supported yet. Please choose Cash on Delivery for now.</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={() => { setPaymentMethod('cod'); setShowPaymentModal(false); }}
                className="px-4 py-2 rounded-md bg-[#2e4493] text-white hover:bg-[#131a2f]"
              >
                Use Cash on Delivery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global overlay while placing order */}
      {isPlacingOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-5 py-4 flex items-center gap-3">
            <svg className="h-5 w-5 text-blue-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-sm font-medium text-gray-900">Placing your order…</span>
          </div>
        </div>
      )}
    </div>
  );
}


