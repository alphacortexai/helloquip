"use client";
import React from 'react';

const SearchBar = ({ onSearch }) => {
  return (
    <div className="w-full max-w-md mx-auto mt-2">
      <input
        type="text"
        placeholder="Search products..."
        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
