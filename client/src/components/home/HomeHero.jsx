import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    image: '/loopout_for_everyone.png',
    accent: '#F43F5E',
    category: 'YOUR LOCAL MARKETPLACE',
    headline: 'Find a place that feels like home.',
    cta: { label: 'Find a home', path: '/search?type=properties' },
  },
  {
    id: 2,
    image: '/loopout_maid_celebration.png',
    accent: '#F59E0B',
    category: 'YOUR LOCAL MARKETPLACE',
    headline: 'Trusted help, right when you need it.',
    cta: { label: 'Book a service', path: '/search?type=services' },
  },
  {
    id: 3,
    image: '/barber_loopout_campaign.png',
    accent: '#818CF8',
    category: 'YOUR LOCAL MARKETPLACE',
    headline: 'Book someone you can trust.',
    cta: { label: 'Find a helper', path: '/search?type=helpers' },
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
  const stats = useHomeStats();
  const slide = SLIDES[activeIndex];

  const statLine = stats
    ? [
        stats.avgRating?.value && `${stats.avgRating.value} average rating`,
        stats.verifiedHosts?.value && `${stats.verifiedHosts.value} verified hosts`,
      ].filter(Boolean).join(' · ')
    : null;

  const heroHeight = compact ? 'clamp(260px, 34vh, 340px)' : 'clamp(320px, 42vh, 420px)';

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

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.08] tracking-tight max-w-2xl">
              {slide.headline}
            </h1>

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
