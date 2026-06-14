import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, XMarkIcon, SparklesIcon, ChevronLeftIcon, CalendarDaysIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const Card = ({ card, removeCard, active }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      removeCard(card.id, 'right');
    } else if (info.offset.x < -100) {
      removeCard(card.id, 'left');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 w-full h-full rounded-[2.5rem] shadow-2xl overflow-hidden bg-white border border-gray-100 cursor-grab active:cursor-grabbing origin-bottom"
    >
      {active && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
      )}
      <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
      
      {active && (
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black text-white uppercase tracking-widest border border-white/30">
              {card.type}
            </span>
            <span className="flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black text-white border border-white/30">
              <HeartSolidIcon className="w-3 h-3 text-rose-500" />
              {card.rating}
            </span>
          </div>
          <h2 className="text-3xl font-black text-white leading-none mb-1">{card.title}</h2>
          <p className="text-xl font-medium text-white/80">{card.price}</p>
        </div>
      )}
    </motion.div>
  );
};

export default function Matchmaker() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', request: '' });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  
  const navigate = useNavigate();

  const fetchDatabaseCards = async () => {
    setLoading(true);
    try {
      const [listingsRes, servicesRes, helpersRes] = await Promise.all([
        fetch('/api/listing/get?limit=50'),
        fetch('/api/service/get?limit=50'),
        fetch('/api/helper/get?limit=50')
      ]);

      const listings = listingsRes.ok ? await listingsRes.json() : [];
      const services = servicesRes.ok ? await servicesRes.json() : [];
      const helpers = helpersRes.ok ? await helpersRes.json() : [];

      const formattedCards = [
        ...listings.map(item => ({
          id: item._id,
          title: item.name,
          mainType: 'Property',
          type: item.type || 'Property',
          category: item.category || '',
          price: item.price ? `R${item.price}` : 'Open Bid',
          image: item.imageUrls?.[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
          rating: item.rating || 5.0,
          link: `/listing/${item._id}`,
          contact: item.contact || ''
        })),
        ...services.map(item => ({
          id: item._id,
          title: item.name,
          mainType: 'Service',
          type: item.category || 'Service',
          category: item.category || '',
          price: item.price ? `R${item.price}` : 'Open Bid',
          image: item.imageUrls?.[0] || 'https://images.pexels.com/photos/4099467/pexels-photo-4099467.jpeg?auto=compress&cs=tinysrgb&w=800',
          rating: item.rating || 5.0,
          link: `/service/${item._id}`,
          contact: item.contact || ''
        })),
        ...helpers.map(item => ({
          id: item._id,
          title: item.name,
          mainType: 'Helper',
          type: item.type || item.category || 'Helper',
          category: item.category || '',
          price: item.regularPrice ? `R${item.regularPrice}` : 'Open Bid',
          image: item.imageUrls?.[0] || 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
          rating: item.rating || 5.0,
          link: `/helper/${item._id}`,
          contact: item.contact || ''
        }))
      ];

      setCards(formattedCards.sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error("Failed to load matchmaker database items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseCards();
  }, []);

  const removeCard = (id, direction) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const filteredCards = cards.filter(card => {
    if (selectedType === 'All') return true;
    if (selectedType === 'Helpers') return card.mainType === 'Helper';
    if (selectedType === 'Properties') return card.mainType === 'Property';
    if (selectedType === 'Services') return card.mainType === 'Service';
    
    const searchStr = `${card.type} ${card.category} ${card.title}`.toLowerCase();
    const sel = selectedType.toLowerCase();
    
    if (sel === 'cleaners' || sel === 'cleaner') return searchStr.includes('clean');
    if (sel === 'barbershops' || sel === 'barber') return searchStr.includes('barber');
    if (sel === 'beauty') return searchStr.includes('beaut') || searchStr.includes('nail') || searchStr.includes('hair');
    if (sel === 'guest house' || sel === 'guesthouse') return searchStr.includes('guest') || searchStr.includes('guesthouse');
    if (sel === 'hotels') return searchStr.includes('hotel');
    if (sel === 'rooms') return searchStr.includes('room');
    if (sel === 'for rent' || sel === 'rental') return searchStr.includes('rent');
    
    return searchStr.includes(sel);
  });

  const handleManualAction = (direction) => {
    if (filteredCards.length === 0) return;
    const currentCard = filteredCards[filteredCards.length - 1];
    removeCard(currentCard.id, direction);
  };

  const handleOpenBookingModal = () => {
    if (filteredCards.length === 0) return;
    setShowBookingModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone || !bookingForm.request) return;

    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      setShowBookingModal(false);
      setBookingForm({ name: '', phone: '', request: '' });
      if (filteredCards.length > 0) {
        removeCard(filteredCards[filteredCards.length - 1].id, 'right');
      }
    }, 2000);
  };

  const handleViewMoreInfo = () => {
    if (filteredCards.length === 0) return;
    const currentCard = filteredCards[filteredCards.length - 1];
    navigate(currentCard.link);
  };

  const currentCard = filteredCards[filteredCards.length - 1];

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col z-[200]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-500/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-colors text-white">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-full backdrop-blur-md">
          <SparklesIcon className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-black text-white uppercase tracking-widest hidden sm:inline">Matchmaker</span>
        </div>
        <div className="flex items-center">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/20 rounded-full px-3 py-2 outline-none appearance-none cursor-pointer backdrop-blur-md"
          >
            <option value="All" className="text-gray-900">All Types</option>
            <optgroup label="General" className="text-gray-900 font-bold">
              <option value="Helpers" className="text-gray-900 font-normal">Helpers</option>
              <option value="Properties" className="text-gray-900 font-normal">Properties</option>
              <option value="Services" className="text-gray-900 font-normal">Services</option>
            </optgroup>
            <optgroup label="Helpers" className="text-gray-900 font-bold">
              <option value="Sneaker" className="text-gray-900 font-normal">Sneaker Cleaning</option>
              <option value="Washingmat" className="text-gray-900 font-normal">Washingmat</option>
              <option value="Animals" className="text-gray-900 font-normal">Pet Care</option>
              <option value="Domestic" className="text-gray-900 font-normal">Domestic</option>
              <option value="Tutor" className="text-gray-900 font-normal">Tutors</option>
              <option value="Maid" className="text-gray-900 font-normal">Maids</option>
              <option value="Beauty" className="text-gray-900 font-normal">Beauty</option>
              <option value="Cleaner" className="text-gray-900 font-normal">Cleaners</option>
              <option value="Barber" className="text-gray-900 font-normal">Barbers</option>
              <option value="Hair" className="text-gray-900 font-normal">Hair</option>
              <option value="Nails" className="text-gray-900 font-normal">Nails</option>
              <option value="Massage" className="text-gray-900 font-normal">Massage</option>
              <option value="Chef" className="text-gray-900 font-normal">Chefs</option>
              <option value="Tattoo" className="text-gray-900 font-normal">Tattoo Artists</option>
              <option value="Nanny" className="text-gray-900 font-normal">Nannies</option>
            </optgroup>
            <optgroup label="Services" className="text-gray-900 font-bold">
              <option value="Baker" className="text-gray-900 font-normal">Bakers</option>
              <option value="Carwash" className="text-gray-900 font-normal">Carwash</option>
              <option value="Photograph" className="text-gray-900 font-normal">Photography</option>
              <option value="Transport" className="text-gray-900 font-normal">Transport</option>
              <option value="Landscaping" className="text-gray-900 font-normal">Landscaping</option>
              <option value="Electrician" className="text-gray-900 font-normal">Electricians</option>
              <option value="Handyman" className="text-gray-900 font-normal">Handyman</option>
              <option value="Catering" className="text-gray-900 font-normal">Catering</option>
              <option value="SchoolTransport" className="text-gray-900 font-normal">School Transport</option>
              <option value="Daycare" className="text-gray-900 font-normal">Daycare</option>
              <option value="Daily" className="text-gray-900 font-normal">Daily Services</option>
              <option value="Delivery" className="text-gray-900 font-normal">Delivery</option>
              <option value="Usedbooks" className="text-gray-900 font-normal">Used Books</option>
            </optgroup>
            <optgroup label="Properties" className="text-gray-900 font-bold">
              <option value="Rental" className="text-gray-900 font-normal">Rentals</option>
              <option value="Guest house" className="text-gray-900 font-normal">Guest Houses</option>
              <option value="Sale" className="text-gray-900 font-normal">For Sale</option>
              <option value="Overnight" className="text-gray-900 font-normal">Overnight Stays</option>
              <option value="Vacation" className="text-gray-900 font-normal">Vacation Rentals</option>
              <option value="Office" className="text-gray-900 font-normal">Office Space</option>
              <option value="Land" className="text-gray-900 font-normal">Land</option>
              <option value="Hotels" className="text-gray-900 font-normal">Hotels</option>
              <option value="Rooms" className="text-gray-900 font-normal">Rooms</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative flex-1 flex items-center justify-center max-w-sm mx-auto w-full px-6 pb-24 z-10">
        <div className="relative w-full aspect-[3/4]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-md">
              <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin mb-4" />
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Syncing Database Feed...</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredCards.map((card, index) => (
                <Card 
                  key={card.id} 
                  card={card} 
                  removeCard={removeCard} 
                  active={index === filteredCards.length - 1}
                />
              ))}
            </AnimatePresence>
          )}

          {!loading && filteredCards.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-md"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mb-4">
                <SparklesIcon className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">You're caught up!</h3>
              <p className="text-gray-400 text-sm">We're finding more personalized matches for you.</p>
              <button 
                onClick={fetchDatabaseCards}
                className="mt-8 px-6 py-3 bg-white text-gray-950 font-black uppercase tracking-widest rounded-full text-xs hover:bg-gray-200 transition-colors"
              >
                Refresh Matches
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {!loading && filteredCards.length > 0 && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-4 z-20">
          {/* Skip Card */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleManualAction('left')}
            className="w-14 h-14 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-xl hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-500 text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6 stroke-[3]" />
          </motion.button>

          {/* Book Button */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleOpenBookingModal}
            className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)] text-white hover:bg-emerald-400 transition-colors"
          >
            <CalendarDaysIcon className="w-7 h-7 stroke-[2.5]" />
          </motion.button>

          {/* View More Info (Eye Icon) */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleViewMoreInfo}
            className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)] text-white hover:bg-indigo-500 transition-colors"
          >
            <EyeIcon className="w-7 h-7 stroke-[2.5]" />
          </motion.button>

          {/* Wishlist Card */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleManualAction('right')}
            className="w-14 h-14 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-xl hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-500 text-white transition-colors"
          >
            <HeartSolidIcon className="w-6 h-6" />
          </motion.button>
        </div>
      )}

      {/* Booking Form Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-gray-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden"
            >
              <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

              {showSuccessMessage ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <SparklesIcon className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-wider text-emerald-400 mb-2">Request Sent!</h3>
                  <p className="text-gray-400 text-sm">Your booking request was submitted successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">Booking Protocol</span>
                    <h3 className="text-2xl font-black leading-tight tracking-tight mt-1">{currentCard?.title || 'Request Hub'}</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Your Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        required
                        value={bookingForm.name} 
                        onChange={handleFormChange}
                        placeholder="Enter your full name" 
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:border-emerald-500 outline-none transition-colors placeholder:text-gray-600"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Contact Number</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        required
                        value={bookingForm.phone} 
                        onChange={handleFormChange}
                        placeholder="Enter your phone number" 
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:border-emerald-500 outline-none transition-colors placeholder:text-gray-600"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Request details</label>
                      <textarea 
                        name="request" 
                        required
                        rows="3"
                        value={bookingForm.request} 
                        onChange={handleFormChange}
                        placeholder="What are you looking for or expecting from this request?" 
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:border-emerald-500 outline-none transition-colors placeholder:text-gray-600 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowBookingModal(false);
                        setBookingForm({ name: '', phone: '', request: '' });
                      }}
                      className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
