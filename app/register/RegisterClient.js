// "use client";

// import { useEffect, useState } from "react";
// import {
//   getAuth,
//   signInWithPopup,
//   GoogleAuthProvider,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
// } from "firebase/auth";
// import { useRouter, useSearchParams } from "next/navigation";

// export default function RegisterClient() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const redirect = searchParams.get("redirect") || "/";

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [error, setError] = useState("");

//   const auth = getAuth();

//   const handleGoogleSignIn = async () => {
//     try {
//       const provider = new GoogleAuthProvider();
//       await signInWithPopup(auth, provider);
//       router.push(redirect);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const handleEmailAuth = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (isRegistering && password !== confirmPassword) {
//       setError("Passwords do not match.");
//       return;
//     }

//     try {
//       if (isRegistering) {
//         await createUserWithEmailAndPassword(auth, email, password);
//       } else {
//         await signInWithEmailAndPassword(auth, email, password);
//       }
//       router.push(redirect);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   useEffect(() => {
//     if (auth.currentUser) {
//       router.push(redirect);
//     }
//   }, [auth, redirect, router]);

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
//       <h1 className="text-4xl font-extrabold text-indigo-700 mb-2">
//         {isRegistering ? "Join Us Today!" : "Hello Quip!"}
//       </h1>
//       <p className="text-indigo-500 text-lg mb-8 text-center max-w-md">
//         {isRegistering
//           ? "Create your account and start your journey with us."
//           : "Sign in to proceed with your order."}
//       </p>

//       {error && (
//         <div className="text-center text-red-600 bg-red-100 py-2 px-4 rounded-lg font-semibold mb-6 max-w-md w-full">
//           {error}
//         </div>
//       )}

//       <form
//         onSubmit={handleEmailAuth}
//         className="flex flex-col gap-4 max-w-md w-full"
//       >
//         <input
//           type="email"
//           placeholder="Email address"
//           className="w-full border border-gray-300 rounded-lg px-5 py-3"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           className="w-full border border-gray-300 rounded-lg px-5 py-3"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />

//         {isRegistering && (
//           <input
//             type="password"
//             placeholder="Confirm Password"
//             className="w-full border border-gray-300 rounded-lg px-5 py-3"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             required
//           />
//         )}

//         <button
//           type="submit"
//           className="w-full bg-indigo-600 text-white py-3 rounded-lg"
//         >
//           {isRegistering ? "Register" : "Sign In"}
//         </button>
//       </form>

//       <p className="text-gray-600 mt-6 max-w-md text-center">
//         {isRegistering ? (
//           <>
//             Already have an account?{" "}
//             <button
//               onClick={() => {
//                 setIsRegistering(false);
//                 setError("");
//                 setPassword("");
//                 setConfirmPassword("");
//               }}
//               className="text-indigo-600 font-medium hover:underline"
//               type="button"
//             >
//               Sign In
//             </button>
//           </>
//         ) : (
//           <>
//             Don’t have an account?{" "}
//             <button
//               onClick={() => {
//                 setIsRegistering(true);
//                 setError("");
//                 setPassword("");
//                 setConfirmPassword("");
//               }}
//               className="text-indigo-600 font-medium hover:underline"
//               type="button"
//             >
//               Register
//             </button>
//           </>
//         )}
//       </p>

//       <div className="flex items-center justify-center gap-3 my-6 max-w-md w-full">
//         <span className="text-gray-400 font-semibold uppercase tracking-wider">
//           OR
//         </span>
//       </div>

//       <button
//         onClick={handleGoogleSignIn}
//         className="w-full max-w-md flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition"
//       >
//         <svg className="h-6 w-6" viewBox="0 0 488 512" fill="currentColor">
//           <path d="M488 261.8C488 403.3 391.2 504 248 504c-137 0-248-111-248-248S111 8 248 8c66.7 0 123.3 24.5 167.3 64.6l-67.8 65.1C313.3 105.1 284.5 96 248 96c-87.5 0-158.4 71.4-158.4 160S160.5 416 248 416c82.5 0 132.3-58.2 137.7-111.3H248v-89h240c2 13 3 25.7 3 45.1z" />
//         </svg>
//         Continue with Google
//       </button>

