import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { Sparkles, MapPin, Star, ChevronRight, ArrowRight, TrendingUp, Shield, Users } from 'lucide-react';
import {
  MagnifyingGlassIcon,
  ScissorsIcon,
  UserGroupIcon,
  HomeModernIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const SLIDES = [
  {
    id: 1,
    image: '/loopout_for_everyone.png',
    accent: '#F43F5E',
    accentFrom: 'from-rose-500',
    accentVia: 'via-rose-400',
    accentTo: 'to-amber-500',
    category: 'PREMIUM STAYS',
    headline: 'Where Every Stay',
    headlineAccent: 'Feels Like Home.',
    sub: 'Discover curated rooms, apartments & guesthouses across South Africa — verified, loved, unforgettable.',
    ctaPrimary: { label: 'Find a Place', path: '/search?type=properties' },
    ctaSecondary: { label: 'Host Your Space', path: '/create-listing' },
  },
  {
    id: 2,
    image: '/loopout_maid_celebration.png',
    accent: '#F59E0B',
    accentFrom: 'from-amber-400',
    accentVia: 'via-orange-400',
    accentTo: 'to-rose-500',
    category: 'HOME SERVICES',
    headline: 'Premium Help,',
    headlineAccent: 'At Your Door.',
    sub: 'Chefs, cleaners, tutors, bakers and more — elite helpers ready to serve you on demand.',
    ctaPrimary: { label: 'Browse Helpers', path: '/search?type=helpers' },
    ctaSecondary: { label: 'Become a Helper', path: '/create-helper' },
  },
  {
    id: 3,
    image: '/barber_loopout_campaign.png',
    accent: '#818CF8',
    accentFrom: 'from-indigo-400',
    accentVia: 'via-purple-400',
    accentTo: 'to-rose-500',
    category: 'ELITE GROOMING',
    headline: 'Look Sharp,',
    headlineAccent: 'Feel Unstoppable.',
    sub: 'Top-rated barbers, beauty artists & stylists — draped in excellence, crafted for you.',
    ctaPrimary: { label: 'Book a Barber', path: '/search?category=barber&type=services' },
    ctaSecondary: { label: 'List Your Salon', path: '/create-helper' },
  },
  {
    id: 4,
    image: '/student_room_loopout_campaign.png',
    accent: '#34D399',
    accentFrom: 'from-emerald-400',
    accentVia: 'via-teal-400',
    accentTo: 'to-cyan-500',
    category: 'CURATED ROOMS',
    headline: 'Your Perfect Room',
    headlineAccent: 'Is Waiting.',
    sub: 'Student rooms, furnished apartments & shared living — every detail curated, every space verified.',
    ctaPrimary: { label: 'Find Rooms', path: '/search?category=rental&type=properties' },
    ctaSecondary: { label: 'List a Room', path: '/create-listing' },
  },
  {
    id: 5,
    image: '/hotel_reception_loopout_campaign.png',
    accent: '#FBBF24',
    accentFrom: 'from-amber-300',
    accentVia: 'via-yellow-400',
    accentTo: 'to-orange-500',
    category: 'GRAND HOSPITALITY',
    headline: 'Welcome to',
    headlineAccent: 'Excellence.',
    sub: 'From the gate to reception — loopOut hotels deliver grandeur at every touchpoint.',
    ctaPrimary: { label: 'Discover Hotels', path: '/search?type=properties' },
    ctaSecondary: { label: 'Partner With Us', path: '/create-listing' },
  },
];

const LIVE_CITIES = [
  { city: 'JHB', status: 'Live', count: '2.4k' },
  { city: 'PTA', status: 'Active', count: '1.8k' },
  { city: 'CPT', status: 'Live', count: '3.1k' },
  { city: 'PLK', status: 'Active', count: '890' },
];

const TRUST_STATS = [
  { icon: Users, label: 'Verified Hosts', value: '12k+' },
  { icon: Star, label: 'Avg Rating', value: '4.9★' },
  { icon: Shield, label: 'Safe Bookings', value: '100%' },
  { icon: TrendingUp, label: 'Monthly Stays', value: '45k+' },
];

export const HomeHero = ({ navigate }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperRef, setSwiperRef] = useState(null);
  const [progress, setProgress] = useState(0);
  const SLIDE_DURATION = 8000;

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const raf = requestAnimationFrame(function tick() {
      const elapsed = Date.now() - start;
      const p = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(p);
      if (p < 100) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [activeIndex]);

  const slide = SLIDES[activeIndex];

  return (
    <div className="relative w-full overflow-hidden bg-[#080810]" style={{ height: 'clamp(560px, 90vh, 900px)' }}>

      {/* ─── Background Image Swiper ─── */}
      <div className="absolute inset-0 z-0">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          speed={1800}
          autoplay={{ delay: SLIDE_DURATION, disableOnInteraction: false }}
          onSwiper={setSwiperRef}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          className="w-full h-full"
        >
          {SLIDES.map((s) => (
            <SwiperSlide key={s.id} className="relative w-full h-full">
              <motion.div
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 9, ease: 'linear' }}
                className="absolute inset-0"
              >
                <img
                  src={s.image}
                  alt={s.headline}
                  className="w-full h-full object-cover"
                  style={{ filter: 'brightness(0.38) saturate(1.1)' }}
                />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080810]/50 via-transparent to-[#080810]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080810]/80 via-[#080810]/20 to-transparent" />

        {/* Ambient glow from active slide accent */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute bottom-0 left-0 w-[600px] h-[400px] pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 20% 80%, ${slide.accent}22 0%, transparent 65%)`,
            }}
          />
        </AnimatePresence>
      </div>

      {/* ─── Main Content ─── */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 pt-16 pb-8">
        <div className="max-w-4xl">

          {/* Category pill */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + '-cat'}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 mb-6"
            >
              <span
                className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.25em] uppercase border"
                style={{
                  color: slide.accent,
                  borderColor: `${slide.accent}55`,
                  background: `${slide.accent}18`,
                }}
              >
                {slide.category}
              </span>
              <span className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live Now
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Headline */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={slide.id + '-title'}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-[clamp(2.6rem,6vw,5.5rem)] font-black text-white leading-[1.0] tracking-tighter mb-4"
            >
              {slide.headline}{' '}
              <span
                className={`text-transparent bg-clip-text bg-gradient-to-r ${slide.accentFrom} ${slide.accentVia} ${slide.accentTo}`}
              >
                {slide.headlineAccent}
              </span>
            </motion.h1>
          </AnimatePresence>

          {/* Sub description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={slide.id + '-sub'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="text-white/55 text-base lg:text-lg max-w-xl mb-10 leading-relaxed font-medium"
            >
              {slide.sub}
            </motion.p>
          </AnimatePresence>

          {/* CTA Buttons */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + '-cta'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap items-center gap-4"
            >
              <button
                onClick={() => navigate(slide.ctaPrimary.path)}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm tracking-wide text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}cc)`,
                  boxShadow: `0 8px 32px ${slide.accent}55`,
                }}
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                {slide.ctaPrimary.label}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate(slide.ctaSecondary.path)}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm tracking-wide text-white/80 border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/12 hover:border-white/40 transition-all duration-300"
              >
                {slide.ctaSecondary.label}
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </AnimatePresence>

          {/* Trust stats — desktop only */}
          <div className="hidden lg:flex items-center gap-8 mt-12 pt-8 border-t border-white/8">
            {TRUST_STATS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white/60" />
                </div>
                <div>
                  <div className="text-white font-black text-sm leading-none">{value}</div>
                  <div className="text-white/35 text-[10px] tracking-wide mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right Side: Slide Indicators ─── */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col items-center gap-3">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => swiperRef?.slideTo(i)}
            className="relative w-1.5 rounded-full transition-all duration-500 overflow-hidden"
            style={{
              height: i === activeIndex ? 48 : 16,
              background: i === activeIndex ? 'transparent' : 'rgba(255,255,255,0.2)',
            }}
          >
            {i === activeIndex && (
              <>
                <span className="absolute inset-0 rounded-full bg-white/20" />
                <motion.span
                  key={activeIndex}
                  initial={{ height: '0%' }}
                  animate={{ height: '100%' }}
                  transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
                  className="absolute top-0 left-0 right-0 rounded-full"
                  style={{ background: slide.accent }}
                />
              </>
            )}
          </button>
        ))}
      </div>

      {/* ─── Bottom Bar: Live Cities + Progress ─── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 sm:px-12 lg:px-20 pb-6">
        <div className="flex items-end justify-between gap-4">

          {/* Live city pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {LIVE_CITIES.map(({ city, status, count }) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 backdrop-blur-md"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-black text-white/70 tracking-widest uppercase">{city}</span>
                <span className="text-[10px] text-white/35 font-semibold">{count}</span>
              </motion.div>
            ))}
          </div>

          {/* Slide counter + progress bar (mobile) */}
          <div className="flex flex-col items-end gap-2 lg:hidden">
            <span className="text-[10px] text-white/40 font-black tracking-widest">
              {String(activeIndex + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
            </span>
            <div className="w-24 h-0.5 bg-white/15 rounded-full overflow-hidden">
              <motion.div
                key={activeIndex}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
                className="h-full rounded-full"
                style={{ background: slide.accent }}
              />
            </div>
          </div>

          {/* Desktop counter */}
          <div className="hidden lg:flex items-center gap-3">
            <span className="text-[11px] text-white/35 font-black tracking-widest">
              {String(activeIndex + 1).padStart(2, '0')}
            </span>
            <div className="w-32 h-0.5 bg-white/12 rounded-full overflow-hidden">
              <motion.div
                key={activeIndex}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
                className="h-full rounded-full"
                style={{ background: slide.accent }}
              />
            </div>
            <span className="text-[11px] text-white/35 font-black tracking-widest">
              {String(SLIDES.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
