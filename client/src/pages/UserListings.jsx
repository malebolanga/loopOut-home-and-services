import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdLocationOn } from 'react-icons/md';
import { FaEdit, FaTrash, FaBuilding, FaTree, FaMoneyBillWave, FaKey, FaFilter, FaPlus } from 'react-icons/fa';

const ListingTypeConfig = {
  rent: {
    label: 'Long Term Rent',
    icon: <FaKey className="w-4 h-4" />,
    style: 'bg-blue-100 text-blue-800',
  },
  sale: {
    label: 'For Sale',
    icon: <FaMoneyBillWave className="w-4 h-4" />,
    style: 'bg-green-100 text-green-800',
  },
  land: {
    label: 'Land',
    icon: <FaTree className="w-4 h-4" />,
    style: 'bg-amber-100 text-amber-800',
  },
  office: {
    label: 'Office Space',
    icon: <FaBuilding className="w-4 h-4" />,
    style: 'bg-purple-100 text-purple-800',
  },
  over: {
    label: 'Short Term',
    icon: <FaBuilding className="w-4 h-4" />,
    style: 'bg-rose-100 text-rose-800',
  },
};

export default function UserListings() {
  const { currentUser } = useSelector((state) => state.user);
  const [deletingId, setDeletingId] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

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
    }
  };

  const toggleTypeFilter = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
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
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete listing');
      }
  
      // Update UI by removing the deleted listing
      setUserListings(prev => prev.filter(l => l._id !== listingId));
      
      // Optional: Show success message
      alert('Listing deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message || 'Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };
  
  useEffect(() => {
    if (currentUser?._id) fetchListings();
  }, [currentUser]);

  const filteredListings = selectedTypes.length > 0
    ? userListings.filter((l) => selectedTypes.includes(l.type))
    : userListings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Listings</h1>
          <p className="mt-1 text-gray-500">
            {userListings.length} properties • Last updated {new Date().toLocaleDateString()}
          </p>
        </div>
        <Link
            to={`/${currentUser?._id}/create-listing`}
          className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-rose-600 hover:bg-rose-700 transition-colors duration-200"
        >
          <FaPlus className="mr-2 -ml-1 h-4 w-4" />
          Add Property
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-10 py-4 mb-6">
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 text-gray-600">
            <FaFilter className="flex-shrink-0" />
            <span className="font-medium">Filter by:</span>
          </div>
          {Object.entries(ListingTypeConfig).map(([type, config]) => (
            <button
              key={type}
              onClick={() => toggleTypeFilter(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                selectedTypes.includes(type)
                  ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
              }`}
            >
              {config.icon}
              <span className="whitespace-nowrap">{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
        {filteredListings.map((listing) => (
          <div
            key={listing._id}
            className="group relative rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-lg"
          >
            {/* Image */}
            <Link
              to={`/listing/${listing._id}`}
              className="block aspect-square overflow-hidden"
            >
              <img
                src={listing.imageUrls[0] || '/placeholder-property.jpg'}
                alt={listing.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur bg-white/90 ${ListingTypeConfig[listing.type]?.style}`}>
                {ListingTypeConfig[listing.type]?.label}
              </span>
              {listing.offer && (
                <span className="px-3 py-1 text-xs font-medium rounded-full backdrop-blur bg-green-100/90 text-green-800">
                  Special Offer
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Link
                to={`/update-listing/${listing._id}`}
                className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                title="Edit listing"
              >
                <FaEdit className="w-4 h-4 text-gray-600" />
              </Link>
              <button
                onClick={() => handleDelete(listing._id)}
                disabled={deletingId === listing._id}
                className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                title="Delete listing"
              >
                {deletingId === listing._id ? (
                  <span className="block w-4 h-4 animate-pulse">...</span>
                ) : (
                  <FaTrash className="w-4 h-4 text-red-600" />
                )}
              </button>
            </div>

            {/* Details - Removed white background */}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {listing.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-rose-600">
                    R{listing.regularPrice?.toLocaleString()}
                  </span>
                  {listing.type === 'rent' && (
                    <span className="text-sm text-gray-500">/mo</span>
                  )}
                </div>
              </div>

              <p className="mt-2 text-gray-500 text-sm line-clamp-2">
                {listing.description}
              </p>

              <div className="mt-3 flex items-center gap-1 text-sm text-gray-500">
                <MdLocationOn className="text-rose-500 flex-shrink-0" />
                <span className="truncate">{listing.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredListings.length === 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-6 text-rose-500">
              <FaBuilding className="w-16 h-16 mx-auto opacity-30" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {userListings.length === 0 ? 'No properties yet' : 'No matches found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {userListings.length === 0
                ? 'Create your first listing to get started'
                : 'Try adjusting your filters or create a new listing'}
            </p>
            <Link
              to="/create-listing"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              <FaPlus className="mr-2 -ml-1 h-4 w-4" />
              Create Listing
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}