"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Search } from "lucide-react"; // optional icon from Lucide

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allProductNames, setAllProductNames] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProductNames = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const names = snapshot.docs.map((doc) => doc.data().name.toLowerCase());
      setAllProductNames(names);
    };
    fetchProductNames();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSuggestions([]);
    } else {
      const filtered = allProductNames
        .filter((name) => name.includes(searchTerm.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
    }
  }, [searchTerm, allProductNames]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSuggestions([]);
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setSuggestions([]);
    setIsFocused(false);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  return (
    <div className="relative w-full max-w-md mx-auto mt-0">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder="Search for medical equipments & products..."
          className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 100)}
        />
        <button type="submit" className="absolute left-3 top-1.5 text-gray-500 hover:text-gray-700">
          <Search className="w-4 h-4" />
        </button>
      </form>

      {isFocused && searchTerm && suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white w-full border border-gray-200 rounded-md mt-1 shadow">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => handleSuggestionClick(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
