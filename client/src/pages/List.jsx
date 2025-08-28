import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { MdLocationOn, MdStar } from 'react-icons/md';
import { FaEdit, FaTrash, FaBuilding, FaTree, FaMoneyBillWave, FaKey, FaFilter, FaPlus, FaSpinner, FaHeart, FaRegHeart } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';

const ListingTypeConfig = {
  rent: {
    label: 'Long Term Rent',
    icon: <FaKey className="w-4 h-4" />,
    style: 'bg-blue-100 text-blue-800',
    gradient: 'from-blue-400 to-blue-600',
  },
  sale: {
    label: 'For Sale',
    icon: <FaMoneyBillWave className="w-4 h-4" />,
    style: 'bg-green-100 text-green-800',
    gradient: 'from-green-400 to-green-600',
  },
  land: {
    label: 'Land',
    icon: <FaTree className="w-4 h-4" />,
    style: 'bg-amber-100 text-amber-800',
    gradient: 'from-amber-400 to-amber-600',
  },
  office: {
    label: 'Office Space',
    icon: <FaBuilding className="w-4 h-4" />,
    style: 'bg-purple-100 text-purple-800',
    gradient: 'from-purple-400 to-purple-600',
  },
  over: {
    label: 'Short Term',
    icon: <FaBuilding className="w-4 h-4" />,
    style: 'bg-rose-100 text-rose-800',
    gradient: 'from-rose-400 to-rose-600',
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
    if (!window.confirm('Are you sure you want to permanently delete this listing? This action cannot be undone.')) return;
    
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <FaBuilding className="text-blue-400 text-3xl animate-pulse" />
            </div>
            <div className="absolute -inset-2 border-4 border-blue-100 rounded-full animate-spin-slow opacity-70"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3 font-sans">
            Loading Your Properties
          </h1>
          <div className="flex justify-center mb-6">
            <FaSpinner className="animate-spin text-2xl text-blue-500" />
          </div>
          <p className="text-gray-500 text-lg">
            Preparing your property portfolio...
          </p>
          <div className="mt-8 w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full animate-progress" 
              style={{ width: '70%' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sticky top-0 p-2 z-30 bg-white/95 backdrop-blur-sm py-4 border-b border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-2.5xl font-bold text-gray-900 tracking-tight">
              Your Property Listings
            </h1>
            <p className="mt-1.5 text-sm text-gray-500 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                {userListings.length} {userListings.length === 1 ? 'property' : 'properties'}
              </span>
              <span>•</span>
              <span>Last updated: Just now</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3.5 p-2">
            <button
              onClick={refreshListings}
              className="p-2.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-xs"
              disabled={refreshing}
              aria-label="Refresh listings"
            >
              <FiRefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <Link
              to={`/${currentUser?._id}/create-listing`}
              className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              <FaPlus className="mr-2 -ml-0.5 h-3.5 w-3.5" />
              Add New
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-[68px] z-20 bg-white/95 backdrop-blur-sm py-3 border-b border-gray-100 shadow-xs">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex items-center gap-2 text-gray-500 shrink-0">
            <FaFilter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-medium uppercase tracking-wider">Filter By</span>
          </div>
          
          <div className="flex items-center gap-2">
            {Object.entries(ListingTypeConfig).map(([type, config]) => (
              <button
                key={type}
                onClick={() => toggleTypeFilter(type)}
                className={`
                  p-2.5 rounded-lg transition-all duration-200 relative
                  ${selectedTypes.includes(type)
                    ? 'bg-rose-100/80 text-rose-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                  }
                  group focus:outline-none focus:ring-2 focus:ring-rose-400/30
                `}
                aria-label={config.label}
              >
                <div className="relative w-5 h-5">
                  {React.cloneElement(config.icon, {
                    className: `w-full h-full transition-transform duration-200 ${
                      selectedTypes.includes(type) 
                        ? 'scale-110 text-rose-600' 
                        : 'group-hover:scale-105 text-current'
                    }`
                  })}
                  {selectedTypes.includes(type) && (
                    <span className="absolute inset-0 rounded-full bg-rose-100/40 animate-pulse"></span>
                  )}
                </div>
                {selectedTypes.includes(type) && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 p-2">
        {filteredListings.map((listing) => (
          <div
            key={listing._id}
            className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-200 hover:border-gray-300 bg-white"
          >
            {/* Favorite Button */}
            <button 
              onClick={() => toggleFavorite(listing._id)}
              className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-sm transition-all ${
                favorites.includes(listing._id)
                  ? 'bg-rose-100/90 text-rose-600 shadow-sm'
                  : 'bg-white/90 hover:bg-white text-gray-500 hover:text-rose-500'
              }`}
              aria-label={favorites.includes(listing._id) ? "Remove from favorites" : "Add to favorites"}
            >
              {favorites.includes(listing._id) ? (
                <FaHeart className="w-4 h-4" />
              ) : (
                <FaRegHeart className="w-4 h-4" />
              )}
            </button>

            {/* Image */}
            <Link
              to={`/listing/${listing._id}`}
              className="block aspect-[4/3] overflow-hidden relative"
            >
              <img
                src={listing.imageUrls[0] || '/placeholder-property.jpg'}
                alt={listing.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
            </Link>

            {/* Listing Details */}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {listing.name}
                </h3>
                <div className="flex items-center gap-1">
                  <MdStar className="text-yellow-400" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
              </div>

              <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <MdLocationOn className="text-rose-500 flex-shrink-0" />
                <span className="truncate">{listing.address}</span>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <span className={`px-2 py-1 text-xs font-medium rounded ${ListingTypeConfig[listing.type]?.style}`}>
                  {ListingTypeConfig[listing.type]?.label}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-gray-900">
                    R{listing.regularPrice?.toLocaleString()}
                  </span>
                  {listing.type === 'rent' && (
                    <span className="text-sm text-gray-500">/month</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/update-listing/${listing._id}`}
                  className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FaEdit className="w-3 h-3" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(listing._id)}
                  disabled={deletingId === listing._id}
                  className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {deletingId === listing._id ? (
                    <FaSpinner className="animate-spin w-3 h-3" />
                  ) : (
                    <FaTrash className="w-3 h-3" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredListings.length === 0 && (
        <div className="text-center py-16 rounded-xl bg-gray-50 mt-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center">
            <FaBuilding className="text-rose-300 text-4xl" />
          </div>
          <h2 className="text-xl font-medium text-gray-700">
            {userListings.length === 0 ? 'No properties yet' : 'No matching properties'}
          </h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            {userListings.length === 0
              ? 'Get started by adding your first property listing'
              : 'Try adjusting your filters'}
          </p>
          <Link
            to="/create-listing"
            className="inline-flex items-center px-6 py-3 mt-6 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-rose-600 hover:bg-rose-700 transition-colors"
          >
            <FaPlus className="mr-2 -ml-1 h-4 w-4" />
            Create Listing
          </Link>
        </div>
      )}
    </div>
  );
}