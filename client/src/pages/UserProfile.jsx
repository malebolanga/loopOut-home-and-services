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

  // Mock user data
  const mockUserData = {
    _id: id,
    username: 'johndoe',
    email: 'john@example.com',
    fullName: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    bio: 'Digital nomad and adventure seeker. Love hiking, photography, and meeting new people from around the world. Always up for a good conversation over coffee!',
    location: 'San Francisco, CA',
    joinedDate: '2024-01-15',
    verified: true,
    rating: 4.8,
    reviewsCount: 127,
    hostingSince: '2023-05-20',
    languages: ['English', 'Spanish', 'French'],
    occupation: 'Software Engineer',
    company: 'Tech Corp',
    education: 'Stanford University',
    superhost: true,
    responseRate: 98,
    responseTime: 'within an hour',
    followers: 245,
    following: 189,
    listings: [
      {
        id: 1,
        title: 'Modern Downtown Loft',
        location: 'San Francisco',
        price: '$189/night',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        type: 'Apartment'
      },
      {
        id: 2,
        title: 'Beachfront Villa',
        location: 'Miami',
        price: '$320/night',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        type: 'Villa'
      }
    ],
    reviews: [
      {
        id: 1,
        reviewerName: 'Sarah M.',
        reviewerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        rating: 5,
        date: '2024-02-15',
        comment: 'John was an amazing host! His place was exactly as described and he provided great recommendations for local restaurants.',
        listing: 'Modern Downtown Loft'
      },
      {
        id: 2,
        reviewerName: 'Michael T.',
        reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        rating: 4,
        date: '2024-02-10',
        comment: 'Great communication and very accommodating. The location was perfect for exploring the city.',
        listing: 'Modern Downtown Loft'
      }
    ],
    badges: ['Superhost', 'Verified ID', 'Quick Responder', '5-Star Host']
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error('Invalid user ID');
        }
        
        setUserData(mockUserData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
                      {userData.fullName}
                    </h1>
                    {userData.superhost && (
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                        <StarIcon className="w-3 h-3 mr-1" />
                        Superhost
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <StarIconSolid className="w-5 h-5 text-amber-500 mr-1" />
                      <span className="font-medium">{userData.rating}</span>
                      <span className="text-gray-500 ml-1">({userData.reviewsCount} reviews)</span>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="w-5 h-5 mr-2" />
                      {userData.location}
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2" />
                      Joined {new Date(userData.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mb-6">
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
                  <button className="p-2.5 border border-gray-300 rounded-full hover:border-pink-500 hover:text-pink-600 transition-colors">
                    <HeartIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                {userData.bio}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-300">
                  <div className="text-2xl font-bold text-gray-900">{userData.followers}</div>
                  <div className="text-gray-600 text-sm">Followers</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-300">
                  <div className="text-2xl font-bold text-gray-900">{userData.following}</div>
                  <div className="text-gray-600 text-sm">Following</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-300">
                  <div className="text-2xl font-bold text-gray-90">{userData.listings.length}</div>
                  <div className="text-gray-600 text-sm">Listings</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-300">
                  <div className="text-2xl font-bold text-gray-900">{userData.responseRate}%</div>
                  <div className="text-gray-600 text-sm">Response Rate</div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {userData.badges.map((badge, index) => (
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
                  <span className="text-gray-700">{userData.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-pink-600" />
                  <span className="text-gray-700">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <GlobeAltIcon className="w-5 h-5 text-pink-600" />
                  <span className="text-gray-700">Speaks: {userData.languages.join(', ')}</span>
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
                      About Me
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <BriefcaseIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500">Occupation</div>
                          <div className="font-medium">{userData.occupation}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500">Company</div>
                          <div className="font-medium">{userData.company}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500">Education</div>
                          <div className="font-medium">{userData.education}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Response Info */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <ChatBubbleLeftRightIcon className="w-6 h-6 mr-3 text-pink-600" />
                      Response Info
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Response rate:</span>
                        <span className="font-bold text-green-600">{userData.responseRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Response time:</span>
                        <span className="font-bold">{userData.responseTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Featured Listings */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Featured Listings</h3>
                  <div className="space-y-4">
                    {userData.listings.map((listing) => (
                      <div
                        key={listing.id}
                        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                      >
                        <div className="flex">
                          <div className="w-32 h-32 flex-shrink-0">
                            <img
                              src={listing.image}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-gray-900">{listing.title}</h4>
                              <span className="text-pink-600 font-bold">{listing.price}</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{listing.location}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {listing.type}
                              </span>
                              <div className="flex items-center">
                                <StarIconSolid className="w-4 h-4 text-amber-500 mr-1" />
                                <span className="font-medium">{listing.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'listings' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">All Listings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userData.listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                      onClick={() => navigate(`/listing/${listing.id}`)}
                    >
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900">{listing.title}</h3>
                          <span className="text-pink-600 font-bold">{listing.price}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{listing.location}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {listing.type}
                          </span>
                          <div className="flex items-center">
                            <StarIconSolid className="w-4 h-4 text-amber-500 mr-1" />
                            <span className="font-medium">{listing.rating}</span>
                          </div>
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
                  <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                  <div className="flex items-center">
                    <StarIconSolid className="w-6 h-6 text-amber-500 mr-2" />
                    <span className="text-2xl font-bold">{userData.rating}</span>
                    <span className="text-gray-500 ml-2">({userData.reviewsCount} reviews)</span>
                  </div>
                </div>
                <div className="space-y-6">
                  {userData.reviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-start space-x-4 mb-4">
                        <img
                          src={review.reviewerAvatar}
                          alt={review.reviewerName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-gray-900">{review.reviewerName}</h4>
                              <p className="text-gray-500 text-sm">Reviewed {review.listing}</p>
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <StarIconSolid
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'text-amber-500' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 mt-3">{review.comment}</p>
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-gray-400 text-sm">
                              {new Date(review.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">More About {userData.fullName}</h2>
                  <div className="prose prose-pink max-w-none">
                    <p className="text-gray-700 mb-4">
                      {userData.fullName} is an experienced host who takes great pride in providing exceptional
                      hospitality to all guests. With a background in {userData.occupation?.toLowerCase()}, 
                      attention to detail and customer satisfaction are top priorities.
                    </p>
                    <p className="text-gray-700 mb-4">
                      Living in {userData.location}, {userData.fullName} has extensive knowledge of the local area
                      and is always happy to share recommendations for restaurants, attractions, and hidden gems.
                    </p>
                    <p className="text-gray-700">
                      When not hosting, you can find {userData.fullName.split(' ')[0]} exploring the outdoors,
                      practicing photography, or experimenting with new recipes in the kitchen.
                    </p>
                  </div>
                </div>
                <div>
                  <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-6 text-white">
                    <h3 className="text-xl font-bold mb-4">Hosting Stats</h3>
                    <ul className="space-y-4">
                      <li className="flex justify-between items-center">
                        <span>Listings</span>
                        <span className="font-bold">{userData.listings.length}</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Total Reviews</span>
                        <span className="font-bold">{userData.reviewsCount}</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Average Rating</span>
                        <span className="font-bold">{userData.rating}</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Hosting Since</span>
                        <span className="font-bold">
                          {new Date(userData.hostingSince).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
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