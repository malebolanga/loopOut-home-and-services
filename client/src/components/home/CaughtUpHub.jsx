import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Smartphone, 
  Building2, 
  Users, 
  Globe, 
  Sparkles, 
  ArrowUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  QrCode
} from 'lucide-react';
import { FaApple, FaGooglePlay } from 'react-icons/fa';

const REVIEWS = [
  {
    id: 1,
    title: "Everything I need in one place",
    quote: "Great booking app as you can easily book appointments, stays, pay and rate your experience all through this platform.",
    author: "Jordan",
    location: "Cape Town, South Africa",
    rating: 5
  },
  {
    id: 2,
    title: "The best booking system",
    quote: "Great experience, easy to book. Paying for treatments and home services is so convenient — no cash or cards needed!",
    author: "Lucy",
    location: "London, UK",
    rating: 5
  },
  {
    id: 3,
    title: "Found my favorite local pros",
    quote: "Recently moved to Polokwane and didn't know any salons or helpers. loopOut gave me a whole new verified list to choose from!",
    author: "Thabo",
    location: "Polokwane, South Africa",
    rating: 5
  },
  {
    id: 4,
    title: "Easy to use & explore",
    quote: "loopOut's reminders make life so much easier. I also found a few good barbershops and local helpers that I didn't know existed.",
    author: "Dan",
    location: "New York, USA",
    rating: 5
  },
  {
    id: 5,
    title: "Great for finding services",
    quote: "I've been using loopOut for two years and it's by far the best booking and home services platform I've used. Highly recommend it!",
    author: "Dale",
    location: "Sydney, Australia",
    rating: 5
  },
  {
    id: 6,
    title: "My go-to for self-care & home",
    quote: "loopOut is my go-to app for massages, beauty and stays. I can easily find and book places near me — I love it!",
    author: "Cameron",
    location: "Edinburgh, UK",
    rating: 5
  },
  {
    id: 7,
    title: "All my clients love it",
    quote: "My clients love booking appointments online with loopOut. The consultation forms and free SMS reminders are so convenient.",
    author: "Anton",
    location: "Los Angeles, USA",
    rating: 5
  },
  {
    id: 8,
    title: "Ten times better than other apps",
    quote: "Moving to loopOut has been the best decision for my business. My stylists and clients all love the app. It completely transformed our operations.",
    author: "Agnesa",
    location: "Montreal, Canada",
    rating: 5
  },
  {
    id: 9,
    title: "Hassle-free bookings",
    quote: "loopOut lets you pick the day, time and service pro, gives a clear price and timeframe for all services on a simple menu. Instant confirmation!",
    author: "Pamela",
    location: "Dublin, Ireland",
    rating: 5
  },
  {
    id: 10,
    title: "Sleek look & feel, easy to use",
    quote: "I love the slick and sleek look and feel of this booking software. It’s the best in the industry and I highly recommend it.",
    author: "Sylvester",
    location: "Melbourne, Australia",
    rating: 5
  }
];

const METRICS = [
  { value: "1 Million+", label: "appointments & bookings on loopOut", icon: Sparkles },
  { value: "130,000+", label: "partner businesses & local hosts", icon: Building2 },
  { value: "120+ regions", label: "using loopOut worldwide", icon: Globe },
  { value: "450,000+", label: "stylists, helpers & service pros", icon: Users }
];

