"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// 👇 Replace with actual admin emails
const adminEmails = [
  "edrine.eminence@gmail.com","edrine.mutebi@gmail.com","mulebekisharif@gmail.com"
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
        //   alert("Access denied. Admins only.");
          toast.info("Access Denied");
          router.push("/admin/login");
        } else {
          setCurrentAdminUid(user.uid);
          setIsAuthorized(true);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [router]);

    if (loading) return <p>Loading...</p>;
    if (!isAuthorized) return null;

    return <Component {...props} currentAdminUid={currentAdminUid} />;
  };
}
