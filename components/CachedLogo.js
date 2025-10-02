"use client";

import Image from 'next/image';
import { useState } from 'react';

const CachedLogo = ({ 
  variant = 'default', // 'default', 'footer', 'loading', 'register'
  className = '',
  onClick,
  priority = false,
  width,
  height
}) => {
  const [imageError, setImageError] = useState(false);

  // Logo URLs for different variants
  const logoUrls = {
    default: "https://firebasestorage.googleapis.com/v0/b/helloquip-80e20.firebasestorage.app/o/HQlogo.png?alt=media&token=580aa6cc-f6d0-4ace-bcda-8e7b6b573821",
    footer: "https://firebasestorage.googleapis.com/v0/b/helloquip-80e20.firebasestorage.app/o/HQlogo3.png?alt=media&token=22b28cda-b3db-4508-a374-9c374d2a4294",
    loading: "https://firebasestorage.googleapis.com/v0/b/helloquip-80e20.firebasestorage.app/o/HQlogo3.png?alt=media&token=22b28cda-b3db-4508-a374-9c374d2a4294",
    register: "https://firebasestorage.googleapis.com/v0/b/helloquip-80e20.firebasestorage.app/o/HQlogo3.png?alt=media&token=22b28cda-b3db-4508-a374-9c374d2a4294"
  };

  // Default dimensions for different variants
  const defaultDimensions = {
    default: { width: 56, height: 56 }, // h-12 md:h-14
    footer: { width: 64, height: 64 }, // h-16
    loading: { width: 64, height: 64 }, // h-14 md:h-16
    register: { width: 40, height: 40 } // h-10
  };

  const logoUrl = logoUrls[variant] || logoUrls.default;
  const dimensions = width && height ? { width, height } : defaultDimensions[variant];

  // Fallback to regular img tag if Image component fails
  if (imageError) {
    return (
      <img
        src={logoUrl}
        alt="HeloQuip Logo"
        className={className}
        onClick={onClick}
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
          objectFit: 'contain'
        }}
      />
    );
  }

  return (
    <Image
      src={logoUrl}
      alt="HeloQuip Logo"
      width={dimensions.width}
      height={dimensions.height}
      className={className}
      onClick={onClick}
      priority={priority}
      quality={90}
      // Cache for 30 days
      unoptimized={false}
      onError={() => setImageError(true)}
      // Add cache headers via Next.js Image optimization
      style={{
        objectFit: 'contain'
      }}
    />
  );
};

export default CachedLogo;
