"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

const MAX_CAROUSEL_IMAGES = 6;

export default function CarouselSettings() {
  const [carouselMode, setCarouselMode] = useState("trending");
  const [carouselImages, setCarouselImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "display"));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setCarouselMode(data.carouselMode || "trending");
          setCarouselImages(Array.isArray(data.carouselImages) ? data.carouselImages : []);
        }
      } catch (error) {
        console.error("Error loading carousel settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const hasImageSlots = carouselImages.length < MAX_CAROUSEL_IMAGES;

  const sortedImages = useMemo(() => {
    return [...carouselImages];
  }, [carouselImages]);

  const updateSettings = async (updates) => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, "settings", "display"),
        {
          ...updates,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving carousel settings:", error);
      alert("Failed to save carousel settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleModeChange = async (value) => {
    setCarouselMode(value);
    await updateSettings({ carouselMode: value });
  };

  const handleUploadImages = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = MAX_CAROUSEL_IMAGES - carouselImages.length;
    if (fileArray.length > remainingSlots) {
      alert(`You can upload up to ${remainingSlots} more image(s).`);
      return;
    }

    setUploading(true);
    try {
      const uploads = await Promise.all(
        fileArray.map(async (file) => {
          const safeName = file.name.replace(/\s+/g, "-");
          const storagePath = `carousel/${Date.now()}_${safeName}`;
          const imageRef = ref(storage, storagePath);
          const snapshot = await uploadBytes(imageRef, file);
          const url = await getDownloadURL(snapshot.ref);
          return {
            url,
            storagePath,
            alt: file.name || "Carousel image",
            createdAt: new Date(),
          };
        })
      );

      const updatedImages = [...carouselImages, ...uploads];
      setCarouselImages(updatedImages);
      setCarouselMode("images");
      await updateSettings({ carouselImages: updatedImages, carouselMode: "images" });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading carousel images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateImageLink = (index, value) => {
    const updated = carouselImages.map((img, i) =>
      i === index ? { ...img, link: value || undefined } : img
    );
    setCarouselImages(updated);
    updateSettings({ carouselImages: updated });
  };

  const handleRemoveImage = async (index) => {
    const target = carouselImages[index];
    if (!target) return;

    const updatedImages = carouselImages.filter((_, i) => i !== index);
    setCarouselImages(updatedImages);

    setSaving(true);
    try {
      if (target.storagePath) {
        await deleteObject(ref(storage, target.storagePath));
      }
      await updateSettings({ carouselImages: updatedImages });
    } catch (error) {
      console.error("Error removing carousel image:", error);
      alert("Failed to remove image. Please try again.");
      setCarouselImages(carouselImages);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Carousel Settings</h3>
          <p className="text-sm text-gray-600">Control what appears in the homepage carousel</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Carousel Content</h4>
          <p className="text-xs text-gray-600 mb-4">
            Choose whether the carousel shows trending products or custom images.
          </p>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="carouselMode"
                value="trending"
                checked={carouselMode === "trending"}
                onChange={(e) => handleModeChange(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Trending products</span>
                <p className="text-xs text-gray-500">Uses the existing trending products carousel.</p>
              </div>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="carouselMode"
                value="images"
                checked={carouselMode === "images"}
                onChange={(e) => handleModeChange(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Custom images</span>
                <p className="text-xs text-gray-500">Upload your own images to display.</p>
              </div>
            </label>
          </div>
          {carouselMode === "trending" && carouselImages.length > 0 && (
            <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              You have uploaded carousel images. Switch to Custom images to display them.
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Carousel Images</h4>
              <p className="text-xs text-gray-600">
                Upload up to {MAX_CAROUSEL_IMAGES} images. Use 712×384 for best fit (no cropping on desktop or mobile).
              </p>
            </div>
            <span className="text-xs text-gray-500">
              {carouselImages.length}/{MAX_CAROUSEL_IMAGES}
            </span>
          </div>

          <div className="mt-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleUploadImages(e.target.files)}
              disabled={!hasImageSlots || uploading}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            {!hasImageSlots && (
              <p className="text-xs text-amber-600 mt-2">
                Remove an image to upload more.
              </p>
            )}
          </div>

          {sortedImages.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedImages.map((image, index) => (
                <div key={image.storagePath || image.url} className="border border-gray-200 rounded-lg p-3">
                  <div className="w-full h-32 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                    {image.url ? (
                      <img
                        src={image.url}
                        alt={image.alt || `Carousel image ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No image</span>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="text-xs text-gray-500 block mb-1">Link when clicked (optional)</label>
                    <input
                      type="text"
                      placeholder="/product/123 or https://..."
                      value={image.link || ""}
                      onChange={(e) =>
                        setCarouselImages((prev) =>
                          prev.map((img, i) => (i === index ? { ...img, link: e.target.value } : img))
                        )
                      }
                      onBlur={(e) => handleUpdateImageLink(index, e.target.value.trim())}
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-600 truncate">
                      {image.alt || `Image ${index + 1}`}
                    </span>
                    <button
                      onClick={() => handleRemoveImage(index)}
                      disabled={saving}
                      className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sortedImages.length === 0 && (
            <div className="mt-4 text-xs text-gray-500">
              No carousel images uploaded yet.
            </div>
          )}
        </div>

        {saving && (
          <div className="text-xs text-blue-600">Saving changes...</div>
        )}
      </div>
    </div>
  );
}
