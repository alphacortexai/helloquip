// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: ["firebasestorage.googleapis.com", 'lh3.googleusercontent.com'],
//   },
// };




// export default nextConfig;





// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: ["firebasestorage.googleapis.com", "lh3.googleusercontent.com", "cdn-icons-png.flaticon.com"],
//   },
// };

// export default nextConfig;



/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      },
    ],
    // Enable modern image formats (WebP, AVIF)
    formats: ['image/avif', 'image/webp'],
    // Add device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimize layout shift
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
