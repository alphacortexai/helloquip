import { useEffect, useRef } from 'react';

export function useScrollPosition() {
  const scrollPositionRef = useRef(0);

  // Save scroll position when leaving the page
  const saveScrollPosition = () => {
    if (typeof window !== 'undefined') {
      scrollPositionRef.current = window.scrollY;
      sessionStorage.setItem('mainPageScrollPosition', window.scrollY.toString());
    }
  };

  // Restore scroll position when returning to the page
  const restoreScrollPosition = () => {
    if (typeof window !== 'undefined') {
      const savedPosition = sessionStorage.getItem('mainPageScrollPosition');
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        if (position > 0) {
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            window.scrollTo(0, position);
            // Clear the saved position after restoring
            sessionStorage.removeItem('mainPageScrollPosition');
          });
        }
      }
      // Removed automatic scroll-to-top - let users scroll naturally
    }
  };

  // Scroll to top (for product pages)
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  };

  return {
    saveScrollPosition,
    restoreScrollPosition,
    scrollToTop
  };
}
