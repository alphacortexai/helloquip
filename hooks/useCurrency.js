"use client";

import { useState, useEffect, createContext, useContext } from 'react';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  // Restore currency preference from localStorage
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferredCurrency');
      return saved || 'UGX';
    }
    return 'UGX';
  });
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch USD exchange rate (UGX to USD)
  useEffect(() => {
    const fetchExchangeRate = async () => {
      setLoading(true);
      try {
        // Try to get from a free exchange rate API
        // Using exchangerate-api.com (free tier allows 1,500 requests/month)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        
        // Get UGX rate (1 USD = X UGX)
        const ugxRate = data.rates?.UGX;
        if (ugxRate) {
          // Store as USD to UGX rate (for conversion: UGX / rate = USD)
          setExchangeRate(ugxRate);
          // Cache in localStorage
          localStorage.setItem('usdToUgxRate', ugxRate.toString());
          localStorage.setItem('exchangeRateTimestamp', Date.now().toString());
        }
      } catch (error) {
        console.warn('Failed to fetch exchange rate, using cached or default:', error);
        // Try to use cached rate if available (valid for 24 hours)
        const cachedRate = localStorage.getItem('usdToUgxRate');
        const cachedTimestamp = localStorage.getItem('exchangeRateTimestamp');
        
        if (cachedRate && cachedTimestamp) {
          const age = Date.now() - parseInt(cachedTimestamp);
          // Use cached rate if less than 24 hours old
          if (age < 24 * 60 * 60 * 1000) {
            setExchangeRate(parseFloat(cachedRate));
          } else {
            // Default fallback rate (approximate)
            setExchangeRate(3700); // 1 USD ≈ 3700 UGX
          }
        } else {
          // Default fallback rate
          setExchangeRate(3700);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();
  }, []);

  const convertPrice = (priceInUgx, targetCurrency = currency) => {
    if (!priceInUgx || priceInUgx === 0) return 0;
    
    if (targetCurrency === 'UGX') {
      return priceInUgx;
    }
    
    if (targetCurrency === 'USD' && exchangeRate) {
      return priceInUgx / exchangeRate;
    }
    
    return priceInUgx;
  };

  const formatPrice = (priceInUgx, targetCurrency = currency) => {
    const convertedPrice = convertPrice(priceInUgx, targetCurrency);
    
    if (targetCurrency === 'USD') {
      return `$${convertedPrice.toFixed(2)}`;
    }
    
    return `UGX ${convertedPrice.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      exchangeRate,
      loading,
      convertPrice,
      formatPrice
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}

