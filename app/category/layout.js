"use client";

import { useEffect } from 'react';
import { useScrollPosition } from '@/lib/useScrollPosition';

export default function CategoryLayout({ children }) {
  const { scrollToTop } = useScrollPosition();

  // Scroll to top when entering any category page
  useEffect(() => {
    scrollToTop();
  }, [scrollToTop]);

  return <>{children}</>;
}
