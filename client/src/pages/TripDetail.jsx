import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaHome, FaMusic, FaTools } from 'react-icons/fa';
import ImageWithFallback from '../components/ImageWithFallback';

const TripDetails = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [daysUntilTrip, setDaysUntilTrip] = useState(null);
  const [hoursUntilDeparture, setHoursUntilDeparture] = useState(null);
  const [showReminder, setShowReminder] = useState(false);
  const [show24hReminder, setShow24hReminder] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/trips/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch trip');
        }
        
        setTrip(data);
      } catch (err) {
        console.error('Error fetching trip:', err);
        setError(err.message || 'Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrip();
  }, [id]);

  // Calculate time until trip and set reminders
  useEffect(() => {
    if (!trip) return;
    
    const calculateTimeUntilTrip = () => {
      const now = new Date();
      const startDate = new Date(trip.startDate);
      const timeDiff = startDate.getTime() - now.getTime();
      
      // Calculate days
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      setDaysUntilTrip(daysDiff);
      
      // Calculate hours
      const hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));
      setHoursUntilDeparture(hoursDiff);
      
      // Show 6-hour reminder
      if (hoursDiff <= 6 && hoursDiff > 0) {
        setShowReminder(true);
      }
      
      // Show 24-hour reminder (only when between 7-24 hours)
      if (hoursDiff <= 24 && hoursDiff > 6) {
        setShow24hReminder(true);
      }
    };
    
    calculateTimeUntilTrip();
    const interval = setInterval(calculateTimeUntilTrip, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [trip]);

  // Auto-hide reminders after 10 seconds
  useEffect(() => {
    if (!showReminder && !show24hReminder) return;
    
    const timer = setTimeout(() => {
      setShowReminder(false);
      setShow24hReminder(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [showReminder, show24hReminder]);

  // Component for expandable text
  const ExpandableText = ({ text, maxLength = 150 }) => {
    const [expanded, setExpanded] = useState(false);
    
    if (!text) return null;
    
    if (text.length <= maxLength) {
      return <p className="text-sm text-gray-600 dark:text-white mt-2">{text}</p>;
    }
    
    return (
      <div>
        <p className="text-sm text-gray-600 dark:text-white mt-2">
          {expanded ? text : `${text.substring(0, maxLength)}...`}
        </p>
        <button 
          className="text-blue-500 text-sm mt-1 font-medium"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-white">Loading your trip details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Trip</h2>
          <p className="text-gray-700 dark:text-white mb-6">{error}</p>
          <Link 
            to="/" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Trip Not Found</h2>
          <p className="text-gray-700 dark:text-white mb-6">The trip you re looking for doesn t exist or has been deleted.</p>
          <Link 
            to="/" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Plan a New Trip
          </Link>
        </div>
      </div>
    );
  }

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen from-blue-50 to-indigo-100 py-8 px-4">
      {/* Reminder Notifications */}
      {showReminder && (
        <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4 border-l-4 border-red-500 max-w-md animate-fadeIn">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Departure Soon!</h3>
              <p className="text-gray-700 dark:text-white mt-1">
                Your trip to {trip.destination} starts in less than 6 hours.
                Time to get ready!
              </p>
            </div>
            <button 
              onClick={() => setShowReminder(false)}
              className="text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-white ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {show24hReminder && (
        <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4 border-l-4 border-blue-500 max-w-md animate-fadeIn">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Trip Starts Tomorrow!</h3>
              <p className="text-gray-700 dark:text-white mt-1">
                Your trip to {trip.destination} starts in 24 hours.
                Don t forget to pack!
              </p>
            </div>
            <button 
              onClick={() => setShow24hReminder(false)}
              className="text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-white ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              {trip.name}
            </h1>
            
            {/* Countdown Section */}
            {daysUntilTrip !== null && daysUntilTrip > 0 && (
              <div className="mt-4 inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-6 rounded-full shadow-md">
                <span className="font-bold">Trip starts in:</span> {daysUntilTrip} {daysUntilTrip === 1 ? 'day' : 'days'}
              </div>
            )}
            
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <div className="flex items-center text-gray-700 dark:text-white">
                <FaMapMarkerAlt className="text-blue-600 mr-2" />
                <span>{trip.destination}</span>
              </div>
              <div className="flex items-center text-gray-700 dark:text-white">
                <FaCalendarAlt className="text-blue-600 mr-2" />
                <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
              </div>
            </div>
          </div>

          {trip.description && (
            <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-bold text-lg text-blue-800 mb-2">Trip Description</h3>
              <p className="text-gray-700 dark:text-white">{trip.description}</p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Trip Itinerary</h2>
            
            {trip.stops.map((stop, index) => (
              <div key={index} className="mb-10 last:mb-0">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {stop.location} - {formatDate(stop.date)}
                  </h3>
                </div>

                {/* Events Section */}
                {stop.events.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <FaMusic className="text-purple-600 text-xl mr-2" />
                      <h4 className="font-bold text-lg text-gray-800 dark:text-white">Events</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stop.events.map(event => (
                        <div key={event._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-md">
                          {event.imageUrls && event.imageUrls.length > 0 && (
                            <div className="h-48 overflow-hidden">
                              <ImageWithFallback 
                                src={event.imageUrls[0]} 
                                alt={event.name} 
                                className="w-full h-full object-cover"
                                type="event"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h5 className="font-bold text-gray-900 dark:text-white">{event.name}</h5>
                            <p className="text-sm text-purple-600 font-medium capitalize">
                              {event.type} • {formatDate(event.date)}
                            </p>
                            <ExpandableText text={event.description} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Helpers Section */}
                {stop.helpers.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <FaTools className="text-green-600 text-xl mr-2" />
                      <h4 className="font-bold text-lg text-gray-800 dark:text-white">Services</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stop.helpers.map(helper => (
                        <div key={helper._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-md">
                          {helper.imageUrls && helper.imageUrls.length > 0 && (
                            <div className="h-48 overflow-hidden">
                              <ImageWithFallback 
                                src={helper.imageUrls[0]} 
                                alt={helper.name} 
                                className="w-full h-full object-cover"
                                type="service"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h5 className="font-bold text-gray-900 dark:text-white">{helper.name}</h5>
                            <p className="text-sm text-green-600 font-medium capitalize">
                              {helper.type} • R{helper.regularPrice}
                            </p>
                            <ExpandableText text={helper.description} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Listings Section */}
                {stop.listings.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <FaHome className="text-blue-600 text-xl mr-2" />
                      <h4 className="font-bold text-lg text-gray-800 dark:text-white">Accommodations</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stop.listings.map(listing => (
                        <div key={listing._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-md">
                          {listing.imageUrls && listing.imageUrls.length > 0 && (
                            <div className="h-48 overflow-hidden">
                              <ImageWithFallback 
                                src={listing.imageUrls[0]} 
                                alt={listing.name} 
                                className="w-full h-full object-cover"
                                type="property"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h5 className="font-bold text-gray-900 dark:text-white">{listing.name}</h5>
                            <p className="text-sm text-blue-600 font-medium">
                              {listing.bedrooms} {listing.bedrooms === 1 ? 'bed' : 'beds'} • 
                              {listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'} • 
                              R{listing.regularPrice}/night
                            </p>
                            <ExpandableText text={listing.description} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {stop.events.length === 0 && stop.helpers.length === 0 && stop.listings.length === 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-800">
                    <p className="text-gray-500 dark:text-white">No activities planned for this stop</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Link 
            to="/" 
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-800 shadow-md"
          >
            Plan Another Trip
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
