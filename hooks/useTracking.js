"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getUserTrackingService } from "@/lib/userTrackingService";

export function usePageTracking() {
  const pathname = usePathname();
  const trackingService = getUserTrackingService();

  useEffect(() => {
    if (trackingService && trackingService.isTrackingEnabled) {
      trackingService.trackPageView(pathname);
    }
  }, [pathname, trackingService]);
}

export function useProductTracking(productId, productName, productData) {
  const trackingService = getUserTrackingService();

  useEffect(() => {
    if (trackingService && trackingService.isTrackingEnabled && productId) {
      trackingService.trackProductView(productId, productName, productData);
    }
  }, [productId, productName, productData, trackingService]);
}

export function trackProductClick(productId, productName, productData = {}) {
  const trackingService = getUserTrackingService();
  if (trackingService && trackingService.isTrackingEnabled) {
    trackingService.trackProductClick(productId, productName, productData);
  }
}

export function trackButtonClick(buttonId, buttonText, context = {}) {
  const trackingService = getUserTrackingService();
  if (trackingService && trackingService.isTrackingEnabled) {
    trackingService.trackButtonClick(buttonId, buttonText, context);
  }
}
