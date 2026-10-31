import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, HandHeart, House, Search, ShoppingBag, Sparkles, UtensilsCrossed, X } from 'lucide-react';
import appIcon from '../../apple-touch-icon.png';

const introSlides = [
  {
    eyebrow: 'Discover nearby',
    title: 'Find what you need, close to home.',
    description: 'Explore local places, helpful people, food, services and everyday finds—all in one LoopOut community.',
    Icon: Search,
    color: 'from-rose-500 to-orange-400',
    items: [{ Icon: House, label: 'Places to stay' }, { Icon: HandHeart, label: 'Local helpers' }, { Icon: UtensilsCrossed, label: 'Food nearby' }],
  },
  {
    eyebrow: 'Book with confidence',
    title: 'Meet the right local provider.',
    description: 'Compare profiles, see the details that matter, and send a booking request for the service you need.',
    Icon: BriefcaseBusiness,
    color: 'from-violet-500 to-indigo-500',
    items: [{ Icon: Search, label: 'Browse profiles' }, { Icon: BriefcaseBusiness, label: 'Choose a service' }, { Icon: Sparkles, label: 'Send a request' }],
  },
  {
    eyebrow: 'Become a provider',
    title: 'Turn your skills into bookings.',
    description: 'Sign in, open Become, choose a role and select Convert. Then create your profile and publish your service.',
    Icon: HandHeart,
    color: 'from-emerald-500 to-teal-500',
    items: [{ Icon: Search, label: 'Sign in' }, { Icon: Sparkles, label: 'Choose your role' }, { Icon: BriefcaseBusiness, label: 'Select Convert' }],
  },
  {
    eyebrow: 'More ways to grow',
    title: 'Sell, serve food or share a space.',
    description: 'List goods, offer meals, host guests or provide a service. Keep your requests and conversations together in LoopOut.',
    Icon: ShoppingBag,
    color: 'from-amber-500 to-rose-500',
    items: [{ Icon: ShoppingBag, label: 'Sell local goods' }, { Icon: UtensilsCrossed, label: 'Offer food' }, { Icon: House, label: 'Host guests' }],
  },
];

export default function AuthBrandLogo() {
  const [isZooming, setIsZooming] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const SlideIcon = introSlides[activeSlide].Icon;

  useEffect(() => {
    if (!showIntro || activeSlide >= introSlides.length - 1) return undefined;
    const timer = setTimeout(() => setActiveSlide(index => Math.min(index + 1, introSlides.length - 1)), 5200);
    return () => clearTimeout(timer);
  }, [showIntro, activeSlide]);

  useEffect(() => {
    if (!showIntro && !isZooming) return undefined;
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setIsZooming(false);
        setShowIntro(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showIntro, isZooming]);

  const closeIntro = () => {
    setShowIntro(false);
    setActiveSlide(0);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Discover how LoopOut works"
        onClick={() => { setActiveSlide(0); setIsZooming(true); }}
        disabled={isZooming || showIntro}
        className="inline-flex items-center gap-2.5 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-4"
      >
        <span className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center">
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl border-2 border-rose-400/70"
            animate={{ scale: [1, 1.2], opacity: [0.45, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
          <img src={appIcon} alt="" className="relative z-[1] h-12 w-12 rounded-2xl object-contain" />
          <motion.span
            aria-hidden="true"
            className="absolute -right-1 -top-1 z-[2] flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white shadow-md ring-2 ring-white"
            animate={{ y: [0, -2, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Search className="h-3 w-3" />
          </motion.span>
        </span>
        <span className="text-2xl font-black tracking-tight">
          <span className="text-rose-600">loop</span><span className="text-orange-500">Out</span>
        </span>
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isZooming && (
            <motion.div
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-600"
              onClick={() => setIsZooming(false)}
            >
              <motion.img
                src={appIcon}
                alt=""
                initial={{ width: 56, height: 56, rotate: 0, borderRadius: 16, opacity: 1 }}
                animate={{ width: '160vmax', height: '160vmax', rotate: 360, borderRadius: '50%', opacity: [1, 0.96, 0.96, 0] }}
                transition={{ duration: 1.15, ease: [0.2, 0.72, 0.2, 1] }}
                onAnimationComplete={() => { setIsZooming(false); setShowIntro(true); }}
                className="max-w-none shrink-0 object-contain drop-shadow-[0_0_28px_rgba(255,255,255,0.24)]"
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showIntro && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="loopout-intro-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="fixed inset-0 z-[10001] flex items-center justify-center overflow-y-auto bg-slate-950/95 px-4 py-8 text-white backdrop-blur-xl sm:px-6"
            >
              <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-rose-500/20 blur-3xl" />
                <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
              </div>

              <button type="button" onClick={closeIntro} aria-label="Close LoopOut introduction" className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 transition hover:bg-white/20 sm:right-7 sm:top-7">
                <X className="h-5 w-5" />
              </button>

              <div className="relative z-[1] w-full max-w-xl">
                <div className="mb-7 flex items-center justify-center gap-3">
                  <img src={appIcon} alt="" className="h-10 w-10 rounded-xl object-contain" />
                  <span className="text-xl font-black tracking-tight"><span className="text-rose-400">loop</span><span className="text-orange-300">Out</span></span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.section
                    key={activeSlide}
                    initial={{ opacity: 0, y: 22, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.99 }}
                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-9"
                  >
                    <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${introSlides[activeSlide].color} shadow-lg`}>
                      <SlideIcon className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-rose-200">{introSlides[activeSlide].eyebrow}</p>
                    <h2 id="loopout-intro-title" className="mx-auto mt-3 max-w-lg text-center text-3xl font-semibold tracking-tight sm:text-4xl">
                      {introSlides[activeSlide].title}
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-center text-sm leading-6 text-slate-300 sm:text-base">
                      {introSlides[activeSlide].description}
                    </p>

                    <div className="mt-7 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {introSlides[activeSlide].items.map(({ Icon, label }) => (
                        <div key={label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/15 px-3 py-3 sm:flex-col sm:justify-center sm:gap-2 sm:text-center">
                          <Icon className="h-5 w-5 shrink-0 text-rose-200" />
                          <span className="text-xs font-medium text-slate-200">{label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                </AnimatePresence>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5" aria-label={`Step ${activeSlide + 1} of ${introSlides.length}`}>
                    {introSlides.map((slide, index) => (
                      <button key={slide.eyebrow} type="button" aria-label={`Go to introduction step ${index + 1}`} onClick={() => setActiveSlide(index)} className={`h-2 rounded-full transition-all ${index === activeSlide ? 'w-7 bg-rose-300' : 'w-2 bg-white/30 hover:bg-white/60'}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {activeSlide > 0 && (
                      <button type="button" onClick={() => setActiveSlide(index => Math.max(0, index - 1))} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10" aria-label="Previous introduction step">
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                    )}
                    {activeSlide < introSlides.length - 1 ? (
                      <button type="button" onClick={() => setActiveSlide(index => Math.min(introSlides.length - 1, index + 1))} className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-rose-100">
                        Next <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button type="button" onClick={closeIntro} className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-rose-100">
                        Continue to LoopOut <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-5 text-center text-xs text-slate-400">Tap through the steps, or let them cycle automatically.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
