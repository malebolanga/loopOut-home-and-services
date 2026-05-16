/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo, useCallback } from "react";
import ListingItem from "../components/ListingItem";
import { FaSearch, FaFilter, FaTimes, FaSlidersH, FaHome } from "react-icons/fa";
import { MdApartment, MdHouse, MdBusiness, MdLandscape } from "react-icons/md";
import "../styles/ListingDetails.scss";

const SmartSearchPage = () => {
  // State for real data
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    sortBy: "newest"
  });

  // Property type options
  const propertyTypes = [
    { value: "all", label: "All Properties", icon: <FaHome /> },
    { value: "sale", label: "For Sale", icon: <MdHouse /> },
    { value: "rent", label: "For Rent", icon: <MdApartment /> },
    { value: "office", label: "Office", icon: <MdBusiness /> },
    { value: "land", label: "Land", icon: <MdLandscape /> },
  ];

  // Fetch listings from database
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters based on filters
        const queryParams = new URLSearchParams();
        
        if (filters.type !== "all") {
          queryParams.append("type", filters.type);
        }
        
        if (filters.minPrice) {
          queryParams.append("minPrice", filters.minPrice);
        }
        
        if (filters.maxPrice) {
          queryParams.append("maxPrice", filters.maxPrice);
        }
        
        if (filters.bedrooms) {
          queryParams.append("bedroomsMin", filters.bedrooms);
        }
        
        if (filters.bathrooms) {
          queryParams.append("bathroomsMin", filters.bathrooms);
        }
        
        // Add search query if exists
        if (searchQuery.trim()) {
          queryParams.append("searchTerm", searchQuery.trim());
        }
        
        // Add sorting
        if (filters.sortBy !== "newest") {
          const sortMap = {
            priceLowHigh: { sort: "regularPrice", order: "asc" },
            priceHighLow: { sort: "regularPrice", order: "desc" },
            oldest: { sort: "createdAt", order: "asc" }
          };
          
          if (sortMap[filters.sortBy]) {
            queryParams.append("sort", sortMap[filters.sortBy].sort);
            queryParams.append("order", sortMap[filters.sortBy].order);
          }
        } else {
          queryParams.append("sort", "createdAt");
          queryParams.append("order", "desc");
        }
        
        // Make API call to your backend
        const response = await fetch(`/api/listing/get?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch listings: ${response.status}`);
        }
        
        const data = await response.json();
        setListings(data);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Add debounce to prevent too many API calls
    const timeoutId = setTimeout(() => {
      fetchListings();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // Sticky search bar effect
  useEffect(() => {
    const handleScroll = () => {
      setIsSearchSticky(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter and search logic (client-side filtering as backup)
  const filteredListings = useMemo(() => {
    let filtered = [...listings];

    // Apply search query (client-side as backup)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing =>
        (listing.name && listing.name.toLowerCase().includes(query)) ||
        (listing.address && listing.address.toLowerCase().includes(query)) ||
        (listing.type && listing.type.toLowerCase().includes(query))
      );
    }

    // Apply type filter (client-side as backup)
    if (filters.type !== "all") {
      filtered = filtered.filter(listing => listing.type === filters.type);
    }

    // Apply price filters (client-side as backup)
    if (filters.minPrice) {
      filtered = filtered.filter(listing => {
        const price = listing.offer ? listing.discountPrice : listing.regularPrice;
        return price >= parseInt(filters.minPrice);
      });
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(listing => {
        const price = listing.offer ? listing.discountPrice : listing.regularPrice;
        return price <= parseInt(filters.maxPrice);
      });
    }

    // Apply bedroom filter (client-side as backup)
    if (filters.bedrooms) {
      filtered = filtered.filter(listing => 
        listing.bedrooms && listing.bedrooms >= parseInt(filters.bedrooms)
      );
    }

    // Apply bathroom filter (client-side as backup)
    if (filters.bathrooms) {
      filtered = filtered.filter(listing => 
        listing.bathrooms && listing.bathrooms >= parseInt(filters.bathrooms)
      );
    }

    // Apply sorting (client-side as backup)
    switch (filters.sortBy) {
      case "priceLowHigh":
        filtered.sort((a, b) => {
          const priceA = a.offer ? a.discountPrice : a.regularPrice;
          const priceB = b.offer ? b.discountPrice : b.regularPrice;
          return priceA - priceB;
        });
        break;
      case "priceHighLow":
        filtered.sort((a, b) => {
          const priceA = a.offer ? a.discountPrice : a.regularPrice;
          const priceB = b.offer ? b.discountPrice : b.regularPrice;
          return priceB - priceA;
        });
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        break;
    }

    return filtered;
  }, [listings, searchQuery, filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      type: "all",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      bathrooms: "",
      sortBy: "newest"
    });
    setSearchQuery("");
  }, []);

  // Handle listing click
  const handleListingClick = (listingId) => {
    console.log(`Listing ${listingId} clicked`);
    // In a real app, you might track analytics or perform other actions
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Sticky Search Header */}
      <div className={`sticky top-0 z-50 transition-all duration-300 ${isSearchSticky ? 'shadow-lg' : ''}`}>
        {/* Main Search Bar */}
        <div className={`bg-white transition-all duration-300 ${isSearchSticky ? 'py-3' : 'py-6'}`}>
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-grow relative">
                  <div className="relative">
                    <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="text"
                      placeholder="Search by location, property type, or keyword..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <FaSlidersH />
                  Filters
                  {Object.values(filters).some(val => val !== "" && val !== "all" && val !== "newest") && (
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {Object.values(filters).filter(val => val !== "" && val !== "all" && val !== "newest").length}
                    </span>
                  )}
                </button>

                {/* Clear Filters Button */}
                {(searchQuery || Object.values(filters).some(val => val !== "" && val !== "all" && val !== "newest")) && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all"
                  >
                    <FaTimes />
                    Clear All
                  </button>
                )}
              </div>

              {/* Property Type Quick Filters */}
              <div className="mt-4 flex flex-wrap gap-2">
                {propertyTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFilters(prev => ({ ...prev, type: type.value }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.type === type.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <span className="text-lg">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white border-t border-gray-200 shadow-sm animate-slideDown">
            <div className="container mx-auto px-4 py-6">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="minPrice"
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                      />
                      <input
                        type="number"
                        name="maxPrice"
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                      />
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>
                    <select
                      name="bedrooms"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.bedrooms}
                      onChange={handleFilterChange}
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms
                    </label>
                    <select
                      name="bathrooms"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.bathrooms}
                      onChange={handleFilterChange}
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      name="sortBy"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.sortBy}
                      onChange={handleFilterChange}
                    >
                      <option value="newest">Newest First</option>
                      <option value="priceLowHigh">Price: Low to High</option>
                      <option value="priceHighLow">Price: High to Low</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-8">
        <div className="max-w-6xl mx-auto">
          {/* Results Summary */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `Search Results for "${searchQuery}"` : "All Properties"}
            </h1>
            <p className="text-gray-600 mt-1">
              Found {filteredListings.length} {filteredListings.length === 1 ? "property" : "properties"}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <FaTimes className="text-3xl text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Error loading properties
              </h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && !error ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-xl"></div>
                  <div className="mt-4 space-y-2">
                    <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                    <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                    <div className="bg-gray-200 h-6 w-1/3 rounded mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* No Results State */}
              {!loading && filteredListings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                    <FaSearch className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No properties found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                /* Properties Grid - REAL LISTINGS FROM DATABASE */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-3">
                  {filteredListings.map((listing) => (
                    <ListingItem
                      key={listing._id}
                      listing={listing}
                      onClick={() => handleListingClick(listing._id)}
                      className="hover:shadow-lg transition-shadow duration-300"
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Back to Top Button */}
      {isSearchSticky && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-40 hover:scale-110"
          aria-label="Back to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SmartSearchPage;
