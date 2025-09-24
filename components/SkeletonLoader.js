"use client";

export default function SkeletonLoader({ type = "product" }) {
  if (type === "product") {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-32 rounded-lg mb-2"></div>
        <div className="bg-gray-200 h-4 rounded mb-1"></div>
        <div className="bg-gray-200 h-3 rounded w-2/3"></div>
      </div>
    );
  }

  if (type === "product-card") {
    return (
      <div className="animate-pulse bg-gray-50 rounded-3xl p-4">
        <div className="bg-gray-200 h-48 rounded-2xl mb-3"></div>
        <div className="space-y-2">
          <div className="bg-gray-200 h-4 rounded w-3/4"></div>
          <div className="bg-gray-200 h-3 rounded w-1/2"></div>
          <div className="bg-gray-200 h-3 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (type === "category") {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-16 rounded-lg mb-2"></div>
        <div className="bg-gray-200 h-3 rounded w-1/2"></div>
      </div>
    );
  }

  if (type === "trending") {
    return (
      <div className="animate-pulse">
        {/* Desktop trending skeleton - single large card */}
        <div className="hidden md:block">
          <div className="bg-gray-200 h-64 rounded-2xl"></div>
        </div>
        {/* Mobile trending skeleton - horizontal scroll */}
        <div className="block md:hidden">
          <div className="bg-gray-200 h-48 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-4 rounded mb-2"></div>
        <div className="bg-gray-200 h-4 rounded mb-2 w-5/6"></div>
        <div className="bg-gray-200 h-4 rounded w-4/6"></div>
      </div>
    );
  }

  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-4 rounded mb-2"></div>
      <div className="bg-gray-200 h-4 rounded w-3/4"></div>
    </div>
  );
}
