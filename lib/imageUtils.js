// lib/imageUtils.js
// Shared image utility functions

export const getPreferredImageUrl = (imageUrl, size = "680x680") => {
  if (!imageUrl) return "/fallback.jpg";

  // If it's a string, decode and return
  if (typeof imageUrl === "string") {
    try {
      return decodeURIComponent(imageUrl);
    } catch {
      return imageUrl;
    }
  }

  // If it's an object with multiple sizes
  if (typeof imageUrl === "object") {
    const preferred =
      imageUrl[size] || imageUrl["original"] || Object.values(imageUrl)[0];
    try {
      return decodeURIComponent(preferred);
    } catch {
      return preferred;
    }
  }

  return "/fallback.jpg";
};

export const getProductImageUrl = (product, size = "680x680") => {
  if (!product) return "/fallback.jpg";
  
  // Try different possible image fields
  const imageUrl = product.imageUrl || product.image || product.mainImage;
  
  return getPreferredImageUrl(imageUrl, size);
};