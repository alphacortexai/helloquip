"use client";

import { useEffect } from 'react';

export default function SpeedInsightsTest() {
  useEffect(() => {
    // Test if Speed Insights is working
    const testSpeedInsights = () => {
      console.log('🔍 Testing Speed Insights...');
      
      // Check if the script is loaded
      const scripts = document.querySelectorAll('script[src*="vercel-insights"]');
      console.log('📊 Speed Insights scripts found:', scripts.length);
      
      // Check for global object
      if (typeof window !== 'undefined') {
        console.log('🌐 Window object available');
        
        // Look for Vercel Insights global
        const vercelInsights = window.__VERCEL_INSIGHTS__;
        console.log('📈 Vercel Insights global:', vercelInsights);
      }
      
      // Simulate some user interaction
      setTimeout(() => {
        console.log('🖱️ Simulating user interaction...');
        document.body.click();
      }, 1000);
    };

    testSpeedInsights();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded text-xs z-50">
      Speed Insights Test
    </div>
  );
}

