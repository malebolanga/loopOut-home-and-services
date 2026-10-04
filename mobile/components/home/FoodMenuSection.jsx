import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartIcon, ClockIcon, TruckIcon, FireIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, HeartIcon, SparklesIcon } from '@heroicons/react/24/solid';

/* ─── Menu Data ─────────────────────────────────────────────────────────── */
const MENU_CATEGORIES = ['All', 'Mains', 'Street Food', 'Drinks', 'Desserts'];

const MENU_ITEMS = [
  {
    id: 1, category: 'Mains', emoji: '🍖',
    name: 'Braai Platter', description: 'Boerewors, lamb chops & chicken wings over charcoal',
    price: 189, rating: 4.9, reviews: 312, time: '35 min',
    badge: '🔥 Best Seller', badgeColor: 'bg-orange-500', gradient: 'from-orange-400 to-red-500',
    image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 2, category: 'Mains', emoji: '🍛',
    name: 'Bunny Chow', description: 'Hollowed white bread filled with rich lamb curry',
    price: 95, rating: 4.8, reviews: 208, time: '25 min',
    badge: '🌶️ Spicy', badgeColor: 'bg-red-500', gradient: 'from-yellow-400 to-orange-500',
    image: 'https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 3, category: 'Mains', emoji: '🍲',
    name: 'Pap & Stew', description: 'Creamy pap with slow-cooked oxtail stew & chakalaka',
    price: 79, rating: 4.7, reviews: 176, time: '30 min',
    badge: '❤️ Local Fav', badgeColor: 'bg-rose-500', gradient: 'from-amber-400 to-orange-500',
    image: 'https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 4, category: 'Mains', emoji: '🐟',
    name: 'Grilled Hake', description: 'Lemon-herb grilled hake with slap chips & tartar sauce',
    price: 115, rating: 4.6, reviews: 143, time: '20 min',
    badge: '🥗 Healthy', badgeColor: 'bg-green-500', gradient: 'from-cyan-400 to-blue-500',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 5, category: 'Street Food', emoji: '🥟',
    name: 'Vetkoek', description: 'Golden deep-fried dough filled with mince or jam',
    price: 25, rating: 4.8, reviews: 401, time: '10 min',
    badge: '⚡ Quick', badgeColor: 'bg-yellow-500', gradient: 'from-yellow-300 to-amber-500',
    image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 6, category: 'Street Food', emoji: '🌮',
    name: 'Kota Sandwich', description: 'Quarter loaf loaded with chips, polony, cheese & atchaar',
    price: 40, rating: 4.7, reviews: 289, time: '12 min',
    badge: '🏆 Street Icon', badgeColor: 'bg-purple-500', gradient: 'from-fuchsia-400 to-pink-500',
    image: 'https://images.pexels.com/photos/1199960/pexels-photo-1199960.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 7, category: 'Street Food', emoji: '🍗',
    name: 'Peri-Peri Wings', description: 'Crispy chicken wings tossed in house peri-peri sauce',
    price: 65, rating: 4.9, reviews: 512, time: '18 min',
    badge: '🔥 Hot & Crispy', badgeColor: 'bg-red-600', gradient: 'from-red-400 to-orange-600',
    image: 'https://images.pexels.com/photos/60616/fried-chicken-56061-large.jpg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 8, category: 'Drinks', emoji: '🥤',
    name: 'Rooibos Lemonade', description: 'Chilled SA rooibos blended with fresh lemon & honey',
    price: 35, rating: 4.6, reviews: 198, time: '5 min',
    badge: '🌿 Refreshing', badgeColor: 'bg-green-600', gradient: 'from-red-300 to-rose-500',
    image: 'https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 9, category: 'Drinks', emoji: '🍹',
    name: 'Mango Smoothie', description: 'Fresh mango, banana, ginger & yoghurt blended smooth',
    price: 45, rating: 4.8, reviews: 167, time: '5 min',
    badge: '✨ New', badgeColor: 'bg-amber-500', gradient: 'from-amber-300 to-orange-500',
    image: 'https://images.pexels.com/photos/775030/pexels-photo-775030.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 10, category: 'Desserts', emoji: '🍮',
    name: 'Milk Tart', description: 'Cape Malay-style milk tart with cinnamon dust',
    price: 45, rating: 4.9, reviews: 334, time: '5 min',
    badge: '🇿🇦 SA Classic', badgeColor: 'bg-green-600', gradient: 'from-sky-300 to-indigo-400',
    image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 11, category: 'Desserts', emoji: '🍩',
    name: 'Koeksisters', description: 'Syrupy twisted doughnut with coconut & spice glaze',
    price: 30, rating: 4.7, reviews: 245, time: '5 min',
    badge: '🍯 Sweet', badgeColor: 'bg-yellow-600', gradient: 'from-yellow-400 to-amber-500',
    image: 'https://images.pexels.com/photos/209540/pexels-photo-209540.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 12, category: 'Desserts', emoji: '🧁',
    name: 'Malva Pudding', description: 'Warm spongy caramel pudding with vanilla custard',
    price: 55, rating: 5.0, reviews: 421, time: '10 min',
    badge: "👑 Chef's Pick", badgeColor: 'bg-rose-600', gradient: 'from-rose-400 to-pink-500',
    image: 'https://images.pexels.com/photos/45202/brownie-dessert-cake-sweet-45202.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

/* ─── FoodCard ───────────────────────────────────────────────────────────── */
const FoodCard = ({ item }) => {
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = useCallback((e) => {
    e.stopPropagation();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-slate-100 shrink-0">
        {!imgError ? (
          <img
            src={item.image}
            alt={item.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
            <span className="text-6xl">{item.emoji}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <span className={`absolute top-3 left-3 ${item.badgeColor} text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow`}>
          {item.badge}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); setLiked(l => !l); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow transition-transform hover:scale-110 active:scale-95"
        >
          <HeartIcon className={`w-4 h-4 transition-colors ${liked ? 'text-rose-500' : 'text-slate-400'}`} style={{ fill: liked ? '#f43f5e' : 'none' }} />
        </button>

        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-slate-700 text-[10px] font-bold shadow">
          <ClockIcon className="w-3 h-3" />
          {item.time}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <h3 className="font-black text-slate-900 text-sm leading-tight">{item.name}</h3>
          <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">{item.description}</p>
        </div>

        <div className="flex items-center gap-1 mt-auto">
          <StarSolid className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-black text-slate-800">{item.rating.toFixed(1)}</span>
          <span className="text-[10px] text-slate-400">({item.reviews})</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-lg font-black text-slate-900">R{item.price}</span>
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.88 }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all duration-200 shadow-sm ${
              added ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200'
            }`}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  ✓ Added!
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
                  <ShoppingCartIcon className="w-3.5 h-3.5" /> Add
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── FoodMenuSection ────────────────────────────────────────────────────── */
const FoodMenuSection = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState('All');
  const filtered = activeTab === 'All' ? MENU_ITEMS : MENU_ITEMS.filter(i => i.category === activeTab);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-black tracking-widest text-orange-600 uppercase flex items-center gap-1.5">
            <FireIcon className="w-3.5 h-3.5" /> Food &amp; Dining
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 leading-tight">
            Menu <span className="text-rose-500">Favourites</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Popular dishes delivered to your door</p>
        </div>

        <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 px-4 py-2.5 rounded-2xl shrink-0">
          <TruckIcon className="w-4 h-4 text-emerald-600" />
          <div>
            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Free delivery</p>
            <p className="text-[11px] text-emerald-600 font-semibold">Orders over R200</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {MENU_CATEGORIES.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-black transition-all duration-200 ${
              activeTab === tab
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 scale-105'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-rose-300 hover:text-rose-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <AnimatePresence>
          {filtered.map(item => (
            <FoodCard key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-10 relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-rose-200"
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 right-20 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />

        <div className="relative z-10 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
            <SparklesIcon className="w-4 h-4 text-yellow-300" />
            <span className="text-yellow-200 text-xs font-black uppercase tracking-widest">Limited time</span>
          </div>
          <h3 className="text-white text-xl sm:text-2xl font-black leading-tight">
            Hungry? Let loopOut bring it to you 🚀
          </h3>
          <p className="text-white/80 text-sm mt-1">Order from local chefs &amp; restaurants near you</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate?.('/service-home-page?type=catering')}
          className="relative z-10 shrink-0 px-6 py-3 bg-white text-rose-600 font-black text-sm rounded-2xl shadow-lg hover:bg-rose-50 transition-colors"
        >
          Order Now →
        </motion.button>
      </motion.div>
    </div>
  );
};

export default FoodMenuSection;
