import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaSearch, FaPlus, FaTrash, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

const TripSearch = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [stops, setStops] = useState([{ id: 1, location: '', date: '' }]);
  const [searchResults, setSearchResults] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [activeCategory, setActiveCategory] = useState({});
  const [slideIndex, setSlideIndex] = useState({});
  const [showPlanSidebar, setShowPlanSidebar] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!tripName.trim()) newErrors.tripName = "Trip name is required";
    if (!destination.trim()) newErrors.destination = "Destination is required";
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";
    if (new Date(startDate) > new Date(endDate)) {
      newErrors.dateRange = "End date must be after start date";
    }
    
    stops.forEach((stop, index) => {
      if (!stop.location.trim()) newErrors[`stopLocation-${index}`] = "Location is required";
      if (!stop.date) newErrors[`stopDate-${index}`] = "Date is required";
    });

    return newErrors;
  };

  const handleAddStop = () => {
    setStops([...stops, { id: Date.now(), location: '', date: '' }]);
  };

  const handleRemoveStop = (id) => {
    if (stops.length > 1) {
      const newStops = stops.filter(stop => stop.id !== id);
      setStops(newStops);
      
      const newResults = {...searchResults};
      delete newResults[id];
      setSearchResults(newResults);
      
      const newActive = {...activeCategory};
      delete newActive[id];
      setActiveCategory(newActive);
    }
  };

  const handleStopChange = (id, field, value) => {
    setStops(stops.map(stop => 
      stop.id === id ? { ...stop, [field]: value } : stop
    ));
  };

  const searchForStop = async (stopId, location, date) => {
    if (!location || !date) return;
    
    setIsLoading(true);
    try {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      
      const response = await fetch(
        `/api/trips/search?location=${encodeURIComponent(location)}&date=${encodeURIComponent(formattedDate)}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch data');
      }
      
      setSearchResults(prev => ({
        ...prev,
        [stopId]: {
          events: data.events || [],
          helpers: data.helpers || [],
          listings: data.listings || []
        }
      }));
      
      // Set default active category for this stop
      setActiveCategory(prev => ({
        ...prev,
        [stopId]: 'events'
      }));
      
      // Reset slide index for this stop
      setSlideIndex(prev => ({
        ...prev,
        [stopId]: 0
      }));
    } catch (error) {
      console.error('Search failed:', error);
      setSaveError(error.message || 'Search failed. Please try again.');
    }
    setIsLoading(false);
  };

  const toggleSelection = (stopId, category, itemId) => {
    setSelectedItems(prev => {
      const newSelection = { ...prev };
      if (!newSelection[stopId]) newSelection[stopId] = { events: [], helpers: [], listings: [] };
      
      const index = newSelection[stopId][category].indexOf(itemId);
      if (index > -1) {
        newSelection[stopId][category] = newSelection[stopId][category].filter(id => id !== itemId);
      } else {
        newSelection[stopId][category] = [...newSelection[stopId][category], itemId];
      }
      
      return newSelection;
    });
  };

  const setCategory = (stopId, category) => {
    setActiveCategory(prev => ({
      ...prev,
      [stopId]: category
    }));
    
    setSlideIndex(prev => ({
      ...prev,
      [stopId]: 0
    }));
  };

  const nextSlide = (stopId, length) => {
    setSlideIndex(prev => {
      const currentIndex = prev[stopId] || 0;
      const maxIndex = Math.max(0, Math.ceil(length / 2) - 1);
      return {
        ...prev,
        [stopId]: currentIndex < maxIndex ? currentIndex + 1 : 0
      };
    });
  };

  const prevSlide = (stopId, length) => {
    setSlideIndex(prev => {
      const currentIndex = prev[stopId] || 0;
      const maxIndex = Math.max(0, Math.ceil(length / 2) - 1);
      return {
        ...prev,
        [stopId]: currentIndex > 0 ? currentIndex - 1 : maxIndex
      };
    });
  };

  const getShortDescription = (description) => {
    if (!description) return '';
    if (description.length > 100) {
      return description.substring(0, 100) + '...';
    }
    return description;
  };

  const saveTrip = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    
    setIsLoading(true);
    setSaveError('');
    
    try {
      const tripData = {
        userRef: currentUser._id,
        name: tripName,
        destination,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        description,
        stops: stops.map(stop => ({
          location: stop.location,
          date: new Date(stop.date).toISOString(),
          events: selectedItems[stop.id]?.events || [],
          helpers: selectedItems[stop.id]?.helpers || [],
          listings: selectedItems[stop.id]?.listings || []
        }))
      };
      
      const response = await fetch('/api/trips/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.accessToken}`
        },
        body: JSON.stringify(tripData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Failed to save trip');
        } catch {
          throw new Error(errorText || 'Failed to save trip');
        }
      }

      const savedTrip = await response.json();
      navigate(`/trip/${savedTrip.trip._id}`);
    } catch (error) {
      console.error('Failed to save trip:', error);
      setSaveError(error.message || 'Failed to save trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen from-blue-50 to-indigo-100 py-8 px-4 relative">
      {/* Plan Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${showPlanSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
            <h2 className="text-xl font-bold">Your Trip Plan</h2>
            <button 
              onClick={() => setShowPlanSidebar(false)}
              className="text-white hover:text-gray-200"
            >
              <FaTimes size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Trip Overview</h3>
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <p className="font-medium">{tripName}</p>
                <p className="text-sm text-gray-600">{destination}</p>
                <p className="text-sm text-gray-600">
                  {startDate && new Date(startDate).toLocaleDateString()} - 
                  {endDate && new Date(endDate).toLocaleDateString()}
                </p>
              </div>
              
              {description && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-700">{description}</p>
                </div>
              )}
            </div>
            
            <h3 className="font-bold text-lg text-gray-800 mb-4">Selected Items</h3>
            
            {stops.map((stop, index) => (
              <div key={stop.id} className="mb-6">
                <div className="font-medium text-gray-800 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">
                    {index + 1}
                  </span>
                  Stop {index + 1}: {stop.location}
                </div>
                
                {/* Selected Events */}
                {selectedItems[stop.id]?.events?.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-purple-600 mb-2">Events</h4>
                    <div className="space-y-2">
                      {selectedItems[stop.id].events.map(eventId => {
                        const event = searchResults[stop.id]?.events?.find(e => e._id === eventId);
                        return event ? (
                          <div key={event._id} className="flex items-start p-2 bg-purple-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{event.name}</p>
                              <p className="text-xs text-gray-500">{event.type}</p>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                {/* Selected Services */}
                {selectedItems[stop.id]?.helpers?.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-green-600 mb-2">Services</h4>
                    <div className="space-y-2">
                      {selectedItems[stop.id].helpers.map(helperId => {
                        const helper = searchResults[stop.id]?.helpers?.find(h => h._id === helperId);
                        return helper ? (
                          <div key={helper._id} className="flex items-start p-2 bg-green-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{helper.name}</p>
                              <p className="text-xs text-gray-500">{helper.type}</p>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                {/* Selected Accommodations */}
                {selectedItems[stop.id]?.listings?.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-blue-600 mb-2">Accommodations</h4>
                    <div className="space-y-2">
                      {selectedItems[stop.id].listings.map(listingId => {
                        const listing = searchResults[stop.id]?.listings?.find(l => l._id === listingId);
                        return listing ? (
                          <div key={listing._id} className="flex items-start p-2 bg-blue-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{listing.name}</p>
                              <p className="text-xs text-gray-500">
                                ${listing.regularPrice}/night
                              </p>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                {(!selectedItems[stop.id] || 
                 (selectedItems[stop.id]?.events?.length === 0 && 
                  selectedItems[stop.id]?.helpers?.length === 0 && 
                  selectedItems[stop.id]?.listings?.length === 0)) && (
                  <div className="text-center text-sm text-gray-500 py-4">
                    No items selected for this stop
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={saveTrip}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-800 shadow-md transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Trip...
                </>
              ) : 'Save Trip Plan'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Plan Your Perfect Trip
            </h1>
            <p className="mt-3 text-lg text-gray-700 max-w-2xl">
              Discover events, services, and accommodations for each stop on your journey
            </p>
          </div>
          
          <button
            onClick={() => setShowPlanSidebar(true)}
            className="hidden md:flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-800 shadow-md transition-colors"
          >
            View Plan
          </button>
        </div>

        {saveError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {saveError}
          </div>
        )}

        <div className="bg-white shadow-xl rounded-2xl p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Name *
              </label>
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl ${errors.tripName ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                placeholder="Summer Europe Adventure"
              />
              {errors.tripName && (
                <p className="mt-1 text-sm text-red-600">{errors.tripName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Destination *
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl ${errors.destination ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                placeholder="Paris, France"
              />
              {errors.destination && (
                <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-500" />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl ${errors.startDate ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-500" />
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl ${errors.endDate ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
              {errors.dateRange && (
                <p className="mt-1 text-sm text-red-600">{errors.dateRange}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500"
              placeholder="What are your plans? Any special activities or notes?"
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Trip Stops</h2>
            <button
              type="button"
              onClick={handleAddStop}
              className="flex items-center text-white bg-blue-600 hover:bg-blue-700 font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus className="mr-1" /> Add Stop
            </button>
          </div>

          {stops.map((stop, index) => (
            <div 
              key={stop.id}
              className="mb-8 bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100"
            >
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Stop {index + 1}: {stop.location || 'New Location'}</h3>
                {stops.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(stop.id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={stop.location}
                    onChange={(e) => handleStopChange(stop.id, 'location', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl ${errors[`stopLocation-${index}`] ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                    placeholder="City or specific place"
                  />
                  {errors[`stopLocation-${index}`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`stopLocation-${index}`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <div className="flex">
                    <input
                      type="date"
                      value={stop.date}
                      onChange={(e) => handleStopChange(stop.id, 'date', e.target.value)}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-l-xl ${errors[`stopDate-${index}`] ? 'border-red-500' : 'focus:border-blue-500'}`}
                    />
                    <button
                      type="button"
                      onClick={() => searchForStop(stop.id, stop.location, stop.date)}
                      className="bg-blue-600 text-white px-4 py-3 rounded-r-xl hover:bg-blue-700 flex items-center transition-colors"
                      disabled={isLoading}
                    >
                      <FaSearch className="mr-2" /> Search
                    </button>
                  </div>
                  {errors[`stopDate-${index}`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`stopDate-${index}`]}
                    </p>
                  )}
                </div>
              </div>

              {searchResults[stop.id] && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <h4 className="font-bold text-xl text-gray-800 mb-4">Search Results for {stop.location}</h4>
                  
                  {/* Category Selector */}
                  <div className="flex mb-6 border-b border-gray-200">
                    <button
                      className={`px-4 py-2 font-medium ${activeCategory[stop.id] === 'events' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                      onClick={() => setCategory(stop.id, 'events')}
                    >
                      Events
                    </button>
                    <button
                      className={`px-4 py-2 font-medium ${activeCategory[stop.id] === 'helpers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                      onClick={() => setCategory(stop.id, 'helpers')}
                    >
                      Services
                    </button>
                    <button
                      className={`px-4 py-2 font-medium ${activeCategory[stop.id] === 'listings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                      onClick={() => setCategory(stop.id, 'listings')}
                    >
                      Accommodations
                    </button>
                  </div>
                  
                  {/* Events Slide */}
                  {activeCategory[stop.id] === 'events' && searchResults[stop.id].events.length > 0 && (
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold text-lg text-gray-800">Events in {stop.location}</h5>
                        <div className="flex space-x-2">
                          <button 
                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                            onClick={() => prevSlide(stop.id, searchResults[stop.id].events.length)}
                          >
                            <FaChevronLeft />
                          </button>
                          <button 
                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                            onClick={() => nextSlide(stop.id, searchResults[stop.id].events.length)}
                          >
                            <FaChevronRight />
                          </button>
                        </div>
                      </div>
                      
                      <div className="relative overflow-hidden">
                        <div 
                          className="flex transition-transform duration-300 ease-in-out"
                          style={{ transform: `translateX(-${(slideIndex[stop.id] || 0) * 100}%)` }}
                        >
                          {searchResults[stop.id].events.map(event => (
                            <div key={event._id} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 pr-4">
                              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md">
                                {event.imageUrls && event.imageUrls.length > 0 && (
                                  <div className="h-48 overflow-hidden">
                                    <img 
                                      src={event.imageUrls[0]} 
                                      alt={event.name} 
                                      className="w-full h-full object-cover"
                                      onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Event+Image'}
                                    />
                                  </div>
                                )}
                                <div className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h6 className="font-bold text-gray-900">{event.name}</h6>
                                      <p className="text-sm text-blue-600 font-medium capitalize mt-1">
                                        {event.type} • {event.date}
                                      </p>
                                      <p className="text-sm text-gray-600 mt-2">
                                        {getShortDescription(event.description)}
                                      </p>
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={selectedItems[stop.id]?.events?.includes(event._id) || false}
                                      onChange={() => toggleSelection(stop.id, 'events', event._id)}
                                      className="mt-1 h-5 w-5 text-blue-600 rounded"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Helpers Slide */}
                  {activeCategory[stop.id] === 'helpers' && searchResults[stop.id].helpers.length > 0 && (
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold text-lg text-gray-800">Services in {stop.location}</h5>
                        <div className="flex space-x-2">
                          <button 
                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                            onClick={() => prevSlide(stop.id, searchResults[stop.id].helpers.length)}
                          >
                            <FaChevronLeft />
                          </button>
                          <button 
                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                            onClick={() => nextSlide(stop.id, searchResults[stop.id].helpers.length)}
                          >
                            <FaChevronRight />
                          </button>
                        </div>
                      </div>
                      
                      <div className="relative overflow-hidden">
                        <div 
                          className="flex transition-transform duration-300 ease-in-out"
                          style={{ transform: `translateX(-${(slideIndex[stop.id] || 0) * 100}%)` }}
                        >
                          {searchResults[stop.id].helpers.map(helper => (
                            <div key={helper._id} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 pr-4">
                              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md">
                                {helper.imageUrls && helper.imageUrls.length > 0 && (
                                  <div className="h-48 overflow-hidden">
                                    <img 
                                      src={helper.imageUrls[0]} 
                                      alt={helper.name} 
                                      className="w-full h-full object-cover"
                                      onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Service+Image'}
                                    />
                                  </div>
                                )}
                                <div className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h6 className="font-bold text-gray-900">{helper.name}</h6>
                                      <p className="text-sm text-blue-600 font-medium capitalize mt-1">
                                        {helper.type} • ${helper.regularPrice}
                                      </p>
                                      <p className="text-sm text-gray-600 mt-2">
                                        {getShortDescription(helper.description)}
                                      </p>
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={selectedItems[stop.id]?.helpers?.includes(helper._id) || false}
                                      onChange={() => toggleSelection(stop.id, 'helpers', helper._id)}
                                      className="mt-1 h-5 w-5 text-blue-600 rounded"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Listings Slide */}
                  {activeCategory[stop.id] === 'listings' && searchResults[stop.id].listings.length > 0 && (
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold text-lg text-gray-800">Accommodations in {stop.location}</h5>
                        <div className="flex space-x-2">
                          <button 
                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                            onClick={() => prevSlide(stop.id, searchResults[stop.id].listings.length)}
                          >
                            <FaChevronLeft />
                          </button>
                          <button 
                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                            onClick={() => nextSlide(stop.id, searchResults[stop.id].listings.length)}
                          >
                            <FaChevronRight />
                          </button>
                        </div>
                      </div>
                      
                      <div className="relative overflow-hidden">
                        <div 
                          className="flex transition-transform duration-300 ease-in-out"
                          style={{ transform: `translateX(-${(slideIndex[stop.id] || 0) * 100}%)` }}
                        >
                          {searchResults[stop.id].listings.map(listing => (
                            <div key={listing._id} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 pr-4">
                              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md">
                                {listing.imageUrls && listing.imageUrls.length > 0 && (
                                  <div className="h-48 overflow-hidden">
                                    <img 
                                      src={listing.imageUrls[0]} 
                                      alt={listing.name} 
                                      className="w-full h-full object-cover"
                                      onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Accommodation+Image'}
                                    />
                                  </div>
                                )}
                                <div className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h6 className="font-bold text-gray-900">{listing.name}</h6>
                                      <p className="text-sm text-blue-600 font-medium mt-1">
                                        {listing.bedrooms} {listing.bedrooms === 1 ? 'bed' : 'beds'} • 
                                        {listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'} • 
                                        R{listing.regularPrice}/night
                                      </p>
                                      <p className="text-sm text-gray-600 mt-2">
                                        {getShortDescription(listing.description)}
                                      </p>
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={selectedItems[stop.id]?.listings?.includes(listing._id) || false}
                                      onChange={() => toggleSelection(stop.id, 'listings', listing._id)}
                                      className="mt-1 h-5 w-5 text-blue-600 rounded"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {searchResults[stop.id].events.length === 0 && 
                   searchResults[stop.id].helpers.length === 0 && 
                   searchResults[stop.id].listings.length === 0 && (
                    <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                      <div className="text-5xl text-gray-300 mb-4">🔍</div>
                      <h5 className="font-bold text-gray-700 text-lg">No results found</h5>
                      <p className="text-gray-500 mt-2">
                        We couldn t find any matches for  {stop.location}  on {stop.date}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between mb-12">
          <button
            onClick={() => setShowPlanSidebar(true)}
            className="md:hidden px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-800 shadow-md transition-colors"
          >
            View Plan
          </button>
          
          <button
            onClick={saveTrip}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-800 shadow-xl flex items-center justify-center transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-6 w-6 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Trip...
              </>
            ) : 'Save Your Trip Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripSearch;
