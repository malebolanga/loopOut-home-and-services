import { useEffect, useState, useCallback, useRef } from "react";
import ListingItem from "../components/ListingItem";
import {
  MapPinIcon,
  FunnelIcon,
  XMarkIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  GlobeAmericasIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HomeModernIcon
} from "@heroicons/react/24/outline";

// Helper: Calculates distance between two points on Earth (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Component for user feedback messages
// eslint-disable-next-line react/prop-types
const UserMessage = ({ type, message, onAction, actionText }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
    <div className={`p-6 rounded-full ${type === 'error' ? 'bg-rose-50' : 'bg-gray-50'} mb-6`}>
      {type === 'error' ? (
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
          <XMarkIcon className="w-8 h-8 text-rose-600" />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <MagnifyingGlassIcon className="w-8 h-8 text-gray-600" />
        </div>
      )}
    </div>
    <h3 className="text-2xl font-semibold text-gray-800 mb-3">{message}</h3>
    {type === 'info' && (
      <p className="text-gray-500 mb-6 max-w-md">
        Try adjusting your filters or search radius to find more properties.
      </p>
    )}
    {onAction && (
      <button
        onClick={onAction}
        className="px-6 py-3 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
      >
        {actionText}
      </button>
    )}
  </div>
);

// Property type filter buttons
const PropertyTypeButton = ({ type, label, isSelected, onClick }) => (
  <button
    onClick={() => onClick(type)}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${isSelected
      ? 'bg-gray-800 text-white shadow-sm'
      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
  >
    {label}
  </button>
);

export default function ForRent() {
  const [rentalListings, setRentalListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKind, setSelectedKind] = useState("all");
  const [availableKinds, setAvailableKinds] = useState(["all", "apartment", "house", "condo", "studio"]);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(15);
  const [previousSearches, setPreviousSearches] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [radiusMenuOpen, setRadiusMenuOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const isFetchingRef = useRef(false);
  const radiusMenuRef = useRef(null);

  // Close radius menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (radiusMenuRef.current && !radiusMenuRef.current.contains(event.target)) {
        setRadiusMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Property type labels for display - specific to rentals
  const propertyTypeLabels = {
    "all": "All Rentals",
    "apartment": "Apartments",
    "house": "Houses",
    "condo": "Condos",
    "studio": "Studios",
    "townhouse": "Townhouses",
    "loft": "Lofts",
    "duplex": "Duplexes",
    "villa": "Villas",
    "flat": "Flats"
  };

  // Radius options
  const radiusOptions = [5, 10, 15, 25, 50, 100];

  // Price range options for rentals
  const priceOptions = [
    { label: "Any price", min: 0, max: 10000 },
    { label: "Under $1,000", min: 0, max: 1000 },
    { label: "$1,000 - $2,000", min: 1000, max: 2000 },
    { label: "$2,000 - $3,000", min: 2000, max: 3000 },
    { label: "$3,000 - $4,000", min: 3000, max: 4000 },
    { label: "$4,000+", min: 4000, max: 10000 }
  ];

  // Fetches available property types from the API - specifically for rentals
  useEffect(() => {
    const fetchKinds = async () => {
      try {
        const res = await fetch("/api/listing/kinds?type=rent");
        const data = await res.json();

        const rawKinds = Array.isArray(data)
          ? data
          : data?.kinds && Array.isArray(data.kinds)
            ? data.kinds
            : data && typeof data === "object"
              ? Object.keys(data)
              : [];

        const validKinds = [
          ...new Set(
            rawKinds.filter((kind) => typeof kind === "string" && kind.trim() !== "")
          ),
        ];
        setAvailableKinds(["all", ...validKinds]);

        if (!res.ok && res.status !== 404) {
          throw new Error(`Failed to fetch property types: ${res.status}`);
        }
      } catch (err) {
        console.error("Error fetching property types:", err);
        setAvailableKinds(["all", "apartment", "house", "condo", "studio"]);
        setError("We couldn't load all property types, but you can still search!");
      }
    };
    fetchKinds();
  }, []);

  // Gets user's current geolocation
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(newLocation);
            try {
              localStorage.setItem("lastLocation", JSON.stringify(newLocation));
            } catch (e) {
              console.warn("Couldn't save location to localStorage:", e);
            }
          },
          (geoError) => {
            console.warn("Location access denied:", geoError.message);
            try {
              const lastLocation = localStorage.getItem("lastLocation");
              if (lastLocation) {
                setUserLocation(JSON.parse(lastLocation));
                setError("Using your last known location for nearby properties.");
              } else {
                setError("Allow location access to see nearby properties.");
              }
            } catch (e) {
              console.warn("Couldn't load last location:", e);
              setError("We couldn't find your location. Please check browser settings.");
            }
          }
        );
      } else {
        setError("Your browser doesn't support location services.");
      }
    };

    getLocation();
    try {
      const savedSearches = JSON.parse(localStorage.getItem("previousRentalSearches")) || [];
      setPreviousSearches(savedSearches);
      const savedViewed = JSON.parse(sessionStorage.getItem("recentlyViewedRentals")) || [];
      setRecentlyViewed(savedViewed);
    } catch (e) {
      console.warn("Couldn't load from storage:", e);
    }
  }, []);

  const markAsViewed = useCallback((listing) => {
    setRecentlyViewed((prevViewed) => {
      const filtered = prevViewed.filter((item) => item._id !== listing._id);
      const updatedViewed = [listing, ...filtered].slice(0, 5);
      try {
        sessionStorage.setItem("recentlyViewedRentals", JSON.stringify(updatedViewed));
      } catch (e) {
        console.warn("Couldn't save to session storage:", e);
      }
      return updatedViewed;
    });
  }, []);

  const fetchListings = useCallback(
    async (reset = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      const currentPage = reset ? 1 : page;
      let url = `/api/listing/get?type=rent&limit=12&page=${currentPage}`;

      if (selectedKind !== "all") {
        url += `&kind=${selectedKind}`;
      }
      if (userLocation?.lat && userLocation?.lng) {
        url += `&lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${searchRadius}`;
      }
      // Add price filter if not default
      if (priceRange.min > 0 || priceRange.max < 10000) {
        url += `&minPrice=${priceRange.min}&maxPrice=${priceRange.max}`;
      }

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load listings: ${response.status}`);
        }

        const data = await response.json();
        const newItems = Array.isArray(data)
          ? data
          : data.listings && Array.isArray(data.listings)
            ? data.listings
            : [];

        const listingsWithProximity = newItems
          .map((listing) => ({
            ...listing,
            proximity: userLocation?.lat && userLocation?.lng && listing.location?.lat && listing.location?.lng
              ? calculateDistance(
                userLocation.lat,
                userLocation.lng,
                listing.location.lat,
                listing.location.lng
              )
              : Infinity,
          }))
          .sort((a, b) => a.proximity - b.proximity);

        setRentalListings((prev) => {
          const combined = reset ? listingsWithProximity : [...prev, ...listingsWithProximity];
          // Filter out duplicates
          const uniqueListings = combined.filter((listing, index, self) =>
            index === self.findIndex((l) => l._id === listing._id)
          );
          return uniqueListings;
        });

        if (reset) {
          setPage(2);
        } else {
          setPage((prev) => prev + 1);
        }

        setHasMore(newItems.length >= 12);

        if (selectedKind !== "all" && userLocation) {
          const newSearch = {
            kind: selectedKind,
            location: userLocation,
            priceRange: priceRange,
            timestamp: new Date().toISOString(),
          };
          setPreviousSearches((prev) => {
            const updated = [
              newSearch,
              ...prev
                .filter(
                  (p) =>
                    p.kind !== newSearch.kind ||
                    p.location?.lat !== newSearch.location?.lat ||
                    p.location?.lng !== newSearch.location?.lng
                )
                .slice(0, 3),
            ];
            try {
              localStorage.setItem("previousRentalSearches", JSON.stringify(updated));
            } catch (e) {
              console.warn("Couldn't save searches:", e);
            }
            return updated;
          });
        }
      } catch (err) {
        console.error("Failed to load listings:", err);
        setError(err.message || "Something went wrong! Please try again.");
        if (reset) setRentalListings([]);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [selectedKind, userLocation, searchRadius, page, priceRange]
  );

  useEffect(() => {
    setPage(1);
    fetchListings(true);
  }, [selectedKind, userLocation, searchRadius, priceRange]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 300 &&
        !loading &&
        hasMore &&
        !isFetchingRef.current
      ) {
        fetchListings();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, fetchListings]);

  const handlePriceSelect = (min, max) => {
    setPriceRange({ min, max });
    setShowPriceFilter(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#FF385C] rounded-lg">
                  <HomeModernIcon className="w-6 h-6 text-white" />
                </div>

              </div>

              <div className="flex items-center space-x-3">
                {/* Location Status */}
                {userLocation ? (
                  <div className="hidden md:flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                    <GlobeAmericasIcon className="w-4 h-4 mr-2" />
                    <span>Location active</span>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                    <GlobeAmericasIcon className="w-4 h-4 mr-2" />
                    <span>Location needed</span>
                  </div>
                )}

                {/* Price Filter Button */}
                <div className="relative">


                  {showPriceFilter && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      {priceOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handlePriceSelect(option.min, option.max)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${priceRange.min === option.min && priceRange.max === option.max
                            ? 'text-[#FF385C] font-medium'
                            : 'text-gray-700'
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filters Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-200 ${showFilters
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <FunnelIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Filters</span>
                </button>
              </div>
            </div>

            {/* Property Type Filters */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {availableKinds.map((kind) => (
                  <PropertyTypeButton
                    key={kind}
                    type={kind}
                    label={propertyTypeLabels[kind] || kind.charAt(0).toUpperCase() + kind.slice(1)}
                    isSelected={selectedKind === kind}
                    onClick={setSelectedKind}
                  />
                ))}
              </div>

              {/* Search Radius Selector */}
              <div className="relative hidden sm:block" ref={radiusMenuRef}>
                <button
                  onClick={() => setRadiusMenuOpen(!radiusMenuOpen)}
                  className="flex items-center text-sm text-gray-700 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                >
                  <span className="mr-2">Within {searchRadius}km</span>
                  {radiusMenuOpen ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>

                {radiusMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {radiusOptions.map((radius) => (
                      <button
                        key={radius}
                        onClick={() => {
                          setSearchRadius(radius);
                          setRadiusMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${searchRadius === radius ? 'text-[#FF385C] font-medium' : 'text-gray-700'
                          }`}
                      >
                        Within {radius}km
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32">
        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-gray-700 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Recently viewed rentals</h2>
              </div>
              <button
                onClick={() => {
                  sessionStorage.removeItem("recentlyViewedRentals");
                  setRecentlyViewed([]);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1 rounded-lg hover:bg-gray-50"
              >
                Clear all
              </button>
            </div>

            <div className="relative">
              <div className="flex space-x-4 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                {recentlyViewed.map((listing) => (
                  <div
                    key={listing._id || `viewed-${listing.name}-${Math.random()}`}
                    className="flex-shrink-0 w-[280px]"
                  >
                    <ListingItem
                      listing={listing}
                      proximity={
                        userLocation && listing.location
                          ? calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            listing.location.lat,
                            listing.location.lng
                          ).toFixed(1)
                          : null
                      }
                      onClick={() => markAsViewed(listing)}
                      className="group"
                      showBadge={true}
                      isRental={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Properties Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedKind === 'all' ? 'All rentals' : `${propertyTypeLabels[selectedKind]} for rent`}
              {priceRange.min > 0 || priceRange.max < 10000 ? ' • Price filtered' : ''}
            </h2>
            <div className="text-sm text-gray-500">
              {rentalListings.length} {rentalListings.length === 1 ? 'rental' : 'rentals'} found
            </div>
          </div>

          {loading && page === 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-200 rounded-xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : rentalListings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
                {rentalListings.map((listing) => (
                  <ListingItem
                    key={listing._id || `listing-${Math.random()}`}
                    listing={listing}
                    proximity={
                      userLocation && listing.location
                        ? calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          listing.location.lat,
                          listing.location.lng
                        ).toFixed(1)
                        : null
                    }
                    onClick={() => markAsViewed(listing)}
                    className=""
                    isRental={true}
                  />
                ))}
              </div>

              {loading && page > 1 && (
                <div className="flex justify-center py-12">
                  <div className="flex items-center space-x-3">
                    <ArrowPathIcon className="w-5 h-5 animate-spin text-[#FF385C]" />
                    <span className="text-gray-600">Loading more rentals...</span>
                  </div>
                </div>
              )}

              {!hasMore && rentalListings.length > 0 && (
                <div className="text-center py-12 border-t border-gray-100">
                  <p className="text-gray-500">
                    You've seen all available rentals! Try different filters or adjust your search radius.
                  </p>
                </div>
              )}
            </>
          ) : (
            <UserMessage
              type="info"
              message="No rentals found"
              onAction={() => {
                setSelectedKind("all");
                setSearchRadius(15);
                setPriceRange({ min: 0, max: 10000 });
              }}
              actionText="Clear filters"
            />
          )}
        </section>
      </main>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                <XMarkIcon className="w-4 h-4 text-rose-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">{error}</p>
              <button
                onClick={() => fetchListings(true)}
                className="mt-2 text-sm font-medium text-[#FF385C] hover:text-[#E31C5F]"
              >
                Try again
              </button>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add CSS for scrollbar hiding */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        body { overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
        body::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
