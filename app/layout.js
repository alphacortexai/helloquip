// // app/layout.js
// import "./globals.css";
// import { Inter } from "next/font/google";
// import ClientLayoutWrapper from "@/components/ClientLayoutWrapper"; // NEW
// import { CartProvider } from "@/components/CartContext";
// import NotificationSetup from "@/components/NotificationSetup";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "HelloQuip",
//   description: "Medical eCommerce",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <CartProvider>
//           <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
//         </CartProvider>
//       </body>
//     </html>
//   );
// }



import "./globals.css";
import { Inter } from "next/font/google";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { CartProvider } from "@/components/CartContext";
import NotificationSetup from "@/components/NotificationSetup";  // <-- import the React component

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HelloQuip",
  description: "Medical eCommerce",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <NotificationSetup />  {/* <-- use it here */}
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
