"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import Footer from "@/components/Footer";
import FeaturedProducts from "@/components/FeaturedProducts";
import { ArrowLeft } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useParams();
  const pathname = usePathname();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleBuyNow = () => {
    if (!user) {
      router.push(`/register?redirect=/order?productId=${product.id}`);
    } else {
      router.push(`/order?productId=${product.id}`);
    }
  };

  const handleTalkToSeller = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      router.push(`/register?redirect=/messenger`);
      return;
    }

    try {
      const chatId = `admin_${currentUser.uid}`;
      const productMessage = {
        from: currentUser.uid,
        to: "admin",
        timestamp: serverTimestamp(),
        chatId,
        type: "product_card",
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          imageUrl: product.imageUrl,
        },
      };
      await addDoc(collection(db, "messages"), productMessage);
      router.push("/messenger");
    } catch (error) {
      console.error("Failed to send product card message:", error);
      toast.error("Failed to start chat. Please try again.");
    }
  };

  const handleAddToOrder = () => {
    const existing = JSON.parse(localStorage.getItem("orderItems") || "[]");
    const alreadyAdded = existing.some((item) => item.id === product.id);
    if (alreadyAdded) {
      toast.info("This product is already in your order.");
      return;
    }
    const updated = [...existing, { ...product, quantity: 1 }];
    localStorage.setItem("orderItems", JSON.stringify(updated));
    toast.info("Product added to your order!");
  };

  if (loading) return <p className="text-center py-6">Loading...</p>;
  if (!product) return <p className="text-center py-6">Product not found.</p>;

  return (
    <>
      {/* Floating Back Button below navbar */}
      <div
        onClick={() => router.back()}
        className="fixed top-20 left-4 z-50 flex items-center gap-2 bg-white shadow-md px-3 py-1.5 rounded-full text-blue-600 cursor-pointer hover:bg-blue-50 transition"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* LEFT: Image Gallery */}
          <div className="md:w-[45%] flex flex-col gap-4">
            <div className="bg-gray-100 rounded-xl w-full h-52 md:h-[320px] flex items-center justify-center overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={400}
                height={400}
                className="object-contain rounded-xl"
                priority
              />
            </div>

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

            {/* Action Buttons in one row */}
{/* Action Buttons in one horizontal row */}
<div className="flex flex-wrap gap-3 pt-4">
  <button
    onClick={handleAddToOrder}
    className="flex-1 min-w-[150px] bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
  >
    Add to Order
  </button>

  <button
    onClick={handleBuyNow}
    className="flex-1 min-w-[150px] border border-gray-300 text-gray-700 px-5 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
  >
    Buy Now
  </button>

  <button
    onClick={handleTalkToSeller}
    className="flex-1 min-w-[150px] bg-green-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition"
  >
    Talk to Seller
  </button>
</div>

          </div>
        </div>
      </div>

      {/* Similar Products */}
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
