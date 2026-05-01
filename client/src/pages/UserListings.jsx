import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Sparkles, Edit2, Trash2 } from 'lucide-react';
import { MdLocationOn, MdMoreVert, MdEdit, MdDelete } from 'react-icons/md';
import { FaEdit, FaTrash, FaBuilding, FaTree, FaMoneyBillWave, FaKey, FaFilter, FaPlus, FaCheckCircle, FaSpinner } from 'react-icons/fa';

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
    label: 'Helper',
    icon: <FaEdit className="w-3.5 h-3.5" />,
    style: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  },
};

export default function UserListings() {
  const navigate = useNavigate();
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 p-2">
          {filteredListings.map((listing) => (
            <div
              key={listing._id}
              onClick={() => {
                const path = listing.category === 'stays' ? `/listing/${listing._id}` : 
                            listing.category === 'experiences' ? `/service/${listing._id}` :
                            `/helper/${listing._id}`;
                navigate(path);
              }}
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
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900">
                    {ListingTypeConfig[listing.type]?.label || ListingTypeConfig[listing.category]?.label}
                  </span>
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
                      <MdLocationOn className="w-3 h-3" />
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
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        const editPath = listing.category === 'stays' ? `/update-listing/${listing._id}` : 
                                       listing.category === 'experiences' ? `/update-service/${listing._id}` :
                                       `/update-helper/${listing._id}`;
                        navigate(editPath); 
                      }}
                      className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-green-400 hover:bg-green-500 hover:text-white transition-all rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(listing._id, listing.category); }}
                      disabled={deletingId === listing._id}
                      className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-rose-400 hover:bg-rose-500 hover:text-white transition-all rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {deletingId === listing._id ? <FaSpinner className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      Delete
                    </button>
                  </div>
                  <div 
                    className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black uppercase tracking-[0.2em] text-center text-xs hover:bg-rose-500 hover:text-white transition-all shadow-2xl"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      const viewPath = listing.category === 'stays' ? `/listing/${listing._id}` : 
                                      listing.category === 'experiences' ? `/service/${listing._id}` :
                                      `/helper/${listing._id}`;
                      navigate(viewPath); 
                    }}
                  >
                    Inspect Original Masterpiece
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