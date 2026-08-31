import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  MapPinIcon, 
  BriefcaseIcon, 
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Sparkles } from 'lucide-react';

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
  }, [currentUser?._id]);

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
        className="block bg-transparent border border-slate-200 dark:border-gray-800/50 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-500 relative group"
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-rose-600 transition-colors tracking-tight italic">
                {trip.name}
              </h3>
              <div className="flex items-center text-gray-500 dark:text-white mt-2 text-sm font-medium">
                <MapPinIcon className="w-4 h-4 mr-1.5 text-rose-500" />
                <span>{trip.destination}</span>
              </div>
            </div>
            
            {/* Show tiny countdown badge for very near upcoming trips */}
            {daysUntil > 0 && daysUntil <= 7 && (
              <span className="bg-rose-100/80 backdrop-blur-sm text-rose-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl shadow-sm">
                 In {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
              </span>
            )}
            
            <div className="text-gray-400 group-hover:text-rose-500 transform group-hover:translate-x-1 transition-all">
               <ChevronRightIcon className="w-6 h-6" />
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-white text-xs font-bold mt-4 bg-slate-50 dark:bg-gray-950/50 p-4 rounded-2xl border border-slate-200 dark:border-gray-800/30">
            <CalendarIcon className="w-4 h-4 mr-2 text-rose-500" />
            <span className="uppercase tracking-widest">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
          </div>
          
          {trip.stops && trip.stops.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-gray-800/50 text-[10px] font-black uppercase tracking-widest text-gray-400 flex flex-wrap gap-2">
               <span className="bg-white/80 border border-slate-100 dark:border-gray-800 px-3 py-1.5 rounded-xl shadow-sm">
                 {trip.stops.length} {trip.stops.length === 1 ? 'Stop' : 'Stops'}
               </span>
               <span className="bg-white/80 border border-slate-100 dark:border-gray-800 px-3 py-1.5 rounded-xl shadow-sm">
                 {trip.stops.reduce((acc, stop) => acc + (stop.events?.length || 0), 0)} Events
               </span>
               <span className="bg-white/80 border border-slate-100 dark:border-gray-800 px-3 py-1.5 rounded-xl shadow-sm">
                 {trip.stops.reduce((acc, stop) => acc + (stop.helpers?.length || 0), 0)} Services
               </span>
               <span className="bg-white/80 border border-slate-100 dark:border-gray-800 px-3 py-1.5 rounded-xl shadow-sm">
                 {trip.stops.reduce((acc, stop) => acc + (stop.listings?.length || 0), 0)} Stays
               </span>
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen py-16 px-6 sm:px-10 lg:px-16 bg-slate-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 mb-4 block italic">Deployment Vault</span>
          <h1 className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter italic">Personal Expeditions</h1>
          <p className="text-gray-500 dark:text-white mt-4 text-lg font-medium max-w-2xl">Manage all your upcoming and past itineraries in the loopOut Masterpiece ecosystem.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white/50 rounded-[3rem] border border-rose-100 shadow-sm">
            <p className="text-rose-500 font-black italic tracking-tight text-xl uppercase">Neural Interface Error. Failed to load vault.</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-32 bg-white/50 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-gray-800/50">
            <div className="bg-rose-50 w-24 h-24 rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
               <BriefcaseIcon className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter italic">No expeditions found... yet!</h2>
            <p className="text-gray-500 dark:text-white mb-12 max-w-md mx-auto font-medium">
              Time to dust off your bags and start planning your next Masterpiece adventure.
            </p>
            <Link 
              to="/trip" 
              className="inline-flex items-center px-10 py-5 bg-gray-950 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-rose-500 transition-all active:scale-95 shadow-2xl"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Initialize Architect
            </Link>
          </div>
        ) : (
          <div className="space-y-20 pb-40">
            {/* Upcoming Trips Section */}
            {upcomingTrips.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-2 h-10 bg-rose-500 rounded-full" />
                   <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter italic uppercase">
                    Active Deployments
                    <span className="ml-4 text-sm font-black text-rose-500 border border-rose-200 px-3 py-1 rounded-full align-middle">
                      {upcomingTrips.length}
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {upcomingTrips.map((trip) => (
                    <TripCard key={trip._id} trip={trip} />
                  ))}
                </div>
              </section>
            )}

            {/* Past Trips Section */}
            {pastTrips.length > 0 && (
              <section className="pt-20 border-t border-slate-200 dark:border-gray-800/50">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-2 h-10 bg-gray-400 rounded-full" />
                   <h2 className="text-3xl font-black text-gray-400 tracking-tighter italic uppercase">
                    Historical Archives
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-60 hover:opacity-100 transition-opacity duration-500">
                  {pastTrips.map((trip) => (
                    <TripCard key={trip._id} trip={trip} />
                  ))}
                </div>
              </section>
            )}
            
            <div className="mt-20 text-center border-t border-slate-100 dark:border-gray-800 pt-10">
              <p className="text-gray-400 font-bold mb-6 italic">Neural Connection stable. Syncing with Help Center vault.</p>
              <Link to="/trip" className="text-rose-500 font-black uppercase tracking-[0.2em] text-[10px] hover:underline underline-offset-8">
                Initialize new expedition
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
