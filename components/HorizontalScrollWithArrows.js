"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

/**
 * Wraps a horizontally scrollable row with left/right arrow buttons.
 * Arrows are hidden when at the start (left) or end (right).
 * itemCount: optional, when it changes we re-check scroll state (e.g. after data loads).
 * scrollClassName: extra classes for the scroll container (e.g. gap-4, snap-x, pb-2).
 * scrollByFullWidth: if true, scroll by clientWidth (one full "slide"); else 75% of clientWidth.
 * forwardedRef: optional ref to assign to the scroll element.
 * useFlex: if false, scroll container does not use flex (for custom inner layout like grid). Default true.
 */
export default function HorizontalScrollWithArrows({
  children,
  className = "",
  scrollClassName = "",
  itemCount,
  scrollByFullWidth = false,
  forwardedRef,
  useFlex = true,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const tolerance = 2;
    setCanScrollLeft(scrollLeft > tolerance);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - tolerance);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState);
    const win = el.ownerDocument?.defaultView || window;
    win.addEventListener("resize", updateScrollState);
    updateScrollState();
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      win.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  useEffect(() => {
    if (itemCount == null) return;
    const t = setTimeout(updateScrollState, 100);
    return () => clearTimeout(t);
  }, [itemCount, updateScrollState]);

  useEffect(() => {
    const t1 = setTimeout(updateScrollState, 300);
    const t2 = setTimeout(updateScrollState, 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [updateScrollState]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = scrollByFullWidth ? el.clientWidth : el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const setRef = (el) => {
    scrollRef.current = el;
    if (forwardedRef) {
      if (typeof forwardedRef === "function") forwardedRef(el);
      else forwardedRef.current = el;
    }
  };

  const showLeft = canScrollLeft;
  const showRight = canScrollRight;

  return (
    <div className={`relative ${className}`}>
      {showLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      )}
      <div
        ref={setRef}
        className={`overflow-x-auto scrollbar-hide ${useFlex ? "flex" : ""} ${scrollClassName}`}
      >
        {children}
      </div>
      {showRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
