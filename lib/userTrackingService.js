"use client";

import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment } from "firebase/firestore";

// Firestore does not accept undefined; strip undefined values from objects.
// Only recurse into plain objects so we don't mutate Firestore sentinels (e.g. serverTimestamp()).
function sanitizeForFirestore(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore).filter((v) => v !== undefined);
  const isPlainObject = (v) => typeof v === "object" && v !== null && (Object.getPrototypeOf(v) === Object.prototype || Array.isArray(v));
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    out[key] = isPlainObject(value) ? sanitizeForFirestore(value) : value;
  }
  return out;
}

class UserTrackingService {
  constructor() {
    this.isTrackingEnabled = false;
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.pageViews = [];
    this.clicks = [];
    this.deviceInfo = null;
    this.locationInfo = null;
    this._lastPageViewPath = null;
    this._lastPageViewTime = 0;
    this._lastProductClick = { id: null, time: 0 };
    this._lastProductView = { id: null, time: 0 };
    this._lastButtonClick = { id: null, time: 0 };
    this._lastNavigation = { from: null, to: null, type: null, time: 0 };
    this._lastSearch = { term: null, time: 0 };
    this.init();
  }

  init() {
    // Check if tracking is enabled
    const consent = localStorage.getItem("cookieConsent");
    if (consent === "accepted") {
      this.enableTracking();
    }

    // Listen for consent acceptance
    if (typeof window !== "undefined") {
      window.addEventListener("cookieConsentAccepted", () => {
        this.enableTracking();
      });
    }
  }

  enableTracking() {
    if (this.isTrackingEnabled) return;
    
    this.isTrackingEnabled = true;
    this.collectDeviceInfo();
    this.collectLocationInfo();
    this.trackPageView();
    this.setupEventListeners();
    
    // Flush data periodically
    setInterval(() => {
      this.flushData();
    }, 30000); // Every 30 seconds
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getUserId() {
    // Try to get from Firebase Auth first
    if (typeof window !== "undefined" && window.firebaseUser?.uid) {
      return window.firebaseUser.uid;
    }
    
    // Check for persistent user ID
    let userId = localStorage.getItem("persistentUserId");
    if (!userId) {
      userId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("persistentUserId", userId);
    }
    return userId;
  }

  collectDeviceInfo() {
    if (typeof window === "undefined") return;

    this.deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookieEnabled: navigator.cookieEnabled,
      online: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency || null,
      deviceMemory: navigator.deviceMemory || null,
    };
  }

