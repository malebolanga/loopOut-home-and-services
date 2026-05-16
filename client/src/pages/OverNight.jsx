import { useEffect, useState, useCallback, useRef } from "react";
import ListingItem from "../components/ListingItem";
import {
  MapPinIcon,
  FunnelIcon,
  ClockIcon,
  HomeIcon,
  GlobeAmericasIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MoonIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import {
  FaHeart,
  FaFilter
} from "react-icons/fa";
import NeuralLoader from "../components/NeuralLoader";

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

const UserMessage = ({ type, message, onAction, actionText }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
    <div className={`p-6 rounded-full ${type === 'error' ? 'bg-rose-50' : 'bg-gray-50'} mb-6`}>
      {type === 'error' ? (
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ) : (
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <MoonIcon className="w-8 h-8 text-gray-600" />
        </div>
      )}
    </div>
    <h3 className="text-2xl font-semibold text-gray-800 mb-3">{message}</h3>
    {type === 'info' && (
      <p className="text-gray-500 mb-6 max-w-md">
        Try adjusting your search radius or property type to find more overnight stays.
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

export default function OverNight() {
  const [overnightListings, setOvernightListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKind, setSelectedKind] = useState("all");
  const [availableKinds, setAvailableKinds] = useState(["all", "hotel", "guesthouse", "bnb", "motel"]);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [radiusMenuOpen, setRadiusMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const isFetchingRef = useRef(false);
  const radiusMenuRef = useRef(null);

  const propertyTypeLabels = {
    "all": "All Stays",
    "hotel": "Hotels",
    "guesthouse": "Guesthouses",
    "bnb": "B&Bs",
    "motel": "Motels",
    "lodge": "Lodges",
    "hostel": "Hostels"
  };

  const radiusOptions = [2, 5, 10, 25, 50];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (radiusMenuRef.current && !radiusMenuRef.current.contains(event.target)) {
        setRadiusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchKinds = async () => {
      try {
        const res = await fetch("/api/listing/kinds?type=over");
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
        setAvailableKinds(["all", "hotel", "guesthouse", "bnb", "motel"]);
      }
    };
    fetchKinds();
  }, []);

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
              console.warn("Couldn't save location:", e);
            }
          },
          (geoError) => {
            console.warn("Location access denied:", geoError.message);
            try {
              const lastLocation = localStorage.getItem("lastLocation");
              if (lastLocation) {
                setUserLocation(JSON.parse(lastLocation));
              }
            } catch (e) {
              console.warn("Couldn't load last location:", e);
            }
          }
        );
      }
    };

    getLocation();
    try {
      const savedViewed = JSON.parse(sessionStorage.getItem("recentlyViewedOvernightListings")) || [];
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
        sessionStorage.setItem("recentlyViewedOvernightListings", JSON.stringify(updatedViewed));
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
      let url = `/api/listing/get?type=over&limit=12&page=${currentPage}`;

      if (selectedKind !== "all") {
        url += `&kind=${selectedKind}`;
      }
      if (userLocation?.lat && userLocation?.lng) {
        url += `&lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${searchRadius}`;
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

        setOvernightListings((prev) => {
          const combined = reset ? listingsWithProximity : [...prev, ...listingsWithProximity];
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
      } catch (err) {
        console.error("Failed to load listings:", err);
        setError(err.message || "Something went wrong! Please try again.");
        if (reset) setOvernightListings([]);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [selectedKind, userLocation, searchRadius, page]
  );

  useEffect(() => {
    setPage(1);
    fetchListings(true);
  }, [selectedKind, userLocation, searchRadius]);

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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <MoonIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Overnight Stays
                  </h1>
                  {userLocation && (
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span>Showing stays within {searchRadius}km of your location</span>
                    </div>
                  )}
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
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${searchRadius === radius ? 'text-purple-600 font-medium' : 'text-gray-700'
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-gray-700 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Recently viewed stays</h2>
              </div>
              <button
                onClick={() => {
                  sessionStorage.removeItem("recentlyViewedOvernightListings");
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
                      className=""
                      showBadge={true}
                      isOvernight={true}
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
              {selectedKind === 'all' ? 'All overnight stays' : `${propertyTypeLabels[selectedKind]}`}
            </h2>
            <div className="text-sm text-gray-500">
              {overnightListings.length} {overnightListings.length === 1 ? 'stay' : 'stays'} found
            </div>
          </div>

          {loading && page === 1 ? (
            <div className="py-24 flex justify-center w-full col-span-full">
              <NeuralLoader text="Scanning Local Hubs..." />
            </div>
          ) : overnightListings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {overnightListings.map((listing) => (
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
                    isOvernight={true}
                  />
                ))}
              </div>

              {loading && page > 1 && (
                <div className="flex justify-center py-12">
                   <NeuralLoader text="Deploying more results..." />
                </div>
              )}

              {!hasMore && overnightListings.length > 0 && (
                <div className="text-center py-12 border-t border-gray-100">
                  <p className="text-gray-500">
                    You've seen all available stays! Try different filters or adjust your search radius.
                  </p>
                </div>
              )}
            </>
          ) : (
            <UserMessage
              type="info"
              message="No overnight stays found"
              onAction={() => {
                setSelectedKind("all");
                setSearchRadius(5);
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
                <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">{error}</p>
              <button
                onClick={() => fetchListings(true)}
                className="mt-2 text-sm font-medium text-purple-600 hover:text-purple-800"
              >
                Try again
              </button>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

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
