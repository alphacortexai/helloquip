"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp, increment } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import Link from "next/link";
import { 
  ShoppingCartIcon, 
  ShieldCheckIcon,
  TruckIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

import ImageGallery from "@/components/ImageGallery";
import QuantityInput from "@/components/QuantityInput";
import RelatedProducts from "@/components/RelatedProducts";
import ContactButtons from "@/components/ContactButtons";
import WishlistButton from "@/components/WishlistButton";
import ProductComparisonButton from "@/components/ProductComparisonButton";
import { CustomerExperienceService } from "@/lib/customerExperienceService";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useParams();
  const pathname = usePathname();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          data.imageUrl = data.imageUrl || fallbackImage;
          data.extraImageUrls = Array.isArray(data.extraImageUrls) && data.extraImageUrls.length > 0
              ? data.extraImageUrls
              : [fallbackImage];

          setProduct(data);
          setActiveImage(data.imageUrl);
          setError(null);
        } else {
          setProduct(null);
          setError("Product not found.");
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Failed to load product. Please retry.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product?.id) return;
    const recordView = async () => {
      try {
        const now = new Date();
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const day = d.getUTCDay();
        const diffToMonday = (day === 0 ? -6 : 1) - day;
        d.setUTCDate(d.getUTCDate() + diffToMonday);
        const weekKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

        const weekDocRef = doc(db, "productViews", product.id, "weeks", weekKey);
        await setDoc(
          weekDocRef,
          { count: increment(1), weekStart: weekKey, updatedAt: serverTimestamp() },
          { merge: true }
        );
      } catch (e) {}
    };
    recordView();
  }, [product?.id]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user && product) {
        CustomerExperienceService.trackProductView(user.uid, product.id, product);
      }
    });
    return () => unsubscribe();
  }, [product]);

  const handleAddToOrder = async () => {
    if (!user) {
      router.push(`/register?redirect=/product/${product.id}`);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

  const normalizedAttributes = Array.isArray(product.attributes)
    ? product.attributes
    : product.attributes && typeof product.attributes === "object"
      ? Object.entries(product.attributes).map(([name, value]) => ({
          name,
          description: typeof value === "string" ? value : String(value ?? ""),
        }))
      : [];

  const allImages = [product.imageUrl, ...(product.extraImageUrls || [])].filter(Boolean);
  const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-[#2e4493]">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-[#2e4493]">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-12">
            {/* Image Gallery */}
            <div className="space-y-6">
              <ImageGallery
                images={allImages}
                activeImage={activeImage}
                onSelect={setActiveImage}
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-8">
                <span className="text-[#2e4493] text-sm font-bold uppercase tracking-widest">{product.category || "Medical Equipment"}</span>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 leading-tight">{product.name}</h1>
                <div className="flex items-center mt-4 space-x-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-sm text-gray-500">(4.8 / 5.0)</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="text-green-600 text-sm font-bold">In Stock</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-3xl p-8 mb-8">
                <div className="flex items-baseline space-x-4">
                  <span className="text-4xl font-bold text-[#2e4493]">UGX {discountedPrice.toLocaleString()}</span>
                  {product.discount > 0 && (
                    <span className="text-xl text-gray-400 line-through">UGX {product.price.toLocaleString()}</span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-2">Prices include VAT where applicable</p>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-2xl border border-gray-100">
                    <ShieldCheckIcon className="w-6 h-6 text-[#2e4493]" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Warranty</p>
                      <p className="text-[10px] text-gray-500">{product.warranty || "1 Year Standard"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-2xl border border-gray-100">
                    <TruckIcon className="w-6 h-6 text-[#2e4493]" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Delivery</p>
                      <p className="text-[10px] text-gray-500">2-3 Business Days</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-32">
                    <QuantityInput quantity={quantity} setQuantity={setQuantity} />
                  </div>
                  <button 
                    onClick={handleAddToOrder}
                    className="flex-1 bg-[#2e4493] text-white py-4 rounded-2xl font-bold hover:bg-[#1a2a5e] transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                    <span>Add to Order</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <WishlistButton product={product} className="flex-1" />
                  <ProductComparisonButton product={product} className="flex-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <RelatedProducts
            selectedCategory={product.category}
            excludeId={product.id}
          />
        </section>
      </div>
    </div>
  );
}
