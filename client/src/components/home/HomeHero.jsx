import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { ArrowRight, MapPin, Search } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    image: '/loopout_for_everyone.png',
    accent: '#F43F5E',
    category: 'STAYS',
    headline: 'Find a place that feels like home.',
    cta: { label: 'Find a place', path: '/search?type=properties' },
  },
  {
    id: 2,
    image: '/loopout_maid_celebration.png',
    accent: '#F59E0B',
    category: 'SERVICES',
    headline: 'Trusted help, right when you need it.',
    cta: { label: 'Explore services', path: '/search?type=services' },
  },
  {
    id: 3,
    image: '/barber_loopout_campaign.png',
    accent: '#818CF8',
    category: 'GROOMING',
    headline: 'Book someone you can trust.',
    cta: { label: 'Find a barber', path: '/search?category=barber&type=services' },
  },
];

const SLIDE_DURATION = 6500;

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
  const [query, setQuery] = useState('');
  const stats = useHomeStats();
  const slide = SLIDES[activeIndex];

  const search = (event) => {
    event?.preventDefault();
    const value = query.trim();
    navigate(value ? `/search?q=${encodeURIComponent(value)}` : '/search');
  };

  const statLine = stats
    ? [
        stats.avgRating?.value && `${stats.avgRating.value} average rating`,
        stats.verifiedHosts?.value && `${stats.verifiedHosts.value} verified hosts`,
      ].filter(Boolean).join(' · ')
    : null;

  const heroHeight = compact ? 'clamp(300px, 38vh, 380px)' : 'clamp(390px, 55vh, 520px)';

  return (
    <section
      aria-label="Discover LoopOut"
      className="relative w-full overflow-hidden bg-[#0c0c14] rounded-[28px]"
      style={{ height: heroHeight }}
    >
      <div className="absolute inset-0 z-0">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          speed={1000}
          autoplay={{ delay: SLIDE_DURATION, disableOnInteraction: false }}
          onSwiper={setSwiperRef}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          className="w-full h-full"
        >
          {SLIDES.map((s) => (
            <SwiperSlide key={s.id} className="relative w-full h-full">
              <img
                src={s.image}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.42) saturate(1.05)' }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-8 lg:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-3xl"
          >
            <span
              className="inline-flex px-3 py-1 rounded-full text-[10px] font-black tracking-[0.18em] uppercase mb-3"
              style={{ color: slide.accent, background: `${slide.accent}22` }}
            >
              {slide.category}
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.05] tracking-tight max-w-2xl">
              {slide.headline}
            </h1>

            <p className="text-white/75 text-sm sm:text-base mt-3 max-w-xl">
              Discover trusted services, people and places around you — all in one LoopOut.
            </p>

            <form onSubmit={search} className="mt-5 w-full max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl bg-white shadow-2xl">
                <div className="flex-1 min-w-0 flex items-center gap-2 px-3">
                  <Search className="w-5 h-5 shrink-0 text-gray-400" aria-hidden="true" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full min-w-0 bg-transparent border-0 outline-none text-gray-900 placeholder:text-gray-400 py-3 text-sm sm:text-base"
                    placeholder="What are you looking for?"
                    aria-label="Search LoopOut"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-12 px-5 rounded-xl font-extrabold text-white bg-gray-950 hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Search <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-2 px-1 text-white/65 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Discover what's available near you</span>
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => navigate(slide.cta.path)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white border border-white/20 bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
              >
                {slide.cta.label} <ArrowRight className="w-4 h-4" />
              </button>
              {statLine && <p className="text-white/55 text-xs font-semibold">{statLine}</p>}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-1.5 mt-5" aria-label="Hero slides">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => swiperRef?.slideTo(i)}
              aria-label={`Show ${s.category}`}
              aria-current={i === activeIndex ? 'true' : undefined}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? 24 : 7,
                background: i === activeIndex ? slide.accent : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
