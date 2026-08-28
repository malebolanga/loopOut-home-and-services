import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { ArrowRight } from 'lucide-react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SLIDES = [
  {
    id: 1,
    image: '/loopout_for_everyone.png',
    accent: '#F43F5E',
    category: 'PREMIUM STAYS',
    headline: 'Where every stay feels like home.',
    cta: { label: 'Find a place', path: '/search?type=properties' },
  },
  {
    id: 2,
    image: '/loopout_maid_celebration.png',
    accent: '#F59E0B',
    category: 'HOME SERVICES',
    headline: 'Premium help, at your door.',
    cta: { label: 'Browse helpers', path: '/search?type=helpers' },
  },
  {
    id: 3,
    image: '/barber_loopout_campaign.png',
    accent: '#818CF8',
    category: 'ELITE GROOMING',
    headline: 'Look sharp, feel unstoppable.',
    cta: { label: 'Book a barber', path: '/search?category=barber&type=services' },
  },
  {
    id: 4,
    image: '/student_room_loopout_campaign.png',
    accent: '#34D399',
    category: 'CURATED ROOMS',
    headline: 'Your perfect room is waiting.',
    cta: { label: 'Find rooms', path: '/search?category=rental&type=properties' },
  },
  {
    id: 5,
    image: '/hotel_reception_loopout_campaign.png',
    accent: '#FBBF24',
    category: 'GRAND HOSPITALITY',
    headline: 'Welcome to excellence.',
    cta: { label: 'Discover hotels', path: '/search?type=properties' },
  },
];

const SLIDE_DURATION = 6000;

// Real numbers only — no invented stats. Fetched once, shown as one quiet
// line of text rather than a busy stat bar.
const useHomeStats = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats/home')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => { if (!cancelled && data?.success) setStats(data.stats); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return stats;
};

export const HomeHero = ({ navigate, compact = false }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperRef, setSwiperRef] = useState(null);
  const stats = useHomeStats();
  const slide = SLIDES[activeIndex];

  const statLine = stats
    ? [
        stats.avgRating?.value && `${stats.avgRating.value} rating`,
        stats.verifiedHosts?.value && `${stats.verifiedHosts.value} verified hosts`,
      ].filter(Boolean).join(' · ')
    : null;

  // Medium, contained card — not full-bleed, not full viewport height.
  const heroHeight = compact ? 'clamp(260px, 34vh, 340px)' : 'clamp(320px, 42vh, 420px)';

  return (
    <div
      className="relative w-full overflow-hidden bg-[#0c0c14] rounded-3xl"
      style={{ height: heroHeight }}
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          speed={1200}
          autoplay={{ delay: SLIDE_DURATION, disableOnInteraction: false }}
          onSwiper={setSwiperRef}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          className="w-full h-full"
        >
          {SLIDES.map((s) => (
            <SwiperSlide key={s.id} className="relative w-full h-full">
              <img
                src={s.image}
                alt={s.headline}
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.45) saturate(1.05)' }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      </div>

      {/* Content — one clear message, one clear action */}
      <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-lg"
          >
            <span
              className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-3"
              style={{ color: slide.accent, background: `${slide.accent}22` }}
            >
              {slide.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight mb-4">
              {slide.headline}
            </h1>
            <button
              onClick={() => navigate(slide.cta.path)}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-transform hover:scale-105"
              style={{ background: slide.accent }}
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              {slide.cta.label}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            {statLine && (
              <p className="text-white/50 text-xs font-semibold mt-3">{statLine}</p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Simple dot navigation */}
        <div className="flex items-center gap-1.5 mt-5">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => swiperRef?.slideTo(i)}
              aria-label={`Show ${s.category} slide`}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? 20 : 6,
                background: i === activeIndex ? slide.accent : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
