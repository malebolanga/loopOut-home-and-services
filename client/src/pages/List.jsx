import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { MdLocationOn, MdStar, MdFilterList, MdRefresh, MdMoreVert, MdEdit, MdDelete } from 'react-icons/md';
import { FaSpinner, FaPlus, FaHome, FaBuilding, FaTree, FaKey, FaMoneyBillWave, FaBed, FaBath } from 'react-icons/fa';

const ListingTypeConfig = {
  rent: {
    label: 'Long Term',
    icon: <FaKey className="w-3.5 h-3.5" />,
    color: '#222222',
  },
  sale: {
    label: 'For Sale',
    icon: <FaMoneyBillWave className="w-3.5 h-3.5" />,
    color: '#222222',
  },
  land: {
    label: 'Land',
    icon: <FaTree className="w-3.5 h-3.5" />,
    color: '#222222',
  },
  office: {
    label: 'Office',
    icon: <FaBuilding className="w-3.5 h-3.5" />,
    color: '#222222',
  },
  over: {
    label: 'Short Term',
    icon: <FaHome className="w-3.5 h-3.5" />,
    color: '#222222',
  },
};

// Status badge config
const StatusConfig = {
  active: {
    label: 'Active',
    style: 'bg-[#E8F5E9] text-[#2E7D32]',
  },
  pending: {
    label: 'Pending',
    style: 'bg-[#FFF3E0] text-[#EF6C00]',
  },
  inactive: {
    label: 'Inactive',
    style: 'bg-[#FFEBEE] text-[#C62828]',
  },
};

