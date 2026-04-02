import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaSuitcaseRolling, FaChevronRight } from 'react-icons/fa';

export default function Trips() {
  const { currentUser } = useSelector((state) => state.user);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/trips/user/${currentUser._id}`);
        const data = await res.json();
        
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        
        setTrips(data);
        setLoading(false);
        setError(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchTrips();
    }
  }, [currentUser]);

  // Format date nicely
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Group trips into Upcoming and Past
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTrips = trips.filter(trip => new Date(trip.endDate) >= today);
  const pastTrips = trips.filter(trip => new Date(trip.endDate) < today);

  const TripCard = ({ trip }) => {
    const tripStart = new Date(trip.startDate);
    const timeDiff = tripStart.getTime() - today.getTime();
    const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    return (
      <Link 
        to={`/trip/${trip._id}`}
        className="block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 relative group"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {trip.name}
              </h3>
              <div className="flex items-center text-gray-500 mt-2 text-sm">
                <FaMapMarkerAlt className="mr-1 text-blue-500" />
                <span>{trip.destination}</span>
              </div>
            </div>
            
            {/* Show tiny countdown badge for very near upcoming trips */}
            {daysUntil > 0 && daysUntil <= 7 && (
              <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                 In {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
              </span>
            )}
            
            <div className="text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
               <FaChevronRight />
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <FaCalendarAlt className="mr-2 text-gray-400" />
            <span className="font-medium">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
          </div>
          
          {trip.stops && trip.stops.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 flex flex-wrap gap-2">
               <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                 {trip.stops.length} {trip.stops.length === 1 ? 'Stop' : 'Stops'}
               </span>
               <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-medium">
                 {trip.stops.reduce((acc, stop) => acc + (stop.events?.length || 0), 0)} Events
               </span>
               <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-medium">
                 {trip.stops.reduce((acc, stop) => acc + (stop.helpers?.length || 0), 0)} Services
               </span>
               <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-medium">
                 {trip.stops.reduce((acc, stop) => acc + (stop.listings?.length || 0), 0)} Stays
               </span>
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Trips</h1>
          <p className="text-gray-500 mt-2">Manage all your upcoming and past itineraries.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-red-100">
            <p className="text-red-500 font-medium">Error loading your trips. Please try again later.</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <FaSuitcaseRolling className="text-3xl text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No trips booked... yet!</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Time to dust off your bags and start planning your next adventure.
            </p>
            <Link 
              to="/plan-trip" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Start searching
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Upcoming Trips Section */}
            {upcomingTrips.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  Upcoming trips
                  <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {upcomingTrips.length}
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingTrips.map((trip) => (
                    <TripCard key={trip._id} trip={trip} />
                  ))}
                </div>
              </section>
            )}

            {/* Past Trips Section */}
            {pastTrips.length > 0 && (
              <section className="pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  Where you've been
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                  {pastTrips.map((trip) => (
                    <TripCard key={trip._id} trip={trip} />
                  ))}
                </div>
              </section>
            )}
            
            <div className="mt-12 text-center">
              <p className="text-gray-500 mb-4">Can't find your reservation here? Visit the Help Center.</p>
              <Link to="/plan-trip" className="text-blue-600 font-semibold hover:underline">
                Plan a new trip
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}