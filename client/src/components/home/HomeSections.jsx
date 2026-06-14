import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Tag as TagIcon } from 'lucide-react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import useSearchIntelligence from '../../hooks/useSearchIntelligence';
import HelperItem from '../../components/HelperItem';
import ImageGallery from '../../components/ImageGallery';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export const NeuralPicksSection = ({ navigate }) => {
  const { rankItems, interactionMetrics } = useSearchIntelligence();
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        const res = await fetch('/api/helper/get?limit=20');
        const data = await res.json();
        if (data.success) {
          // Use the neural algorithm to rank fetched items
          setHelpers(rankItems(data.helpers));
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchHelpers();
  }, [rankItems]);

  if (loading || helpers.length === 0) return null;

  return (
    <motion.section 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true }} 
      variants={fadeInUp} 
      className="mb-16"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-rose-500"
                />
              ))}
            </div>
            <span className="text-rose-500 text-[10px] font-black tracking-[0.3em] uppercase italic">Alpha Neural Discovery</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">PROMOTED FOR YOU</h2>
          <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-[0.2em]">Based on your performance and interest history</p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full border border-gray-300" />
            Sessions: {interactionMetrics.sessionCount}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full border border-gray-300" />
            Accuracy: 98%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {helpers.slice(0, 4).map((helper, idx) => (
          <motion.div
            key={helper._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="relative"
          >
            <HelperItem helper={helper} />
            {/* Neural Overlay Tag */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <div className="px-3 py-1 bg-gray-950/80 backdrop-blur-md border border-white/20 rounded-full flex items-center gap-2 shadow-2xl">
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Neural Pick</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export const SellItemsSection = ({ navigate }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const CATEGORY_EMOJIS = {
    furniture: '🛋️',
    electronics: '📱',
    clothes: '👗',
    universities: '🎓',
    books: '📚',
  };

  const CATEGORY_COLORS = {
    furniture: 'from-amber-500 to-orange-500',
    electronics: 'from-blue-500 to-indigo-600',
    clothes: 'from-rose-400 to-pink-500',
    universities: 'from-violet-500 to-purple-600',
    books: 'from-emerald-500 to-teal-500',
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/sell?limit=10');
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          setItems(data.data);
        }
      } catch (err) {
        console.error('Failed to load sell items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className="mb-16"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TagIcon className="w-4 h-4 text-rose-500" />
            <span className="text-rose-500 text-[10px] font-black tracking-[0.3em] uppercase">P2P Exchange</span>
          </div>
          <h2 className="text-2xl font-black text-gray-950 tracking-tighter uppercase">Community <br/><span className="text-rose-500">Vault</span></h2>
          <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] mt-1">Preloved items from the network</p>
        </div>
        <button
          onClick={() => navigate('/sell')}
          className="text-[10px] font-black text-rose-500 uppercase tracking-widest border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-full transition-all flex items-center gap-2"
        >
          <span>Access Vault</span>
          <ArrowRightIcon className="w-3 h-3" />
        </button>
      </div>

      <div className="flex overflow-x-auto gap-5 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide snap-x">
        {items.map((item, idx) => {
          const catColor = CATEGORY_COLORS[item.category] || 'from-gray-500 to-gray-600';
          return (
          <div
            key={item._id}
            onClick={() => navigate(`/sell-item/${item._id}`)}
            className="flex-shrink-0 w-[180px] md:w-[220px] cursor-pointer snap-start"
          >
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-950 border border-white/10 group-hover:border-rose-500/50 shadow-2xl transition-all">
              <img loading="lazy"
                src={item.imageUrls?.[0] || 'https://via.placeholder.com/300'}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
              />
              
              {/* Immersive Dark Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
              
              <div className={`absolute top-4 left-4 bg-gray-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center gap-1.5 z-20`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${catColor} animate-pulse`} />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">
                  {CATEGORY_EMOJIS[item.category] || '🏷️'} {item.category}
                </span>
              </div>
              
              {/* Content info at bottom */}
              <div className="absolute bottom-0 inset-x-0 p-5 z-20 flex flex-col justify-end">
                <h3 className="font-black text-[15px] text-white leading-tight line-clamp-2 mb-2 group-hover:text-rose-400 transition-colors">{item.title}</h3>
                
                <div className="flex items-center gap-2 mb-3">
                  {item.creator?.avatar && (
                    <img loading="lazy" src={item.creator.avatar} alt={item.creator.username} className="w-5 h-5 rounded-full object-cover border border-white/20 shadow-sm" />
                  )}
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">{item.creator?.username || 'Anonymous'}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                    R {item.price?.toLocaleString() || item.price}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )})}
      </div>
    </motion.section>
  );
};

export const SmartRecommendations = ({ recommendations, insights, loading, onItemClick }) => {
  if (loading) {
    return (
      <div className="mb-8 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] bg-gray-200 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-rose-500" />
        <h3 className="font-semibold text-gray-900">AI Picks for you</h3>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
        {recommendations.slice(0, 6).map((item, i) => (
          <div key={item._id ? `rec-${item._id}` : `rec-${i}`} onClick={() => onItemClick(item, item.routeType || item.type)} className="flex-shrink-0 w-40 cursor-pointer group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-2 bg-gray-200">
              <ImageGallery
                imageUrls={item.imageUrls || []}
                alt={item.name}
                type={item.routeType === 'listing' ? (item.type?.includes('rent') ? 'rent' : item.type?.includes('sale') ? 'sale' : item.type?.includes('office') ? 'office' : 'property') : (item.routeType || 'default')}
              />
              <div className="absolute top-2 left-2">
                <span className="text-[10px] font-semibold px-2 py-1 bg-white/90 backdrop-blur rounded-md">AI Pick</span>
              </div>
            </div>
            <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 font-semibold">R{item.price || item.regularPrice}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const ServicesToYourDoor = ({ navigate }) => {
  const atHomeServices = [
    { id: 'barber', name: 'Mobile Barber', desc: 'Fresh cuts at your home', emoji: '💈', color: 'from-gray-950 to-gray-800' },
    { id: 'hair', name: 'Home Hair & Style', desc: 'Salon experience at home', emoji: '💇', color: 'from-rose-500 to-pink-500' },
    { id: 'massage', name: 'Home Massage', desc: 'Relaxation brought to you', emoji: '💆', color: 'from-emerald-500 to-teal-500' },
    { id: 'domestic', name: 'House Cleaning', desc: 'Professional cleaning', emoji: '🧹', color: 'from-blue-600 to-indigo-600' },
    { id: 'handyman', name: 'Mobile Handyman', desc: 'Home repairs & maintenance', emoji: '🛠️', color: 'from-orange-600 to-amber-500' },
  ];

  return (
    <section className="mb-16">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">THE HOME EXPERIENCE</h2>
          <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-[0.2em]">Services that travel directly to you</p>
        </div>
        <button
          onClick={() => navigate('/helper-home-page')}
          className="text-xs font-black text-rose-500 uppercase tracking-widest border-b-2 border-rose-500/20 hover:border-rose-500 transition-all"
        >
          View All Home Experts
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
        {atHomeServices.map((service, idx) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -10 }}
            onClick={() => navigate(`/search?category=${service.id}&type=helpers`)}
            className="snap-start shrink-0 w-[300px] md:w-[320px] cursor-pointer bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/30 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/5 to-transparent rounded-bl-[4rem]" />
            <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${service.color} flex items-center justify-center text-3xl mb-8 shadow-lg hover:rotate-12 transition-transform duration-500`}>
              {service.emoji}
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">{service.name}</h3>
            <p className="text-gray-500 text-sm mb-10 font-medium leading-relaxed h-10">{service.desc}</p>
            <div className="flex items-center text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] gap-3">
              BOOK EXPERT <ArrowRightIcon className="w-4 h-4 hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export const WeeklySpecialsSection = ({ navigate, isMobile = false }) => {
  const allSpecials = [
    {
      id: 'promo-verified',
      title: 'Verified Excellence',
      discount: 'PREMIUM',
      desc: 'Trust only the best local experts in your area',
      color: 'bg-indigo-600',
      image: '/special_verified.png'
    },
    {
      id: 'promo-favor',
      title: 'Community Favor',
      discount: 'R50 + R50',
      desc: 'Refer a neighbor and both get credits',
      color: 'bg-emerald-600',
      image: '/special_flavor.png'
    },
    {
      id: 'promo-1',
      title: 'First-Time User Special',
      discount: 'R20 OFF',
      desc: 'On your first home experience booking',
      color: 'bg-rose-600',
      image: '/special_first.png'
    },
    {
      id: 'promo-barber',
      title: 'LoopOut Barber',
      discount: 'EXCELLENCE',
      desc: 'Draped in excellence, styled by premier groomers',
      color: 'bg-indigo-600',
      image: '/barber_loopout_campaign.png'
    },
    {
      id: 'promo-hotel',
      title: 'LoopOut Hotel',
      discount: 'EXCLUSIVE',
      desc: 'Welcome to premium comfort at partner destinations',
      color: 'bg-amber-600',
      image: '/hotel_reception_loopout_campaign.png'
    },
    {
      id: 'promo-rooms',
      title: 'LoopOut Soweto Stay',
      discount: 'SOWETO',
      desc: 'Rest in luxury with co-branded pillows at premier guest houses',
      color: 'bg-emerald-600',
      image: '/soweto_bg.png'
    }
  ];

  const specials = isMobile 
    ? allSpecials.filter(s => s.id === 'promo-favor' || s.id === 'promo-1')
    : allSpecials;

  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        <h2 className="text-xl font-black text-gray-950 tracking-widest uppercase">DEFINE YOUR DAY</h2>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-3 ${isMobile ? 'lg:grid-cols-2' : 'lg:grid-cols-6'} gap-6`}>
        {specials.map((promo, idx) => (
          <motion.div
            key={promo.id}
            whileHover={{ scale: 1.02 }}
            className="relative h-64 rounded-[2.5rem] overflow-hidden  cursor-pointer shadow-xl"
            onClick={() => navigate('/search?filter=special')}
          >
            <img loading="lazy" src={promo.image} className="absolute inset-0 w-full h-full object-cover hover:scale-110 transition-transform duration-[5s]" alt={promo.title} />
            <div className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors" />
            <div className="absolute inset-x-0 bottom-0 p-8">
              <div className={`${promo.color} text-white text-[10px] font-black px-3 py-1 rounded-full w-fit mb-3 tracking-widest`}>
                {promo.discount}
              </div>
              <h3 className="text-white font-bold text-xl leading-tight mb-1">{promo.title}</h3>
              <p className="text-white/80 text-sm font-medium">{promo.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
