"use client";

export default function ImageSkeleton({ 
  width = "100%", 
  height = "100%", 
  className = "",
  rounded = "lg",
  showShimmer = true 
}) {
  // Map rounded prop to actual Tailwind classes
  const roundedClasses = {
    'sm': 'rounded-sm',
    'md': 'rounded-md', 
    'lg': 'rounded-lg',
    'xl': 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    'full': 'rounded-full'
  };

  const roundedClass = roundedClasses[rounded] || 'rounded-lg';

  return (
    <div 
      className={`relative bg-gray-200 overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Base skeleton */}
      <div className={`w-full h-full bg-gray-200 ${roundedClass}`} />
      
      {/* Shimmer effect */}
      {showShimmer && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      )}
    </div>
  );
}
