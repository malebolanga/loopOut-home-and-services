import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { MdLocationOn, MdStar, MdFilterList, MdRefresh, MdMoreVert, MdEdit, MdDelete } from 'react-icons/md';
import { FaSpinner, FaPlus, FaHome, FaBuilding, FaTree, FaKey, FaMoneyBillWave, FaBed, FaBath } from 'react-icons/fa';
import { Star, Sparkles, Edit2, Trash2, Home as HomeIcon } from 'lucide-react';

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
  }, [currentUser?._id]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 p-2">
          {filteredListings.map((listing) => (
            <div
              key={listing._id}
              className="group relative aspect-square bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-700 h-full cursor-pointer"
            >
              <div className="absolute inset-0 z-0">
                <img
                  src={listing.imageUrls[0] || '/placeholder-property.jpg'}
                  alt={listing.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Top Overlays */}
              <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
                <div className="px-3 py-1.5 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-lg flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-rose-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900">{listing.type}</span>
                </div>
              </div>

              {/* Permanent Information Overlay (On Image) */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                <div className="flex justify-between items-end gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 text-white">
                      <Star className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                      <span className="text-xs font-black">4.8</span>
                    </div>
                    <h3 className="text-base font-black text-white leading-tight truncate mb-0.5">
                      {listing.name}
                    </h3>
                    <p className="text-xs text-white/70 font-medium truncate flex items-center gap-1">
                      {listing.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-white tracking-tighter leading-none mb-1">
                      R{listing.regularPrice?.toLocaleString()}
                    </div>
                    <div className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em] leading-none text-nowrap">Perspective</div>
                  </div>
                </div>
              </div>

              {/* Hover Action Overlay */}
              <div className="absolute inset-0 z-20 flex flex-col justify-center items-center p-8 bg-gray-900/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:pointer-events-auto">
                <div className="w-full space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <div className="flex gap-2">
                    <Link
                      to={`/update-listing/${listing._id}`}
                      className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-green-400 hover:bg-green-500 hover:text-white transition-all rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(listing._id); }}
                      disabled={deletingId === listing._id}
                      className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-rose-400 hover:bg-rose-500 hover:text-white transition-all rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {deletingId === listing._id ? <Sparkles className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      Delete
                    </button>
                  </div>
                  <Link
                    to={`/listing/${listing._id}`} 
                    className="block w-full py-4 bg-white text-gray-900 rounded-2xl font-black uppercase tracking-[0.2em] text-center text-xs hover:bg-rose-500 hover:text-white transition-all shadow-2xl"
                  >
                    Inspect Original Masterpiece
                  </Link>
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
