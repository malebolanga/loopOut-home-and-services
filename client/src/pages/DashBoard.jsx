
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  FaCalendar,
  FaUser,
  FaPhone,
  
  FaClock,
  FaCheck,
  FaTimes,
  FaHome,
  FaCut,
  FaUtensils,
  FaSearch,
 
  FaWhatsapp,
  FaMapMarkerAlt,
  FaStar
} from 'react-icons/fa';

// Mock data for demo
const mockBookings = [
  {
    _id: '1',
    type: 'listing',
    itemId: 'prop1',
    clientName: 'John Smith',
    clientPhone: '0712345678',
    date: '2024-12-20',
    time: '14:00',
    location: '123 Main St, Johannesburg',
    specialRequirements: 'Need parking space',
    totalAmount: 2500,
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
    listingDetails: {
      name: 'Modern Apartment in Sandton',
      address: '123 Main St, Johannesburg',
      type: 'rent',
      regularPrice: 2500
    }
  },
  {
    _id: '2',
    type: 'helper',
    itemId: 'helper1',
    clientName: 'Sarah Johnson',
    clientPhone: '0823456789',
    selectedServices: ['haircut', 'beardTrim'],
    date: '2024-12-18',
    time: '10:00',
    location: 'Come to Client - 456 Oak Ave, Pretoria',
    specialRequirements: 'Skin sensitivity to certain products',
    totalAmount: 180,
    status: 'confirmed',
    createdAt: '2024-01-14T15:45:00Z',
    helperDetails: {
      name: 'Mike the Barber',
      type: 'barber',
      regularPrice: 150,
      travelFee: 30,
      address: '789 Barber St, Pretoria'
    }
  },
  {
    _id: '3',
    type: 'helper',
    itemId: 'helper2',
    clientName: 'David Wilson',
    clientPhone: '0834567890',
    selectedServices: ['mealPrep'],
    date: '2024-12-22',
    time: '18:00',
    location: "Chef's Kitchen",
    specialRequirements: 'Vegetarian meals only',
    totalAmount: 400,
    status: 'pending',
    createdAt: '2024-01-16T09:15:00Z',
    helperDetails: {
      name: 'Chef Maria',
      type: 'chef',
      regularPrice: 400,
      address: '55 Food Court, Cape Town'
    }
  },
  {
    _id: '4',
    type: 'listing',
    itemId: 'prop2',
    clientName: 'Emma Davis',
    clientPhone: '0745678901',
    date: '2024-12-25',
    time: '16:00',
    location: '78 Beach Road, Durban',
    specialRequirements: 'Late check-in at 8 PM',
    totalAmount: 1800,
    status: 'completed',
    createdAt: '2024-01-10T14:20:00Z',
    listingDetails: {
      name: 'Beachfront Villa',
      address: '78 Beach Road, Durban',
      type: 'over',
      regularPrice: 1800
    }
  }
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200'
};

const typeIcons = {
  listing: FaHome,
  helper: FaUser
};

const helperTypeIcons = {
  barber: FaCut,
  chef: FaUtensils,
  beauty: FaStar,
  domestic: FaHome,
  maid: FaHome,
  tutor: FaUser,
  tattoo: FaStar
};

export default function DemoDashboard() {
  const [bookings, setBookings] = useState(mockBookings);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Simulate API call
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.clientPhone.includes(searchTerm) ||
                         (booking.listingDetails?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (booking.helperDetails?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings(prev => prev.map(booking =>
      booking._id === bookingId ? { ...booking, status: newStatus } : booking
    ));
  };

  const getServiceType = (booking) => {
    if (booking.type === 'listing') {
      return booking.listingDetails?.type === 'over' ? 'Overnight Stay' : 'Property Rental';
    } else {
      const helperType = booking.helperDetails?.type;
      const typeNames = {
        barber: 'Barber Service',
        chef: 'Chef Service',
        beauty: 'Beauty Service',
        domestic: 'Domestic Help',
        maid: 'Cleaning Service',
        tutor: 'Tutoring',
        tattoo: 'Tattoo Art'
      };
      return typeNames[helperType] || 'Professional Service';
    }
  };

  const getServiceIcon = (booking) => {
    if (booking.type === 'listing') {
      const Icon = typeIcons.listing;
      return <Icon className="text-blue-500" />;
    } else {
      const helperType = booking.helperDetails?.type;
      const Icon = helperTypeIcons[helperType] || FaUser;
      return <Icon className="text-green-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage all your property and service bookings in one place
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaCalendar className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCheck className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaCheck className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Bookings
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'pending' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'confirmed' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'completed' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
            </div>

            <div className="relative w-full lg:w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <FaCalendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No bookings found</h3>
              <p className="mt-2 text-gray-500">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Your bookings will appear here when clients book through WhatsApp'
                }
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {getServiceIcon(booking)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {booking.type === 'listing' 
                              ? booking.listingDetails?.name 
                              : booking.helperDetails?.name
                            }
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[booking.status]}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-gray-600">{getServiceType(booking)}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Booked {getTimeAgo(booking.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        R{booking.totalAmount}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.type === 'listing' ? 'Total amount' : 'Service fee'}
                      </p>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FaUser className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Client</p>
                        <p className="font-medium">{booking.clientName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <FaPhone className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{booking.clientPhone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <FaCalendar className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date & Time</p>
                        <p className="font-medium">
                          {formatDate(booking.date)} at {booking.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <FaMapMarkerAlt className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium truncate">{booking.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Services & Requirements */}
                  {(booking.selectedServices?.length > 0 || booking.specialRequirements) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {booking.selectedServices?.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Services</p>
                          <div className="flex flex-wrap gap-2">
                            {booking.selectedServices.map((service, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {booking.specialRequirements && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Special Requirements</p>
                          <p className="text-gray-900">{booking.specialRequirements}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {booking.status === 'pending' && (
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FaCheck /> Confirm Booking
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <FaTimes /> Decline
                      </button>
                      <a
                        href={`https://wa.me/${booking.clientPhone.replace(/^0/, '27')}?text=${encodeURIComponent(`Hi ${booking.clientName}, I'm following up on your booking for ${booking.type === 'listing' ? booking.listingDetails?.name : booking.helperDetails?.name}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <FaWhatsapp /> WhatsApp Client
                      </a>
                    </div>
                  )}

                  {booking.status === 'confirmed' && (
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'completed')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaCheck /> Mark as Completed
                      </button>
                      <a
                        href={`https://wa.me/${booking.clientPhone.replace(/^0/, '27')}?text=${encodeURIComponent(`Hi ${booking.clientName}, I'm confirming your booking for tomorrow at ${booking.time}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <FaWhatsapp /> Send Reminder
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Demo Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Demo Information</h3>
          <p className="text-blue-700">
            This is a demo dashboard showing how WhatsApp bookings would appear. In a real application, 
            these bookings would be automatically saved when clients book through your WhatsApp integration.
          </p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-600">
            <div>
              <strong>Features demonstrated:</strong>
              <ul className="list-disc list-inside mt-1">
                <li>Booking management for properties and services</li>
                <li>Status tracking (pending, confirmed, completed)</li>
                <li>Client communication via WhatsApp</li>
                <li>Search and filter functionality</li>
              </ul>
            </div>
            <div>
              <strong>Try these actions:</strong>
              <ul className="list-disc list-inside mt-1">
                <li>Filter by status using the buttons above</li>
                <li>Search for client names or phone numbers</li>
                <li>Update booking status (Confirm/Decline)</li>
                <li>Click WhatsApp buttons to message clients</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}