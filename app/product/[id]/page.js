"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Footer from "@/components/Footer";
import FeaturedProducts from "@/components/FeaturedProducts";

import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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

  // Listen for user auth state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center py-6">Loading...</p>;
  if (!product) return <p className="text-center py-6">Product not found.</p>;

  // Buy Now handler
  const handleBuyNow = () => {
    if (!user) {
      // User not logged in — redirect to /register (or /login)
      // Pass the intended redirect URL after login (e.g. order page)
      router.push(`/register?redirect=/order?productId=${product.id}`);
    } else {
      // User logged in — redirect to order page with product ID
      router.push(`/order?productId=${product.id}`);
    }
  };

  const handleAddToOrder = () => {
    const existing = JSON.parse(localStorage.getItem("orderItems") || "[]");

    // Check if product already exists in localStorage by ID
    const alreadyAdded = existing.some((item) => item.id === product.id);

    if (alreadyAdded) {
      toast.info("This product is already in your order.");
      return;
    }

    // If not added, proceed to add with quantity = 1
    const updated = [...existing, { ...product, quantity: 1 }];

    localStorage.setItem("orderItems", JSON.stringify(updated));
     toast.info("Product added to your order!");
  };





  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div
          className="mb-4 flex items-center gap-2 text-blue-600 cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </div>

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
                priority
              />
            </div>

            {/* Thumbnail row */}
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
              onClick={handleAddToOrder}
              className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition"
            >
              Add to Order
            </button>


              <button
                onClick={handleBuyNow}
                className="w-full sm:w-auto border border-gray-300 text-gray-700 px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition"
              >
                Buy Now
              </button>

              <button
                onClick={() => toast("Messaging seller…")}
                className="w-full sm:w-auto bg-green-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition"
              >
                Talk to Seller
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
    </>
  );
}
