"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const trendingSnapshot = await getDocs(collection(db, "trendingProducts"));
        const trendingItems = [];

        for (const docSnap of trendingSnapshot.docs) {
          const { productId } = docSnap.data();
          const productRef = doc(db, "products", productId);
          const productSnap = await getDoc(productRef);

          if (productSnap.exists()) {
            const productData = productSnap.data();
            trendingItems.push({
              id: productSnap.id,
              name: productData.name || "Unnamed Product",
              description: productData.description || "No description available.",
              price: productData.price || 0,
              imageUrl: productData.imageUrl || "/placeholder.png",
            });
          }
        }

        setProducts(trendingItems);
      } catch (error) {
        console.error("Error loading trending products:", error);
      }
    };

    fetchTrendingProducts();
  }, []);

  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col items-center">
          <p className="text-base font-semibold text-black">Trending Products</p>
          <div className="w-24 h-0.5 bg-blue-600 mt-2"></div>
        </div>

        <div className="overflow-hidden relative w-full mt-10">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {products.map((product, index) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="relative group rounded-lg overflow-hidden shadow-lg cursor-pointer block min-w-full"
              >
                <div className="relative w-full aspect-[4/5]">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:brightness-75 transition duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                </div>

                <div className="absolute bottom-8 left-8 text-white space-y-2 z-20 transform group-hover:-translate-y-4 transition duration-300">
                  <h3 className="font-semibold text-lg lg:text-xl text-white">
                    {product.name}
                  </h3>
                  <p className="text-sm lg:text-base leading-5 max-w-xs text-white">
                    {product.description}
                  </p>
                  <p className="font-bold text-black bg-white/80 px-2 py-1 rounded">
                    {typeof product.price === "number"
                      ? product.price.toLocaleString("en-UG", {
                          style: "currency",
                          currency: "UGX",
                        })
                      : product.price}
                  </p>
                  <button className="flex items-center gap-1.5 bg-blue-600 px-4 py-2 rounded">
                    Buy now
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </button>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            {products.map((_, index) => (
              <div
                key={index}
                onClick={() => handleSlideChange(index)}
                className={`h-2 w-2 rounded-full cursor-pointer ${
                  currentSlide === index ? "bg-blue-600" : "bg-gray-400"
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

