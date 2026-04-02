import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHome, FiMapPin, FiDollarSign, FiBed, FiShower } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';

export default function UserListings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data
        const userRes = await fetch(`/api/user/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        if (!userRes.ok) throw new Error('Failed to fetch user data');
        const userData = await userRes.json();
        setUser(userData);
        
        // Fetch listings
        const listingsRes = await fetch(`/api/user/listings/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        if (!listingsRes.ok) throw new Error('Failed to fetch listings');
        const listingsData = await listingsRes.json();
        setListings(listingsData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4 mx-auto" />
          <p className="text-lg text-gray-700">Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <FiArrowLeft className="mr-2" /> Back to Users
          </button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.username} s Listings
              </h1>
              <p className="text-gray-600 mt-2">
                {listings.length} {listings.length === 1 ? 'listing' : 'listings'} available
              </p>
            </div>
            
            <div className="flex items-center mt-4 md:mt-0">
              <img 
                src={user?.avatar} 
                alt={user?.username} 
                className="w-12 h-12 rounded-full border-2 border-white shadow-md"
              />
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">{user?.username}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <FiHome className="mx-auto text-5xl text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Listings Found</h3>
            <p className="text-gray-600 mb-6">
              {user?.username} hasn t created any property listings yet.
            </p>
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Browse Other Users
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <div 
                key={listing._id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative">
                  {listing.imageUrls && listing.imageUrls.length > 0 ? (
                    <img 
                      src={listing.imageUrls[0]} 
                      alt={listing.name} 
                      className="w-full h-56 object-cover"
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-56 flex items-center justify-center">
                      <FiHome className="text-4xl text-gray-400" />
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ${listing.regularPrice.toLocaleString()}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{listing.name}</h3>
                  <p className="text-gray-600 mb-4 flex items-center">
                    <FiMapPin className="mr-2 text-gray-500" />
                    {listing.address}
                  </p>
                  
                  <div className="flex justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center text-gray-600">
                      <FiBed className="mr-1" />
                      {listing.bedrooms} {listing.bedrooms === 1 ? 'Bed' : 'Beds'}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiShower className="mr-1" />
                      {listing.bathrooms} {listing.bathrooms === 1 ? 'Bath' : 'Baths'}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiDollarSign className="mr-1" />
                      {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
                    </div>
                  </div>
                  
                  <Link 
                    to={`/listing/${listing._id}`}
                    className="mt-6 inline-block w-full text-center py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}