"use client";

import { useEffect, useState } from "react";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [error, setError] = useState("");

  const auth = getAuth();

  const checkIfNewUser = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      router.push(`/complete-profile`);
    } else {
      try {
        sessionStorage.setItem("forceScrollTop", "1");
      } catch {}
      router.push(redirect || "/");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await checkIfNewUser(result.user);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      try {
        sessionStorage.setItem("forceScrollTop", "1");
      } catch {}
      router.push(redirect || "/");
    }
  }, [auth, redirect, router]);

  return (
    <>
      {error && (
        <div className="text-center text-red-600 bg-red-100 py-2 px-4 rounded-lg font-semibold mb-6 max-w-md w-full">
          {error}
        </div>
      )}

      <button
        onClick={handleGoogleSignIn}
        className="w-full max-w-md flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition"
      >
        <svg className="h-6 w-6" viewBox="0 0 488 512" fill="currentColor">
          <path d="M488 261.8C488 403.3 391.2 504 248 504c-137 0-248-111-248-248S111 8 248 8c66.7 0 123.3 24.5 167.3 64.6l-67.8 65.1C313.3 105.1 284.5 96 248 96c-87.5 0-158.4 71.4-158.4 160S160.5 416 248 416c82.5 0 132.3-58.2 137.7-111.3H248v-89h240c2 13 3 25.7 3 45.1z" />
        </svg>
        Continue with Google
      </button>
    </>
  );
}

