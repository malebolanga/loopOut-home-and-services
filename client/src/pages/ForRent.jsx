import { useEffect, useState, useCallback, useRef } from "react";
import ListingItem from "../components/ListingItem"; // Ensure this component is styled for an Airbnb look

// Helper: Calculates distance between two points on Earth (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
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

// Component for user feedback messages (errors, no results, etc.)
// eslint-disable-next-line react/prop-types
const UserMessage = ({ type, message, onAction, actionText }) => (
  <div className={`text-center py-12 sm:py-16 ${type === 'error' ? 'text-rose-700' : 'text-gray-600'}`}>
    <svg
      className={`mx-auto h-12 w-12 ${type === 'error' ? 'text-rose-500' : 'text-gray-400'}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      {type === 'error' ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      )}
    </svg>
    <h3 className="mt-2 text-lg font-semibold text-gray-900">{message}</h3>
    {onAction && (
      <button
        onClick={onAction}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);

export default function ForRent() {
  // State management for listings, loading, filters, and user data
  const [rentListings, setRentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKind, setSelectedKind] = useState("all");
  const [availableKinds, setAvailableKinds] = useState(["all"]);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(15); // Default to a more common radius (15km)
  const [previousSearches, setPreviousSearches] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState([]); // State for recently viewed

  // Ref to prevent multiple fetch calls during rapid scrolling, improving stability
  const isFetchingRef = useRef(false);

  // --- Data Fetching & Side Effects ---

  // Fetches available property types from the API on initial load
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
        setAvailableKinds(["all", "room", "apartment", "house", "town-house"]); // Fallback
        setError("We couldn't load all property types, but you can still search!");
      }
    };
    fetchKinds();
  }, []);

  // Gets user's current geolocation and loads past searches (from localStorage) and recently viewed (from sessionStorage)
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
              // Using localStorage for persistent location
              localStorage.setItem("lastLocation", JSON.stringify(newLocation));
            } catch (e) {
              console.warn("Couldn't save location to browser localStorage:", e);
            }
          },
          (geoError) => {
            console.warn("Location access denied or unavailable:", geoError.message);
            try {
              const lastLocation = localStorage.getItem("lastLocation");
              if (lastLocation) {
                setUserLocation(JSON.parse(lastLocation));
                setError("Couldn't get your exact location, using your last known spot.");
              } else {
                setError("Allow location access to see nearby rentals for best results.");
              }
            } catch (e) {
              console.warn("Couldn't load last location from browser localStorage:", e);
              setError("We couldn't find your location. Please check browser settings.");
            }
          }
        );
      } else {
        setError("Your browser doesn't support location services. Try a different browser.");
      }
    };

    getLocation();
    try {
      const savedSearches = JSON.parse(localStorage.getItem("previousSearches")) || [];
      setPreviousSearches(savedSearches);
      // Retrieve recently viewed from sessionStorage
      const savedViewed = JSON.parse(sessionStorage.getItem("recentlyViewedListings")) || [];
      setRecentlyViewed(savedViewed);
    } catch (e) {
      console.warn("Couldn't load past searches or recently viewed from storage:", e);
    }
  }, []);

  // Function to mark a listing as viewed (using sessionStorage)
  const markAsViewed = useCallback((listing) => {
    setRecentlyViewed((prevViewed) => {
      // Remove if already exists to move it to the top
      const filtered = prevViewed.filter((item) => item._id !== listing._id);
      // Add new listing to the beginning, limit to 5 items for the carousel
      const updatedViewed = [listing, ...filtered].slice(0, 5); // Limit to 5 items for a compact carousel
      try {
        // Save to sessionStorage
        sessionStorage.setItem("recentlyViewedListings", JSON.stringify(updatedViewed));
      } catch (e) {
        console.warn("Couldn't save recently viewed listing to session storage:", e);
      }
      return updatedViewed;
    });
  }, []);

  // Callback function to fetch listings based on current filters and location
  const fetchListings = useCallback(
    async (reset = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      const currentPage = reset ? 1 : page;
      let url = `/api/listing/get?type=rent&limit=100&page=${currentPage}`;

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
              : Infinity, // Assign Infinity if location data is missing to push it to the end
          }))
          .sort((a, b) => a.proximity - b.proximity); // Sort by proximity

        setRentListings((prev) => {
          const combined = reset ? listingsWithProximity : [...prev, ...listingsWithProximity];
          // Filter out listings that are already in recentlyViewed to avoid duplicates on the main list
          return combined.filter(
            (listing) => !recentlyViewed.some((viewed) => viewed._id === listing._id)
          );
        });
        setPage((prev) => prev + 1);
        setHasMore(newItems.length >= 15);

        // Store recent searches in localStorage (for persistent history)
        if (selectedKind !== "all" && userLocation) {
          const newSearch = {
            kind: selectedKind,
            location: userLocation,
            timestamp: new Date().toISOString(),
          };
          setPreviousSearches((prev) => {
            // Filter out exact duplicates and limit to a few recent searches
            const updated = [
              newSearch,
              ...prev
                .filter(
                  (p) =>
                    p.kind !== newSearch.kind ||
                    p.location?.lat !== newSearch.location?.lat ||
                    p.location?.lng !== newSearch.location?.lng
                )
                .slice(0, 4), // Keep up to 4 previous unique searches
            ];
            try {
              localStorage.setItem("previousSearches", JSON.stringify(updated));
            } catch (e) {
              console.warn("Couldn't save recent searches to browser localStorage:", e);
            }
            return updated;
          });
        }
      } catch (err) {
        console.error("Failed to load listings:", err);
        setError(err.message || "Something went wrong! Please try again.");
        if (reset) setRentListings([]);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [selectedKind, userLocation, searchRadius, page, recentlyViewed]
  ); // `recentlyViewed` is a dependency because we filter based on it

  // Effect to trigger listing fetch when filters or user location change
  useEffect(() => {
    // Reset page to 1 and refetch when filters change
    setPage(1);
    fetchListings(true);
  }, [selectedKind, userLocation, searchRadius, fetchListings]);

  // Effect for infinite scrolling
  useEffect(() => {
    const handleScroll = () => {
      // Check if user has scrolled to the bottom of the page
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 300 && // 300px buffer from bottom
        !loading &&
        hasMore &&
        !isFetchingRef.current // Prevent multiple fetches while one is in progress
      ) {
        fetchListings();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, fetchListings]);

  // --- Page Structure & UI Rendering ---

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Filters Bar - Now at the very top */}
    

      {/* Conditional Error/Info Messages */}
      {error && (
        <UserMessage
          type="error"
          message={error}
          onAction={() => fetchListings(true)}
          actionText="Try Again"
        />
      )}

      {/* Recent Searches Section (persistent with localStorage) */}
      {previousSearches.length > 0 && (
        <div className=" py-4  z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {previousSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedKind(search.kind);
                    if (search.location) setUserLocation(search.location);
                  }}
                  
                >
                  
                  
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area: Listings Grid or Messages */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Recently Viewed Listings Section (Horizontal Scroll) */}
        {recentlyViewed.length > 0 && (
            <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Recently viewed</h2>
                  {/* "Clear all" button only appears if there are more than 0 viewed items */}
                  {recentlyViewed.length > 0 && (
                    <button
                      className="text-sm text-rose-600 hover:text-rose-800 transition-colors"
                      onClick={() => {
                        sessionStorage.removeItem("recentlyViewedListings"); // Clear from session storage
                        setRecentlyViewed([]); // Clear from state
                      }}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="flex space-x-4 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                    {recentlyViewed.map((listing) => (
                      <div
                        key={listing._id || `viewed-${listing.name}-${Math.random()}`}
                        className="flex-shrink-0 w-[150px] sm:w-[250px]" // Fixed width for consistent carousel items
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
                          onClick={() => markAsViewed(listing)} // Still mark as viewed on re-click to bring to front
                          className="group bg-white rounded-xl scrollbar-hide shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 cursor-pointer w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
            </section>
        )}

        {/* All Other Listings Section */}
        {loading && page === 1 && rentListings.length === 0 && recentlyViewed.length === 0 ? (
          // Initial loading skeleton (more items for a richer, faster feel)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                <div className="aspect-video bg-gray-200" /> {/* Standard aspect ratio for images */}
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : rentListings.length > 0 ? (
          // Display actual listings in a responsive grid
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-6">All rentals</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 rounded-2xl">
                {rentListings.map((listing) => (
                <ListingItem
                    key={listing._id || `listing-${Math.random()}`} // Robust unique key for React lists
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
                    // Mark as viewed when clicked
                    onClick={() => markAsViewed(listing)}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 cursor-pointer"
                />
                ))}
                {loading && page > 1 && (
                // Loading spinner for subsequent infinite scroll loads
                <div className="col-span-full flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
                </div>
                )}
                {!hasMore && rentListings.length > 0 && (
                // Message when all available listings have been loaded
                <div className="col-span-full text-center py-8 text-gray-500">
                    You ve seen all the rentals! Explore different filters or locations.
                </div>
                )}
            </div>
          </section>
        ) : (
          // Message displayed when no listings are found for the current search/filters
          <UserMessage
            type="info"
            message="No rentals found for your current selection."
            onAction={() => {
              setSelectedKind("all"); // Reset filters to "All Homes"
              setSearchRadius(15); // Reset radius to default
            }}
            actionText="Clear Filters"
          />
        )}
      </main>
    </div>
  );
}