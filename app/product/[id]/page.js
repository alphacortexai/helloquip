// "use client";
// import { useParams, useRouter, usePathname } from "next/navigation";
// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { db } from "@/lib/firebase";
// import {
//   doc,
//   getDoc,
//   setDoc,
//   serverTimestamp,
// } from "firebase/firestore";
// import Footer from "@/components/Footer";
// import FeaturedProducts from "@/components/FeaturedProducts";
// import ContactButtons from "@/components/ContactButtons";
// import ImageGallery from "@/components/ImageGallery";
// import QuantityInput from "@/components/QuantityInput";
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
//   const [quantity, setQuantity] = useState(1);

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [pathname]);

// useEffect(() => {
//   if (!id) return;
//   const fetchProduct = async () => {
//     const docRef = doc(db, "products", id);
//     const docSnap = await getDoc(docRef);
//     if (docSnap.exists()) {
//       const fallbackImage = "/placeholder.jpg";
//       const data = { id: docSnap.id, ...docSnap.data() };

//       // ✅ Apply fallback logic inside this effect
//       data.imageUrl = data.imageUrl || fallbackImage;
//       data.extraImageUrls =
//         data.extraImageUrls && data.extraImageUrls.length > 0
//           ? data.extraImageUrls
//           : [fallbackImage];

//       setProduct(data);
//       setActiveImage(data.imageUrl);
//     } else {
//       setProduct(null);
//     }
//     setLoading(false);
//   };
//   fetchProduct();
// }, [id]);


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

//     if (quantity < 1) {
//       toast.error("Quantity must be at least 1");
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
//         quantity,
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

//   // const allImages = [product.imageUrl, ...(product.extraImageUrls || [])];
// // Fallback image path (your logo or default placeholder)
// const fallbackImage = "/placeholder.jpg";

// // Ensure main image is always available
// const mainImage = product.imageUrl || fallbackImage;

// // Ensure extra images have at least one valid image or fallback
// const extraImages = (product.extraImageUrls && product.extraImageUrls.length > 0)
//   ? product.extraImageUrls
//   : [fallbackImage];

// // Combine all images
// const allImages = [mainImage, ...extraImages];

// // Set initial active image as main or fallback
// useEffect(() => {
//   if (!id) return;
//   const fetchProduct = async () => {
//     const docRef = doc(db, "products", id);
//     const docSnap = await getDoc(docRef);
//     if (docSnap.exists()) {
//       const data = { id: docSnap.id, ...docSnap.data() };
      
//       // Apply fallback logic after loading product
//       data.imageUrl = data.imageUrl || fallbackImage;
//       data.extraImageUrls =
//         data.extraImageUrls && data.extraImageUrls.length > 0
//           ? data.extraImageUrls
//           : [fallbackImage];

//       setProduct(data);
//       setActiveImage(data.imageUrl);
//     }
//     setLoading(false);
//   };
//   fetchProduct();
// }, [id]);




// return (
//   <>
//     <div className="max-w-6xl md:px-6">
//       <div className="flex flex-col md:flex-row gap-2 md:gap-6">
//         {/* Image Gallery */}
//         <div className="md:w-[40%] flex flex-col gap-4">
//           <ImageGallery
//             images={allImages}
//             activeImage={activeImage}
//             onSelect={setActiveImage}
//           />
//         </div>

//         {/* Product Info */}
//         <div className="flex-1 ml-1 mr-1">
//           <div className="w-full flex flex-col gap-2">

//             {/* Card 1: Price, Name, Product Code */}
//             <div className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-100 flex flex-col gap-2">
//               <div className="bg-orange-50 border border-orange-200 rounded-full p-4 mb-2 space-y-2">
//                 <div className="flex items-center justify-between flex-wrap gap-2">
//                   <span className="text-[15px] font-bold text-gray-900">
//                     UGX {(product.discount > 0 
//                       ? product.price * (1 - product.discount / 100) 
//                       : product.price
//                     ).toLocaleString()}
//                   </span>
//                   <div className="flex items-center gap-2">
//                     {product.discount > 0 && (
//                       <span className="line-through text-gray-500 text-[15px]">
//                         UGX {product.price.toLocaleString()}
//                       </span>
//                     )}

