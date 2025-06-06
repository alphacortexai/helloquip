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
        // You can optionally add pathname if you want to restrict paths
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
  },
};

export default nextConfig;
