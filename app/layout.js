// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper"; // NEW
import { CartProvider } from "@/components/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HelloQuip",
  description: "Medical eCommerce",
};

export default function RootLayout({ children }) {
  return (
    // <html lang="en">
    //   <body className={inter.className}>
    //     <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
    //      <CartProvider>{children}</CartProvider>
    //   </body>
    // </html>
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
