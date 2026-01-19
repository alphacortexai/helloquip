export const dynamic = "force-dynamic";

import Link from "next/link";
import CachedLogo from "@/components/CachedLogo";
import RegisterClient from "./RegisterClient";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0865ff] px-4 text-white">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <h1 className="text-4xl font-extrabold mb-2">HeloQuip</h1>
        <p className="text-white/90 text-lg mb-8">
          Continue with Google to proceed with your order.
        </p>

        <RegisterClient />

        <Link
          href="/"
          className="mt-10 w-full text-white border border-white py-3 rounded-lg font-semibold hover:bg-white/10 transition inline-block"
        >
          ← Return to Shop
        </Link>

        <div className="mt-10 opacity-90">
          <CachedLogo variant="register" className="h-10 w-auto" />
        </div>
      </div>
    </div>
  );
}
