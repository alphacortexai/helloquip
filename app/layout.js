import "./globals.css";
import { Inter } from "next/font/google";
import ClientWrapper from "@/components/ClientWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HelloQuip",
  description: "Medical eCommerce",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Critical resource hints for faster loading */}
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/logo.png" as="image" type="image/png" />
        <link rel="preload" href="/fallback.jpg" as="image" type="image/jpeg" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://cdn-icons-png.flaticon.com" />
        
        {/* Preconnect to Firebase Auth */}
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <link rel="preconnect" href="https://securetoken.googleapis.com" />
      </head>
      <body className={inter.className}>
        <ClientWrapper>{children}</ClientWrapper>
        <SpeedInsights />
      </body>
    </html>
  );
}
