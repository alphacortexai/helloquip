import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getScrollManager } from './scrollPositionManager';

// Custom hook for scroll restoration
export const useScrollRestoration = (pageKey, options = {}) => {
  const {
    restoreOnMount = true,
    saveOnUnmount = true,
    saveOnScroll = true,
    scrollDelay = 500,
    elementId = null
  } = options;

  const router = useRouter();
  const scrollManager = useRef(null);
  const isNavigating = useRef(false);

  // Initialize scroll manager
  useEffect(() => {
    scrollManager.current = getScrollManager();
  }, []);

  // Restore scroll position on mount
  useEffect(() => {
    if (!restoreOnMount || !scrollManager.current) return;

    const timer = setTimeout(() => {
      scrollManager.current.restorePosition(pageKey);
    }, scrollDelay);

    return () => clearTimeout(timer);
  }, [pageKey, restoreOnMount, scrollDelay]);

  // Save scroll position on unmount
  useEffect(() => {
    if (!saveOnUnmount || !scrollManager.current) return;

    return () => {
      if (!isNavigating.current) {
        scrollManager.current.savePosition(pageKey);
      }
    };
  }, [pageKey, saveOnUnmount]);

  // Save scroll position while scrolling
  useEffect(() => {
    if (!saveOnScroll || !scrollManager.current) return;

    let scrollTimer;
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        scrollManager.current.savePosition(pageKey);
      }, 2000); // Save after 2 seconds of no scrolling
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [pageKey, saveOnScroll]);

  // Navigation handler with scroll position saving
  const navigateWithScrollSave = (url, elementId = null) => {
    if (!scrollManager.current) return;

    isNavigating.current = true;
    
    // Save precise scroll position with element ID if provided
    if (elementId) {
      scrollManager.current.savePositionWithElement(pageKey, elementId);
    } else {
      scrollManager.current.savePosition(pageKey);
    }

    // Update URL with anchor for precise restoration
    try {
      if (elementId) {
        const anchor = elementId;
        const currentUrl = new URL(window.location.href);
        currentUrl.hash = anchor;
        window.history.replaceState(window.history.state, "", currentUrl.toString());
      }
    } catch (e) {
      console.warn('Could not update URL with anchor:', e);
    }

    // Navigate to the new page
    router.push(url);
  };

  // Save current position manually
  const saveCurrentPosition = (customElementId = null) => {
    if (!scrollManager.current) return;

    const elementIdToUse = customElementId || elementId;
    
    if (elementIdToUse) {
      scrollManager.current.savePositionWithElement(pageKey, elementIdToUse);
    } else {
      scrollManager.current.savePosition(pageKey);
    }
  };

  // Restore position manually
  const restorePosition = () => {
    if (!scrollManager.current) return;
    scrollManager.current.restorePosition(pageKey);
  };

  return {
    navigateWithScrollSave,
    saveCurrentPosition,
    restorePosition,
    isNavigating: isNavigating.current
  };
};

// Hook specifically for product navigation
export const useProductNavigation = (pageKey = 'main') => {
  const { navigateWithScrollSave } = useScrollRestoration(pageKey, {
    restoreOnMount: true,
    saveOnUnmount: true,
    saveOnScroll: true
  });

  const navigateToProduct = (productId, productType = 'product') => {
    const elementId = `${productType}-${productId}`;
    navigateWithScrollSave(`/product/${productId}`, elementId);
  };

  return {
    navigateToProduct,
    navigateToProductFromFeatured: (productId) => navigateToProduct(productId, 'p'),
    navigateToProductFromTrending: (productId) => navigateToProduct(productId, 'trend')
  };
};
