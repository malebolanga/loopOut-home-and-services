import { useParams, Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Star, Sparkles, Heart, MapPin, ThumbsUp, ThumbsDown } from 'lucide-react';
import {
  FaStar, FaMapMarkerAlt, FaHeart, FaRegHeart,
  FaUser, FaClock, FaDog, FaUsers, FaGraduationCap, FaCut, FaTools, FaCar, FaShieldAlt
} from 'react-icons/fa';
import NeuralLoader from '../components/NeuralLoader';
import ImageWithFallback from '../components/ImageWithFallback';
import { useWishlist } from "../hooks/useWishlist";

export default function HelperDetails() {
  const navigate = useNavigate();
  const { type } = useParams();
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState({});
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Helper type labels
  const typeLabels = {
    domestic: 'Domestic Helpers',
    errand: 'Errand Runners',
    tutor: 'Tutors',
    chef: 'Chefs',
    beauty: 'Beauty Specialists',
    tattoo: 'Tattoo Artists',
    barber: 'Barbers'
  };

  // Simulate fetching helpers from API
  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call: 
        // const res = await fetch(`/api/helpers?type=${type}`);
        // const data = await res.json();

        // Simulated data based on type
        const simulatedData = Array(12).fill().map((_, i) => ({
          _id: `${type}-${i + 1}`,
          name: `${typeLabels[type]} ${i + 1}`,
          type,
          rating: (Math.random() * 4 + 1).toFixed(1),
          reviews: Math.floor(Math.random() * 100),
          address: `Location ${i + 1}, Cape Town`,
          regularPrice: Math.floor(Math.random() * 300) + 100,
          description: `Professional ${typeLabels[type].toLowerCase()} with ${i + 3} years of experience`,
          imageUrls: Array(4).fill().map((_, imgIndex) =>
            `https://images.pexels.com/photos/3768914/pexels-photo-3768914.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`
          ),
          host: `Host ${i + 1}`,
          period: i % 2 === 0 ? 'Weekdays' : 'Flexible',
          pets: i % 3 === 0,
          security: i % 4 === 0,
        }));

        // Set data with delay to simulate network request
        setTimeout(() => {
          setHelpers(simulatedData);
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to load helpers');
        setLoading(false);
      }
    };

    if (type && Object.keys(typeLabels).includes(type)) {
      fetchHelpers();
    } else {
      setError('Invalid helper type');
      setLoading(false);
    }
  }, [type]);

  // Toggle favorite status
  const toggleFavorite = (id) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Type-specific icons
  const getTypeIcon = () => {
    switch (type) {
      case 'tutor': return <FaGraduationCap className="mr-2" />;
      case 'chef': return <FaUsers className="mr-2" />;
      case 'beauty': return <FaCut className="mr-2" />;
      case 'tattoo': return <FaTools className="mr-2" />;
      case 'barber': return <FaCar className="mr-2" />;
      default: return <FaUser className="mr-2" />;
    }
  };

  if (loading) {
    return <NeuralLoader fullScreen text={`Loading ${typeLabels[type]}...`} />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg inline-block">
          <h3 className="text-lg font-medium text-red-800">{error}</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {getTypeIcon()}
          {typeLabels[type]}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover top-rated professionals ready to assist you with your needs
        </p>
      </div>

      {/* Helpers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {helpers.map((helper) => (
          <div
            key={helper._id}
            onClick={() => navigate(`/helper/${helper._id}`)}
            className="group relative aspect-square bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-700 h-full cursor-pointer"
          >
            <div className="absolute inset-0 z-0">
               <Swiper
                modules={[Pagination, Autoplay]}
                pagination={{ clickable: true, dynamicBullets: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                className="w-full h-full"
              >
                {helper.imageUrls.map((img, index) => (
                  <SwiperSlide key={index}>
                    <ImageWithFallback
                      src={img}
                      alt={`${helper.name} - ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      loading="lazy"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Top Overlays */}
            <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
              <div className="px-3 py-1.5 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-lg flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900">{typeLabels[type]}</span>
              </div>

               <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(helper._id);
                }}
                className="w-10 h-10 bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-lg flex items-center justify-center text-gray-900 hover:bg-rose-500 hover:text-white transition-all active:scale-90 pointer-events-auto"
              >
                <Heart className={`w-4 h-4 ${favorites[helper._id] ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`} />
              </button>
            </div>

            {/* Permanent Information Overlay (On Image) */}
            <div className="absolute inset-x-0 bottom-0 z-10 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
              <div className="flex justify-between items-end gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 text-white">
                    <Star className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span className="text-xs font-black">{helper.rating}</span>
                  </div>
                  <h3 className="text-base font-black text-white leading-tight truncate mb-0.5">
                    {helper.name}
                  </h3>
                  <p className="text-xs text-white/70 font-medium truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {helper.address}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-white tracking-tighter leading-none mb-1">
                    R{helper.regularPrice}
                  </div>
                  <div className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em] leading-none text-nowrap">Perspective</div>
                </div>
              </div>
            </div>

            {/* Hover Action Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center p-8 bg-gray-900/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:pointer-events-auto">
              <div className="w-full space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                <div className="flex gap-2">
                  <div className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-green-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm">
                    <ThumbsUp className="w-4 h-4" />
                    {Math.floor(Math.random() * 50)}
                  </div>
                  <div className="flex-1 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-rose-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center gap-1.5 shadow-sm">
                    <ThumbsDown className="w-4 h-4" />
                    {Math.floor(Math.random() * 5)}
                  </div>
                </div>
                <div 
                  className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black uppercase tracking-[0.2em] text-center text-xs hover:bg-rose-500 hover:text-white transition-all shadow-2xl"
                >
                  Inspect Original Masterpiece
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {helpers.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-gray-100 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
            <FaUser className="text-gray-400 text-2xl" />
          </div>
          <h3 className="mt-4 text-xl font-medium text-gray-900">No helpers found</h3>
          <p className="mt-1 text-gray-500">
            We couldnt find any {typeLabels[type].toLowerCase()} matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
