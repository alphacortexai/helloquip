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
  const [activeImage, setActiveImage] = useState("");

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

  const allImages = [product.imageUrl, ...(product.extraImageUrls || [])];

  return (
    <>
      <button
        onClick={() => router.back()}
        className="fixed mb-4 top-[100px] left-8 z-50 px-4 py-2 bg-blue-100 text-blue-700 text-sm  rounded-md shadow-sm hover:bg-blue-200 transition-all"
      >
        ← Back
      </button>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-6 md:gap-5">
          {/* LEFT: Image Gallery */}
          <div className="md:w-[45%] flex flex-col gap-4">
            {/* Main Image Preview */}
            <div className="rounded-xl w-full h-80 md:h-[320px] flex items-center justify-center overflow-hidden">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt="Main preview"
                  width={400}
                  height={600}
                  className="object-contain rounded-xl"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto">
              {Array.from({ length: 5 }).map((_, index) => {
                const thumb = allImages[index];
                return thumb ? (
                  <div
                    key={index}
                    className={`w-14 h-14 relative rounded-lg overflow-hidden border-2 cursor-pointer ${
                      activeImage === thumb ? "border-blue-500" : "border-gray-200"
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
                    className="w-14 h-14 bg-gray-200 rounded-lg border border-gray-300"
                  />
                );
              })}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="space-y-2">
              <h2 className="text-xl md:text-1xl font-semibold text-gray-900">
                {product.name}
              <span className="text-blue-600 font-semibold text-lg">
                -- UGX {parseInt(product.price).toLocaleString()}
              </span>
              </h2>
              <p className="text-sm text-gray-600 ">
                {product.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleAddToOrder}
                className="flex-1 min-w-[100px] bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
              >
                Add to Order
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 min-w-[100px] border border-gray-300 text-gray-700 px-5 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
              >
                View Orders
              </button>
              <button
                onClick={handleTalkToSeller}
                className="flex-1 min-w-[20px] bg-green-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition"
              >
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {product?.category && (
        <div className="pt-2 pb-8">
          <h2 className="text-lg  text-center mb-2">
            Related products in <span className="font-semibold"> {product.category} </span> 
          </h2>
          <FeaturedProducts selectedCategory={product.category} />
        </div>
      )}
    </>
  );
}
