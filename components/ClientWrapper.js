"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import components that use hooks to prevent SSR issues
const ClientLayoutWrapper = dynamic(() => import("./ClientLayoutWrapper"), {
  ssr: false,
});

const CartProvider = dynamic(() => import("./CartContext").then(mod => ({ default: mod.CartProvider })), {
  ssr: false,
});

const NotificationSetup = dynamic(() => import("./NotificationSetup"), {
  ssr: false,
});

const SessionProvider = dynamic(() => import("./SessionProvider"), {
  ssr: false,
});

const AutoSignIn = dynamic(() => import("./AutoSignIn"), {
  ssr: false,
});

const ProductSettingsProvider = dynamic(() => import("../hooks/useProductSettings").then(mod => ({ default: mod.ProductSettingsProvider })), {
  ssr: false,
});

export default function ClientWrapper({ children }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on the server
  if (!isClient) {
    return null;
  }

  return (
    <SessionProvider>
      <AutoSignIn />
      <ProductSettingsProvider>
        <CartProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          <NotificationSetup />
        </CartProvider>
      </ProductSettingsProvider>
    </SessionProvider>
  );
}
