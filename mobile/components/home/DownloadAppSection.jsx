import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon, 
  MapPinIcon, 
  CalendarDaysIcon, 
  CheckCircleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/solid';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { BrandIcon } from '../BrandLogo';
import { isNativeApp } from '../../utils/nativeApp';

const SCREEN_DURATION = 3500;

// Four static preview screens illustrate the booking journey. They are not
// live listings, availability, or booking confirmations.
const SCREENS = [
  {
    id: 'browse',
    label: 'Browse',
    render: () => (
      <div className="h-full bg-white flex flex-col overflow-hidden select-none">
        {/* Phone Top Status */}
        <div className="px-4 pt-2.5 pb-1 flex items-center justify-between text-[8px] font-black text-gray-400">
          <span className="flex items-center gap-1 text-gray-700 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            9:41
          </span>
          <div className="flex items-center gap-1">
            <MapPinIcon className="w-2.5 h-2.5 text-rose-500" />
            <span className="text-[8px] font-black uppercase tracking-wider text-gray-800">Johannesburg, GP</span>
          </div>
        </div>

        {/* Header & Search */}
        <div className="px-3.5 pt-1 pb-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[14px] font-black text-gray-950 tracking-tight leading-tight">Find a service</h4>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
              340+ Pros
            </span>
          </div>
          {/* Mock Search Bar */}
          <div className="mt-1.5 flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 rounded-xl border border-gray-150 text-[8.5px] text-gray-400">
            <MagnifyingGlassIcon className="w-3 h-3 text-rose-500 shrink-0" />
            <span className="truncate">Search cleaners, tutors, chefs, plumbing...</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-3.5 flex gap-1 mb-2 overflow-x-hidden">
          {['Cleaning', 'Barber', 'Chef', 'Tutors', 'Plumbing'].map((c, i) => (
            <span 
              key={c} 
              className={`text-[8px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                i === 0 
                  ? 'bg-gray-950 text-white shadow-xs' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c}
            </span>
          ))}
        </div>

        {/* Scrollable Content: Featured Services + More Services at Bottom */}
        <div className="px-3.5 space-y-2 flex-1 overflow-y-auto scrollbar-hide pb-2">
          {/* 4 Featured Services Grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                title: 'Home Deep Clean',
                category: 'Cleaning',
                price: 'R450',
                rating: '4.9',
                reviews: '128',
                badge: 'Verified',
                bg: 'from-rose-400 to-rose-500'
              },
              {
                title: 'Premium Barber',
                category: 'Grooming',
                price: 'R180',
                rating: '4.9',
                reviews: '94',
                badge: 'Popular',
                bg: 'from-amber-400 to-orange-500'
              },
              {
                title: 'Private Chef Dining',
                category: 'Culinary',
                price: 'R650',
                rating: '5.0',
                reviews: '62',
                badge: 'Top Pro',
                bg: 'from-emerald-400 to-teal-500'
              },
              {
                title: 'Maths & STEM Tutor',
                category: 'Education',
                price: 'R250/h',
                rating: '4.8',
                reviews: '47',
                badge: 'Expert',
                bg: 'from-blue-400 to-indigo-500'
              }
            ].map((svc) => (
              <div key={svc.title} className="rounded-xl overflow-hidden border border-gray-100 bg-white shadow-xs hover:border-gray-300 transition-all">
                <div className={`h-12 bg-gradient-to-br ${svc.bg} p-1.5 flex items-start justify-between text-white relative`}>
                  <span className="text-[7.5px] font-black uppercase tracking-wider bg-black/30 backdrop-blur-xs px-1.5 py-0.5 rounded-full">
                    {svc.category}
                  </span>
                  <span className="text-[8px] font-black bg-white/95 text-gray-900 px-1.5 py-0.5 rounded-md shadow-2xs">
                    {svc.price}
                  </span>
                </div>
                <div className="p-1.5">
                  <p className="text-[8.5px] font-black text-gray-900 truncate">{svc.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-0.5">
                      <StarIcon className="w-2.5 h-2.5 text-amber-500" />
                      <span className="text-[7.5px] font-bold text-gray-700">{svc.rating}</span>
                      <span className="text-[7px] text-gray-400">({svc.reviews})</span>
                    </div>
                    <span className="text-[7px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                      {svc.badge}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* More Services Section at the Bottom */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <SparklesIcon className="w-2.5 h-2.5 text-rose-500" />
                <span className="text-[9px] font-black text-gray-900 tracking-tight">More Services in Johannesburg</span>
              </div>
              <span className="text-[7.5px] font-black text-rose-600 uppercase tracking-wider">View all</span>
            </div>

            <div className="space-y-1.5">
              {[
                {
                  title: 'Plumbing & Emergency Leaks',
                  pro: 'Sipho Repairs',
                  rate: 'From R380',
                  rating: '4.9',
                  tag: '⚡ 30m response',
                  tagColor: 'text-amber-700 bg-amber-50 border-amber-200'
                },
                {
                  title: 'Mobile Nails & Beauty Glam',
                  pro: 'Lindiwe Beauty Studio',
                  rate: 'From R220',
                  rating: '4.9',
                  tag: '💅 At-home',
                  tagColor: 'text-rose-700 bg-rose-50 border-rose-200'
                },
                {
                  title: 'Solar & Inverter Maintenance',
                  pro: 'Gauteng Solar Tech',
                  rate: 'From R500',
                  rating: '5.0',
                  tag: '☀️ Certified',
                  tagColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
                }
              ].map((item) => (
                <div 
                  key={item.title} 
                  className="flex items-center justify-between p-1.5 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-[8.5px] font-black text-gray-900 truncate leading-snug">{item.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[7.5px] text-gray-500 truncate">{item.pro}</span>
                      <span className={`text-[7px] font-bold px-1 py-0.2 rounded border ${item.tagColor}`}>
                        {item.tag}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[8px] font-black text-gray-950 block">{item.rate}</span>
                    <div className="flex items-center gap-0.5 justify-end">
                      <StarIcon className="w-2 h-2 text-amber-500" />
                      <span className="text-[7px] font-bold text-gray-600">{item.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom App Nav Dock */}
        <div className="mt-auto px-3 py-1.5 border-t border-gray-100 flex items-center justify-around bg-white/95 backdrop-blur-xs text-[7px] font-black">
          <div className="flex flex-col items-center text-rose-500">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mb-0.5" />
            <span>Home</span>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-transparent mb-0.5" />
            <span>Search</span>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-transparent mb-0.5" />
            <span>Bookings</span>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-transparent mb-0.5" />
            <span>Profile</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'detail',
    label: 'Service',
    render: () => (
      <div className="h-full bg-white flex flex-col">
        <div className="h-24 bg-gradient-to-br from-rose-300 to-rose-400 relative flex-shrink-0">
          <button className="absolute top-3 left-3 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
            <ChevronLeftIcon className="w-3.5 h-3.5 text-gray-900" />
          </button>
        </div>
        <div className="px-4 pt-3 flex-1">
          <h4 className="text-[14px] font-black text-gray-900 tracking-tight">Home Deep Clean</h4>
          <div className="flex items-center gap-1 mt-1">
            <MapPinIcon className="w-3 h-3 text-gray-400" />
            <span className="text-[9px] font-bold text-gray-500">Sandton, Johannesburg</span>
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            <StarIcon className="w-3 h-3 text-gray-900" />
            <span className="text-[10px] font-black text-gray-900">4.9</span>
            <span className="text-[9px] text-gray-400 font-semibold">(128 reviews)</span>
          </div>
          <div className="h-px bg-gray-100 my-2.5" />
          <p className="text-[9px] text-gray-500 font-medium leading-relaxed">Full home clean including kitchen, bathrooms &amp; living areas.</p>
        </div>
        <div className="p-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[13px] font-black text-gray-900">R450</span>
          <span className="text-[9px] font-black text-white bg-rose-500 px-3 py-1.5 rounded-full">Book now</span>
        </div>
      </div>
    ),
  },
  {
    id: 'schedule',
    label: 'Schedule',
    render: () => (
      <div className="h-full bg-white flex flex-col">
        <div className="px-4 pt-3 pb-2 flex items-center gap-2">
          <button className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <ChevronLeftIcon className="w-3.5 h-3.5 text-gray-900" />
          </button>
          <h4 className="text-[13px] font-black text-gray-900 tracking-tight">Pick a time</h4>
        </div>
        <div className="px-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <CalendarDaysIcon className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[10px] font-bold text-gray-700">Thursday, 12 September</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {['09:00', '11:30', '14:00', '15:30', '17:00', '18:30'].map((t, i) => (
              <span
                key={t}
                className={`text-[9px] font-black text-center py-2 rounded-lg ${
                  i === 2 ? 'bg-rose-500 text-white' : 'bg-gray-50 text-gray-600 border border-gray-100'
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="p-3 mt-auto border-t border-gray-100">
          <span className="block text-center text-[9px] font-black text-white bg-gray-900 py-2.5 rounded-full">Confirm booking</span>
        </div>
      </div>
    ),
  },
  {
    id: 'confirmed',
    label: 'Confirmed',
    render: () => (
      <div className="h-full bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
          <CheckCircleIcon className="w-7 h-7 text-emerald-500" />
        </div>
        <h4 className="text-[13px] font-black text-gray-900 tracking-tight">Booking preview</h4>
        <p className="text-[9px] text-gray-500 font-medium mt-1 leading-relaxed">
          Example confirmation for a home cleaning appointment.
        </p>
        <div className="mt-4 w-full rounded-xl border border-gray-100 p-2.5 flex items-center gap-2 text-left">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-300 to-rose-400 flex-shrink-0" />
          <div>
            <p className="text-[9px] font-black text-gray-900">Example provider</p>
            <p className="text-[8px] text-gray-400 font-semibold">Booking flow preview</p>
          </div>
        </div>
      </div>
    ),
  },
];

const PhoneMockup = () => {
  const [screenIndex, setScreenIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setScreenIndex((prev) => (prev + 1) % SCREENS.length);
    }, SCREEN_DURATION);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto" style={{ width: 260 }}>
      {/* Phone frame */}
      <div className="relative rounded-[2.75rem] bg-gray-950 p-3 shadow-2xl">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-950 rounded-full z-20" />
        <div className="relative rounded-[2.1rem] overflow-hidden bg-white" style={{ height: 520 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={SCREENS[screenIndex].id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              {SCREENS[screenIndex].render()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress dots — this is a real sequence, so numbering/dots earn their place */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        {SCREENS.map((s, i) => (
          <div
            key={s.id}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === screenIndex ? 20 : 6,
              background: i === screenIndex ? '#F43F5E' : '#E5E7EB',
            }}
          />
        ))}
      </div>
    </div>
  );
};

const StoreBadge = ({ platform }) => (
  <div className="flex items-center gap-2.5 bg-gray-950 text-white rounded-xl px-4 py-2.5 opacity-90 cursor-default select-none">
    {platform === 'ios' ? (
      <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8.9-.16 1.76-.83 3.07-.79 1.65.14 2.9.85 3.72 2.28-3.34 2-2.55 6.6.14 7.5-.6 1.65-1.36 3.3-1.99 3.9-.05-.02 0 0 0 0zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor">
        <path d="M3.6 2.6c-.3.3-.5.7-.5 1.2v16.4c0 .5.2.9.5 1.2l.1.1L13 12.3v-.2L3.7 2.5l-.1.1zM16.8 15.1l-2.9-2.9v-.4l2.9-2.9 3.5 2c1 .6 1 1.5 0 2.1l-3.5 2.1zM4.3 21.5l9-9.2 2.9 2.9-9.9 5.7c-.8.4-1.6.4-2-.1v-.6.3zM13.3 11.1l-9-9.2c.4-.5 1.2-.5 2-.1l9.9 5.7-2.9 2.9v.7z" />
      </svg>
    )}
    <div className="text-left">
      <p className="text-[8px] font-medium text-gray-300 leading-none">Coming soon to</p>
      <p className="text-[13px] font-black leading-tight -mt-px">{platform === 'ios' ? 'App Store' : 'Google Play'}</p>
    </div>
  </div>
);

const DownloadAppSection = () => {
  if (isNativeApp()) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="order-2 md:order-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 mb-5">
            <BrandIcon className="w-8 h-8" />
            <span className="text-lg font-black tracking-tighter">
              <span className="text-rose-500">loop</span>
              <span className="text-orange-500">Out</span>
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.1]">
            Book a home service in under a minute
          </h2>
           <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-md mx-auto md:mx-0">
             Browse trusted local pros, pick a time that works, and get confirmed instantly — the loopOut app is on its way to iOS and Android.
           </p>
           <p className="mt-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Illustrative app preview. Listings, prices, and availability shown in the preview are examples.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-3">
            <StoreBadge platform="ios" />
            <StoreBadge platform="android" />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
};

export default DownloadAppSection;
