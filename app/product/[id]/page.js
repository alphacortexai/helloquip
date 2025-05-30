


// "use client";

// import { useParams, useRouter, usePathname } from "next/navigation";
// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { db } from "@/lib/firebase";
// import {
//   doc,
//   getDoc,
//   setDoc,
//   updateDoc,
//   arrayUnion,
//   collection,
//   addDoc,
//   serverTimestamp,
// } from "firebase/firestore";
// import Footer from "@/components/Footer";
// import FeaturedProducts from "@/components/FeaturedProducts";
// import { ArrowLeft } from "lucide-react";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { toast } from "sonner";

// export default function ProductDetail() {
//   const router = useRouter();
//   const { id } = useParams();
//   const pathname = usePathname();

//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);
//   const [activeImage, setActiveImage] = useState("");

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [pathname]);

//   useEffect(() => {
//     if (!id) return;
//     const fetchProduct = async () => {
//       const docRef = doc(db, "products", id);
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         const data = { id: docSnap.id, ...docSnap.data() };
//         setProduct(data);
//         setActiveImage(data.imageUrl);
//       }
//       setLoading(false);
//     };
//     fetchProduct();
//   }, [id]);

//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setUser(user);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleAddToOrder = async () => {
//     if (!user) {
//       router.push(`/register?redirect=/order?productId=${product.id}`);
//       return;
//     }

//     try {
//       const itemRef = doc(db, "carts", user.uid, "items", product.id);
//       const itemSnap = await getDoc(itemRef);

//       if (itemSnap.exists()) {
//         toast.info("This product is already in your cart.");
//         return;
//       }

//       await setDoc(itemRef, {
//         ...product,
//         quantity: 1,
//         addedAt: serverTimestamp(),
//       });

//       toast.success("Product added to your cart!");
//     } catch (error) {
//       console.error("Failed to add product to cart:", error);
//       toast.error("Failed to add to cart. Please try again.");
//     }
//   };


//   const handleBuyNow = () => {
//     if (!user) {
//       router.push(`/register?redirect=/order?productId=${product.id}`);
//     } else {
//       router.push(`/order?productId=${product.id}`);
//     }
//   };

//   if (loading) return <p className="text-center py-6">Loading...</p>;
//   if (!product) return <p className="text-center py-6">Product not found.</p>;

//   const allImages = [product.imageUrl, ...(product.extraImageUrls || [])];

//   return (
//     <>
//       <div className="mt-2 max-w-6xl mx-auto px-4 py-1">
//         <div className="flex flex-col md:flex-row gap-3 md:gap-5">
//           <div className="md:w-[40%] flex flex-col gap-4">
//             <div className="rounded-xl w-full h-55 md:h-[120px] flex items-center justify-center overflow-hidden">
//               {activeImage ? (
//                 <Image
//                   src={activeImage}
//                   alt="Main preview"
//                   width={400}
//                   height={300}
//                   className="object-contain rounded-xl"
//                   priority
//                 />
//               ) : (
//                 <div className="w-full h-full bg-gray-200" />
//               )}
//             </div>

//             <div className="flex gap-2 overflow-x-auto">
//               {Array.from({ length: 5 }).map((_, index) => {
//                 const thumb = allImages[index];
//                 return thumb ? (
//                   <div
//                     key={index}
//                     className={`w-10 h-10 relative rounded-lg overflow-hidden border-1 cursor-pointer ${
//                       activeImage === thumb ? "border-blue-500" : "border-gray-200"
//                     }`}
//                     onClick={() => setActiveImage(thumb)}
//                   >
//                     <Image
//                       src={thumb}
//                       alt={`thumbnail-${index}`}
//                       fill
//                       className="object-cover"
//                     />
//                   </div>
//                 ) : (
//                   <div
//                     key={index}
//                     className="w-10 h-10 bg-gray-200 rounded-lg border border-gray-300"
//                   />
//                 );
//               })}
//             </div>
//           </div>

//           <div className="flex-1 flex flex-col gap-2">
//             <div className="space-y-2">
//               <h2 className="text-base md:text-lg font-medium text-gray-800">
//                 {product.name}
//                 <span className="text-blue-600 font-normal text-sm ml-1">
//                   – UGX {parseInt(product.price).toLocaleString()}
//                 </span>
//               </h2>

