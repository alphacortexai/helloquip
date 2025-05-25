




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

// export default function RegisterPage() {
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
//       {/* Friendly Hello Quip */}
//       <h1 className="text-4xl font-extrabold text-indigo-700 mb-2">
//         {isRegistering ? "Join Us Today!" : "Hello Quip!"}
//       </h1>
//       <p className="text-indigo-500 text-lg mb-8 text-center max-w-md">
//         {isRegistering
//           ? "Create your account and start your journey with us."
//           : "Sign in to proceed with your order."}
//       </p>

//       {/* Error message */}
//       {error && (
//         <div className="text-center text-red-600 bg-red-100 py-2 px-4 rounded-lg font-semibold mb-6 max-w-md w-full">
//           {error}
//         </div>
//       )}

//       {/* Form */}
//       <form
//         onSubmit={handleEmailAuth}
//         className="flex flex-col gap-4 max-w-md w-full"
//       >
//         <input
//           type="email"
//           placeholder="Email address"
//           className="w-full border border-gray-300 rounded-lg px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//           autoComplete="email"
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           className="w-full border border-gray-300 rounded-lg px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           autoComplete={isRegistering ? "new-password" : "current-password"}
//         />

//         {isRegistering && (
//           <input
//             type="password"
//             placeholder="Confirm Password"
//             className="w-full border border-gray-300 rounded-lg px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             required
//             autoComplete="new-password"
//           />
//         )}

//         <button
//           type="submit"
//           className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold text-lg transition"
//         >
//           {isRegistering ? "Register" : "Sign In"}
//         </button>
//       </form>

//       {/* Toggle Sign In / Register */}
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

//       {/* Google Sign-In Button */}
//       <button
//         onClick={handleGoogleSignIn}
//         className="w-full max-w-md flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition"
//       >
//         <svg
//           className="h-6 w-6"
//           viewBox="0 0 488 512"
//           fill="currentColor"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <path d="M488 261.8C488 403.3 391.2 504 248 504c-137 0-248-111-248-248S111 8 248 8c66.7 0 123.3 24.5 167.3 64.6l-67.8 65.1C313.3 105.1 284.5 96 248 96c-87.5 0-158.4 71.4-158.4 160S160.5 416 248 416c82.5 0 132.3-58.2 137.7-111.3H248v-89h240c2 13 3 25.7 3 45.1z" />
//         </svg>
//         Continue with Google
//       </button>

//       {/* Return to Shop Button */}
//       <button
//         onClick={() => router.push("/")}
//         className="mt-10 max-w-md w-full text-indigo-700 border border-indigo-700 py-3 rounded-lg font-semibold hover:bg-indigo-100 transition"
//       >
//         ← Return to Shop
//       </button>
//     </div>
//   );
// }




import RegisterClient from "./RegisterClient";

export default function RegisterPage() {
  return <RegisterClient />;
}
