import React, { Suspense } from "react";
import SearchResults from "./SearchResults"; // client component

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchResults />
    </Suspense>
  );
}
