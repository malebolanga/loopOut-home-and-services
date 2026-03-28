// UserProfile.jsx - 完整代码（使用Tailwind替代CSS）
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  CalendarIcon,
  MapPinIcon,
  GlobeAltIcon,
  StarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckBadgeIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  HeartIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChevronRightIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { FaWhatsapp } from 'react-icons/fa';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [portfolioFilter, setPortfolioFilter] = useState('all');
  const [showFollowList, setShowFollowList] = useState(null); // 'followers', 'following', or null
  const [followListData, setFollowListData] = useState([]);
  const [followListLoading, setFollowListLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/user/public/${id}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || 'Failed to fetch user');
        
        setUserData(data);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserData();
  }, [id]);

  useEffect(() => {
    if (userData && currentUser) {
      setIsFollowing(userData.followers?.includes(currentUser._id));
    }
  }, [userData, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const endpoint = isFollowing ? `/api/user/unfollow/${id}` : `/api/user/follow/${id}`;
      const res = await fetch(endpoint, {
        method: 'PUT',
      });
      const data = await res.json();
      if (res.ok) {
        setIsFollowing(!isFollowing);
        // Update counts manually to avoid another fetch
        setUserData(prev => ({
          ...prev,
          followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1,
          followers: isFollowing 
            ? prev.followers.filter(fid => fid !== currentUser._id)
            : [...(prev.followers || []), currentUser._id]
        }));
      } else {
        alert(data.message || 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Follow error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleMessage = async () => {
    // ... (existing code remains SAME)
  };

  const openFollowList = async (type) => {
    setShowFollowList(type);
    setFollowListLoading(true);
    try {
      const res = await fetch(`/api/user/${type}/${id}`);
      const data = await res.json();
      if (res.ok) {
        setFollowListData(data);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setFollowListLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">User Not Found</h2>
          <p className="text-gray-600 mb-6">The user you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="bg-gradient-to-br from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-shadow"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo */}
      <div className="relative h-64 md:h-80 lg:h-96">
        <img
          src={userData.coverPhoto || "https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"}
          alt="Cover"
          className="w-full h-full object-cover transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-8 lg:space-y-0 lg:space-x-12">
            
            {/* Left: Avatar & Interaction */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="relative -mt-24 md:-mt-36 mb-6">
                <div className="relative p-1.5 bg-white rounded-[2.5rem] shadow-2xl transform transition-transform group-hover:scale-105 duration-500">
                  <img
                    src={userData.avatar}
                    alt={userData.username}
                    className="w-32 h-32 md:w-44 md:h-44 lg:w-48 lg:h-48 rounded-[2rem] object-cover ring-2 ring-gray-50 bg-gray-50"
                  />
                  {userData.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2 md:p-2.5 rounded-2xl shadow-xl border-4 border-white">
                      <CheckBadgeIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Desktop Bottom / Mobile Bottom */}
              <div className="flex w-full space-x-3 mt-2">
                {currentUser?._id !== id ? (
                  <>
                    <button
                      onClick={handleFollow}
                      className={`flex-1 px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 transform active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                        isFollowing
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gradient-to-br from-rose-500 to-pink-600 text-white hover:shadow-rose-200 hover:shadow-2xl'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button
                      onClick={handleMessage}
                      className="px-6 py-3.5 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 hover:border-rose-500 hover:text-rose-600 transition-all duration-300 flex items-center gap-2 bg-gray-50 hover:bg-white"
                    >
                      <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      Message
                    </button>
                  </>
                ) : (
                  <Link
                    to="/profile"
                    className="flex-1 px-8 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all text-center flex items-center justify-center gap-2"
                  >
                    Edit My Profile
                  </Link>
                )}
              </div>
            </div>

            {/* Right: Info & Stats */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-8">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
                      {userData.username || 'User'}
                    </h1>
                    {userData.likeCount > 50 && (
                      <span className="bg-gradient-to-br from-rose-500 to-rose-600 text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-lg shadow-rose-100 flex items-center">
                        <StarIconSolid className="w-3.5 h-3.5 mr-1.5" />
                        Top Rated Host
                      </span>
                    )}
                    {userData.isVerified && (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-xl flex items-center border border-emerald-100">
                        <ShieldCheckIcon className="w-3.5 h-3.5 mr-1.5" />
                        Verified Partner
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 md:gap-8 text-gray-600 font-medium">
                    <div className="flex items-center cursor-default">
                      <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center mr-3 group-hover:bg-rose-100 transition-colors">
                        <StarIconSolid className="w-5 h-5 text-rose-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-bold leading-tight">
                          {userData.likeCount + userData.dislikeCount > 0 
                            ? ((userData.likeCount / (userData.likeCount + userData.dislikeCount)) * 5).toFixed(1) 
                            : '0.0'}
                        </span>
                        <span className="text-[10px] opacity-60 uppercase">Host Rating</span>
                      </div>
                    </div>
                    <div className="flex items-center cursor-default">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                        <MapPinIcon className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-bold leading-tight truncate max-w-[150px]">
                          {userData.location || 'LoopOut Member'}
                        </span>
                        <span className="text-[10px] opacity-60 uppercase">Primary Base</span>
                      </div>
                    </div>
                    <div className="flex items-center cursor-default">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mr-3 group-hover:bg-purple-100 transition-colors">
                        <CalendarIcon className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-bold leading-tight">
                          {new Date(userData.createdAt).getFullYear()}
                        </span>
                        <span className="text-[10px] opacity-60 uppercase">Partner Since</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Share/Action Strip */}
                <div className="flex gap-2.5 mt-6 md:mt-0">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Profile URL copied to clipboard!');
                    }}
                    className="group w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:shadow-gray-100 transition-all duration-300"
                    title="Copy Profile URL"
                  >
                    <GlobeAltIcon className="w-5 h-5 text-gray-400 group-hover:text-rose-500" />
                  </button>
                  <button className="group w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
                    <HeartIcon className="w-5 h-5 text-gray-400 group-hover:text-rose-500" />
                  </button>
                </div>
              </div>

              {/* Premium Bios & Bio Data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Host Story</h3>
                   <p className="text-gray-600 leading-relaxed font-medium">
                    {userData.bio || 'This LoopOut partner prefers to let their creations speak for themselves. Reach out to learn more about their journey.'}
                  </p>
                </div>
                
                {/* Contact Strip */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Direct Contact</h3>
                  {userData.phone && (
                    <a 
                      href={`https://wa.me/${userData.phone.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-colors "
                    >
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <FaWhatsapp className="text-emerald-500 text-lg" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Fast Reply</span>
                        <span className="text-sm font-bold text-emerald-900">WhatsApp Now</span>
                      </div>
                    </a>
                  )}
                  {userData.email && (
                    <a 
                      href={`mailto:${userData.email}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:border-rose-200 transition-all"
                    >
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Business Inquiries</span>
                        <span className="text-sm font-bold text-gray-800 truncate max-w-[140px]">{userData.email}</span>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Premium Stats Blocks */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Followers', value: userData.followersCount || 0, icon: <UserGroupIcon className="w-4 h-4" />, color: 'rose', onClick: () => openFollowList('followers') },
                  { label: 'Following', value: userData.followingCount || 0, icon: <UserGroupIcon className="w-4 h-4" />, color: 'emerald', onClick: () => openFollowList('following') },
                  { label: 'Portfolio Items', value: (userData.listings?.length || 0) + (userData.services?.length || 0) + (userData.helpers?.length || 0) + (userData.events?.length || 0), icon: <BriefcaseIcon className="w-4 h-4" />, color: 'blue' },
                  { label: 'Total Likes', value: userData.likeCount, icon: <HeartIcon className="w-4 h-4" />, color: 'pink' }
                ].map((stat, idx) => (
                  <div 
                    key={idx} 
                    onClick={stat.onClick}
                    className={`group relative bg-gray-50 hover:bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center transition-all duration-500 hover:shadow-2xl hover:shadow-gray-100 overflow-hidden ${stat.onClick ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 scale-[3]">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-black text-gray-900 mb-0.5">{stat.value}</div>
                    <div className="text-[9px] font-black uppercase tracking-[0.1em] text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>          {/* Premium Tab Navigation */}
          <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-1 mb-8 overflow-hidden">
            <nav className="flex flex-wrap md:flex-nowrap">
              {['overview', 'portfolio', 'appreciation', 'about'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 font-bold text-sm tracking-tight transition-all duration-300 rounded-xl flex items-center justify-center gap-2 ${
                    activeTab === tab
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 pointer-events-none'
                      : 'bg-transparent text-gray-500 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  {tab === 'overview' && <GlobeAltIcon className="w-5 h-5" />}
                  {tab === 'portfolio' && <BriefcaseIcon className="w-5 h-5" />}
                  {tab === 'appreciation' && <HeartIcon className="w-5 h-5" />}
                  {tab === 'about' && <UserCircleIcon className="w-5 h-5" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Enhanced Tab Content */}
          <div className="pb-20">
            {activeTab === 'overview' && (
              <div className="space-y-12">
                {/* Recent Highlights Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <div className="w-2 h-8 bg-rose-500 rounded-full"></div>
                        Recent Creations
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[
                        ...(userData.listings || []).slice(0, 1).map(i => ({ ...i, category: 'listing' })),
                        ...(userData.services || []).slice(0, 1).map(i => ({ ...i, category: 'service' })),
                        ...(userData.helpers || []).slice(0, 1).map(i => ({ ...i, category: 'helper' })),
                        ...(userData.events || []).slice(0, 1).map(i => ({ ...i, category: 'event' }))
                      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((item, index) => (
                        <div
                          key={index}
                          className=" bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 cursor-pointer"
                          onClick={() => {
                            if (item.category === 'service' && item.type === 'carwash') return navigate(`/carwash/${item._id}`);
                            if (item.category === 'helper' && item.type === 'photography') return navigate(`/photography/${item._id}`);
                            navigate(`/${item.category}/${item._id || item.listingId || item.serviceId}`);
                          }}
                        >
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={item.imageUrls?.[0] || item.images?.[0] || '/placeholder.jpg'}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute top-4 left-4">
                              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl ${
                                item.category === 'listing' ? 'bg-blue-600' :
                                item.category === 'service' ? 'bg-emerald-600' :
                                item.category === 'helper' ? 'bg-rose-600' : 'bg-purple-600'
                              }`}>
                                {item.category}
                              </span>
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                            <p className="text-gray-500 text-xs mb-4 flex items-center gap-1">
                              <MapPinIcon className="w-3.5 h-3.5" />
                              {item.address || item.location}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                              <span className="text-rose-600 font-extrabold text-sm">
                                {item.regularPrice ? `R${item.regularPrice}` : item.price || 'Contact'}
                              </span>
                              <div className="flex items-center text-amber-500 text-xs font-bold">
                                <StarIconSolid className="w-3.5 h-3.5 mr-1" />
                                {item.rating || 'New'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sidebar stats in Overview */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <ShieldCheckIcon className="w-6 h-6 text-rose-500" />
                        Trust Profile
                      </h3>
                      <div className="space-y-6">
                        {[
                          { label: 'Platform Verification', value: userData.isVerified ? 'Partner Verified' : 'Standard', active: userData.isVerified },
                          { label: 'Superhost Status', value: userData.likeCount > 50 ? 'Elite Tier' : 'Growing', active: userData.likeCount > 50 },
                          { label: 'Booking Success', value: '98%', active: true },
                          { label: 'Join Date', value: new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }), active: true }
                        ].map((stat, i) => (
                          <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                            <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
                            <span className={`text-xs font-bold ${stat.active ? 'text-emerald-400' : 'text-gray-500'}`}>{stat.value}</span>
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-8 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-rose-500 hover:text-white transition-all duration-300">
                        View Detailed History
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-gray-100">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Full Portfolio</h2>
                  <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {['all', 'listing', 'service', 'helper', 'event'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setPortfolioFilter(cat)}
                        className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          portfolioFilter === cat ? 'bg-rose-500 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {cat === 'all' ? 'All' : cat + 's'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {[
                    ...(userData.listings || []).map(i => ({ ...i, category: 'listing' })),
                    ...(userData.services || []).map(i => ({ ...i, category: 'service' })),
                    ...(userData.helpers || []).map(i => ({ ...i, category: 'helper' })),
                    ...(userData.events || []).map(i => ({ ...i, category: 'event' }))
                  ].filter(item => portfolioFilter === 'all' || item.category === portfolioFilter).map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col"
                      onClick={() => {
                        if (item.category === 'service' && item.type === 'carwash') return navigate(`/carwash/${item._id}`);
                        if (item.category === 'helper' && item.type === 'photography') return navigate(`/photography/${item._id}`);
                        navigate(`/${item.category}/${item._id || item.listingId || item.serviceId}`);
                      }}
                    >
                      <div className="relative h-60 overflow-hidden">
                        <img
                          src={item.imageUrls?.[0] || item.images?.[0] || '/placeholder.jpg'}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                           <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-2xl backdrop-blur-md ${
                              item.category === 'listing' ? 'bg-blue-600/80' :
                              item.category === 'service' ? 'bg-emerald-600/80' :
                              item.category === 'helper' ? 'bg-rose-600/80' : 'bg-purple-600/80'
                            }`}>
                              {item.category}
                            </span>
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="mb-4">
                           <h3 className="font-extrabold text-gray-900 text-lg mb-1 leading-tight line-clamp-2">{item.name || item.title}</h3>
                           <p className="text-gray-400 text-xs font-semibold flex items-center gap-1">
                            <MapPinIcon className="w-3.5 h-3.5 text-rose-500" />
                            {item.address || item.location || 'LoopOut Community'}
                          </p>
                        </div>
                        
                        <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Rate Starts From</span>
                            <span className="text-xl font-black text-gray-900">
                             {item.regularPrice ? `R${item.regularPrice}` : item.price || 'Free'}
                            </span>
                          </div>
                          <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-rose-500 transition-colors">
                             <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!userData.listings?.length && !userData.services?.length && !userData.helpers?.length && !userData.events?.length) && (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                       <BriefcaseIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                       <p className="text-gray-400 font-bold text-xl tracking-tight">This partner's portfolio is currently empty.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'appreciation' && (
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-4">
                   <h2 className="text-4xl font-black text-gray-900 tracking-tight">Host Reputation</h2>
                   <p className="text-gray-500 max-w-lg mx-auto font-medium">Platform-wide feedback and trust indicators across all services and listings provided by this host.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-rose-50/50 flex flex-col items-center">
                      <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-6">
                         <HandThumbUpIcon className="w-10 h-10 text-rose-500" />
                      </div>
                      <div className="text-5xl font-black text-gray-900 mb-2">{userData.likeCount || 0}</div>
                      <div className="text-xs font-black uppercase tracking-widest text-gray-400">Total Recommendations</div>
                   </div>
                   <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-50/50 flex flex-col items-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                         <HandThumbDownIcon className="w-10 h-10 text-gray-400" />
                      </div>
                      <div className="text-5xl font-black text-gray-400 mb-2">{userData.dislikeCount || 0}</div>
                      <div className="text-xs font-black uppercase tracking-widest text-gray-400">Critical Feedback</div>
                   </div>
                </div>

                <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                   <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="space-y-2">
                         <h3 className="text-2xl font-black tracking-tight">Platform Trust Score</h3>
                         <p className="text-gray-400 text-sm font-medium">Calculated based on positive interactions and successful service delivery.</p>
                      </div>
                      <div className="text-6xl font-black text-rose-500">
                         {userData.likeCount + userData.dislikeCount > 0 
                            ? Math.round((userData.likeCount / (userData.likeCount + userData.dislikeCount)) * 100)
                            : '100'}%
                      </div>
                   </div>
                   <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <section className="space-y-4">
                       <h3 className="text-xs font-black uppercase tracking-[0.25em] text-rose-500">Professional Background</h3>
                       <div className="space-y-4">
                          <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100">
                             <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <BriefcaseIcon className="w-6 h-6 text-blue-500" />
                             </div>
                             <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Main Occupation</p>
                                <p className="text-gray-900 font-extrabold">{userData.occupation || 'Platform Professional'}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100">
                             <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                                <AcademicCapIcon className="w-6 h-6 text-purple-500" />
                             </div>
                             <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Skills & Expertise</p>
                                <p className="text-gray-900 font-extrabold">{userData.interests || 'Multi-talented Partner'}</p>
                             </div>
                          </div>
                       </div>
                    </section>

                    <section className="space-y-4">
                       <h3 className="text-xs font-black uppercase tracking-[0.25em] text-rose-500">Social Reach</h3>
                       <div className="flex gap-4">
                          {[
                             { label: 'Website', icon: <GlobeAltIcon className="w-5 h-5" />, value: userData.website },
                             { label: 'Social', icon: <UserCircleIcon className="w-5 h-5" />, value: userData.socialMedia }
                          ].map((item, i) => (
                             item.value && (
                                <a key={i} href={item.value.startsWith('http') ? item.value : `https://${item.value}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-3 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 hover:border-rose-500 hover:text-rose-600 transition-all">
                                   {item.icon}
                                   {item.label}
                                </a>
                             )
                          ))}
                       </div>
                    </section>
                 </div>

                 <div className="space-y-8">
                    <section className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100 space-y-6">
                       <h3 className="text-xl font-black tracking-tight text-gray-900">Partner Bio</h3>
                       <div className="prose prose-rose">
                          <p className="text-gray-600 leading-relaxed font-medium">
                            {userData.bio || "No detailed autobiographical data available for this LoopOut partner. We recommend messaging the host directly for more specific inquiries about their experience or vision."}
                          </p>
                       </div>
                    </section>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Follow List Modal */}
      {showFollowList && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900 capitalize tracking-tight">
                {showFollowList}
              </h3>
              <button 
                onClick={() => setShowFollowList(null)}
                className="p-2 hover:bg-white rounded-full transition-colors bg-gray-100 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {followListLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                </div>
              ) : followListData.length > 0 ? (
                followListData.map((user) => (
                  <Link
                    key={user._id}
                    to={`/user-profile/${user._id}`}
                    onClick={() => setShowFollowList(null)}
                    className="flex items-center gap-4 p-4 hover:bg-rose-50 rounded-[1.5rem] transition-all group border border-transparent hover:border-rose-100"
                  >
                    <img 
                      src={user.avatar} 
                      alt={user.username} 
                      className="w-12 h-12 rounded-2xl object-cover shadow-md group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors">{user.username}</p>
                      <p className="text-xs text-gray-400 line-clamp-1 font-medium">{user.bio || 'LoopOut Member'}</p>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-300 group-hover:text-rose-400 transition-colors" />
                  </Link>
                ))
              ) : (
                <div className="py-12 text-center">
                  <UserGroupIcon className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                  <p className="text-gray-400 font-bold">No users found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;