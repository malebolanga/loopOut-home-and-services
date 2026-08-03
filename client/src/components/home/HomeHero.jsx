import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { Sparkles } from 'lucide-react';
import { 
  MagnifyingGlassIcon, 
  ScissorsIcon, 
  UserGroupIcon, 
  HomeModernIcon, 
  StarIcon 
} from '@heroicons/react/24/outline';

export const HomeHero = ({ navigate }) => {
  const slides = [
    {
      id: 1,
      image: '/loopout_for_everyone.png',
      tagIcon: Sparkles,
      tagText: 'Premium Reflections',
      titleLine1: 'LOOPOUT',
      titleLine2: 'MIRROR.',
      titleGradient: 'from-rose-500 via-rose-400 to-amber-500',
      description: 'Reflect your best self in every space. Discover luxury in the details.',
      buttonAction: () => navigate('/explore'),
      buttonText: 'Start Neural Search',
      buttonIcon: MagnifyingGlassIcon
    },
    {
      id: 2,
      image: '/loopout_maid_celebration.png',
      tagIcon: ScissorsIcon,
      tagText: 'Elite Salon Experience',
      titleLine1: 'LOOPOUT',
      titleLine2: 'SALON.',
      titleGradient: 'from-amber-400 via-rose-400 to-rose-500',
      description: 'Premium seating, premium styling. Our signature on every chair.',
      buttonAction: () => navigate('/search?category=hair&type=services'),
      buttonText: 'Find Your Salon',
      buttonIcon: ScissorsIcon
    },
    {
      id: 3,
      image: '/barber_loopout_campaign.png',
      tagIcon: UserGroupIcon,
      tagText: 'Professional Grooming',
      titleLine1: 'LOOPOUT',
      titleLine2: 'BARBER.',
      titleGradient: 'from-indigo-400 via-purple-400 to-rose-500',
      description: 'Experience luxury from the moment you sit down. Draped in excellence.',
      buttonAction: () => navigate('/search?category=barber&type=services'),
      buttonText: 'Book a Barber',
      buttonIcon: ScissorsIcon
    },
    {
      id: 4,
      image: '/student_room_loopout_campaign.png',
      tagIcon: HomeModernIcon,
      tagText: 'Curated Living Spaces',
      titleLine1: 'LOOPOUT',
      titleLine2: 'ROOMS.',
      titleGradient: 'from-emerald-400 via-teal-400 to-cyan-500',
      description: 'Inside the room for rent, every detail is curated for you. Even the curtains.',
      buttonAction: () => navigate('/search?category=rental&type=properties'),
      buttonText: 'Explore Rooms',
      buttonIcon: HomeModernIcon
    },
    {
      id: 5,
      image: '/soweto_bg.png',
      tagIcon: Sparkles,
      tagText: 'Signature Comfort',
      titleLine1: 'LOOPOUT',
      titleLine2: 'BEDDING.',
      titleGradient: 'from-rose-400 via-pink-400 to-purple-500',
      description: 'Rest in luxury with our signature LoopOut logo on your bedding.',
      buttonAction: () => navigate('/search?category=guesthouse&type=properties'),
      buttonText: 'View Guest Houses',
      buttonIcon: Sparkles
    },
    {
      id: 6,
      image: '/hotel_reception_loopout_campaign.png',
      tagIcon: StarIcon,
      tagText: 'Grand Hospitality',
      titleLine1: 'LOOPOUT',
      titleLine2: 'HOTEL.',
      titleGradient: 'from-amber-300 via-yellow-400 to-orange-500',
      description: 'From the banner at the gate to the reception table, welcome to excellence.',
      buttonAction: () => navigate('/search?type=properties'),
      buttonText: 'Discover Hotels',
      buttonIcon: StarIcon
    }
  ];

  return (
    <div className="relative h-[850px] w-full overflow-hidden bg-gray-950">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        speed={1500}
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        pagination={{ clickable: true, bulletActiveClass: 'swiper-pagination-bullet-active !bg-rose-500' }}
        className="h-full w-full hero-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
              <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10 }}
                className="absolute inset-0"
              >
                <img loading="lazy"
                  src={slide.image}
                  alt={slide.titleLine1 + ' ' + slide.titleLine2}
                  className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-transparent to-gray-950" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-gray-950/40 to-transparent" />
              </motion.div>

              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="max-w-5xl"
                >
                  <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black tracking-[0.3em] uppercase mb-10 shadow-2xl">
                    <slide.tagIcon className="w-4 h-4 text-rose-500" />
                    {slide.tagText}
                  </div>
                  <h1 className="text-7xl lg:text-9xl font-black text-white mb-8 tracking-tighter leading-[0.8] drop-shadow-2xl">
                    {slide.titleLine1} <br />
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${slide.titleGradient}`}>
                      {slide.titleLine2}
                    </span>
                  </h1>
                  <p className="text-xl lg:text-2xl text-white/80 max-w-3xl mx-auto mb-12 font-medium leading-relaxed drop-shadow-lg">
                    {slide.description}
                  </p>
                  <button
                    onClick={slide.buttonAction}
                    className="px-12 py-6 bg-rose-500 text-white rounded-[2.5rem] font-black shadow-[0_20px_50px_rgba(225,29,72,0.4)] transition-all flex items-center gap-3 text-xs tracking-widest uppercase mx-auto hover:bg-rose-600 hover:scale-105"
                  >
                    <slide.buttonIcon className="w-5 h-5" />
                    {slide.buttonText}
                  </button>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Animated City Indicators (Persistent Overlay) */}
      <div className="absolute bottom-12 left-12 z-20 hidden lg:flex flex-col gap-4">
        {["Pretoria", "PMB", "JHB", "Rustenburg"].map((city, i) => (
          <motion.div
            key={city}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.4, x: 0 }}
            transition={{ delay: 1 + (i * 0.2) }}
            className="flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-widest"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {city} Hub Active
          </motion.div>
        ))}
      </div>
    </div>
  );
};
