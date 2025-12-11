import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { MdLocationOn, MdStar, MdFilterList, MdRefresh } from 'react-icons/md';
import { FaEdit, FaTrash, FaBuilding, FaTree, FaMoneyBillWave, FaKey, FaPlus, FaSpinner, FaHeart, FaRegHeart, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';

const ListingTypeConfig = {
  rent: {
    label: 'Long Term Rent',
    icon: <FaKey className="w-4 h-4" />,
    style: 'bg-blue-100 text-blue-800 border-blue-200',
    gradient: 'from-blue-400 to-blue-600',
    color: 'blue',
  },
  sale: {
    label: 'For Sale',
    icon: <FaMoneyBillWave className="w-4 h-4" />,
    style: 'bg-green-100 text-green-800 border-green-200',
    gradient: 'from-green-400 to-green-600',
    color: 'green',
  },
  land: {
    label: 'Land',
    icon: <FaTree className="w-4 h-4" />,
    style: 'bg-amber-100 text-amber-800 border-amber-200',
    gradient: 'from-amber-400 to-amber-600',
    color: 'amber',
  },
  office: {
    label: 'Office Space',
    icon: <FaBuilding className="w-4 h-4" />,
    style: 'bg-purple-100 text-purple-800 border-purple-200',
    gradient: 'from-purple-400 to-purple-600',
    color: 'purple',
  },
  over: {
    label: 'Short Term',
    icon: <FaBuilding className="w-4 h-4" />,
    style: 'bg-rose-100 text-rose-800 border-rose-200',
    gradient: 'from-rose-400 to-rose-600',
    color: 'rose',
  },
};

export default function List() {
  const { currentUser } = useSelector((state) => state.user);
  const [deletingId, setDeletingId] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchListings = async () => {
    try {
      const res = await fetch(`/api/user/listings/${currentUser._id}`, {
        credentials: 'include',
      });
      const data = await res.json();
      
      if (res.ok) {
        const sortedListings = (data.listings || data).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setUserListings(sortedListings);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshListings = () => {
    setRefreshing(true);
    fetchListings();
  };

  const toggleTypeFilter = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleFavorite = (listingId) => {
    setFavorites(prev => 
      prev.includes(listingId) 
        ? prev.filter(id => id !== listingId) 
        : [...prev, listingId]
    );
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      setDeletingId(listingId);
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to delete listing');
  
      setUserListings(prev => prev.filter(l => l._id !== listingId));
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message || 'Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };
  
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      if (currentUser?._id) fetchListings();
    }, 800);
    return () => clearTimeout(timer);
  }, [currentUser]);

  const filteredListings = selectedTypes.length > 0
    ? userListings.filter((l) => selectedTypes.includes(l.type))
    : userListings;

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 flex items-center justify-center mx-auto">
              <FaBuilding className="text-rose-400 text-2xl animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-3">
            Loading your listings
          </h1>
          <p className="text-gray-500">
            Getting your properties ready...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Listings</h1>
              <p className="mt-1 text-sm text-gray-500">
                {userListings.length} {userListings.length === 1 ? 'property' : 'properties'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MdFilterList className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                {selectedTypes.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-rose-500 rounded-full">
                    {selectedTypes.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={refreshListings}
                className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                disabled={refreshing}
                aria-label="Refresh listings"
              >
                <MdRefresh className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <Link
                to={`/${currentUser?._id}/create-listing`}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
              >
                <FaPlus className="mr-2 h-3.5 w-3.5" />
                Add Listing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 py-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Property Types</h3>
              {selectedTypes.length > 0 && (
                <button
                  onClick={() => setSelectedTypes([])}
                  className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ListingTypeConfig).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => toggleTypeFilter(type)}
                  className={`
                    inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200
                    ${selectedTypes.includes(type)
                      ? `border-${config.color}-300 bg-${config.color}-50 text-${config.color}-700`
                      : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900'
                    }
                  `}
                >
                  {React.cloneElement(config.icon, {
                    className: `w-3.5 h-3.5 ${selectedTypes.includes(type) ? `text-${config.color}-600` : 'text-gray-500'}`
                  })}
                  <span className="text-sm font-medium">{config.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <div
              key={listing._id}
              className="group relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/2] overflow-hidden">
                <Link to={`/listing/${listing._id}`} className="block h-full">
                  <img
                    src={listing.imageUrls[0] || '/placeholder-property.jpg'}
                    alt={listing.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </Link>
                
                {/* Favorite Button */}
                <button 
                  onClick={() => toggleFavorite(listing._id)}
                  className="absolute top-3 right-3 z-10"
                  aria-label={favorites.includes(listing._id) ? "Remove from favorites" : "Add to favorites"}
                >
                  <div className={`p-2 rounded-full transition-all ${
                    favorites.includes(listing._id)
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/90 hover:bg-white text-gray-500 hover:text-rose-500'
                  }`}>
                    {favorites.includes(listing._id) ? (
                      <FaHeart className="w-4 h-4" />
                    ) : (
                      <FaRegHeart className="w-4 h-4" />
                    )}
                  </div>
                </button>
                
                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-md text-white ${
                    ListingTypeConfig[listing.type]?.gradient ? 
                    `bg-gradient-to-r ${ListingTypeConfig[listing.type].gradient}` : 
                    'bg-black/70'
                  }`}>
                    {ListingTypeConfig[listing.type]?.label}
                  </span>
                </div>
              </div>

              {/* Listing Details */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Link 
                    to={`/listing/${listing._id}`}
                    className="group-hover:text-rose-600 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 line-clamp-1">
                      {listing.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1">
                    <MdStar className="text-amber-400 w-4 h-4" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                  <MdLocationOn className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{listing.address}</span>
                </div>

                {/* Property Features */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  {listing.bedrooms && (
                    <div className="flex items-center gap-1">
                      <FaBed className="w-3.5 h-3.5" />
                      <span>{listing.bedrooms} beds</span>
                    </div>
                  )}
                  {listing.bathrooms && (
                    <div className="flex items-center gap-1">
                      <FaBath className="w-3.5 h-3.5" />
                      <span>{listing.bathrooms} baths</span>
                    </div>
                  )}
                  {listing.area && (
                    <div className="flex items-center gap-1">
                      <FaRulerCombined className="w-3.5 h-3.5" />
                      <span>{listing.area.toLocaleString()} sqft</span>
                    </div>
                  )}
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-semibold text-gray-900">
                      R{listing.regularPrice?.toLocaleString()}
                    </span>
                    {listing.type === 'rent' && (
                      <span className="text-sm text-gray-500">/month</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/update-listing/${listing._id}`}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit listing"
                    >
                      <FaEdit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(listing._id)}
                      disabled={deletingId === listing._id}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete listing"
                    >
                      {deletingId === listing._id ? (
                        <FaSpinner className="animate-spin w-4 h-4" />
                      ) : (
                        <FaTrash className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <FaBuilding className="text-gray-400 text-3xl" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              {userListings.length === 0 ? 'No listings yet' : 'No matching listings'}
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {userListings.length === 0
                ? 'Start by adding your first property listing to showcase it to potential guests or buyers.'
                : 'Try adjusting your filters to see more results.'}
            </p>
            <Link
              to={`/${currentUser?._id}/create-listing`}
              className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              Create Listing
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}