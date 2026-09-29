import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  HomeIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  AcademicCapIcon,
  HeartIcon,
  BuildingOfficeIcon,
  ShoppingBagIcon,
  BeakerIcon,
  CakeIcon,
  CameraIcon,
  MusicalNoteIcon,
  SunIcon,
  ComputerDesktopIcon,
  BookOpenIcon,
  FireIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  StarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Sparkles } from 'lucide-react';

const Categories = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentLocation] = useState('South Africa');

  // Quick Categories Grid from Home.jsx
  const categories = [
    { icon: '🏠', label: 'Homes', color: 'bg-blue-100', type: 'properties' },
    { icon: '✨', label: 'Services', color: 'bg-emerald-100', type: 'services' },
    { icon: '👷', label: 'Helper', color: 'bg-purple-100', type: 'helpers' },
    { icon: '🎪', label: 'Events', color: 'bg-amber-100', type: 'events' },
    { icon: '🏨', label: 'Hotels', color: 'bg-rose-100', type: 'properties', category: 'rent-short' },
    { icon: '🛒', label: 'Shopping', color: 'bg-yellow-100', type: 'services' },
    { icon: '🍽️', label: 'Food', color: 'bg-red-100', type: 'services' },
    { icon: '➕', label: 'More', color: 'bg-gray-100 dark:bg-gray-800', onClick: () => navigate('/categories') }
  ];

  // Main categories data
  const mainCategories = [
    {
      id: 'properties',
      title: 'Properties',
      description: 'Find your perfect home, office, or stay',
      icon: HomeIcon,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      subcategories: [
        { id: 'sale', name: 'Hotels', count: 1234, icon: BuildingOfficeIcon },
        { id: 'rent-long', name: 'Long Term Rentals', count: 876, icon: HomeIcon },
        { id: 'rent-short', name: 'Short Term Rentals', count: 543, icon: HomeIcon },
        { id: 'office', name: 'Office Spaces', count: 321, icon: BuildingOfficeIcon },
        { id: 'land', name: 'Self Catering', count: 198, icon: HomeIcon },
        { id: 'commercial', name: 'Commercial Properties', count: 267, icon: BuildingStorefrontIcon },
      ]
    },
    {
      id: 'services',
      title: 'Services',
      description: 'Professional services for home, business, and more',
      icon: WrenchScrewdriverIcon,
      color: 'bg-emerald-500',
      gradient: 'from-emerald-500 to-emerald-600',
      subcategories: [
        { id: 'cleaning', name: 'Cleaning Services', count: 345, icon: Sparkles },
        { id: 'handyman service', name: 'Handyman', count: 289, icon: WrenchScrewdriverIcon },
        { id: 'moving', name: 'Moving & Relocation', count: 167, icon: TruckIcon },
        { id: 'landscaping', name: 'Landscaping', count: 123, icon: SunIcon },
        { id: 'catering', name: 'Catering & Food', count: 189, icon: CakeIcon },
        { id: 'photography', name: 'Photography', count: 145, icon: CameraIcon },
        { id: 'it-services', name: 'IT Services', count: 234, icon: ComputerDesktopIcon },
        { id: 'tutoring', name: 'Tutoring', count: 178, icon: AcademicCapIcon },
      ]
    },
    {
      id: 'helpers',
      title: 'Helper',
      description: 'Find reliable help for various tasks',
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600',
      subcategories: [
        { id: 'caregivers', name: 'Caregivers', count: 267, icon: HeartIcon },
        { id: 'tutors', name: 'Tutors', count: 189, icon: AcademicCapIcon },
        { id: 'handyman', name: 'Handyman', count: 324, icon: WrenchScrewdriverIcon },
        { id: 'cleaning-help', name: 'Cleaning Help', count: 456, icon: Sparkles },
        { id: 'drivers', name: 'Drivers', count: 178, icon: TruckIcon },
        { id: 'babysitters', name: 'Babysitters', count: 234, icon: UserGroupIcon },
        { id: 'pet-care', name: 'Pet Care', count: 145, icon: HeartIcon },
        { id: 'event-staff', name: 'Event Staff', count: 123, icon: CalendarDaysIcon },
      ]
    },
    {
      id: 'events',
      title: 'Events',
      description: 'Discover exciting events and activities',
      icon: CalendarDaysIcon,
      color: 'bg-amber-500',
      gradient: 'from-amber-500 to-amber-600',
      subcategories: [
        { id: 'concerts', name: 'Concerts & Music', count: 89, icon: MusicalNoteIcon },
        { id: 'workshops', name: 'Workshops', count: 145, icon: BookOpenIcon },
        { id: 'sports', name: 'Sports Events', count: 78, icon: FireIcon },
        { id: 'festivals', name: 'Festivals', count: 56, icon: CalendarDaysIcon },
        { id: 'conferences', name: 'Conferences', count: 67, icon: AcademicCapIcon },
        { id: 'food-events', name: 'Food Events', count: 92, icon: CakeIcon },
        { id: 'art-exhibitions', name: 'Art Exhibitions', count: 45, icon: CameraIcon },
        { id: 'community', name: 'Community Events', count: 112, icon: UserGroupIcon },
      ]
    },
    {
      id: 'shopping',
      title: 'Shopping',
      description: 'Local stores and online shopping',
      icon: ShoppingBagIcon,
      color: 'bg-rose-500',
      gradient: 'from-rose-500 to-rose-600',
      subcategories: [
        { id: 'fashion', name: 'Fashion & Clothing', count: 456, icon: ShoppingBagIcon },
        { id: 'electronics', name: 'Electronics', count: 234, icon: ComputerDesktopIcon },
        { id: 'home-decor', name: 'Home & Decor', count: 189, icon: HomeIcon },
        { id: 'groceries', name: 'Groceries', count: 567, icon: ShoppingBagIcon },
        { id: 'beauty', name: 'Beauty & Cosmetics', count: 198, icon: Sparkles },
        { id: 'sports-equipment', name: 'Sports Equipment', count: 123, icon: FireIcon },
        { id: 'books', name: 'Books & Stationery', count: 145, icon: BookOpenIcon },
        { id: 'specialty', name: 'Specialty Stores', count: 89, icon: BuildingStorefrontIcon },
      ]
    },
    {
      id: 'learning',
      title: 'Learning',
      description: 'Educational courses and training',
      icon: AcademicCapIcon,
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-indigo-600',
      subcategories: [
        { id: 'online-courses', name: 'Online Courses', count: 456, icon: ComputerDesktopIcon },
        { id: 'language', name: 'Language Classes', count: 189, icon: BookOpenIcon },
        { id: 'music-lessons', name: 'Music Lessons', count: 123, icon: MusicalNoteIcon },
        { id: 'art-classes', name: 'Art Classes', count: 145, icon: CameraIcon },
        { id: 'professional', name: 'Professional Training', count: 234, icon: AcademicCapIcon },
        { id: 'test-prep', name: 'Test Preparation', count: 178, icon: BookOpenIcon },
        { id: 'hobbies', name: 'Hobby Classes', count: 156, icon: Sparkles },
        { id: 'kids-activities', name: 'Kids Activities', count: 267, icon: UserGroupIcon },
      ]
    },
  ];

  // All subcategories flattened for search
  const allSubcategories = mainCategories.flatMap(category => 
    category.subcategories.map(sub => ({
      ...sub,
      mainCategory: category.title,
      mainCategoryId: category.id,
      mainColor: category.color
    }))
  );

  // Filter subcategories based on search
  const filteredSubcategories = searchTerm.trim() === '' 
    ? allSubcategories
    : allSubcategories.filter(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.mainCategory.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Handle category click
  const handleCategoryClick = (category) => {
    if (selectedCategory && selectedCategory.id === category.id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  // Handle subcategory click
  const handleSubcategoryClick = (mainCategoryId, subcategoryId) => {
    navigate(`/search?type=${mainCategoryId}&category=${subcategoryId}&address=${encodeURIComponent(currentLocation)}`);
  };

  // Handle view all in category
  const handleViewAll = (categoryId) => {
    navigate(`/search?type=${categoryId}&address=${encodeURIComponent(currentLocation)}`);
  };

  // Responsive grid classes
  const subcategoryGridCols = 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';

  return (
    <div className="min-h-screen pb-0">
      <Helmet>
        <title>All Categories | LoopOut</title>
        <meta name="description" content="Browse all categories on LoopOut: Properties, Services, Helpers, Events, and more." />
      </Helmet>
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-5 py-6 text-white shadow-2xl shadow-slate-900/20 sm:px-8 sm:py-9">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-rose-500/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="relative">
            <div className="mb-6 flex items-center justify-between">
              <button onClick={() => navigate(-1)} className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20">
                <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back
              </button>
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-rose-200 ring-1 ring-inset ring-rose-300/20">
                <Sparkles className="h-3.5 w-3.5" /> Explore LoopOut
              </span>
            </div>
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-200">Your local directory</p>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Find what moves <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-amber-200">your day.</span></h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Browse homes, trusted professionals, events and everyday essentials—all in one place.</p>
            </div>
            <div className="mt-7 max-w-3xl">
              <label className="sr-only" htmlFor="category-search">Search categories</label>
              <div className="relative rounded-2xl bg-white p-1.5 shadow-xl shadow-black/20">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input id="category-search" type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="What are you looking for?" className="w-full rounded-xl bg-transparent py-3 pl-11 pr-12 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 sm:text-base" />
                {searchTerm && <button onClick={() => setSearchTerm('')} aria-label="Clear category search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><XMarkIcon className="h-4 w-4" /></button>}
              </div>
            </div>
          </div>
        </section>
        <section className="mt-10 mb-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-rose-500">Start here</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Explore by need</h2>
            </div>
            <span className="hidden text-sm font-medium text-slate-500 sm:block">Six ways to get started</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => {
                  if (cat.onClick) {
                    cat.onClick();
                  } else if (cat.type && cat.category) {
                    navigate(`/search?type=${cat.type}&category=${cat.category}&address=${encodeURIComponent(currentLocation)}`);
                  } else if (cat.type) {
                    navigate(`/search?type=${cat.type}&address=${encodeURIComponent(currentLocation)}`);
                  }
                }}
                className="group flex min-h-32 flex-col items-start justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:shadow-black/20"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${cat.color} text-xl shadow-sm transition duration-300 group-hover:scale-110`}>
                  {cat.icon}
                </div>
                <span className="flex w-full items-center justify-between text-sm font-bold text-slate-800 dark:text-white"><span>{cat.label}</span><ChevronRightIcon className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-rose-500" /></span>
              </button>
            ))}
          </div>
        </section>

        {/* Browse All Categories Section */}
        <section className="mb-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-500">The directory</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{searchTerm.trim() ? 'Matching categories' : 'Browse collections'}</h2>
            </div>
            {!searchTerm.trim() && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">6 collections · 46 categories</span>}
          </div>
          
          {searchTerm.trim() === '' ? (
            // Show main categories when no search
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {mainCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
                  >
                    <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${category.gradient}`} />
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`rounded-xl p-2.5 ${category.color} bg-opacity-10`}>
                            <Icon className={`h-6 w-6 ${category.color.replace('bg-', 'text-')}`} />
                          </div>
                          <h3 className="ml-3 text-lg font-black tracking-tight text-slate-900 dark:text-white">{category.title}</h3>
                        </div>
                        <ChevronRightIcon className={`h-5 w-5 text-slate-400 transition-transform ${
                          selectedCategory?.id === category.id ? 'rotate-90' : ''
                        }`} />
                      </div>
                      <p className="mb-5 text-sm leading-6 text-slate-500 dark:text-slate-300">{category.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-400">
                          {category.subcategories.length} categories
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewAll(category.id);
                          }}
                          className="text-sm font-black text-rose-500 transition hover:text-rose-600"
                        >
                          View all →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Show search results
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-700 dark:text-white">
                  {filteredSubcategories.length} results for "{searchTerm}"
                </h3>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-sm text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-white"
                >
                  Clear search
                </button>
              </div>
              
              {filteredSubcategories.length > 0 ? (
                <div className={`grid ${subcategoryGridCols} gap-4`}>
                  {filteredSubcategories.map((subcategory) => {
                    const Icon = subcategory.icon;
                    return (
                      <div
                        key={`${subcategory.mainCategoryId}-${subcategory.id}`}
                        onClick={() => handleSubcategoryClick(subcategory.mainCategoryId, subcategory.id)}
                        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 cursor-pointer hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-800 active:opacity-80"
                      >
                        <div className="flex items-center mb-3">
                          <div className={`p-2 rounded-lg ${subcategory.mainColor} bg-opacity-10`}>
                            <Icon className={`w-5 h-5 ${subcategory.mainColor.replace('bg-', 'text-')}`} />
                          </div>
                          <div className="ml-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">{subcategory.name}</h4>
                            <span className="text-xs text-gray-500 dark:text-white">{subcategory.mainCategory}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-white">
                            {subcategory.count.toLocaleString()} listings
                          </span>
                          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800">
                  <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-700 dark:text-white mb-2">No results found</h3>
                  <p className="text-gray-500 dark:text-white text-sm mb-4">
                    Try searching with different keywords
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Selected Category Details */}
        {selectedCategory && searchTerm.trim() === '' && (
          <section className="mb-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">{selectedCategory.title} Subcategories</h2>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-white"
              >
                Collapse
              </button>
            </div>
            
            <div className="mb-5 rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-rose-50 p-5 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/30">
              <div className="flex items-center mb-2">
                <div className={`p-2 rounded-lg ${selectedCategory.color} bg-opacity-10 mr-3`}>
                  {selectedCategory.icon && (
                    <selectedCategory.icon className={`w-6 h-6 ${selectedCategory.color.replace('bg-', 'text-')}`} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{selectedCategory.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-white">{selectedCategory.description}</p>
                </div>
              </div>
            </div>

            <div className={`grid ${subcategoryGridCols} gap-3`}>
              {selectedCategory.subcategories.map((subcategory) => {
                const Icon = subcategory.icon;
                return (
                  <div
                    key={subcategory.id}
                    onClick={() => handleSubcategoryClick(selectedCategory.id, subcategory.id)}
                    className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-900 dark:hover:shadow-black/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${selectedCategory.color} bg-opacity-10`}>
                          <Icon className={`w-5 h-5 ${selectedCategory.color.replace('bg-', 'text-')}`} />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white ml-3">{subcategory.name}</span>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-rose-500" />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-white">
                      {subcategory.count.toLocaleString()} listings
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => handleViewAll(selectedCategory.id)}
                className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 py-3.5 font-black text-white shadow-lg shadow-rose-500/20 transition hover:scale-[1.01] hover:shadow-rose-500/30"
              >
                View All {selectedCategory.title}
              </button>
            </div>
          </section>
        )}

        {/* Popular Categories Quick Links */}
        {searchTerm.trim() === '' && !selectedCategory && (
          <section className="mb-12 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-500 dark:bg-rose-950/50">🔥</span><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">Most explored</p><h2 className="font-black text-slate-900 dark:text-white">Popular right now</h2></div></div>
            <div className="flex flex-wrap gap-2.5">
              {[
                { id: 'rent-short', name: 'Short Term Rentals', color: 'bg-green-100 text-green-800' },
                { id: 'cleaning', name: 'Cleaning Services', color: 'bg-emerald-100 text-emerald-800' },
                { id: 'tutors', name: 'Tutors', color: 'bg-purple-100 text-purple-800' },
                { id: 'concerts', name: 'Concerts', color: 'bg-amber-100 text-amber-800' },
                { id: 'fashion', name: 'Fashion Shopping', color: 'bg-rose-100 text-rose-800' },
                { id: 'online-courses', name: 'Online Courses', color: 'bg-indigo-100 text-indigo-800' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/search?category=${cat.id}&address=${encodeURIComponent(currentLocation)}`)}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${cat.color} shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="mb-10 rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/15 sm:p-8">
            <div className="mb-7 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-300">At a glance</p><h2 className="mt-1 text-2xl font-black">A world close to home</h2></div><Sparkles className="h-7 w-7 text-rose-300" /></div>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <div className="text-center">
                <div className="mb-1 text-3xl font-black text-blue-300">6</div>
                <p className="text-xs font-bold text-slate-400">Collections</p>
              </div>
              <div className="text-center">
                <div className="mb-1 text-3xl font-black text-emerald-300">{mainCategories.reduce((acc, cat) => acc + cat.subcategories.length, 0)}</div>
                <p className="text-xs font-bold text-slate-400">Categories</p>
              </div>
              <div className="text-center">
                <div className="mb-1 text-3xl font-black text-purple-300">48</div>
                <p className="text-xs font-bold text-slate-400">Filters</p>
              </div>
              <div className="text-center">
                <div className="mb-1 text-3xl font-black text-amber-200">10K+</div>
                <p className="text-xs font-bold text-slate-400">Listings</p>
              </div>
            </div>
          </section>

        {/* Back to Home */}
        <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
          <button onClick={() => navigate('/')} className="mx-auto flex items-center justify-center text-sm font-bold text-slate-500 transition hover:text-rose-500 dark:text-slate-400">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>
      </main>

      {/* Add some padding for bottom nav */}
      <div className="h-16"></div>

      {/* Add custom CSS for scrollbar hiding */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Categories;
