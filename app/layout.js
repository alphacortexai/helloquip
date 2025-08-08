import "./globals.css";
import { Inter } from "next/font/google";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { CartProvider } from "@/components/CartContext";
import NotificationSetup from "@/components/NotificationSetup";

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
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          <NotificationSetup />
        </CartProvider>
      </body>
    </html>
  );
}
