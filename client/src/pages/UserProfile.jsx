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
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

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

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleMessage = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate(`/messages/${id}`);
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
          src={userData.coverPhoto}
          alt="Cover"
          className="w-full h-full object-cover"
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
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative -mt-24 md:-mt-32">
              <div className="relative">
                <img
                  src={userData.avatar}
                  alt={userData.fullName}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white shadow-lg object-cover"
                />
                {userData.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full">
                    <CheckBadgeIcon className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {userData.username || 'User'}
                    </h1>
                    {(userData.likeCount > 50) && (
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                        <StarIcon className="w-3 h-3 mr-1" />
                        Top Rated
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <StarIconSolid className="w-5 h-5 text-amber-500 mr-1" />
                      <span className="font-medium">
                        {userData.likeCount + userData.dislikeCount > 0 
                          ? ((userData.likeCount / (userData.likeCount + userData.dislikeCount)) * 5).toFixed(1) 
                          : '0.0'}
                      </span>
                      <span className="text-gray-500 ml-1">
                        ({userData.likeCount} likes)
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="w-5 h-5 mr-2" />
                      {userData.location || 'Unknown Location'}
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2" />
                      Joined {new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mb-6">
                  {currentUser?._id !== id && (
                    <>
                      <button
                        onClick={handleFollow}
                        className={`px-6 py-2.5 rounded-full font-medium transition-all hover:shadow-lg ${
                          isFollowing
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-gradient-to-br from-pink-500 to-purple-600 text-white'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                      <button
                        onClick={handleMessage}
                        className="px-6 py-2.5 border-2 border-gray-300 rounded-full font-medium hover:border-pink-500 hover:text-pink-600 transition-colors"
                      >
                        Message
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Profile link copied to clipboard!');
                    }}
                    className="p-2.5 border border-gray-300 rounded-full hover:border-pink-500 hover:text-pink-600 transition-colors"
                    title="Share Profile"
                  >
                    <GlobeAltIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 border border-gray-300 rounded-full hover:border-pink-500 hover:text-pink-600 transition-colors">
                    <HeartIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                {userData.bio || 'This user hasn\'t added a bio yet.'}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-300">
                  <div className="text-2xl font-bold text-gray-900">{userData.followers || 0}</div>
                  <div className="text-gray-600 text-sm">Followers</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-300">
                  <div className="text-2xl font-bold text-gray-900">{userData.following || 0}</div>
                  <div className="text-gray-600 text-sm">Following</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-300">
                  <div className="text-2xl font-bold text-gray-900">
                    {(userData.listings?.length || 0) + (userData.services?.length || 0) + (userData.helpers?.length || 0) + (userData.events?.length || 0)}
                  </div>
                  <div className="text-gray-600 text-sm">Total Items</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-300">
                  <div className="text-2xl font-bold text-gray-900">
                    {userData.likeCount}
                  </div>
                  <div className="text-gray-600 text-sm">Likes</div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['Verified ID', userData.likeCount > 10 ? 'Popular' : 'Newcomer'].map((badge, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700"
                  >
                    <ShieldCheckIcon className="w-4 h-4 mr-1.5" />
                    {badge}
                  </span>
                ))}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-pink-600" />
                  <span className="text-gray-700">{userData.email || 'Private Email'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-pink-600" />
                  <span className="text-gray-700">{userData.phone || 'No Phone'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <GlobeAltIcon className="w-5 h-5 text-pink-600" />
                  <span className="text-gray-700">Occupation: {userData.occupation || 'Member'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 border-b border-gray-200">
            <nav className="flex space-x-8">
              {['overview', 'listings', 'reviews', 'about'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                  {/* About Me */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <UserGroupIcon className="w-6 h-6 mr-3 text-pink-600" />
                      Work & Education
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <BriefcaseIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500">Occupation</div>
                          <div className="font-medium">{userData.occupation || 'Not specified'}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500">Education</div>
                          <div className="font-medium">{userData.education || 'Not specified'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recognition */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <CheckBadgeIcon className="w-6 h-6 mr-3 text-pink-600" />
                      Trust & Verification
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Identity Verified:</span>
                        <span className="font-bold text-green-600">Yes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Response time:</span>
                        <span className="font-bold">Fast responder</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Featured Items */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Creations</h3>
                  <div className="space-y-4">
                    {[
                      ...(userData.listings || []).slice(0, 1),
                      ...(userData.services || []).slice(0, 1),
                      ...(userData.helpers || []).slice(0, 1),
                      ...(userData.events || []).slice(0, 1)
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                        onClick={() => navigate(`/${item.type || 'listing'}/${item._id}`)}
                      >
                        <div className="flex">
                          <div className="w-32 h-32 flex-shrink-0">
                            <img
                              src={item.imageUrls?.[0] || item.images?.[0] || '/placeholder.jpg'}
                              alt={item.name || item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-gray-900 line-clamp-1">{item.name || item.title}</h4>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{item.address || item.city || item.location}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs bg-gray-100 font-semibold px-2 py-1 rounded capitalize text-gray-700">
                                {item.type || 'Listing'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!userData.listings?.length && !userData.services?.length && !userData.helpers?.length && !userData.events?.length) && (
                      <p className="text-gray-500 italic">No public items shared yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'listings' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Public Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    ...(userData.listings || []).map(i => ({ ...i, category: 'listing' })),
                    ...(userData.services || []).map(i => ({ ...i, category: 'service' })),
                    ...(userData.helpers || []).map(i => ({ ...i, category: 'helper' })),
                    ...(userData.events || []).map(i => ({ ...i, category: 'event' }))
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 flex flex-col"
                      onClick={() => navigate(`/${item.category}/${item._id}`)}
                    >
                      <img
                        src={item.imageUrls?.[0] || item.images?.[0] || '/placeholder.jpg'}
                        alt={item.name || item.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900 line-clamp-1">{item.name || item.title}</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{item.address || item.city || item.location}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-xs bg-pink-100 text-pink-700 font-bold px-2 py-1 rounded capitalize">
                            {item.category}
                          </span>
                          <span className="text-pink-600 font-bold">
                            {item.regularPrice ? `$${item.regularPrice}` : item.price || 'Free'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-h-[600px] overflow-y-auto pr-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">User Appreciation</h2>
                  <div className="flex items-center">
                    <HeartIcon className="w-6 h-6 text-pink-500 mr-2" />
                    <span className="text-2xl font-bold">{userData.likeCount || 0}</span>
                    <span className="text-gray-500 ml-2">Total Likes</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-600 mb-4 text-lg">
                      Reviews for this user are spread across their specific listings and services.
                    </p>
                    <div className="flex justify-center space-x-8">
                       <div className="text-center">
                          <div className="text-3xl font-bold text-pink-600">{userData.likeCount || 0}</div>
                          <div className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Positive Hits</div>
                       </div>
                       <div className="text-center">
                          <div className="text-3xl font-bold text-gray-400">{userData.dislikeCount || 0}</div>
                          <div className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Dislikes</div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Bio & Background</h2>
                  <div className="prose prose-pink max-w-none">
                    <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                      {userData.bio || "No detailed bio provided yet."}
                    </p>
                    {userData.occupation && (
                      <p className="text-gray-700 mb-4">
                        Working as a <strong>{userData.occupation}</strong>.
                      </p>
                    )}
                    {userData.location && (
                      <p className="text-gray-700">
                        Based in <strong>{userData.location}</strong>.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                   <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                    <h3 className="text-xl font-bold mb-4 border-b border-white/20 pb-2">Activity Overview</h3>
                    <ul className="space-y-4">
                      <li className="flex justify-between items-center">
                        <span className="opacity-90">Joined</span>
                        <span className="font-bold">{new Date(userData.createdAt).getFullYear()}</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span className="opacity-90">Hostings</span>
                        <span className="font-bold">{userData.listings?.length || 0}</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span className="opacity-90">Services</span>
                        <span className="font-bold">{userData.services?.length || 0}</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span className="opacity-90">Total Likes</span>
                        <span className="font-bold">{userData.likeCount}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;