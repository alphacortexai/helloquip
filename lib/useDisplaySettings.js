import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export function useDisplaySettings() {
  const [featuredCardResolution, setFeaturedCardResolution] = useState("100x100");
  const [carouselMode, setCarouselMode] = useState("trending");
  const [carouselImages, setCarouselImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "display"));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setFeaturedCardResolution(data.featuredCardResolution || "100x100");
          setCarouselMode(data.carouselMode || "trending");
          setCarouselImages(Array.isArray(data.carouselImages) ? data.carouselImages : []);
        }
      } catch (error) {
        console.error("Error loading display settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return { featuredCardResolution, carouselMode, carouselImages, loading };
}
