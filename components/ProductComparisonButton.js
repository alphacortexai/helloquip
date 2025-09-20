"use client";

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ScaleIcon } from '@heroicons/react/24/outline';
import { CustomerExperienceService } from '@/lib/customerExperienceService';
import { toast } from 'sonner';

export default function ProductComparisonButton({ product, size = 'default' }) {
  const [user, setUser] = useState(null);
  const [isInComparison, setIsInComparison] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comparisonCount, setComparisonCount] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && product) {
      checkComparisonStatus();
    }
  }, [user, product]);

  const checkComparisonStatus = async () => {
    try {
      const comparisonList = await CustomerExperienceService.getComparisonList(user.uid);
      const isInList = comparisonList.products.some(p => p.id === product.id);
      setIsInComparison(isInList);
      setComparisonCount(comparisonList.products.length);
    } catch (error) {
      console.error('Error checking comparison status:', error);
    }
  };

  const handleComparisonToggle = async () => {
    if (!user) {
      toast.error('Please log in to compare products');
      return;
    }

    setLoading(true);
    try {
      if (isInComparison) {
        const result = await CustomerExperienceService.removeFromComparison(user.uid, product.id);
        if (result.success) {
          setIsInComparison(false);
          setComparisonCount(prev => prev - 1);
          toast.success('Removed from comparison');
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await CustomerExperienceService.addToComparison(user.uid, product.id);
        if (result.success) {
          setIsInComparison(true);
          setComparisonCount(prev => prev + 1);
          toast.success('Added to comparison');
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      toast.error('Failed to update comparison list');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-6 w-6',
    large: 'h-8 w-8'
  };

  const buttonSizeClasses = {
    small: 'p-1',
    default: 'p-2',
    large: 'p-3'
  };

  return (
    <button
      onClick={handleComparisonToggle}
      disabled={loading}
      className={`${buttonSizeClasses[size]} rounded-full transition-all duration-200 ${
        isInComparison 
          ? 'text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100' 
          : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isInComparison ? 'Remove from comparison' : 'Add to comparison'}
    >
      <div className="relative">
        <ScaleIcon className={sizeClasses[size]} />
        {comparisonCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {comparisonCount}
          </span>
        )}
      </div>
    </button>
  );
}
