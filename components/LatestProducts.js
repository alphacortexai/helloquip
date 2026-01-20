"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getPreferredImageUrl } from "@/lib/imageUtils";
import { useDisplaySettings } from "@/lib/useDisplaySettings";
import { useProductSettings, formatProductName } from "@/hooks/useProductSettings";
import HorizontalScrollWithArrows from "@/components/HorizontalScrollWithArrows";

export default function LatestProducts() {
  const router = useRouter();
  const { featuredCardResolution } = useDisplaySettings();
  const { settings } = useProductSettings();
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLatest = async () => {
      try {
        const now = new Date();
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(now.getMonth() - 2);
        twoMonthsAgo.setHours(0, 0, 0, 0);

        const normalizeDate = (p) => {
          const ts = p.createdAt || p.uploadedAt || p.updatedAt || p.timestamp || p.created_at;
          if (!ts) return null;
          try {
            if (ts && typeof ts.toDate === "function") return ts.toDate();
            if (ts instanceof Date) return ts;
            const d = new Date(ts);
            return isNaN(d.getTime()) ? null : d;
          } catch {
            return null;
          }
        };

        const snapshot = await getDocs(collection(db, "products"));
        const source = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const productsWithDates = source.map((p) => ({ p, d: normalizeDate(p) }));
        const validDates = productsWithDates.filter(({ d }) => d !== null);
        const recentProducts = validDates.filter(({ d }) => d >= twoMonthsAgo && d <= now);

        const latest = recentProducts
          .sort((a, b) => b.d - a.d)
          .slice(0, 20)
          .map(({ p }) => p);

        if (latest.length === 0) {
          const anyDateProducts = validDates
            .sort((a, b) => b.d - a.d)
            .slice(0, 20)
            .map(({ p }) => p);
          setLatestProducts(anyDateProducts.length > 0 ? anyDateProducts : source.slice(0, 20));
        } else {
          setLatestProducts(latest);
        }
      } catch {
        setLatestProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadLatest();
  }, []);

  if (loading) {
    return (
      <section className="mb-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="shrink-0 w-44">
                <div className="bg-gray-200 h-44 rounded-xl" />
                <div className="bg-gray-200 h-4 rounded mt-2 w-3/4" />
                <div className="bg-gray-200 h-3 rounded mt-1 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (latestProducts.length === 0) return null;

  return (
    <section className="mb-4">
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Latest
          </h2>
        </div>
        <HorizontalScrollWithArrows scrollClassName="gap-4 pb-2 -mx-1" itemCount={latestProducts.length}>
          {latestProducts.map(({ id, name, price, discount, imageUrl, sku }) => (
            <div
              key={id}
              className="shrink-0 w-44 cursor-pointer group"
              onClick={() => router.push(`/product/${id}`)}
            >
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={getPreferredImageUrl(imageUrl, featuredCardResolution || "200x200") || "/fallback.jpg"}
                  alt={name || "Product"}
                  fill
                  sizes="176px"
                  className="object-cover group-hover:opacity-95 transition-opacity"
                />
                <div className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  New
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-medium text-[#255cdc] line-clamp-2">
                  {formatProductName(name, settings)}
                </h3>
                <p className="text-sm text-gray-500">UGX {price?.toLocaleString() || "N/A"}</p>
              </div>
            </div>
          ))}
        </HorizontalScrollWithArrows>
      </div>
    </section>
  );
}
