"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

// 👇 Replace with actual admin emails
const adminEmails = [
  "edrine.eminence@gmail.com","edrine.mutebi@gmail.com","mulebekisharif@gmail.com","helloquip@admin.com"
];

export default function withAdminAuth(Component) {
  return function ProtectedPage(props) {
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [currentAdminUid, setCurrentAdminUid] = useState(null);
    const router = useRouter();

    useEffect(() => {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.push("/admin/login");
        } else if (!adminEmails.includes(user.email)) {
          console.log("Access denied for email:", user.email);
          alert("Access denied. Admins only.");
          router.push("/admin/login");
        } else {
          setCurrentAdminUid(user.uid);
          setIsAuthorized(true);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin panel...</p>
          </div>
        </div>
      );
    }
    if (!isAuthorized) return null;

    return <Component {...props} currentAdminUid={currentAdminUid} />;
  };
}
