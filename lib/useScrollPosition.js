export function useScrollPosition() {
  // Scroll to top (for product/category pages)
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  };

  return {
    scrollToTop
  };
}
