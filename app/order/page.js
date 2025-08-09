import { Suspense } from "react";
import dynamic from "next/dynamic";

const OrderClient = dynamic(() => import("./OrderClient"), { ssr: false });

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-600">Loading order…</div>}>
      <OrderClient />
    </Suspense>
  );
}
