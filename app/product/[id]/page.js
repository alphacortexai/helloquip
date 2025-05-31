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
      <div className="mt-2 max-w-6xl mx-auto px-4 py-1">
      {/* <button
        onClick={() => router.back()}
        className="mb-1  ml-2 mt-2 mb-2  top-[100px] left-14 z-1 px-8 py-2 bg-blue-100 text-blue-700 text-sm  rounded-md shadow-sm hover:bg-blue-200 transition-all"
      >
        ← Back
      </button> */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-5">
          {/* LEFT: Image Gallery */}
          <div className="md:w-[40%] flex flex-col gap-4">
            {/* Main Image Preview */}
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

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto">
              {Array.from({ length: 5 }).map((_, index) => {
                const thumb = allImages[index];
                return thumb ? (
                  <div
                    key={index}
                    className={`w-10 h-10 relative rounded-lg overflow-hidden border-1 cursor-pointer ${
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
                    className="w-10 h-10 bg-gray-200 rounded-lg border border-gray-300"
                  />
                );
              })}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="space-y-2">
              <h2 className="text-base md:text-lg font-medium text-gray-800">
                {product.name}
                <span className="text-blue-600 font-normal text-sm ml-1">
                  – UGX {parseInt(product.price).toLocaleString()}
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
              {/* <button
                onClick={handleTalkToSeller}
                className="flex-1 min-w-[60px] bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-green-700 transition"
              >
                Chat
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {product?.category && (
        <div className="pt-2 pb-8">
          <h3 className="text-sm  text-center mb-2">
            Related products in <span className="font-semibold"> {product.category} </span> 
          </h3>
          <FeaturedProducts selectedCategory={product.category} />
        </div>
      )}
    </>
  );
}