const CaughtUpHub = ({ stats, navigate }) => {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const nextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % REVIEWS.length);
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-16 mb-24 space-y-16">
      
      {/* 1. App Download Hero Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 p-8 sm:p-12 text-white border border-slate-800 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-black uppercase tracking-widest text-rose-300">
              <Smartphone className="w-3.5 h-3.5 text-rose-400" />
              Official Mobile App
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Download the <span className="bg-gradient-to-r from-rose-400 via-pink-300 to-purple-300 bg-clip-text text-transparent">loopOut app</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Book unforgettable beauty, stays, local helpers, and wellness experiences with the loopOut mobile app — anytime, anywhere.
            </p>

            {/* App Store Buttons & QR */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button 
                onClick={() => navigate('/download')}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 transition-all font-bold shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
              >
                <FaApple className="w-6 h-6 shrink-0" />
                <div className="text-left leading-tight">
                  <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">Download on the</div>
                  <div className="text-sm font-black">App Store</div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/download')}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white transition-all font-bold shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
              >
                <FaGooglePlay className="w-5 h-5 shrink-0 text-emerald-400" />
                <div className="text-left leading-tight">
                  <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Get it on</div>
                  <div className="text-sm font-black">Google Play</div>
                </div>
              </button>

              <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
                <QrCode className="w-5 h-5 text-rose-400" />
                <span>Scan QR code to install</span>
              </div>
            </div>
          </div>

          {/* Right Mobile Visual / Badge */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div 
              whileHover={{ y: -6, rotate: -2 }}
              className="relative p-6 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-md shadow-2xl text-center max-w-xs w-full"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white mb-1">#1 Selfcare & Services App</h3>
              <p className="text-xs text-slate-400 mb-4">Rated 4.9★ by over 500,000+ users worldwide</p>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Instant Confirmation
              </div>
            </motion.div>
          </div>
        </div>
      </div>


      {/* 2. Reviews Section */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-[2.5rem] p-8 sm:p-12 shadow-sm relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-rose-600 text-xs font-extrabold uppercase tracking-widest mb-1">
              <Star className="w-4 h-4 fill-rose-500 text-rose-500" /> Verified Customer Reviews
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Loved by thousands of clients & pros
            </h2>
          </div>

          {/* Carousel Navigation Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={prevReview}
              className="p-3 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-sm active:scale-95 transition-all cursor-pointer"
              aria-label="Previous Review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextReview}
              className="p-3 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-sm active:scale-95 transition-all cursor-pointer"
              aria-label="Next Review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Featured Interactive Review Slide */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentReviewIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {[
              REVIEWS[currentReviewIndex],
              REVIEWS[(currentReviewIndex + 1) % REVIEWS.length],
              REVIEWS[(currentReviewIndex + 2) % REVIEWS.length]
            ].map((rev, idx) => (
              <div
                key={`${rev.id}-${idx}`}
                className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-1.5 text-xs font-bold text-slate-700">5 rating</span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mb-2">
                    "{rev.title}"
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
                    {rev.quote}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-slate-900">{rev.author}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{rev.location}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-rose-600">
                    {rev.author[0]}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>


      {/* 3. Platform Impact Statistics */}
      <div className="py-12 border-y border-slate-200/80 text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          The top-rated destination for selfcare & lifestyle
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-10 max-w-xl mx-auto">
          One solution, one software. Trusted by the best in the selfcare, stays, and service industry.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {METRICS.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200/70 shadow-xs hover:border-slate-300 transition-all">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">
                  {metric.value}
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {metric.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* 4. loopOut for Business Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="space-y-3 text-center md:text-left">
          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase tracking-widest">
            For Entrepreneurs & Providers
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            loopOut for business
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
            Supercharge your business with South Africa's top booking platform for salons, stays, and service pros. Independently voted #1 by industry professionals.
          </p>
        </div>

        <button
          onClick={() => navigate('/become')}
          className="px-6 py-4 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95 shrink-0 cursor-pointer"
        >
          Find out more <ArrowRight className="w-4 h-4 text-rose-600" />
        </button>
      </div>


      {/* 5. Trust Badges & Back to Top */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-emerald-500 text-emerald-500" />
            ))}
          </div>
          <span className="text-xs font-extrabold text-slate-900">Excellent 5/5</span>
          <span className="text-xs text-slate-400 font-medium">| Over 1,250+ reviews on Capterra & App Stores</span>
        </div>

        <button
          onClick={scrollToTop}
          className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
        >
          Back to Top <ArrowUp className="w-4 h-4 text-rose-500" />
        </button>
      </div>

    </div>
  );
};

export default CaughtUpHub;
