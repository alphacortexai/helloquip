// // app/layout.js

// import "./globals.css"; // Import your global styles
// import Footer from "@/components/Footer";

// export const metadata = {
//   title: "HELLOQUIP",
//   description: "Affordable medical equipment in Uganda",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <head>
//         {/* Meta tags go here only if necessary */}
//         <link rel="manifest" href="/manifest.json" />
//         <meta name="theme-color" content="#0f4a73" />
//         <meta name="mobile-web-app-capable" content="yes" />
//         <meta name="apple-mobile-web-app-capable" content="yes" />
//         <meta name="apple-mobile-web-app-status-bar-style" content="default" />
//         <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
//       </head>
//       <body className="bg-gray-50 text-gray-900 font-sans">
//         <main className="pb-20">
//           {children}
//         </main>
//         <Footer />
//       </body>
//     </html>
//   );
// }




// // app/layout.js
// import "./globals.css";
// import { Inter } from "next/font/google";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Your Site",
//   description: "Medical eCommerce",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <Navbar />
//         <main>{children}</main>
//         <Footer />
//       </body>
//     </html>
//   );
// }




// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper"; // NEW

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HelloQuip",
  description: "Medical eCommerce",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
