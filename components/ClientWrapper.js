// "use client";

// import { useEffect, useState } from "react";
// import dynamic from "next/dynamic";

// // Dynamically import components that use hooks to prevent SSR issues
// const ClientLayoutWrapper = dynamic(() => import("./ClientLayoutWrapper"), {
//   ssr: false,
// });

// const CartProvider = dynamic(() => import("./CartContext").then(mod => ({ default: mod.CartProvider })), {
//   ssr: false,
// });

// const NotificationSetup = dynamic(() => import("./NotificationSetup"), {
//   ssr: false,
// });

// const SessionProvider = dynamic(() => import("./SessionProvider"), {
//   ssr: false,
// });

// const AutoSignIn = dynamic(() => import("./AutoSignIn"), {
//   ssr: false,
// });

// const ProductSettingsProvider = dynamic(() => import("../hooks/useProductSettings").then(mod => ({ default: mod.ProductSettingsProvider })), {
//   ssr: false,
// });

// export default function ClientWrapper({ children }) {
//   const [isClient, setIsClient] = useState(false);
//   const [isHydrated, setIsHydrated] = useState(false);

//   useEffect(() => {
//     setIsClient(true);
//     // Small delay to ensure smooth hydration
//     const timer = setTimeout(() => setIsHydrated(true), 50);
//     return () => clearTimeout(timer);
//   }, []);

//   // Render children immediately on server and during hydration
//   // Only wrap with client providers after hydration
//   if (!isHydrated) {
//     return children;
//   }

//   return (
//     <SessionProvider>
//       <AutoSignIn />
//       <ProductSettingsProvider>
//         <CartProvider>
//           <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
//           <NotificationSetup />
//         </CartProvider>
//       </ProductSettingsProvider>
//     </SessionProvider>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import all client-only providers
const ClientLayoutWrapper = dynamic(() => import("./ClientLayoutWrapper"), {
  ssr: false,
});

const CartProvider = dynamic(
  () => import("./CartContext").then((mod) => ({ default: mod.CartProvider })),
  { ssr: false }
);

const NotificationSetup = dynamic(() => import("./NotificationSetup"), {
  ssr: false,
});

const SessionProvider = dynamic(() => import("./SessionProvider"), {
  ssr: false,
});

const AutoSignIn = dynamic(() => import("./AutoSignIn"), {
  ssr: false,
});

const ProductSettingsProvider = dynamic(
  () =>
    import("../hooks/useProductSettings").then((mod) => ({
      default: mod.ProductSettingsProvider,
    })),
  { ssr: false }
);

export default function ClientWrapper({ children }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Render the page content immediately during SSR/initial hydration
  // so the user never sees a blank screen while client-only wrappers load.
  if (!isHydrated) {
    return <>{children}</>;
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
