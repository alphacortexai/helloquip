"use client";

import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

const CurrencyContext = createContext();
const LOCAL_STORAGE_KEY = 'preferredCurrency';
const EXCHANGE_RATE_KEY = 'usdToUgxRate';
const EXCHANGE_RATE_TIMESTAMP_KEY = 'exchangeRateTimestamp';
const DEFAULT_CURRENCY = 'UGX';
const FALLBACK_USD_TO_UGX_RATE = 3700;

const readStoredCurrency = () => {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  return localStorage.getItem(LOCAL_STORAGE_KEY) || DEFAULT_CURRENCY;
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preferenceReady, setPreferenceReady] = useState(false);

  const persistCurrency = useCallback(async (nextCurrency, userId = auth.currentUser?.uid) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, nextCurrency);
    }

    if (!userId) return;

    try {
      await setDoc(doc(db, 'users', userId), {
        preferredCurrency: nextCurrency,
      }, { merge: true });
    } catch (error) {
      console.warn('Failed to persist currency preference:', error);
    }
  }, []);

  const setCurrency = useCallback(async (nextCurrency) => {
    setCurrencyState(nextCurrency);
    await persistCurrency(nextCurrency);
  }, [persistCurrency]);

  useEffect(() => {
    const localCurrency = readStoredCurrency();
    setCurrencyState(localCurrency);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrencyState(readStoredCurrency());
        setPreferenceReady(true);
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        const userCurrency = userSnap.exists() ? userSnap.data()?.preferredCurrency : null;
        const resolvedCurrency = userCurrency || localCurrency || DEFAULT_CURRENCY;

        setCurrencyState(resolvedCurrency);
        if (!userCurrency) {
          await persistCurrency(resolvedCurrency, user.uid);
        } else if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_KEY, userCurrency);
        }
      } catch (error) {
        console.warn('Failed to load stored currency preference:', error);
        setCurrencyState(localCurrency);
      } finally {
        setPreferenceReady(true);
      }
    });

    return () => unsubscribe();
  }, [persistCurrency]);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const ugxRate = data.rates?.UGX;

        if (ugxRate) {
          setExchangeRate(ugxRate);
          localStorage.setItem(EXCHANGE_RATE_KEY, ugxRate.toString());
          localStorage.setItem(EXCHANGE_RATE_TIMESTAMP_KEY, Date.now().toString());
          return;
        }

        throw new Error('UGX exchange rate missing in API response');
      } catch (error) {
        console.warn('Failed to fetch exchange rate, using cached or default:', error);
        const cachedRate = localStorage.getItem(EXCHANGE_RATE_KEY);
        const cachedTimestamp = localStorage.getItem(EXCHANGE_RATE_TIMESTAMP_KEY);

        if (cachedRate && cachedTimestamp) {
          const age = Date.now() - Number.parseInt(cachedTimestamp, 10);
          if (age < 24 * 60 * 60 * 1000) {
            setExchangeRate(Number.parseFloat(cachedRate));
          } else {
            setExchangeRate(FALLBACK_USD_TO_UGX_RATE);
          }
        } else {
          setExchangeRate(FALLBACK_USD_TO_UGX_RATE);
        }
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      fetchExchangeRate();
    }
  }, []);

  const convertPrice = useCallback((priceInUgx, targetCurrency = currency) => {
    const numericPrice = Number(priceInUgx || 0);
    if (!numericPrice) return 0;
    if (targetCurrency === 'UGX') return numericPrice;
    if (targetCurrency === 'USD' && exchangeRate) return numericPrice / exchangeRate;
    return numericPrice;
  }, [currency, exchangeRate]);

  const formatPrice = useCallback((priceInUgx, targetCurrency = currency, options = {}) => {
    const convertedPrice = convertPrice(priceInUgx, targetCurrency);
    const { maximumFractionDigits, minimumFractionDigits, fallback = 'N/A' } = options;

    if (!Number.isFinite(convertedPrice)) return fallback;

    if (targetCurrency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: minimumFractionDigits ?? 2,
        maximumFractionDigits: maximumFractionDigits ?? 2,
      }).format(convertedPrice);
    }

    return `UGX ${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: minimumFractionDigits ?? 0,
      maximumFractionDigits: maximumFractionDigits ?? 0,
    }).format(convertedPrice)}`;
  }, [convertPrice, currency]);

  const value = useMemo(() => ({
    currency,
    setCurrency,
    exchangeRate,
    loading,
    preferenceReady,
    convertPrice,
    formatPrice,
  }), [currency, setCurrency, exchangeRate, loading, preferenceReady, convertPrice, formatPrice]);

  return (
    <CurrencyContext.Provider value={value}>
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