//                     {/* Discount Badge */}
//                     {product.discount > 0 && (
//                       <span className="bg-red-600 text-white text-[10px] font-semibold px-1 py-1 rounded-[10px]">
//                         {`${product.discount}%`}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <p className="text-sm font-semibold text-gray-800 uppercase truncate">
//                 {product.name || 'Unnamed Product'}
//               </p>
//               <p className="text-[14px] text-gray-500">SKU : {product.sku}</p>
//               <p className="text-[11px] text-gray-500 break-words">CODE : {product.productCode}</p>
//             </div>

//             {/* Card 2: Product Description */}
//             <div className="bg-white p-4 rounded-md border border-gray-100">
//               <h3 className="text-sm font-semibold text-gray-800 mb-1">Product Description</h3>
//               <p className="text-xs text-gray-600 leading-relaxed">
//                 {product.description || "No description provided for this product."}
//               </p>
//             </div>

//             {/* Card 3: Product Attributes */}
//             {product.attributes && product.attributes.length > 0 && (
//               <div className="bg-white p-4 rounded-md border border-gray-100">
//                 <h3 className="text-sm font-semibold text-gray-800 mb-1">Product Attributes</h3>
//                 <ul className="text-xs text-gray-600 space-y-1">
//                   {product.attributes.map((attr, index) => (
//                     <li key={index} className="flex justify-between">
//                       <span className="font-medium">{attr.name}:</span>
//                       <span>{attr.description}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {/* Card 4: Quantity */}
//             <div className="bg-white p-4 rounded-md border border-gray-100">
//               <h3 className="text-sm font-semibold text-gray-800 mb-1">Select Quantity</h3>
//               <QuantityInput quantity={quantity} setQuantity={setQuantity} />
//             </div>

//             {/* Card 5: Action Buttons */}
//             <div className="bg-white p-4 border border-gray-100 shadow-sm flex flex-col gap-4">
//               <div className="flex flex-col sm:flex-row gap-3 w-full">
//                 <button
//                   onClick={handleAddToOrder}
//                   className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-sm font-semibold shadow-sm transition-all duration-200"
//                 >
//                   🛒 Add to Order
//                 </button>
//                 <button
//                   onClick={handleBuyNow}
//                   className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 bg-white hover:bg-gray-50 px-5 py-2.5 rounded-md text-sm font-medium shadow-sm transition-all duration-200"
//                 >
//                   💳 Buy Now / View Orders
//                 </button>
//               </div>
//             </div>

//             {/* Card 6: Contact Buttons */}
//             <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm">
//               <h3 className="text-sm font-semibold text-gray-800 mb-2 text-center">Need Help?</h3>
//               <ContactButtons phoneNumber="+256700000000" />
//             </div>

//           </div>
//         </div>
        
//       </div>
//     </div>

//     {/* Related Products Section */}
//     {product?.category && (
//       <div className="pt-6 pb-12 md:px-6">
//         <h3 className="text-center text-sm font-medium text-gray-700 mb-1">
//           Products related to
//           <span className="font-semibold text-gray-900"> {product.name} </span>
//         </h3>
//         {/* <FeaturedProducts
//           selectedCategory={product.category}
//           keyword={product.name?.split(" ").slice(0, 2).join(" ").toLowerCase()}
//         /> */}
//         <FeaturedProducts
//           selectedCategory={product.category}
//           keyword={product.name?.split(" ").slice(0, 2).join(" ").toLowerCase()} // optional short keyword
//           name={product.name}
//           manufacturer={product.manufacturer}
//           tags={product.tags}
//           cardVariant="landscapemain"
//           excludeId={product.id}
//         />

//       </div>
//     )}
//   </>
// );


// }




"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

