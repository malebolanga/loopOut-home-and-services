import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  MapPinIcon,
  ComputerDesktopIcon,
  BookOpenIcon,
  FireIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  StarIcon,
  XMarkIcon,
  MapIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import { Sparkles } from 'lucide-react';

const Categories = () => {
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentLocation] = useState('South Africa');
  const searchInputRef = useRef(null);

  // Check screen size for responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle search visibility
  const handleSearchClick = () => {
    setSearchVisible(true);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  const handleSearchSubmit = (value) => {
    if (value.trim()) {
      navigate(`/search?searchTerm=${value}&type=all&address=${encodeURIComponent(currentLocation)}`);
    }
    setSearchVisible(false);
  };

  // Quick Categories Grid from Home.jsx
  const categories = [
    { icon: '🏠', label: 'Homes', color: 'bg-blue-100', type: 'properties' },
    { icon: '✨', label: 'Services', color: 'bg-emerald-100', type: 'services' },
    { icon: '👷', label: 'Helper', color: 'bg-purple-100', type: 'helpers' },
    { icon: '🎪', label: 'Events', color: 'bg-amber-100', type: 'events' },
    { icon: '🏨', label: 'Hotels', color: 'bg-rose-100', type: 'properties', category: 'rent-short' },
    { icon: '🛒', label: 'Shopping', color: 'bg-yellow-100', type: 'services' },
    { icon: '🍽️', label: 'Food', color: 'bg-red-100', type: 'services' },
    { icon: '➕', label: 'More', color: 'bg-gray-100', onClick: () => navigate('/categories') }
  ];

  // Responsive grid classes
  const gridCols = isDesktop ? 'grid-cols-4' : 'grid-cols-4';
  
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
  const subcategoryGridCols = isDesktop ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1';

  return (
    <div className="min-h-screen pb-0">
      <Helmet>
        <title>All Categories | LoopOut</title>
        <meta name="description" content="Browse all categories on LoopOut: Properties, Services, Helpers, Events, and more." />
      </Helmet>
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className={`${isDesktop ? 'px-6 max-w-7xl mx-auto' : 'px-4'} py-4`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-3 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">All Categories</h1>
            </div>
            <button
              onClick={handleSearchClick}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Search Input - Same as Home.jsx */}
          {searchVisible && (
            <div className="mb-4">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search categories..."
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(e.target.value);
                    }
                  }}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <button
                  onClick={() => setSearchVisible(false)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
          )}

          {/* Search Bar for non-visible state */}
          {!searchVisible && (
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 right-4 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <span className="text-gray-400 hover:text-gray-600 text-sm">Clear</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className={`${isDesktop ? 'px-6 max-w-7xl mx-auto' : 'px-4'} py-4`}>
        {/* Quick Categories Grid - Same as Home.jsx */}
        <section className="mb-8">
          <h2 className="font-bold text-gray-900 text-lg md:text-xl mb-4">Explore categories</h2>
          <div className={`grid ${gridCols} gap-3 md:gap-4`}>
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
                className="flex flex-col items-center p-3 md:p-4 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200 active:opacity-80 border border-transparent hover:border-gray-200"
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 ${cat.color} rounded-full flex items-center justify-center text-xl md:text-2xl mb-2 hover:scale-105 transition-transform`}>
                  {cat.icon}
                </div>
                <span className="text-xs md:text-sm text-gray-700 text-center">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Browse All Categories Section */}
        <section className="mb-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">Browse All Categories</h2>
          
          {searchTerm.trim() === '' ? (
            // Show main categories when no search
            <div className={`grid ${isDesktop ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
              {mainCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="bg-white rounded-xl overflow-hidden cursor-pointer shadow-sm hover:border-gray-300 hover:shadow-md transition-all duration-200 border border-gray-200 active:opacity-80"
                  >
                    <div className={`h-2 ${category.color}`}></div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg ${category.color} bg-opacity-10`}>
                            <Icon className={`w-6 h-6 ${category.color.replace('bg-', 'text-')}`} />
                          </div>
                          <h3 className="font-medium text-gray-900 ml-3">{category.title}</h3>
                        </div>
                        <ChevronRightIcon className={`w-5 h-5 text-gray-400 transition-transform ${
                          selectedCategory?.id === category.id ? 'rotate-90' : ''
                        }`} />
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{category.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {category.subcategories.length} categories
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewAll(category.id);
                          }}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          View all
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
                <h3 className="text-gray-700">
                  {filteredSubcategories.length} results for "{searchTerm}"
                </h3>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-sm text-gray-600 hover:text-gray-900"
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
                        className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:border-gray-300 hover:shadow-md transition-all duration-200 border border-gray-200 active:opacity-80"
                      >
                        <div className="flex items-center mb-3">
                          <div className={`p-2 rounded-lg ${subcategory.mainColor} bg-opacity-10`}>
                            <Icon className={`w-5 h-5 ${subcategory.mainColor.replace('bg-', 'text-')}`} />
                          </div>
                          <div className="ml-3">
                            <h4 className="font-medium text-gray-900">{subcategory.name}</h4>
                            <span className="text-xs text-gray-500">{subcategory.mainCategory}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {subcategory.count.toLocaleString()} listings
                          </span>
                          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                  <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-700 mb-2">No results found</h3>
                  <p className="text-gray-500 text-sm mb-4">
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
              <h2 className="font-bold text-gray-900 text-lg">{selectedCategory.title} Subcategories</h2>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Collapse
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
              <div className="flex items-center mb-2">
                <div className={`p-2 rounded-lg ${selectedCategory.color} bg-opacity-10 mr-3`}>
                  {selectedCategory.icon && (
                    <selectedCategory.icon className={`w-6 h-6 ${selectedCategory.color.replace('bg-', 'text-')}`} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedCategory.title}</h3>
                  <p className="text-sm text-gray-600">{selectedCategory.description}</p>
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
                    className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${selectedCategory.color} bg-opacity-10`}>
                          <Icon className={`w-5 h-5 ${selectedCategory.color.replace('bg-', 'text-')}`} />
                        </div>
                        <span className="font-medium text-gray-900 ml-3">{subcategory.name}</span>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-xs text-gray-500">
                      {subcategory.count.toLocaleString()} listings
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => handleViewAll(selectedCategory.id)}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
              >
                View All {selectedCategory.title}
              </button>
            </div>
          </section>
        )}

        {/* Popular Categories Quick Links */}
        {searchTerm.trim() === '' && !selectedCategory && (
          <section className="mt-8">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Popular Categories</h2>
            <div className="flex flex-wrap gap-2">
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
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${cat.color} hover:opacity-90 transition-opacity`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Stats Section for Desktop - Like Home.jsx */}
        {isDesktop && (
          <section className="mb-8 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
            <h2 className="font-bold text-gray-900 text-xl mb-6">Categories Insights</h2>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">6</div>
                <p className="text-gray-600 text-sm">Main Categories</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">{mainCategories.reduce((acc, cat) => acc + cat.subcategories.length, 0)}</div>
                <p className="text-gray-600 text-sm">Subcategories</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">48</div>
                <p className="text-gray-600 text-sm">Total Filters</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 mb-2">10K+</div>
                <p className="text-gray-600 text-sm">Listings Available</p>
              </div>
            </div>
          </section>
        )}

        {/* Back to Home */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            to="/"
            className="flex items-center justify-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </main>

      {/* Add some padding for bottom nav */}
      <div className="h-16"></div>

      {/* Add custom CSS for scrollbar hiding */}
      <style jsx>{`
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
