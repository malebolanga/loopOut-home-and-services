import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Star, Sparkles, MapPin } from 'lucide-react';
import { MdLocationOn } from 'react-icons/md';

export default function ListingsPage() {
  const { type } = useParams(); // Extract the type from the URL
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/listings?type=${type}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        setListings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [type]);

  return (
    <div className="listings-page p-10">
      <h1 className="text-2xl font-bold mb-4">
        Listings for {type.charAt(0).toUpperCase() + type.slice(1)}
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
        </div>
      ) : error ? (
        <p className="text-rose-500">Error: {error}</p>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
             <div
              key={listing._id || listing.id}
              onClick={() => navigate(`/listing/${listing._id || listing.id}`)}
              className="group relative aspect-square bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-700 h-full cursor-pointer"
            >
              <div className="absolute inset-0 z-0">
                <img
                  src={listing.imageUrls?.[0] || listing.imageUrls || '/placeholder-property.jpg'}
                  alt={listing.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Top Overlays */}
              <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
                <div className="px-3 py-1.5 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-lg flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-rose-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">{listing.type || type}</span>
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
                      R{listing.offer || listing.price || listing.regularPrice || 0}
                    </div>
                    <div className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em] leading-none text-nowrap">Perspective</div>
                  </div>
                </div>
              </div>

              {/* Hover Action Overlay */}
              <div className="absolute inset-0 z-20 flex flex-col justify-center items-center p-8 bg-gray-900/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:pointer-events-auto">
                <div className="w-full space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <div 
                    className="w-full py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-center text-xs hover:bg-rose-500 hover:text-white transition-all shadow-2xl"
                    onClick={(e) => { e.stopPropagation(); navigate(`/listing/${listing._id || listing.id}`); }}
                  >
                    Inspect Original Masterpiece
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No listings found for {type}.</p>
      )}
    </div>
  );
}
