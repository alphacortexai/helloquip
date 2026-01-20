export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import CachedLogo from "@/components/CachedLogo";
import RegisterClient from "./RegisterClient";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#255cdc] flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-6xl flex">
        {/* Desktop: Left - images, title, subtitle (hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-center pr-10">
          <h1 className="text-3xl font-bold text-white mb-1">HeloQuip</h1>
          <p className="text-white/90 text-lg mb-6">Medical Equipment & Supplies</p>
          <div className="flex flex-col gap-3">
            <div className="relative w-full aspect-[16/10] max-h-44 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/imaging.png"
                alt="Imaging"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 0, 50vw"
                priority
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/icu.png"
                  alt="ICU"
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/imgone.png"
                  alt="Medical"
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right (desktop) / Full width (mobile): Register form card */}
        <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end">
          <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-xl flex flex-col items-center">
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 bg-[#255cdc]/10 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#255cdc]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4zm0-2a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mt-3">HeloQuip</h2>
              <p className="text-sm text-gray-500 text-center mt-1">
                Medical Equipment & Supplies
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Continue with Google to sign in or shop
              </p>
            </div>

            <RegisterClient />

            <Link
              href="/"
              className="mt-6 w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              ← Return to Shop
            </Link>

            <div className="mt-8">
              <CachedLogo variant="register" className="h-10 w-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
