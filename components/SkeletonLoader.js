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
      <div className="animate-pulse bg-gray-50 rounded-3xl p-0">
        {/* Image skeleton with exact aspect ratio */}
        <div className="bg-gray-200 rounded-2xl mb-0" style={{ aspectRatio: '5 / 6' }}></div>
        {/* Content skeleton */}
        <div className="px-0 text-center space-y-1 pt-2">
          <div className="bg-gray-200 h-4 rounded w-3/4 mx-auto"></div>
          <div className="bg-gray-200 h-4 rounded w-1/2 mx-auto"></div>
          <div className="bg-gray-200 h-3 rounded w-1/3 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (type === "product-grid") {
    return (
      <div className="animate-pulse">
        {/* Desktop: 6 columns */}
        <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0.5 p-0 m-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-3xl p-0">
              <div className="bg-gray-200 rounded-2xl mb-0" style={{ aspectRatio: '5 / 6' }}></div>
              <div className="px-0 text-center space-y-1 pt-2">
                <div className="bg-gray-200 h-4 rounded w-3/4 mx-auto"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2 mx-auto"></div>
                <div className="bg-gray-200 h-3 rounded w-1/3 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile: Exact layout structure matching FeaturedProducts */}
        <div className="sm:hidden">
          {/* First 4 products (2 rows) */}
          <div className="grid grid-cols-2 gap-0.5 p-0 m-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-3xl p-0">
                <div className="bg-gray-200 rounded-2xl mb-0" style={{ aspectRatio: '5 / 6' }}></div>
                <div className="px-0 text-center space-y-1 pt-2">
                  <div className="bg-gray-200 h-4 rounded w-3/4 mx-auto"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2 mx-auto"></div>
                  <div className="bg-gray-200 h-3 rounded w-1/3 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Recently Viewed Products Skeleton */}
          <div className="mt-1 mb-1">
            <div className="bg-white rounded-lg shadow p-4" style={{ minHeight: 160 }}>
              <div className="bg-gray-200 h-6 rounded w-1/3 mb-4"></div>
              <div className="flex gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="w-32">
                    <div className="bg-gray-200 h-32 rounded-lg mb-2"></div>
                    <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Next 4 products (2 rows) */}
          <div className="grid grid-cols-2 gap-0.5 p-0 m-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i + 4} className="bg-gray-50 rounded-3xl p-0">
                <div className="bg-gray-200 rounded-2xl mb-0" style={{ aspectRatio: '5 / 6' }}></div>
                <div className="px-0 text-center space-y-1 pt-2">
                  <div className="bg-gray-200 h-4 rounded w-3/4 mx-auto"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2 mx-auto"></div>
                  <div className="bg-gray-200 h-3 rounded w-1/3 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Latest Products Skeleton */}
          <div className="bg-white rounded-lg shadow p-4 mt-1 mb-1" style={{ minHeight: 196 }}>
            <div className="bg-gray-200 h-6 rounded w-1/4 mb-4"></div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="shrink-0 w-32">
                  <div className="bg-gray-200 h-32 rounded-lg mb-2"></div>
                  <div className="bg-gray-200 h-3 rounded w-3/4 mb-1"></div>
                  <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Remaining products (22 more) */}
          <div className="grid grid-cols-2 gap-0.5 p-0 m-0">
            {Array.from({ length: 22 }).map((_, i) => (
              <div key={i + 8} className="bg-gray-50 rounded-3xl p-0">
                <div className="bg-gray-200 rounded-2xl mb-0" style={{ aspectRatio: '5 / 6' }}></div>
                <div className="px-0 text-center space-y-1 pt-2">
                  <div className="bg-gray-200 h-4 rounded w-3/4 mx-auto"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2 mx-auto"></div>
                  <div className="bg-gray-200 h-3 rounded w-1/3 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
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
          <div className="bg-gray-200 h-[400px] rounded-2xl"></div>
        </div>
        {/* Mobile trending skeleton - horizontal scroll */}
        <div className="block md:hidden">
          <div className="bg-gray-200 h-44 rounded-xl"></div>
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

  if (type === "recommendations") {
    return (
      <div className="animate-pulse bg-white rounded-xl p-4">
        <div className="bg-gray-200 h-6 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-3xl p-0">
              <div className="bg-gray-200 rounded-2xl mb-2" style={{ aspectRatio: '5 / 6' }}></div>
              <div className="px-0 text-center space-y-1 pt-2">
                <div className="bg-gray-200 h-3 rounded w-3/4 mx-auto"></div>
                <div className="bg-gray-200 h-3 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "testimonials") {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-6 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="bg-gray-200 h-16 rounded-lg"></div>
          <div className="bg-gray-200 h-16 rounded-lg"></div>
          <div className="bg-gray-200 h-16 rounded-lg"></div>
        </div>
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