import ImageGallery from "@/components/ImageGallery";
import QuantityInput from "@/components/QuantityInput";
import FeaturedProducts from "@/components/FeaturedProducts";
import ContactButtons from "@/components/ContactButtons";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useParams();
  const pathname = usePathname();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const fallbackImage = "https://firebasestorage.googleapis.com/v0/b/helloquip-80e20.firebasestorage.app/o/placeholder.jpg?alt=media&token=7b4e6ab8-7a01-468c-b5f7-a19d31290045";

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

        // ✅ Defensive fallback image logic
        data.imageUrl = data.imageUrl || fallbackImage;
        data.extraImageUrls =
          Array.isArray(data.extraImageUrls) && data.extraImageUrls.length > 0
            ? data.extraImageUrls
            : [fallbackImage];

        setProduct(data);
        setActiveImage(data.imageUrl);
      } else {
        setProduct(null);
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

  const allImages = [product.imageUrl, ...product.extraImageUrls];

  return (
    <>
      <div className="max-w-6xl md:px-6">
        <div className="flex flex-col md:flex-row gap-2 md:gap-6">
          {/* Image Gallery */}
          <div className="md:w-[40%] flex flex-col gap-4">
            <ImageGallery
              images={allImages}
              activeImage={activeImage}
              onSelect={setActiveImage}
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 ml-1 mr-1">
            <div className="w-full flex flex-col gap-2">
              {/* Price & Name */}
              <div className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-100 flex flex-col gap-2">
                <div className="bg-orange-50 border border-orange-200 rounded-full p-4 mb-2 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[15px] font-bold text-gray-900">
                      UGX {(product.discount > 0
                        ? product.price * (1 - product.discount / 100)
                        : product.price
                      ).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                      {product.discount > 0 && (
                        <span className="line-through text-gray-500 text-[15px]">
                          UGX {product.price.toLocaleString()}
                        </span>
                      )}
                      {product.discount > 0 && (
                        <span className="bg-red-600 text-white text-[10px] font-semibold px-1 py-1 rounded-[10px]">
                          {`${product.discount}%`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-800 uppercase truncate">
                  {product.name || 'Unnamed Product'}
                </p>
                <p className="text-[14px] text-gray-500">SKU : {product.sku}</p>
                <p className="text-[11px] text-gray-500 break-words">CODE : {product.productCode}</p>
              </div>

              {/* Description */}
              <div className="bg-white p-4 rounded-md border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Product Description</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {product.description || "No description provided for this product."}
                </p>
              </div>

              {/* Attributes */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="bg-white p-4 rounded-md border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Product Attributes</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {product.attributes.map((attr, index) => (
                      <li key={index} className="flex justify-between">
                        <span className="font-medium">{attr.name}:</span>
                        <span>{attr.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity */}
              <div className="bg-white p-4 rounded-md border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Select Quantity</h3>
                <QuantityInput quantity={quantity} setQuantity={setQuantity} />
              </div>

              {/* Buttons */}
              <div className="bg-white p-4 border border-gray-100 shadow-sm flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={handleAddToOrder}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-sm font-semibold shadow-sm transition-all duration-200"
                  >
                    🛒 Add to Order
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 bg-white hover:bg-gray-50 px-5 py-2.5 rounded-md text-sm font-medium shadow-sm transition-all duration-200"
                  >
                    💳 Buy Now / View Orders
                  </button>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-2 text-center">Need Help?</h3>
                <ContactButtons phoneNumber="+256700000000" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product?.category && (
        <div className="pt-6 pb-12 md:px-6">
          <h3 className="text-center text-sm font-medium text-gray-700 mb-1">
            Products related to
            <span className="font-semibold text-gray-900"> {product.name} </span>
          </h3>
          <FeaturedProducts
            selectedCategory={product.category}
            keyword={product.name?.split(" ").slice(0, 2).join(" ").toLowerCase()}
            name={product.name}
            manufacturer={product.manufacturer}
            tags={product.tags}
            cardVariant="landscapemain"
            excludeId={product.id}
          />
        </div>
      )}
    </>
  );
}
