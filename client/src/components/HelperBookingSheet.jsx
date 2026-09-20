import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import {
  FaWhatsapp,
  FaShieldAlt,
  FaSpinner,
  FaCheckCircle
} from 'react-icons/fa';
import BookingTimeSlots from './BookingTimeSlots';

export default function HelperBookingSheet({
  isOpen,
  onClose,
  helper,
  bookingData,
  handleBookingChange,
  setBookingData,
  serviceOptions,
  handleServiceSelection,
  totalPrice,
  handleBookingSubmit,
  handleEscrowCheckout,
  isUploading,
  isTimeSlotBooked,
  isDateFullyBooked
}) {
  const [step, setStep] = useState(1);

  if (!isOpen || !helper) return null;

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleNext = () => {
    if (step === 1) {
      if (!bookingData.name?.trim() || !bookingData.phone?.trim()) {
        alert("Please enter your name and phone number.");
        return;
      }
      if (bookingData.locationOption === 'comeToYou' && !bookingData.address?.trim()) {
        alert("Please enter your service address.");
        return;
      }
    }
    if (step === 2) {
      if (
        (helper.type === 'domestic' || helper.type === 'maid' || helper.type === 'cleaning') &&
        (!bookingData.selectedServices || bookingData.selectedServices.length === 0)
      ) {
        // Optional reminder or allow proceed
      }
    }
    setStep(prev => Math.min(3, prev + 1));
  };

  return (
    <AnimatePresence>
      <motion.div
        key="helper-sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1200] flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={handleClose}
      >
        <motion.div
          key="helper-sheet-content"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-xl bg-white dark:bg-gray-950 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Mobile Drag Indicator */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>

          {/* Sheet Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-950 shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={step > 1 ? () => setStep(prev => prev - 1) : handleClose}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {step > 1 ? (
                  <svg className="w-4 h-4 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                ) : (
                  <XMarkIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                )}
              </button>
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                  Book {helper.name}
                </h2>
                <p className="text-[11px] text-gray-400 font-semibold">
                  Section {step} of 3 · {step === 1 ? 'Contact & Schedule' : step === 2 ? 'Property & Services' : 'Provisions & Reserve'}
                </p>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map(num => (
                <div
                  key={num}
                  className={`h-2 rounded-full transition-all ${
                    step === num
                      ? 'w-6 bg-rose-500'
                      : step > num
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-gray-200 dark:bg-gray-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Sheet Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* ── SECTION 1: Personal Info, Contact, Date & Frequency ── */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Team member selection if available */}
                {helper.performers && helper.performers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2.5">Select Team Member</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setBookingData(prev => ({ ...prev, selectedPerformer: '' }))}
                        className={`p-3 rounded-2xl border-2 text-left transition-all ${!bookingData.selectedPerformer ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/20' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'}`}
                      >
                        <div className="font-bold text-xs text-gray-900 dark:text-white">Any Available Member</div>
                        <p className="text-[10px] text-gray-500">Fastest confirmation</p>
                      </button>
                      {helper.performers.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setBookingData(prev => ({ ...prev, selectedPerformer: p.name }))}
                          className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${bookingData.selectedPerformer === p.name ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/20' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'}`}
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                            {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-gray-900 dark:text-white truncate">{p.name}</div>
                            <p className="text-[9px] text-gray-500 uppercase font-bold">{p.experience} exp</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact inputs */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">1. Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={bookingData.name}
                        onChange={handleBookingChange}
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Contact Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={bookingData.phone}
                        onChange={handleBookingChange}
                        placeholder="e.g. 071 234 5678"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Date & Time selection */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">2. Date & Time</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={bookingData.date}
                        onChange={handleBookingChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                    <BookingTimeSlots
                      selectedDate={bookingData.date}
                      selectedTime={bookingData.time}
                      onSelectTime={(time) => setBookingData(prev => ({ ...prev, time }))}
                      isTimeSlotBooked={isTimeSlotBooked}
                      isDateFullyBooked={isDateFullyBooked}
                    />
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">🔄 Project / Service Frequency</label>
                  <select
                    name="serviceFrequency"
                    value={bookingData.serviceFrequency || ''}
                    onChange={handleBookingChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="">Select frequency / schedule...</option>
                    <option value="This is a one-time project">This is a one-time project</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Every other week">Every other week</option>
                    <option value="Monthly">Monthly</option>
                    <option value="As needed">As needed</option>
                  </select>
                </div>

                {/* Location Option */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">Service Location</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingData(prev => ({ ...prev, locationOption: 'comeToYou' }))}
                      className={`p-3 rounded-2xl border-2 text-center text-xs font-bold transition-all ${bookingData.locationOption === 'comeToYou' ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'}`}
                    >
                      📍 Come to me
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingData(prev => ({ ...prev, locationOption: 'goToThem' }))}
                      className={`p-3 rounded-2xl border-2 text-center text-xs font-bold transition-all ${bookingData.locationOption === 'goToThem' ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'}`}
                    >
                      🚶 I will go to them
                    </button>
                  </div>
                </div>

                {/* Address if comeToYou */}
                {bookingData.locationOption === 'comeToYou' && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">📍 Address *</label>
                    <textarea
                      name="address"
                      value={bookingData.address}
                      onChange={handleBookingChange}
                      rows="2"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                      placeholder="Enter your full street address, suburb & city"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── SECTION 2: Housekeeper, Property Sizes, Tasks & Services ── */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Domestic / Maid Housekeeping specifics */}
                {(helper.type === 'maid' || helper.type === 'domestic' || !helper.type || helper.type === 'cleaning') && (
                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-xs uppercase tracking-wider">
                      🧹 Housekeeping & Maid Details
                    </div>

                    {/* House size */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Property Size</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: '1 Bedroom / Studio', label: '1 Bed / Studio' },
                          { id: '2-3 Bedroom House', label: '2-3 Bed House' },
                          { id: '4+ Bedroom Full House', label: '4+ Bed House' },
                          { id: 'Apartment / Flat', label: 'Apartment / Flat' },
                          { id: 'Townhouse / Duplex', label: 'Townhouse' },
                          { id: 'Office / Commercial', label: 'Office Space' }
                        ].map(size => (
                          <button
                            key={size.id}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, houseSize: size.id }))}
                            className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                              bookingData.houseSize === size.id
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-emerald-300'
                            }`}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Number of Bathrooms */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Number of Bathrooms</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['1 Bathroom', '2 Bathrooms', '3+ Bathrooms'].map(b => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, numberOfBathrooms: b }))}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all ${
                              bookingData.numberOfBathrooms === b
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ironing Load */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">👔 Ironing & Laundry Load Estimate</label>
                      <select
                        name="ironingLoad"
                        value={bookingData.ironingLoad || ''}
                        onChange={handleBookingChange}
                        className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        <option value="">Select load estimate...</option>
                        <option value="None / No Laundry">None / No Laundry needed</option>
                        <option value="Small Basket (1-2 people)">Small Basket (1-2 people)</option>
                        <option value="Medium Basket (3-4 people)">Medium Basket (3-4 people)</option>
                        <option value="Large Basket / Full Family Load">Large Basket / Full Family Load</option>
                        <option value="Curtains, Bedding & Heavy Ironing">Curtains, Bedding & Heavy Ironing</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Chef / Cooking specifics */}
                {(helper.type === 'chef' || helper.type === 'cooking') && (
                  <div className="rounded-2xl border border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/20 p-4 space-y-4">
                    <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300 font-black text-xs uppercase tracking-wider">
                      👨‍🍳 Function & Catering Details
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Function Type</label>
                        <input
                          type="text"
                          name="functionType"
                          value={bookingData.functionType || ''}
                          onChange={handleBookingChange}
                          placeholder="e.g. Birthday, Dinner, Braai..."
                          className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Number of Guests</label>
                        <input
                          type="number"
                          name="numberOfGuests"
                          value={bookingData.numberOfGuests || 1}
                          onChange={handleBookingChange}
                          min="1"
                          placeholder="e.g. 6"
                          className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Meal Style / Presentation</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: '3-Course Plated', label: '3-Course Plated' },
                          { id: 'Buffet Style', label: 'Buffet Style' },
                          { id: 'Braai Experience', label: 'Braai Experience' },
                          { id: 'Canapes & Finger Food', label: 'Canapés / Tapas' },
                          { id: 'Weekly Meal Prep', label: 'Weekly Meal Prep' },
                          { id: 'Family Feast', label: 'Family Feast' }
                        ].map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, mealType: m.id }))}
                            className={`p-2 rounded-xl text-xs font-bold border-2 transition-all ${
                              bookingData.mealType === m.id
                                ? 'bg-orange-600 border-orange-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Barber / Grooming specifics */}
                {(helper.type === 'barber' || helper.type === 'barbar') && (
                  <div className="rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-4">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-black text-xs uppercase tracking-wider">
                      💈 Barbershop & Grooming Details
                    </div>

                    {/* Haircut style options */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Select Haircut Style</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'Fade & Taper', label: '✂️ Fade & Taper' },
                          { id: 'Buzz Cut', label: '⚡ Buzz Cut' },
                          { id: 'Short Back & Sides', label: '💼 Classic Executive' },
                          { id: 'Beard Trim & Shape', label: '🧔 Beard Trim' },
                          { id: 'Clean Razor Shave', label: '🪒 Clean Razor' },
                          { id: 'VIP Haircut + Beard', label: '👑 VIP Hair + Beard' }
                        ].map(style => (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, selectedHaircut: style.id }))}
                            className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                              bookingData.selectedHaircut === style.id
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-300'
                            }`}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Beard Grooming Selection */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Beard Grooming Preference</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['Full Beard Shaping', 'Stubble Line-up', 'Clean Shave', 'No Beard Service'].map(b => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, beardGrooming: b }))}
                            className={`p-2 rounded-xl text-[11px] font-bold border-2 transition-all ${
                              bookingData.beardGrooming === b
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Photography specifics */}
                {(helper.type === 'photography') && (
                  <div className="rounded-2xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 p-4 space-y-4">
                    <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 font-black text-xs uppercase tracking-wider">
                      📸 Photoshoot & Media Details
                    </div>

                    {/* Shoot Style */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Shoot Style / Category</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'Portrait & Headshots', label: '👤 Portrait & Headshots' },
                          { id: 'Events & Parties', label: '🎉 Events & Parties' },
                          { id: 'Wedding & Engagement', label: '💍 Wedding & Love' },
                          { id: 'Commercial & Brand', label: '🛍️ Commercial & Brand' },
                          { id: 'Family & Lifestyle', label: '👨‍👩‍👧 Family & Lifestyle' },
                          { id: 'Studio Session', label: '🏢 Studio Session' }
                        ].map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, photographyType: s.id }))}
                            className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                              bookingData.photographyType === s.id
                                ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-purple-300'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Shoot Duration & Setting */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Estimated Duration</label>
                        <select
                          name="serviceDuration"
                          value={bookingData.serviceDuration || ''}
                          onChange={handleBookingChange}
                          className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        >
                          <option value="">Select session duration...</option>
                          <option value="1 Hour Session">1 Hour Session (Quick Shoot)</option>
                          <option value="2 Hours Session">2 Hours Standard Session</option>
                          <option value="Half Day (4 Hours)">Half Day (4 Hours)</option>
                          <option value="Full Day (8 Hours)">Full Day (8 Hours Coverage)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Location Setting</label>
                        <select
                          name="locationSetting"
                          value={bookingData.locationSetting || ''}
                          onChange={handleBookingChange}
                          className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        >
                          <option value="">Select shoot environment...</option>
                          <option value="Photographer Studio">Photographer Studio</option>
                          <option value="Outdoor / Natural Light">Outdoor / Natural Light</option>
                          <option value="Client Home or Office">Client Home or Office</option>
                          <option value="Event Venue">Event / Function Venue</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Beauty & Spa specifics */}
                {(helper.type === 'beauty' || helper.type === 'spa') && (
                  <div className="rounded-2xl border border-pink-200 dark:border-pink-900/40 bg-pink-50/50 dark:bg-pink-950/20 p-4 space-y-4">
                    <div className="flex items-center gap-2 text-pink-800 dark:text-pink-300 font-black text-xs uppercase tracking-wider">
                      💅 Beauty & Treatment Details
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Treatment Focus</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'Nails & Manicure', label: '💅 Nails & Mani' },
                          { id: 'Facial & Skincare', label: '✨ Facial & Glow' },
                          { id: 'Makeup & Glam', label: '💄 Makeup & Glam' },
                          { id: 'Lash & Brow', label: '👁️ Lash & Brow' },
                          { id: 'Full Body Massage', label: '💆 Massage' },
                          { id: 'Waxing & Threading', label: '🌸 Waxing' }
                        ].map(b => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, beautyFocus: b.id }))}
                            className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                              bookingData.beautyFocus === b.id
                                ? 'bg-pink-600 border-pink-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-pink-300'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tattoo specifics */}
                {(helper.type === 'tattoo') && (
                  <div className="rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-4 space-y-4">
                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-black text-xs uppercase tracking-wider">
                      🖋️ Tattoo Art & Session Details
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Tattoo Size Estimate</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['Small (<5cm)', 'Medium (5-15cm)', 'Large (15-25cm)', 'Sleeve / Backpiece'].map(sz => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, tattooSize: sz }))}
                            className={`p-2 rounded-xl text-[11px] font-bold border-2 transition-all ${
                              bookingData.tattooSize === sz
                                ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                                : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Private Tutor specifics */}
                {(helper.type === 'tutor') && (
                  <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-4">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-xs uppercase tracking-wider">
                      📚 Academic Tutoring Details
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Academic Level</label>
                        <select
                          name="academicLevel"
                          value={bookingData.academicLevel || ''}
                          onChange={handleBookingChange}
                          className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        >
                          <option value="">Select student level...</option>
                          <option value="Primary School">Primary School (Gr 1-7)</option>
                          <option value="High School">High School (Gr 8-11)</option>
                          <option value="Matric Prep">Matric / Grade 12</option>
                          <option value="University / Tertiary">University / Tertiary</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Target Subject</label>
                        <input
                          type="text"
                          name="subject"
                          value={bookingData.subject || ''}
                          onChange={handleBookingChange}
                          placeholder="e.g. Mathematics, Physics, English"
                          className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Car Wash specifics */}
                {(helper.type === 'carwash') && (
                  <div className="rounded-2xl border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50/50 dark:bg-cyan-950/20 p-4 space-y-4">
                    <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-300 font-black text-xs uppercase tracking-wider">
                      🚗 Vehicle & Wash Details
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Vehicle Type</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['Hatchback / Sedan', 'SUV / Crossover', 'Bakkie / 4x4', 'Minibus / Van'].map(v => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, vehicleType: v }))}
                            className={`p-2 rounded-xl text-[11px] font-bold border-2 transition-all ${
                              bookingData.vehicleType === v
                                ? 'bg-cyan-600 border-cyan-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Vehicle Make (Optional)</label>
                        <input
                          type="text"
                          name="vehicleMake"
                          value={bookingData.vehicleMake || ''}
                          onChange={handleBookingChange}
                          placeholder="e.g. Toyota, BMW..."
                          className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">Vehicle Model (Optional)</label>
                        <input
                          type="text"
                          name="vehicleModel"
                          value={bookingData.vehicleModel || ''}
                          onChange={handleBookingChange}
                          placeholder="e.g. Corolla, 3 Series..."
                          className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1.5">💧 Water Source on Site</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setBookingData(prev => ({ ...prev, waterSource: 'client' }))}
                          className={`p-2 rounded-xl border-2 text-xs font-bold transition-all ${bookingData.waterSource !== 'provider' ? 'bg-cyan-600 border-cyan-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                        >
                          Client provides water
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingData(prev => ({ ...prev, waterSource: 'provider' }))}
                          className={`p-2 rounded-xl border-2 text-xs font-bold transition-all ${bookingData.waterSource === 'provider' ? 'bg-cyan-600 border-cyan-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                        >
                          Provider brings tank
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Services Checklist */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2.5">Select Needed Services *</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {serviceOptions.map((service) => {
                      const isSelected = bookingData.selectedServices.includes(service.id);
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleServiceSelection(service.id)}
                          className={`p-3.5 border-2 rounded-2xl text-left transition-all relative ${
                            isSelected
                              ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 shadow-sm'
                              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-xl mb-1">{service.icon}</div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white leading-tight">{service.name}</div>
                          <div className="text-rose-600 font-black text-[11px] mt-1">R{service.price}</div>
                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center">
                              <CheckIcon className="text-white w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Special Instructions / Requests</label>
                  <textarea
                    name="specialRequirements"
                    value={bookingData.specialRequirements}
                    onChange={handleBookingChange}
                    rows="2"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                    placeholder="Any special instructions or preferences..."
                  />
                </div>
              </div>
            )}

            {/* ── SECTION 3: Provisions (Electricity/Food), Price & WhatsApp Booking ── */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Provisions: Food & Electricity */}
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Provisions on site</h4>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-2">🍴 Will you provide food for the helper?</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setBookingData(prev => ({ ...prev, foodProvided: 'yes' }))}
                        className={`p-2.5 rounded-xl border-2 text-xs font-bold transition-all ${bookingData.foodProvided === 'yes' ? 'bg-rose-500 border-rose-500 text-white shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                      >
                        Yes, I will
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingData(prev => ({ ...prev, foodProvided: 'no' }))}
                        className={`p-2.5 rounded-xl border-2 text-xs font-bold transition-all ${bookingData.foodProvided === 'no' ? 'bg-rose-500 border-rose-500 text-white shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-2">⚡ Is electricity available at the location?</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setBookingData(prev => ({ ...prev, electricityProvided: 'yes' }))}
                        className={`p-2.5 rounded-xl border-2 text-xs font-bold transition-all ${bookingData.electricityProvided === 'yes' ? 'bg-rose-500 border-rose-500 text-white shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                      >
                        Yes, available
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingData(prev => ({ ...prev, electricityProvided: 'no' }))}
                        className={`p-2.5 rounded-xl border-2 text-xs font-bold transition-all ${bookingData.electricityProvided === 'no' ? 'bg-rose-500 border-rose-500 text-white shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                      >
                        No electricity
                      </button>
                    </div>
                  </div>
                </div>

                {/* Booking Summary Card */}
                <div className="bg-slate-900 rounded-3xl p-5 text-white space-y-3 shadow-xl">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-300 pb-2 border-b border-white/10">
                    <span>Professional</span>
                    <span className="text-white font-black">{helper?.name}</span>
                  </div>
                  {bookingData.date && (
                    <div className="flex justify-between items-center text-xs font-bold text-slate-300 pb-2 border-b border-white/10">
                      <span>Scheduled Date & Time</span>
                      <span className="text-white font-black">{bookingData.date} {bookingData.time ? `@ ${bookingData.time}` : ''}</span>
                    </div>
                  )}
                  {bookingData.selectedServices.length > 0 && (
                    <div className="space-y-1 py-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Selected Services</span>
                      {bookingData.selectedServices.map(sId => {
                        const opt = serviceOptions.find(o => String(o.id) === String(sId));
                        return opt ? (
                          <div key={sId} className="flex justify-between items-center text-xs text-slate-200">
                            <span>{opt.name}</span>
                            <span>R{opt.price}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                  <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-300">Estimated Total</span>
                    <span className="text-2xl font-black text-rose-400">R{totalPrice}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleBookingSubmit}
                    disabled={isUploading}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2.5 active:scale-95"
                  >
                    {isUploading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Connecting via WhatsApp...
                      </>
                    ) : (
                      <>
                        <FaWhatsapp className="text-xl" />
                        Book via WhatsApp
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleEscrowCheckout}
                    disabled={isUploading}
                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <FaShieldAlt className="text-sm text-indigo-500" />
                    Secure Escrow Checkout
                  </button>
                </div>

                <p className="text-[10px] text-gray-500 font-bold text-center italic bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl py-2 px-3">
                  ⚠️ Never pay cash before completion. Avoid scams with loopOut Escrow!
                </p>
              </div>
            )}
          </div>

          {/* Sheet Footer Navigation */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 && (
              <button
                type="button"
                onClick={handleNext}
                className="px-7 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 active:scale-95 transition-all"
              >
                Next Step →
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
