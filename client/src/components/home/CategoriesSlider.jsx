import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { FreshaCategoryCard } from './FreshaCategoryCard';

export const CategoriesSlider = ({ navigate, TOP_CATEGORIES }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => scrollEl.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (category) => {
    const helpers = ['sneaker', 'washingmat', 'animals', 'domestic', 'tutor', 'maid', 'beauty', 'cleaner', 'nanny', 'barber'];
    const services = ['baker', 'carwash', 'photograph', 'transport', 'tattoo', 'hair', 'nails', 'massage', 'chef', 'landscaping', 'electrician', 'handyman', 'catering', 'schoolTransport', 'daily', 'daycare', 'storage'];
    const properties = ['rental', 'guesthouse'];
    const needs = ['roommate', 'nanny-need'];

    if (needs.includes(category.id)) {
      navigate('/looking-for');
    } else if (helpers.includes(category.id)) {
      navigate(`/search?category=${category.id}&type=helpers`);
    } else if (services.includes(category.id)) {
      navigate(`/search?category=${category.id}&type=services`);
    } else if (properties.includes(category.id)) {
      navigate(`/search?category=${category.id}&type=properties`);
    } else {
      navigate(`/search?category=${category.id}`);
    }
  };

  return (
    <section className="mb-12 relative">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Top categories</h2>
          <p className="text-gray-500 mt-1 text-sm">Discover professionals near you</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className={`p-2 rounded-full border transition-all ${canScrollLeft ? 'border-gray-300 hover:bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
            disabled={!canScrollLeft}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className={`p-2 rounded-full border transition-all ${canScrollRight ? 'border-gray-300 hover:bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
            disabled={!canScrollRight}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {TOP_CATEGORIES.map((category, index) => (
          <div key={category.id} className="snap-start shrink-0 w-[160px] sm:w-[180px]">
            <FreshaCategoryCard
              category={category}
              onClick={handleCategoryClick}
              index={index}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
