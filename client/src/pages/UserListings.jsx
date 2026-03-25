import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdLocationOn, MdMoreVert, MdEdit, MdDelete } from 'react-icons/md';
import { FaEdit, FaTrash, FaBuilding, FaTree, FaMoneyBillWave, FaKey, FaFilter, FaPlus, FaCheckCircle } from 'react-icons/fa';

const ListingTypeConfig = {
  rent: {
    label: 'Long Term Rent',
    icon: <FaKey className="w-3.5 h-3.5" />,
    style: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  sale: {
    label: 'For Sale',
    icon: <FaMoneyBillWave className="w-3.5 h-3.5" />,
    style: 'bg-green-50 text-green-700 border-green-100',
  },
  land: {
    label: 'Land',
    icon: <FaTree className="w-3.5 h-3.5" />,
    style: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  office: {
    label: 'Office Space',
    icon: <FaBuilding className="w-3.5 h-3.5" />,
    style: 'bg-purple-50 text-purple-700 border-purple-100',
  },
  over: {
    label: 'Short Term',
    icon: <FaBuilding className="w-3.5 h-3.5" />,
    style: 'bg-rose-50 text-rose-700 border-rose-100',
  },
  stays: {
    label: 'Stays',
    icon: <FaBuilding className="w-3.5 h-3.5" />,
    style: 'bg-slate-50 text-slate-700 border-slate-100',
  },
  experiences: {
    label: 'Experiences',
    icon: <FaPlus className="w-3.5 h-3.5" />,
    style: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  online: {
    label: 'Helpers',
    icon: <FaEdit className="w-3.5 h-3.5" />,
    style: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  },
};

export default function UserListings() {
  const { currentUser } = useSelector((state) => state.user);
  const [deletingId, setDeletingId] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const [listingsRes, servicesRes, helpersRes] = await Promise.all([
        fetch(`/api/user/listings/${currentUser._id}`),
        fetch(`/api/user/services/${currentUser._id}`),
        fetch(`/api/user/helpers/${currentUser._id}`)
      ]);

      const [listingsData, servicesData, helpersData] = await Promise.all([
        listingsRes.json(),
        servicesRes.json(),
        helpersRes.json()
      ]);
      
      const allItems = [
        ...(Array.isArray(listingsData) ? listingsData : (listingsData.listings || [])).map(l => ({ ...l, category: 'stays' })),
        ...(Array.isArray(servicesData) ? servicesData : (servicesData.services || [])).map(s => ({ ...s, category: 'experiences' })),
        ...(Array.isArray(helpersData) ? helpersData : (helpersData.helpers || [])).map(h => ({ ...h, category: 'online' }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setUserListings(allItems);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTypeFilter = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleDelete = async (id, category) => {
    if (!window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) return;
    
    try {
      setDeletingId(id);
      
      const endpoint = category === 'stays' ? `/api/listing/delete/${id}` :
                       category === 'experiences' ? `/api/service/delete/${id}` :
                       category === 'online' ? `/api/helper/delete/${id}` : '';
      
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete item');
      }
  
      setUserListings(prev => prev.filter(l => l._id !== id));
      setDropdownOpen(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message || 'Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  };
  
  useEffect(() => {
    if (currentUser?._id) fetchListings();
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [currentUser]);

  const filteredListings = selectedTypes.length > 0
    ? userListings.filter((l) => selectedTypes.includes(l.type) || selectedTypes.includes(l.category))
    : userListings;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your host dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F7F7] min-h-screen pb-20">
      {/* Premium Header */}
      <div className="bg-white border-b border-gray-200 pt-12 pb-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Welcome back, {currentUser.username?.split(' ')[0]}
              </h1>
              <p className="mt-2 text-lg text-gray-500 flex items-center gap-2">
                <FaCheckCircle className="text-rose-500" />
                You have {userListings.length} active postings to manage
              </p>
            </div>
            <Link
              to="/create-listing"
              className="inline-flex items-center px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-bold group"
            >
              <FaPlus className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Build a New Post
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        {/* Filter Bar - Horizontal Slider */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 text-gray-400 px-1">
            <FaFilter className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-widest">Sliding Filters</span>
          </div>
          <div className="relative group/filters">
            <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {Object.entries(ListingTypeConfig).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => toggleTypeFilter(type)}
                  className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full border transition-all duration-300 font-semibold shadow-sm flex-shrink-0 ${
                    selectedTypes.includes(type)
                      ? 'border-rose-600 bg-rose-600 text-white shadow-rose-200 scale-105'
                      : 'border-white bg-white hover:border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {config.icon}
                  <span className="whitespace-nowrap text-sm">{config.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Listings Grid - Higher Density */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {filteredListings.map((listing) => (
            <div
              key={listing._id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col h-full"
            >
              {/* Image Section */}
              <div className="relative aspect-square overflow-hidden">
                <Link
                  to={listing.category === 'stays' ? `/listing/${listing._id}` : 
                      listing.category === 'experiences' ? `/service/${listing._id}` :
                      `/helper/${listing._id}`}
                  className="block w-full h-full"
                >
                  <img
                    src={listing.imageUrls[0] || '/placeholder-property.jpg'}
                    alt={listing.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>

                {/* Status Badges */}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 text-[10px] font-bold rounded-full border shadow-sm backdrop-blur-md ${ListingTypeConfig[listing.type]?.style || ListingTypeConfig[listing.category]?.style}`}>
                    {ListingTypeConfig[listing.type]?.label || ListingTypeConfig[listing.category]?.label}
                  </span>
                </div>

                {/* More Dropdown */}
                <div className="absolute top-3 right-3 dropdown-container">
                  <button
                    onClick={() => setDropdownOpen(dropdownOpen === listing._id ? null : listing._id)}
                    className="p-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-colors border border-gray-100"
                  >
                    <MdMoreVert className="w-4 h-4 text-gray-700" />
                  </button>
                  
                  {dropdownOpen === listing._id && (
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link
                        to={listing.category === 'stays' ? `/update-listing/${listing._id}` : 
                            listing.category === 'experiences' ? `/update-service/${listing._id}` :
                            `/update-helper/${listing._id}`}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 font-semibold"
                      >
                        <MdEdit className="w-3.5 h-3.5 text-rose-500" />
                        Edit post
                      </Link>
                      <button
                        onClick={() => handleDelete(listing._id, listing.category)}
                        disabled={deletingId === listing._id}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold border-t border-gray-50"
                      >
                        <MdDelete className="w-3.5 h-3.5" />
                        {deletingId === listing._id ? '...' : 'Remove'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-rose-600 transition-colors mb-1.5">
                  {listing.name}
                </h3>

                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-3">
                  <MdLocationOn className="text-rose-500 flex-shrink-0 w-3 h-3" />
                  <span className="truncate">{listing.address}</span>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-50">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Base Price</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-gray-900 leading-none">
                        R{listing.regularPrice?.toLocaleString()}
                      </span>
                      {listing.type === 'rent' && (
                        <span className="text-[10px] text-gray-500 font-bold">/mo</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Improved Empty State */}
        {filteredListings.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[40px] shadow-sm border border-gray-100 mt-10">
            <div className="max-w-md mx-auto px-6">
              <div className="mb-8 w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
                <FaPlus className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                {userListings.length === 0 ? "Ready to become a host?" : "No matches found"}
              </h3>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed font-medium">
                {userListings.length === 0
                  ? "Start by creating your first listing. It only takes a few minutes to showcase your space or service."
                  : "We couldn't find any results for those filters. Try selecting a different category or clearing all filters."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/create-listing"
                  className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 font-bold"
                >
                  Create Listing
                </Link>
                {selectedTypes.length > 0 && (
                  <button
                    onClick={() => setSelectedTypes([])}
                    className="px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 font-bold"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}