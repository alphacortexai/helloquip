"use client";

import { useEffect } from 'react';
import { useScrollPosition } from '@/lib/useScrollPosition';

export default function ProductLayout({ children }) {
  const { scrollToTop } = useScrollPosition();

  // Scroll to top when entering any product page
  useEffect(() => {
    scrollToTop();
  }, [scrollToTop]);

  return <>{children}</>;
}