export default function List() {
  const { currentUser } = useSelector((state) => state.user);
  const [deletingId, setDeletingId] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);

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

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };
  
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      if (currentUser?._id) fetchListings();
    }, 800);
    return () => clearTimeout(timer);
  }, [currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredListings = selectedTypes.length > 0
    ? userListings.filter((l) => selectedTypes.includes(l.type))
    : userListings;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FaHome className="text-white text-xl" />
          </div>
          <h2 className="text-lg font-semibold text-[#222222]">Loading your listings</h2>
          <p className="text-[#717171] text-sm mt-1">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Airbnb-style Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#DDDDDD]">
        <div className="max-w-[1280px] mx-auto px-0 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-[22px] font-semibold text-[#222222]">Listings</h1>
              <span className="px-3 py-1 bg-[#F7F7F7] rounded-full text-sm font-medium text-[#717171]">
                {userListings.length}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-all text-sm font-medium
                  ${showFilters 
                    ? 'border-[#222222] bg-[#F7F7F7] text-[#222222]' 
                    : 'border-[#DDDDDD] hover:border-[#222222] text-[#222222]'
                  }`}
              >
                <MdFilterList className="w-4 h-4" />
                Filters
                {selectedTypes.length > 0 && (
                  <span className="ml-1 w-5 h-5 text-xs font-medium text-white bg-[#FF5A5F] rounded-full flex items-center justify-center">
                    {selectedTypes.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={refreshListings}
                className="p-2.5 rounded-lg border border-[#DDDDDD] hover:border-[#222222] transition-colors"
                disabled={refreshing}
                aria-label="Refresh listings"
              >
                <MdRefresh className={`w-5 h-5 text-[#222222] ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
            
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="border-b border-[#DDDDDD] bg-white">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#222222]">Property type</h3>
              {selectedTypes.length > 0 && (
                <button
                  onClick={() => setSelectedTypes([])}
                  className="text-sm font-medium text-[#222222] underline hover:text-[#000000]"
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
                    inline-flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200 text-sm font-medium
                    ${selectedTypes.includes(type)
                      ? 'border-[#222222] bg-[#222222] text-white'
                      : 'border-[#DDDDDD] hover:border-[#222222] text-[#222222] bg-white'
                    }
                  `}
                >
                  {config.icon}
                  <span>{config.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8">
        {/* Table Header - Airbnb Style */}
        {filteredListings.length > 0 && (
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-[#717171] uppercase tracking-wide border-b border-[#DDDDDD]">
            <div className="col-span-5">Listing</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-1"></div>
          </div>
        )}

        {/* Listings List */}
        <div className="space-y-2">
          {filteredListings.map((listing) => (
            <div
              key={listing._id}
              className="group bg-white rounded-xl border border-[#DDDDDD] hover:border-[#222222] transition-all duration-200 overflow-hidden"
            >
              {/* Desktop Layout */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 items-center">
                {/* Listing Info */}
                <div className="col-span-5 flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[#F7F7F7]">
                    <img
                      src={listing.imageUrls[0] || '/placeholder-property.jpg'}
                      alt={listing.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <Link 
                      to={`/listing/${listing._id}`}
                      className="block font-semibold text-[#222222] hover:underline truncate"
                    >
                      {listing.name}
                    </Link>
                    <div className="flex items-center gap-1 text-sm text-[#717171] mt-1">
                      <MdLocationOn className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{listing.address}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#717171]">
                      {listing.bedrooms && (
                        <span className="flex items-center gap-1">
                          <FaBed className="w-3 h-3" />
                          {listing.bedrooms}
                        </span>
                      )}
                      {listing.bathrooms && (
                        <span className="flex items-center gap-1">
                          <FaBath className="w-3 h-3" />
                          {listing.bathrooms}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#E8F5E9] text-[#2E7D32]">
                    Active
                  </span>
                </div>

                {/* Type */}
                <div className="col-span-2">
                  <span className="inline-flex items-center gap-1.5 text-sm text-[#222222]">
                    {ListingTypeConfig[listing.type]?.icon}
                    {ListingTypeConfig[listing.type]?.label}
                  </span>
                </div>

                {/* Price */}
                <div className="col-span-2">
                  <div className="text-sm font-semibold text-[#222222]">
                    R{listing.regularPrice?.toLocaleString()}
                  </div>
                  {listing.type === 'rent' && (
                    <div className="text-xs text-[#717171]">/ month</div>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-1 relative dropdown-container">
                  <button
                    onClick={() => toggleDropdown(listing._id)}
                    className="p-2 rounded-full hover:bg-[#F7F7F7] transition-colors"
                  >
                    <MdMoreVert className="w-5 h-5 text-[#717171]" />
                  </button>
                  
                  {dropdownOpen === listing._id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-[#DDDDDD] py-1 z-10">
                      <Link
                        to={`/update-listing/${listing._id}`}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                      >
                        <MdEdit className="w-4 h-4" />
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          handleDelete(listing._id);
                          setDropdownOpen(null);
                        }}
                        disabled={deletingId === listing._id}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C13515] hover:bg-[#FFF8F6] transition-colors"
                      >
                        {deletingId === listing._id ? (
                          <FaSpinner className="animate-spin w-4 h-4" />
                        ) : (
                          <MdDelete className="w-4 h-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden p-4">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[#F7F7F7]">
                    <img
                      src={listing.imageUrls[0] || '/placeholder-property.jpg'}
                      alt={listing.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-[#222222] text-white">
                        {ListingTypeConfig[listing.type]?.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <Link 
                        to={`/listing/${listing._id}`}
                        className="font-semibold text-[#222222] text-sm hover:underline line-clamp-2"
                      >
                        {listing.name}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#717171] mt-1">
                      <MdLocationOn className="w-3 h-3" />
                      <span className="truncate">{listing.address}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-[#717171]">
                      {listing.bedrooms && (
                        <span>{listing.bedrooms} beds</span>
                      )}
                      {listing.bathrooms && (
                        <span>· {listing.bathrooms} baths</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="font-semibold text-[#222222]">
                        R{listing.regularPrice?.toLocaleString()}
                        {listing.type === 'rent' && (
                          <span className="text-xs font-normal text-[#717171]">/mo</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/update-listing/${listing._id}`}
                          className="p-2 text-[#222222] hover:bg-[#F7F7F7] rounded-full transition-colors"
                        >
                          <MdEdit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(listing._id)}
                          disabled={deletingId === listing._id}
                          className="p-2 text-[#C13515] hover:bg-[#FFF8F6] rounded-full transition-colors"
                        >
                          {deletingId === listing._id ? (
                            <FaSpinner className="animate-spin w-4 h-4" />
                          ) : (
                            <MdDelete className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 && (
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#F7F7F7] flex items-center justify-center">
              <FaHome className="text-[#717171] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold text-[#222222] mb-2">
              {userListings.length === 0 ? 'No listings yet' : 'No matching listings'}
            </h2>
            <p className="text-[#717171] text-sm mb-6">
              {userListings.length === 0
                ? 'Start by creating your first property listing to showcase it to potential guests or buyers.'
                : 'Try adjusting your filters to see more results.'}
            </p>
            <Link
              to={`/${currentUser?._id}/create-listing`}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] hover:shadow-md transition-all"
            >
              <FaPlus className="w-4 h-4" />
              Create listing
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}