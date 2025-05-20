import SearchBar from "@/components/SearchBar";
import FeaturedProducts from "@/components/FeaturedProducts";
import TrendingProducts from "@/components/TrendingProducts";
import Categories from "@/components/Categories"; // make sure the path is correct
import CategoryForm from "@/components/CategoryForm";


export default function Home() {
  return (
    <main className="bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-blue-700">HelloQuip</h1>
          <button className="text-gray-700 hover:text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5.121 17.804A8.002 8.002 0 0112 15a8.002 8.002 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Search */}
      <section className="bg-blue-50 pt-16 pb-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">What are you looking for?</h2>
          <SearchBar />
        </div>
      </section>


      {/* Categories (Firebase) */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-8">
          <h3 className="text-lg font-bold mb-6 text-gray-800">Shop by Category</h3>
          <Categories />
          <CategoryForm />  {/* <=== Placed here, inside the same section */}
        </div>
      </section>





      {/* Trending Products */}
      <TrendingProducts />

      {/* Featured Products */}
      <FeaturedProducts />

      
 


    </main>
  );
}
