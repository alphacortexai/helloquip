"use client";

/**
 * Get or create a unique device ID for anonymous users
 * This ID persists across sessions using localStorage
 */
export function getDeviceId() {
  if (typeof window === 'undefined') return 'guest';
  
  try {
    let deviceId = localStorage.getItem('deviceId');
    
    if (!deviceId) {
      // Create a unique device ID
      // Format: device_timestamp_random
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.warn('Error getting device ID:', error);
    // Fallback: use sessionStorage if localStorage fails
    try {
      let deviceId = sessionStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('deviceId', deviceId);
      }
      return deviceId;
    } catch (e) {
      return `guest_${Date.now()}`;
    }
  }
}

