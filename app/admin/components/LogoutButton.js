"use client";

import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function LogoutButton({ isDropdown = false }) {
  const auth = getAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isDropdown) {
    return (
      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
      >
        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
        Logout
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
    >
      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-1" />
      Logout
    </button>
  );
}