//       <button
//         onClick={() => router.push("/")}
//         className="mt-10 max-w-md w-full text-indigo-700 border border-indigo-700 py-3 rounded-lg font-semibold hover:bg-indigo-100 transition"
//       >
//         ← Return to Shop
//       </button>
//     </div>
//   );
// }




// --- Register Page (register/page.jsx) ---

"use client";

import { useEffect, useState } from "react";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  const auth = getAuth();

  const checkIfNewUser = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      router.push(`/complete-profile`);
    } else {
      try { sessionStorage.setItem('forceScrollTop', '1'); } catch {}
      router.push(redirect || '/');
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

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegistering && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      await checkIfNewUser(userCredential.user);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      try { sessionStorage.setItem('forceScrollTop', '1'); } catch {}
      router.push(redirect || '/');
    }
  }, [auth, redirect, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#2e4493] px-4 text-white">
      <h1 className="text-4xl font-extrabold mb-2">
        {isRegistering ? "Join Us Today!" : "Hello Quip!"}
      </h1>
      <p className="text-white/90 text-lg mb-8 text-center max-w-md">
        {isRegistering
          ? "Create your account and start your journey with us."
          : "Sign in to proceed with your order."}
      </p>

      {error && (
        <div className="text-center text-red-600 bg-red-100 py-2 px-4 rounded-lg font-semibold mb-6 max-w-md w-full">
          {error}
        </div>
      )}

      <form
        onSubmit={handleEmailAuth}
        className="flex flex-col gap-4 max-w-md w-full"
      >
        <input
          type="email"
          placeholder="Email address"
          className="w-full rounded-lg px-5 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/60"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg px-5 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/60"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {isRegistering && (
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full rounded-lg px-5 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/60"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        )}

        <button
          type="submit"
          className="w-full bg-white text-[#2e4493] py-3 rounded-lg font-semibold hover:bg-white/90 transition"
        >
          {isRegistering ? "Register" : "Sign In"}
        </button>
      </form>

      <p className="text-white/90 mt-6 max-w-md text-center">
        {isRegistering ? (
          <>
            Already have an account?{' '}
            <button
              onClick={() => {
                setIsRegistering(false);
                setError("");
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-white font-semibold hover:underline"
              type="button"
            >
              Sign In
            </button>
          </>
        ) : (
          <>
            Don’t have an account?{' '}
            <button
              onClick={() => {
                setIsRegistering(true);
                setError("");
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-white font-semibold hover:underline"
              type="button"
            >
              Register
            </button>
          </>
        )}
      </p>

      <div className="flex items-center justify-center gap-3 my-6 max-w-md w-full">
        <span className="text-white/70 font-semibold uppercase tracking-wider">
          OR
        </span>
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="w-full max-w-md flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition"
      >
        <svg className="h-6 w-6" viewBox="0 0 488 512" fill="currentColor">
          <path d="M488 261.8C488 403.3 391.2 504 248 504c-137 0-248-111-248-248S111 8 248 8c66.7 0 123.3 24.5 167.3 64.6l-67.8 65.1C313.3 105.1 284.5 96 248 96c-87.5 0-158.4 71.4-158.4 160S160.5 416 248 416c82.5 0 132.3-58.2 137.7-111.3H248v-89h240c2 13 3 25.7 3 45.1z" />
        </svg>
        Continue with Google
      </button>

      <button
        onClick={() => router.push("/")}
        className="mt-10 max-w-md w-full text-white border border-white py-3 rounded-lg font-semibold hover:bg-white/10 transition"
      >
        ← Return to Shop
      </button>

      {/* Bottom logo */}
      <div className="mt-10 opacity-90">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/helloquip-80e20.firebasestorage.app/o/HQlogo3.png?alt=media&token=22b28cda-b3db-4508-a374-9c374d2a4294"
          alt="HelloQuip Logo"
          className="h-10 w-auto"
        />
      </div>
    </div>
  );
}
