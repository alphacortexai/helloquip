"use client";

import { Suspense } from "react";
import OrderClient from "./OrderClient";

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-600">Loading order…</div>}>
      <OrderClient />
    </Suspense>
  );
}
