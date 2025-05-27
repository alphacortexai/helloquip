// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: ["firebasestorage.googleapis.com", 'lh3.googleusercontent.com'],
//   },
// };




// export default nextConfig;







/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,  // Enable app router
  },
  images: {
    domains: ["firebasestorage.googleapis.com", "lh3.googleusercontent.com"],
  },
};

export default nextConfig;
