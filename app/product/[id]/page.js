// "use client";

// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { db } from "@/lib/firebase";
// import { doc, getDoc } from "firebase/firestore";
// import Footer from "@/components/Footer";
// import FeaturedProducts from "@/components/FeaturedProducts"; // ✅ Make sure the path is correct

// export default function ProductDetail() {
//   const { id } = useParams();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [qty, setQty] = useState(1);

//   useEffect(() => {
//     if (!id) return;

//     const fetchProduct = async () => {
//       const docRef = doc(db, "products", id);
//       const docSnap = await getDoc(docRef);

//       if (docSnap.exists()) {
//         setProduct({ id: docSnap.id, ...docSnap.data() });
//       }

//       setLoading(false);
//     };

//     fetchProduct();
//   }, [id]);

//   if (loading) return <p className="text-center py-6">Loading...</p>;
//   if (!product) return <p className="text-center py-6">Product not found.</p>;

//   return (
//     <>
//       <div className="max-w-5xl mx-auto p-4 md:p-8">
//         <div className="flex flex-col md:flex-row gap-6">
//           {/* Product Image */}
//           <div className="bg-gray-100 rounded-lg w-full md:w-1/2 relative h-72 md:h-[400px] overflow-hidden flex items-center justify-center">
//             <Image
//               src={product.imageUrl}
//               alt={product.name}
//               fill
//               className="object-contain md:object-cover rounded-lg"
//             />
//           </div>

//           {/* Product Details */}
//           <div className="flex-1 flex flex-col justify-between">
//             <div className="space-y-3">
//               <h1 className="text-2xl font-semibold">{product.name}</h1>
//               <p className="text-blue-600 font-bold text-lg">
//                 UGX {parseInt(product.price).toLocaleString()}
//               </p>
//               <p className="text-sm text-gray-600 leading-relaxed">
//                 {product.description}
//               </p>
//             </div>

//             {/* Quantity + Actions */}
//             <div className="mt-6 space-y-4">
//               <div>
//                 <label htmlFor="qty" className="text-sm font-medium block mb-1">
//                   Quantity:
//                 </label>
//                 <input
//                   id="qty"
//                   type="number"
//                   min="1"
//                   value={qty}
//                   onChange={(e) => setQty(Number(e.target.value))}
//                   className="border border-gray-300 rounded px-2 py-1 w-20"
//                 />
//               </div>

//               <div className="flex flex-col sm:flex-row gap-4">
//                 <button
//                   onClick={() => alert(`Added ${qty} to cart.`)}
//                   className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
//                 >
//                   Add to Cart
//                 </button>

//                 <button
//                   onClick={() => alert("Messaging seller...")}
//                   className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
//                 >
//                   Message Seller
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Similar Products */}
//       {product?.category && (
//         <div className="mt-8">
//           <h2 className="text-xl font-semibold text-center mb-2">
//             More in {product.category}
//           </h2>
//           <FeaturedProducts selectedCategory={product.category} />
//         </div>
//       )}

//       {/* Footer */}
//       <Footer />
//     </>
//   );
// }




"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Footer from "@/components/Footer";
import FeaturedProducts from "@/components/FeaturedProducts";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() });
      }

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p className="text-center py-6">Loading...</p>;
  if (!product) return <p className="text-center py-6">Product not found.</p>;

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* LEFT: Image Gallery */}
          <div className="md:w-[45%] flex flex-col gap-4">
          <div className="bg-gray-100 rounded-xl w-full h-64 md:h-[400px] flex items-center justify-center overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={400}
              height={400}
              className="object-contain rounded-xl"
            />
          </div>


            {/* Thumbnail row - Ready for multiple images */}
            <div className="flex gap-2">
              <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <Image
                  src={product.imageUrl}
                  alt="thumbnail"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                {product.name}
              </h1>
              <p className="text-blue-600 font-semibold text-lg">
                UGX {parseInt(product.price).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => alert("Added to cart")}
                className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition"
              >
                Add to Cart
              </button>

              <button
                onClick={() => alert("Buying now")}
                className="w-full sm:w-auto border border-gray-300 text-gray-700 px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition"
              >
                Buy Now
              </button>

              <button
                onClick={() => alert("Messaging seller...")}
                className="w-full sm:w-auto bg-green-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition"
              >
                Chat Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      {product?.category && (
        <div className="pt-4 pb-10">
          <h2 className="text-lg font-semibold text-center mb-2">
            More in {product.category}
          </h2>
          <FeaturedProducts selectedCategory={product.category} />
        </div>
      )}

      <Footer />
    </>
  );
}
