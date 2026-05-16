/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Sparkles, MapPin, Edit2, Trash2, Home as HomeIcon } from 'lucide-react';

const ListingTypeConfig = {
  rent: {
    label: 'Long Rent',
    icon: '🏠',
    style: 'bg-blue-100 text-blue-800',
    gradient: 'from-blue-400 to-blue-600',
  },
  sale: {
    label: 'Sale',
    icon: '💰',
    style: 'bg-green-100 text-green-800',
    gradient: 'from-green-400 to-green-600',
  },
  land: {
    label: 'Land',
    icon: '🌳',
    style: 'bg-amber-100 text-amber-800',
    gradient: 'from-amber-400 to-amber-600',
  },
  office: {
    label: 'Per Hour',
    icon: '🏢',
    style: 'bg-purple-100 text-purple-800',
    gradient: 'from-purple-400 to-purple-600',
  },
  over: {
    label: 'Short Term',
    icon: '🏨',
    style: 'bg-rose-100 text-rose-800',
    gradient: 'from-rose-400 to-rose-600',
  },
};

export default function PropertyListings() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [deletingId, setDeletingId] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

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

  // Sort listings based on selected option
  const sortedListings = [...userListings].sort((a, b) => {
    switch (sortBy) {
      case 'price-high':
        return b.regularPrice - a.regularPrice;
      case 'price-low':
        return a.regularPrice - b.regularPrice;
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      default:
        return 0;
    }
  });

  const filteredListings = selectedTypes.length > 0
    ? sortedListings.filter((l) => selectedTypes.includes(l.type))
    : sortedListings;

  if (loading) {
    return (
      <div className="min-h-screen from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <span className="text-3xl">🏡</span>
            </div>
            <div className="absolute -inset-2 border-4 border-blue-100 rounded-full animate-spin-slow opacity-70"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3 font-sans">
            Loading Your Properties
          </h1>
          <div className="flex justify-center mb-6">
            <span className="text-2xl text-blue-500 animate-spin">⏳</span>
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
            <h1 className="text-2xl sm:text-2.5xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Your Property Listings
            </h1>
            <p className="mt-1.5 text-sm text-gray-500 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                {filteredListings.length} of {userListings.length} {userListings.length === 1 ? 'property' : 'properties'}
              </span>
              <span>•</span>
              <span>Last updated: Just now</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3.5 p-2">
            <div className="relative">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 pl-3 pr-10 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="newest">🆕 Newest First</option>
                <option value="oldest">📅 Oldest First</option>
                <option value="price-high">💰 Price: High to Low</option>
                <option value="price-low">💲 Price: Low to High</option>
              </select>
            </div>
            
            <button
              onClick={refreshListings}
              className="p-2.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-xs"
              disabled={refreshing}
              aria-label="Refresh listings"
            >
              <span className={`text-gray-500 ${refreshing ? 'animate-spin' : ''}`}>🔄</span>
            </button>
            
           
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-[68px] z-20 bg-white/95 backdrop-blur-sm py-3 border-b border-gray-100 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 text-gray-500 shrink-0">
            <span className="text-gray-400">🔍</span>
            <span className="text-xs font-medium uppercase tracking-wider">Filter By Type</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(ListingTypeConfig).map(([type, config]) => (
              <button
                key={type}
                onClick={() => toggleTypeFilter(type)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 relative
                  ${selectedTypes.includes(type)
                    ? 'bg-rose-100/80 text-rose-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                  }
                  group focus:outline-none focus:ring-2 focus:ring-rose-400/30
                `}
                aria-label={config.label}
              >
                <span className="text-base">{config.icon}</span>
                <span className="text-sm font-medium">{config.label}</span>
                {selectedTypes.includes(type) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
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
            onClick={() => navigate(`/listing/${listing._id}`)}
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
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/update-listing/${listing._id}`); }}
                    className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-green-400 hover:bg-green-500 hover:text-white transition-all rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(listing._id); }}
                    disabled={deletingId === listing._id}
                    className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-rose-400 hover:bg-rose-500 hover:text-white transition-all rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {deletingId === listing._id ? <Sparkles className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete
                  </button>
                </div>
                <div 
                  className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black uppercase tracking-[0.2em] text-center text-xs hover:bg-rose-500 hover:text-white transition-all shadow-2xl"
                  onClick={(e) => { e.stopPropagation(); navigate(`/listing/${listing._id}`); }}
                >
                  Inspect Original Masterpiece
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredListings.length === 0 && (
        <div className="text-center py-16 rounded-xl bg-gray-50 mt-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center">
            <span className="text-4xl">🏡</span>
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
            <span className="mr-2 -ml-1">➕</span>
            Create Listing
          </Link>
        </div>
      )}
    </div>
  );
}