//               <p className="text-sm text-gray-600 ">{product.description}</p>
//             </div>

//             <div className="flex flex-wrap gap-2 pt-1">
//               <button
//                 onClick={handleAddToOrder}
//                 className="flex-1 min-w-[90px] bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition"
//               >
//                 Add to Order
//               </button>
//               <button
//                 onClick={handleBuyNow}
//                 className="flex-1 min-w-[90px] border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-100 transition"
//               >
//                 View Orders
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {product?.category && (
//         <div className="pt-2 pb-8">
//           <h3 className="text-sm  text-center mb-2">
//             Related products in <span className="font-semibold"> {product.category} </span>
//           </h3>
//           <FeaturedProducts selectedCategory={product.category} />
//         </div>
//       )}
//     </>
//   );
// }





"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import Footer from "@/components/Footer";
import FeaturedProducts from "@/components/FeaturedProducts";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useParams();
  const pathname = usePathname();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setProduct(data);
        setActiveImage(data.imageUrl);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleAddToOrder = async () => {
    if (!user) {
      router.push(`/register?redirect=/order?productId=${product.id}`);
      return;
    }

    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    try {
      const itemRef = doc(db, "carts", user.uid, "items", product.id);
      const itemSnap = await getDoc(itemRef);

      if (itemSnap.exists()) {
        toast.info("This product is already in your cart.");
        return;
      }

      await setDoc(itemRef, {
        ...product,
        quantity,
        addedAt: serverTimestamp(),
      });

      toast.success("Product added to your cart!");
    } catch (error) {
      console.error("Failed to add product to cart:", error);
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push(`/register?redirect=/order?productId=${product.id}`);
    } else {
      router.push(`/order?productId=${product.id}`);
    }
  };

  if (loading) return <p className="text-center py-6">Loading...</p>;
  if (!product) return <p className="text-center py-6">Product not found.</p>;

  const allImages = [product.imageUrl, ...(product.extraImageUrls || [])];

  return (
    <>
      <div className="mt-2 max-w-6xl mx-auto px-4 py-1">
        <div className="flex flex-col md:flex-row gap-3 md:gap-5">
          <div className="md:w-[40%] flex flex-col gap-4">
            <div className="rounded-xl w-full h-55 md:h-[120px] flex items-center justify-center overflow-hidden">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt="Main preview"
                  width={400}
                  height={300}
                  className="object-contain rounded-xl"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {Array.from({ length: 5 }).map((_, index) => {
                const thumb = allImages[index];
                return thumb ? (
                  <div
                    key={index}
                    className={`w-10 h-10 relative rounded-lg overflow-hidden border-1 cursor-pointer ${
                      activeImage === thumb
                        ? "border-blue-500"
                        : "border-gray-200"
                    }`}
                    onClick={() => setActiveImage(thumb)}
                  >
                    <Image
                      src={thumb}
                      alt={`thumbnail-${index}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    key={index}
                    className="w-10 h-10 bg-gray-200 rounded-lg border border-gray-300"
                  />
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <div className="space-y-2">
              <h2 className="text-base md:text-lg font-medium text-gray-800">
                {product.name}
                <span className="text-blue-600 font-normal text-sm ml-1">
                  – UGX {parseInt(product.price).toLocaleString()}
                </span>
              </h2>

              <p className="text-sm text-gray-600 ">{product.description}</p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-2">
                <span>Qty :</span>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val > 0) setQuantity(val);
                    else setQuantity(1);
                  }}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                  aria-label="Quantity"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleAddToOrder}
                  className="flex-1 min-w-[90px] bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition"
                >
                  Add to Order
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 min-w-[90px] border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-100 transition"
                >
                  View Orders
                </button>
              </div>


            </div>
          </div>
        </div>
      </div>

      {product?.category && (
        <div className="pt-2 pb-8">
          <h3 className="text-sm  text-center mb-2">
            Related products in{" "}
            <span className="font-semibold"> {product.category} </span>
          </h3>
          <FeaturedProducts selectedCategory={product.category} />
        </div>
      )}
    </>
  );
}
