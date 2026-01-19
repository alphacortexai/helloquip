"use client";

import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function CurrencyDropdown() {
  const { currency, setCurrency, exchangeRate, loading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currencies = [
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'UGX' },
    { code: 'USD', name: 'US Dollar', symbol: '$' }
  ];

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    setIsOpen(false);
    // Save preference to localStorage
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 min-w-[100px]"
        aria-label="Select currency"
      >
        <span>{currentCurrency.symbol}</span>
        <span className="hidden sm:inline">{currentCurrency.code}</span>
        <ChevronDownIcon className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleCurrencyChange(curr.code)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center justify-between ${
                  currency === curr.code ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                }`}
              >
                <div className="flex flex-col">
                  <span>{curr.symbol} {curr.code}</span>
                  <span className="text-xs text-gray-500">{curr.name}</span>
                </div>
                {currency === curr.code && (
                  <span className="text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
          {loading && exchangeRate === null && (
            <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200">
              Loading rates...
            </div>
          )}
          {exchangeRate && currency === 'USD' && (
            <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200">
              1 USD ≈ {exchangeRate.toLocaleString()} UGX
            </div>
          )}
        </div>
      )}
    </div>
  );
}

