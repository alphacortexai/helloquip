// Scroll Position Manager for Navigation
// This utility helps preserve and restore scroll positions when navigating between pages

class ScrollPositionManager {
  constructor() {
    this.positions = new Map();
    this.currentPage = null;
    this.init();
  }

  init() {
    // Listen for page visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
      
      // Listen for beforeunload to save current position
      window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
      
      // Listen for popstate (back/forward navigation)
      window.addEventListener('popstate', this.handlePopState.bind(this));
    }
  }

  // Save scroll position for current page
  savePosition(pageKey, position = null) {
    if (typeof window === 'undefined') return;
    
    const currentPosition = position || {
      scrollY: window.scrollY,
      scrollX: window.scrollX,
      timestamp: Date.now()
    };

    console.log('💾 Saving scroll position:', { pageKey, position: currentPosition });

    this.positions.set(pageKey, currentPosition);
    this.currentPage = pageKey;
    
    // Also save to sessionStorage for persistence across page reloads
    try {
      sessionStorage.setItem(`scroll_${pageKey}`, JSON.stringify(currentPosition));
    } catch (e) {
      console.warn('Could not save scroll position to sessionStorage:', e);
    }
  }

  // Restore scroll position for a page
  restorePosition(pageKey, fallbackPosition = null) {
    if (typeof window === 'undefined') return;

    console.log('🔄 Attempting to restore scroll position:', { pageKey, fallbackPosition });

    // Try to get from memory first
    let position = this.positions.get(pageKey);
    
    // If not in memory, try sessionStorage
    if (!position) {
      try {
        const stored = sessionStorage.getItem(`scroll_${pageKey}`);
        if (stored) {
          position = JSON.parse(stored);
          console.log('📱 Retrieved position from sessionStorage:', position);
        }
      } catch (e) {
        console.warn('Could not restore scroll position from sessionStorage:', e);
      }
    }

    // If still no position, use fallback
    if (!position && fallbackPosition) {
      position = fallbackPosition;
      console.log('🔄 Using fallback position:', fallbackPosition);
    }

    if (position) {
      console.log('🎯 Restoring to position:', position);
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        try {
          window.scrollTo({
            left: position.scrollX || 0,
            top: position.scrollY || 0,
            behavior: 'instant' // Use instant to avoid animation
          });
          
          // Also try to scroll to specific element if it exists
          if (position.elementId) {
            const element = document.getElementById(position.elementId);
            if (element) {
              console.log('🎯 Scrolling to element:', position.elementId);
              element.scrollIntoView({ 
                behavior: 'instant',
                block: 'center'
              });
            } else {
              console.warn('⚠️ Element not found for ID:', position.elementId);
            }
          }
        } catch (e) {
          console.warn('Could not restore scroll position:', e);
        }
      });
    } else {
      console.warn('⚠️ No position found to restore for:', pageKey);
    }
  }

  // Save position before navigating away
  handleBeforeUnload() {
    if (this.currentPage) {
      this.savePosition(this.currentPage);
    }
  }

  // Handle visibility change (when user switches tabs)
  handleVisibilityChange() {
    if (document.hidden && this.currentPage) {
      this.savePosition(this.currentPage);
    }
  }

  // Handle back/forward navigation
  handlePopState() {
    // Small delay to ensure page content is loaded
    setTimeout(() => {
      const currentPath = window.location.pathname;
      const hash = window.location.hash;
      
      console.log('🔄 PopState detected:', { path: currentPath, hash });
      
      // Only restore main position if we don't have a featured product hash
      if (currentPath === '/' && !hash?.startsWith('#p-')) {
        console.log('🔄 Restoring main page position');
        this.restorePosition('main');
      } else if (hash?.startsWith('#p-')) {
        console.log('🔄 Featured product hash detected, letting FeaturedProducts handle restoration');
        // Don't restore here - let FeaturedProducts handle it
      }
    }, 100);
  }

  // Save position with element ID for precise restoration
  savePositionWithElement(pageKey, elementId) {
    if (typeof window === 'undefined') return;
    
    this.savePosition(pageKey, {
      scrollY: window.scrollY,
      scrollX: window.scrollX,
      elementId,
      timestamp: Date.now()
    });
  }

  // Clear stored positions
  clearPositions() {
    this.positions.clear();
    try {
      // Clear from sessionStorage too
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('scroll_')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Could not clear scroll positions from sessionStorage:', e);
    }
  }

  // Get current scroll position
  getCurrentPosition() {
    if (typeof window === 'undefined') return null;
    
    return {
      scrollY: window.scrollY,
      scrollX: window.scrollX,
      timestamp: Date.now()
    };
  }
}

// Create singleton instance
let scrollManager = null;

export const getScrollManager = () => {
  if (typeof window === 'undefined') return null;
  
  if (!scrollManager) {
    scrollManager = new ScrollPositionManager();
  }
  
  return scrollManager;
};

// Export the class for testing or custom instances
export { ScrollPositionManager };
