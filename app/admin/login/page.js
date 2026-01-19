// "use client";

// import { useState } from "react";
// import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// import { useRouter } from "next/navigation";
// import { app } from "@/lib/firebase"; // your initialized firebase app

// export default function AdminLogin() {
//   const auth = getAuth(app);
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       router.push("/admin"); // redirect to dashboard after login
//     } catch (err) {
//       setError("Invalid email or password");
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-20 p-4 border rounded shadow">
//       <h1 className="text-xl font-bold mb-4">Admin Login</h1>
//       {error && <p className="text-red-500 mb-2">{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           placeholder="Email"
//           className="w-full mb-2 p-2 border rounded"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           className="w-full mb-4 p-2 border rounded"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
//           Login
//         </button>
//       </form>
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "@/lib/firebase";

export default function AdminLogin() {
  const auth = getAuth(app);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0865ff] px-4" data-page="admin-login">
      <div className="w-full max-w-md bg-white p-4 md:p-6 rounded-lg shadow-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-[#0865ff]/20 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-[#0865ff]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4zm0-2a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold mt-2">HeloQuip Admin</h1>
          <p className="text-sm text-gray-500 text-center">
            Enter your email and password to log in
          </p>
        </div>

        {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#0865ff] focus:border-[#0865ff]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#0865ff] focus:border-[#0865ff]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-[#0865ff] hover:bg-[#075ae6] text-white py-3 rounded font-semibold"
          >
            Continue
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          For further support, please contact our customer service team.
        </p>

        <p className="text-center text-sm text-gray-600 mt-6 font-semibold">
          HELOQUIP
        </p>
      </div>
    </div>
  );
}
