import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export function useDisplaySettings() {
  const [featuredCardResolution, setFeaturedCardResolution] = useState("100x100");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "display"));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setFeaturedCardResolution(data.featuredCardResolution || "100x100");
        }
      } catch (error) {
        console.error("Error loading display settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return { featuredCardResolution, loading };
}
