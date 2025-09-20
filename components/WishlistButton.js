"use client";

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { CustomerExperienceService } from '@/lib/customerExperienceService';
import { toast } from 'sonner';

export default function WishlistButton({ product, size = 'default' }) {
  const [user, setUser] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && product) {
      checkWishlistStatus();
    }
  }, [user, product]);

  const checkWishlistStatus = async () => {
    try {
      const inWishlist = await CustomerExperienceService.isInWishlist(user.uid, product.id);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please log in to add items to wishlist');
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        const result = await CustomerExperienceService.removeFromWishlist(user.uid, product.id);
        if (result.success) {
          setIsInWishlist(false);
          toast.success('Removed from wishlist');
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await CustomerExperienceService.addToWishlist(user.uid, product);
        if (result.success) {
          setIsInWishlist(true);
          toast.success('Added to wishlist');
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
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
      onClick={handleWishlistToggle}
      disabled={loading}
      className={`${buttonSizeClasses[size]} rounded-full transition-all duration-200 ${
        isInWishlist 
          ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' 
          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isInWishlist ? (
        <HeartSolidIcon className={sizeClasses[size]} />
      ) : (
        <HeartIcon className={sizeClasses[size]} />
      )}
    </button>
  );
}