  async collectLocationInfo() {
    // Try to get location from browser (requires user permission)
    if (typeof window === "undefined" || !navigator.geolocation) {
      // Fallback: Try to get approximate location from IP (we'll store what we can get)
      this.locationInfo = {
        source: "unknown",
        available: false
      };
      return;
    }

    // Request geolocation (will prompt user)
    // We'll only use this if user explicitly grants permission
    // For now, we'll store timezone and language as location indicators
    this.locationInfo = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      source: "browser",
      available: true
    };
  }

  trackPageView(page = null) {
    if (!this.isTrackingEnabled) return;

    const pagePath = page || (typeof window !== "undefined" ? window.location.pathname : "/");
    if (pagePath.startsWith("/admin")) return;

    const now = Date.now();
    // Dedupe: avoid duplicate page view for same path within 2s (e.g. React Strict Mode double-invoke or fast re-renders)
    if (this._lastPageViewPath === pagePath && now - this._lastPageViewTime < 2000) {
      return;
    }
    this._lastPageViewPath = pagePath;
    this._lastPageViewTime = now;

    const pageData = {
      path: pagePath,
      fullUrl: typeof window !== "undefined" ? window.location.href : "",
      referrer: typeof document !== "undefined" ? document.referrer : "",
      timestamp: new Date(),
      sessionId: this.sessionId,
    };

    this.pageViews.push(pageData);
    this.savePageView(pageData);
  }

  trackProductClick(productId, productName, productData = {}) {
    if (!this.isTrackingEnabled) return;
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    if (currentPath.startsWith("/admin")) return;

    const now = Date.now();
    if (this._lastProductClick.id === productId && now - this._lastProductClick.time < 600) {
      // Ignore double-tap / rapid duplicate click on same product within 600ms
      return;
    }
    this._lastProductClick = { id: productId, time: now };

    const clickData = {
      type: "product_click",
      productId,
      productName,
      productData,
      timestamp: new Date(),
      sessionId: this.sessionId,
      page: typeof window !== "undefined" ? window.location.pathname : "",
    };

    this.clicks.push(clickData);
    this.saveClick(clickData);
  }

  trackProductView(productId, productName, productData = {}) {
    if (!this.isTrackingEnabled) return;
    if (typeof document !== "undefined" && document.referrer && document.referrer.includes("/admin")) return;

    const now = Date.now();
    if (this._lastProductView.id === productId && now - this._lastProductView.time < 800) {
      // Ignore double-tap / fast re-render causing duplicate product_view for same product
      return;
    }
    this._lastProductView = { id: productId, time: now };

    const viewData = {
      type: "product_view",
      productId,
      productName,
      productData,
      timestamp: new Date(),
      sessionId: this.sessionId,
      page: typeof window !== "undefined" ? window.location.pathname : "",
    };

    this.saveProductView(viewData);
  }

  trackNavigation(from, to, type = "navigation") {
    if (!this.isTrackingEnabled) return;

    const now = Date.now();
    if (
      this._lastNavigation.from === from &&
      this._lastNavigation.to === to &&
      this._lastNavigation.type === type &&
      now - this._lastNavigation.time < 500
    ) {
      // Ignore rapid duplicate navigation events with same from/to/type
      return;
    }
    this._lastNavigation = { from, to, type, time: now };

    const navData = {
      type,
      from,
      to,
      timestamp: new Date(),
      sessionId: this.sessionId,
    };

    this.saveNavigation(navData);
  }

  trackButtonClick(buttonId, buttonText, context = {}) {
    if (!this.isTrackingEnabled) return;

    const now = Date.now();
    if (this._lastButtonClick.id === buttonId && now - this._lastButtonClick.time < 600) {
      // Ignore double-tap on the same button within 600ms
      return;
    }
    this._lastButtonClick = { id: buttonId, time: now };

    const clickData = {
      type: "button_click",
      buttonId,
      buttonText,
      context,
      timestamp: new Date(),
      sessionId: this.sessionId,
      page: typeof window !== "undefined" ? window.location.pathname : "",
    };

    this.saveClick(clickData);
  }

  trackSearchTerm(term) {
    if (!this.isTrackingEnabled) return;
    const cleaned = typeof term === "string" ? term.trim() : "";
    if (!cleaned) return;
    const now = Date.now();
    if (this._lastSearch.term === cleaned && now - this._lastSearch.time < 800) {
      // Ignore rapid duplicate logging of same search term
      return;
    }
    this._lastSearch = { term: cleaned, time: now };
    const searchData = {
      type: "search",
      term: cleaned,
      timestamp: new Date(),
      sessionId: this.sessionId,
      page: typeof window !== "undefined" ? window.location.pathname : "",
      fullUrl: typeof window !== "undefined" ? window.location.href : "",
    };
    this.saveSearch(searchData);
  }

  setupEventListeners() {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // Track page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.trackNavigation(
          window.location.pathname,
          "hidden",
          "page_hidden"
        );
      } else {
        this.trackNavigation(
          "hidden",
          window.location.pathname,
          "page_visible"
        );
      }
    });

    // Track before unload
    window.addEventListener("beforeunload", () => {
      this.flushData();
    });
  }

  async savePageView(pageData) {
    if ((pageData.path || pageData.pagePath || "").startsWith("/admin")) return;
    try {
      const userId = this.getUserId();
      const payload = sanitizeForFirestore({
        userId,
        ...pageData,
        deviceInfo: this.deviceInfo,
        locationInfo: this.locationInfo,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "userPageViews"), payload);
    } catch (error) {
      console.error("Error saving page view:", error);
    }
  }

  async saveClick(clickData) {
    try {
      const userId = this.getUserId();
      const payload = sanitizeForFirestore({
        userId,
        ...clickData,
        deviceInfo: this.deviceInfo,
        locationInfo: this.locationInfo,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "userClicks"), payload);
    } catch (error) {
      console.error("Error saving click:", error);
    }
  }

  async saveSearch(searchData) {
    try {
      const userId = this.getUserId();
      const payload = sanitizeForFirestore({
        userId,
        ...searchData,
        deviceInfo: this.deviceInfo,
        locationInfo: this.locationInfo,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "userSearches"), payload);
    } catch (error) {
      console.error("Error saving search term:", error);
    }
  }

  async saveProductView(viewData) {
    try {
      const userId = this.getUserId();
      const payload = sanitizeForFirestore({
        userId,
        ...viewData,
        deviceInfo: this.deviceInfo,
        locationInfo: this.locationInfo,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "userProductViews"), payload);
    } catch (error) {
      console.error("Error saving product view:", error);
    }
  }

  async saveNavigation(navData) {
    try {
      const userId = this.getUserId();
      const payload = sanitizeForFirestore({
        userId,
        ...navData,
        deviceInfo: this.deviceInfo,
        locationInfo: this.locationInfo,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "userNavigation"), payload);
    } catch (error) {
      console.error("Error saving navigation:", error);
    }
  }

  async flushData() {
    // This is called periodically to ensure all data is saved
    // Most data is saved immediately, but this is a safety net
  }

  // Get user's tracking consent status
  static hasConsent() {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("cookieConsent") === "accepted";
  }
}

// Create singleton instance
let trackingInstance = null;

export const initUserTracking = () => {
  if (typeof window === "undefined") return null;
  
  if (!trackingInstance) {
    trackingInstance = new UserTrackingService();
    window.userTrackingService = trackingInstance;
  }
  
  return trackingInstance;
};

// Export for use in components
export const getUserTrackingService = () => {
  return trackingInstance || initUserTracking();
};

// Make it available globally for cookie consent
if (typeof window !== "undefined") {
  window.initUserTracking = initUserTracking;
}

export default UserTrackingService;
