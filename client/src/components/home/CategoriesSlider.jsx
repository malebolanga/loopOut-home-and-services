import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export const CategoriesSlider = ({ navigate, TOP_CATEGORIES = [] }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [TOP_CATEGORIES.length]);

  const scroll = (direction) => {
    scrollRef.current?.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  const handleCategoryClick = (category) => {
    const helpers = ['sneaker', 'washingmat', 'animals', 'domestic', 'tutor', 'maid', 'beauty', 'cleaner', 'nanny', 'barber'];
    const services = ['baker', 'carwash', 'photograph', 'transport', 'tattoo', 'hair', 'nails', 'massage', 'chef', 'landscaping', 'electrician', 'handyman', 'catering', 'schoolTransport', 'daily', 'daycare', 'storage'];
    const properties = ['rental', 'guesthouse'];
    const needs = ['roommate', 'nanny-need'];
    if (needs.includes(category.id)) navigate('/micro-gigs');
    else if (helpers.includes(category.id)) navigate(`/search?category=${category.id}&type=helpers`);
    else if (services.includes(category.id)) navigate(`/search?category=${category.id}&type=services`);
    else if (properties.includes(category.id)) navigate(`/search?category=${category.id}&type=properties`);
    else navigate(`/search?category=${category.id}`);
  };

  return (
    <section aria-label="Popular LoopOut categories" className="mb-10">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Popular categories</h2>
          <p className="text-gray-500 mt-1 text-sm">Quick ways to find what you need.</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <button type="button" onClick={() => scroll('left')} disabled={!canScrollLeft} aria-label="Previous categories" className="p-2.5 rounded-full border border-gray-200 bg-white disabled:opacity-30 hover:bg-gray-50 transition"><ChevronLeftIcon className="w-5 h-5" /></button>
          <button type="button" onClick={() => scroll('right')} disabled={!canScrollRight} aria-label="Next categories" className="p-2.5 rounded-full border border-gray-200 bg-white disabled:opacity-30 hover:bg-gray-50 transition"><ChevronRightIcon className="w-5 h-5" /></button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {TOP_CATEGORIES.map((category) => (
          <button type="button" key={category.id} onClick={() => handleCategoryClick(category)} className="group snap-start shrink-0 w-[132px] sm:w-[150px] text-left rounded-2xl border border-gray-200 bg-white p-4 hover:border-rose-200 hover:shadow-md active:scale-[.98] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl mb-3 group-hover:bg-rose-50 transition-colors">{category.emoji || '✨'}</div>
            <span className="block font-bold text-gray-900 text-sm truncate">{category.name}</span>
            <span className="block mt-1 text-xs text-gray-500">Explore →</span>
          </button>
        ))}
      </div>
    </section>
  );
};
