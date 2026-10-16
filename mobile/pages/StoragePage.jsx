/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaStar, FaMapMarkerAlt, FaWhatsapp,
  FaShieldAlt, FaArrowLeft, FaLock,
  FaBoxOpen, FaWarehouse, FaRegCalendarAlt, FaFileAlt,
  FaExpand, FaChevronLeft, FaChevronRight, FaHeart,
  FaShare, FaSpinner, FaFilePdf, FaExternalLinkAlt,
  FaInfoCircle, FaTimes
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import HelperComments from '../components/HelperComments';
import GoogleMapComponent from '../components/GoogleMapComponent';

const formatPrice = (n) => (n != null ? `R${Number(n).toLocaleString()}` : '-');

const DURATION_OPTIONS = [
  { value: 'daily', label: 'Daily', detail: 'Flexible short stays' },
  { value: 'weekly', label: 'Weekly', detail: 'Save for seven days' },
  { value: 'monthly', label: 'Monthly', detail: 'Best for regular storage' },
  { value: 'yearly', label: 'Yearly', detail: 'Long-term storage' },
];

const STORAGE_ITEM_OPTIONS = [
  { id: 'chairs', label: 'Chairs', emoji: '🪑' },
  { id: 'bed', label: 'Bed', emoji: '🛏️' },
  { id: 'fridge', label: 'Fridge', emoji: '🧊' },
  { id: 'tv', label: 'TV', emoji: '📺' },
  { id: 'microwave', label: 'Microwave', emoji: '📻' },
  { id: 'clothes', label: 'Clothes', emoji: '👕' },
  { id: 'sofa', label: 'Sofa / Couch', emoji: '🛋️' },
  { id: 'boxes', label: 'Boxes', emoji: '📦' },
  { id: 'table', label: 'Table / Desk', emoji: '🪑' },
  { id: 'appliances', label: 'Appliances', emoji: '🧺' },
];

function computeEstimate(service, duration) {
  if (!service) return 0;
  const priceDay   = Number(service.storagePriceDay)   || 0;
  const priceMonth = Number(service.storagePriceMonth) || Number(service.price) || 0;
  if (duration === 'daily') return priceDay || Math.round(priceMonth / 30);
  if (duration === 'weekly') return priceDay ? priceDay * 7 : Math.round(priceMonth / 4);
  if (duration === 'yearly') return priceMonth * 12;
  return priceMonth;
}

export default function StoragePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((s) => s.user);

  const [storage, setStorage]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [activeImg, setActiveImg]       = useState(0);
  const [lightbox, setLightbox]         = useState(false);
  const [isSaved, setIsSaved]           = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [duration, setDuration]         = useState('monthly');
  const [showBooking, setShowBooking]   = useState(false);
  const [bookingStep, setBookingStep]   = useState(1);
  const [bookingError, setBookingError] = useState('');
  const [selectedStorageItems, setSelectedStorageItems] = useState([]);
  const [items, setItems]               = useState('');
  const [name, setName]                 = useState('');
  const [phone, setPhone]               = useState('');
  const [address, setAddress]           = useState('');
  const [notes, setNotes]               = useState('');
  const [policyAck, setPolicyAck]       = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  const toggleStorageItem = (itemLabel) => {
    setSelectedStorageItems((prev) =>
      prev.includes(itemLabel) ? prev.filter((i) => i !== itemLabel) : [...prev, itemLabel]
    );
  };

  const openBooking = () => {
    setBookingStep(1);
    setBookingError('');
    setPolicyAck(false);
    setShowBooking(true);
  };

  useEffect(() => {
    if (currentUser) { setName(currentUser.username || ''); setPhone(currentUser.phone || ''); }
  }, [currentUser?._id]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/service/get/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setStorage(data);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const images   = storage?.imageUrls?.length ? storage.imageUrls : [];
  const storageAddress = storage?.address || storage?.location || '';
  const estimate = storage ? computeEstimate(storage, duration) : 0;
  const durationLabel = DURATION_OPTIONS.find((option) => option.value === duration)?.label || 'Monthly';
  const fee      = Math.round(estimate * 0.1);
  const total    = estimate + fee;

  const handleBook = (event) => {
    event?.preventDefault();
    if (storage?.storagePolicyDocUrl && !policyAck) {
      setBookingError('Please confirm that you have read and agree to the storage policy.');
      return;
    }
    setBookingError('');
    setSubmitting(true);
    const rawPhone = (storage?.contactInfo || storage?.userPhone || '').replace(/\D/g, '');
    const wa = rawPhone ? `27${rawPhone.replace(/^0/, '')}` : '';
    const finalItems = [
      ...selectedStorageItems,
      ...(items ? [items] : [])
    ].filter(Boolean).join(', ');

    let msg = `*STORAGE BOOKING REQUEST*\n\n`;
    msg += `*Facility:* ${storage.name}\n`;
    if (storage.location) msg += `*Location:* ${storage.location}\n\n`;
    msg += `*Name:* ${name}\n*Phone:* ${phone}\n\n`;
    if (storage.storageSize) msg += `*Size:* ${storage.storageSize}\n`;
    if (storage.storagePriceMonth) msg += `*Monthly Rate:* R${storage.storagePriceMonth}\n`;
    msg += `*Duration:* ${durationLabel}\n`;
    if (finalItems) msg += `*Items to Store:* ${finalItems}\n`;
    if (address) msg += `*Address:* ${address}\n`;
    if (notes) msg += `*Notes:* ${notes}\n`;
    msg += `\n*Estimated Total:* R${total}\n_(estimate only)_`;
    if (policyAck) msg += `\n\nCustomer has read and agreed to the storage policy.`;
    const url = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setShowBooking(false);
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><FaSpinner className="w-10 h-10 text-rose-500 animate-spin" /></div>;
  if (error || !storage) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500 dark:text-white text-lg">{error || 'Storage unit not found.'}</p>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-rose-500 font-medium hover:underline"><FaArrowLeft /> Go back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      {/* Image Gallery - full-width like the other service listings */}
      {images.length > 0 ? (
        <div className="relative w-full">
          <div className="absolute left-4 right-4 top-4 z-30 flex items-center justify-between md:left-6 md:right-6 md:top-6">
            <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-black/30 text-white shadow-lg backdrop-blur-md transition hover:bg-black/50"><FaArrowLeft /></button>
            <button type="button" onClick={() => setIsSaved((saved) => !saved)} aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={isSaved} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-black/30 text-white shadow-lg backdrop-blur-md transition hover:bg-black/50">
              <FaHeart className={isSaved ? 'text-rose-400' : ''} />
            </button>
          </div>
          <div className="grid h-[320px] w-full grid-cols-1 gap-2 overflow-hidden bg-slate-900 sm:h-[400px] md:h-[500px] lg:h-[600px] md:grid-cols-2">
            <button type="button" aria-label="View first photo" onClick={() => { setActiveImg(0); setLightbox(true); }} className="group relative h-full overflow-hidden text-left">
              <img src={images[0]} alt={storage.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            </button>
            <div className="hidden h-full grid-cols-2 grid-rows-2 gap-2 md:grid">
              {images.slice(1, 5).map((image, index) => (
                <button key={`${image}-${index}`} type="button" aria-label={`View photo ${index + 2}`} onClick={() => { setActiveImg(index + 1); setLightbox(true); }} className="group relative h-full overflow-hidden text-left">
                  <img src={image} alt={`${storage.name} ${index + 2}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
                </button>
              ))}
              {images.length < 5 && Array(4 - Math.min(4, images.length - 1)).fill(null).map((_, index) => <div key={`empty-${index}`} className="h-full bg-slate-800" />)}
            </div>
          </div>
          <button type="button" onClick={() => setLightbox(true)} className="absolute bottom-5 right-4 z-20 flex items-center gap-2 rounded-xl border border-slate-200/50 bg-white/90 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-900 shadow-xl backdrop-blur-md transition hover:bg-white md:right-6">
            <FaExpand className="h-4 w-4" /> Show all {images.length} photos
          </button>
        </div>
      ) : (
        <div className="relative flex h-[320px] w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-950 sm:h-[400px] md:h-[500px] lg:h-[600px]">
          <div className="absolute left-4 right-4 top-4 z-30 flex items-center justify-between md:left-6 md:right-6 md:top-6">
            <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-black/30 text-white shadow-lg backdrop-blur-md transition hover:bg-black/50"><FaArrowLeft /></button>
            <button type="button" onClick={() => setIsSaved((saved) => !saved)} aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={isSaved} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-black/30 text-white shadow-lg backdrop-blur-md transition hover:bg-black/50"><FaHeart className={isSaved ? 'text-rose-400' : ''} /></button>
          </div>
          <FaWarehouse className="h-24 w-24 text-slate-400" />
        </div>
      )}

      <main className="app-safe-content-bottom relative z-10 mx-auto -mt-8 max-w-6xl rounded-t-[2rem] bg-white px-5 pb-36 pt-8 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] dark:bg-gray-950 sm:px-8 lg:-mt-12 lg:rounded-t-[2.5rem] lg:px-12 lg:pb-16">
        <div className="mb-10 border-b border-slate-200/60 pb-8">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-600"><FaWarehouse /> Storage</div>
          <h1 className="mb-5 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">{storage.name}</h1>
          <div className="flex flex-wrap items-center gap-2.5 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-2 text-slate-800"><FaStar className="text-amber-400" /><span className="font-semibold">{commentCount > 0 && Number(storage.rating) > 0 ? Number(storage.rating).toFixed(1) : 'New'}</span><span className="text-slate-500">{commentCount} {commentCount === 1 ? 'review' : 'reviews'}</span></span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 dark:border-gray-700 dark:text-slate-300"><FaRegCalendarAlt className="text-indigo-500" />{Number(storage.bookingsCount) > 0 ? ` Booked ${storage.bookingsCount} ${Number(storage.bookingsCount) === 1 ? 'time' : 'times'}` : ' No bookings yet'}</span>
            {storageAddress && <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 dark:border-gray-700 dark:text-slate-300"><FaMapMarkerAlt className="shrink-0 text-slate-400" /><span className="truncate">{storageAddress}</span></span>}
            {Number(storage.storagePriceDay) > 0 && <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-800">{formatPrice(storage.storagePriceDay)} <span className="ml-1 font-medium text-blue-600">/ day</span></span>}
            {Number(storage.storagePriceMonth) > 0 && <span className="inline-flex items-center rounded-full border border-rose-100 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-800">{formatPrice(storage.storagePriceMonth)} <span className="ml-1 font-medium text-rose-600">/ month</span></span>}
            <button onClick={() => setShowComments(true)} className="text-sm text-rose-500 underline hover:text-rose-700">View reviews</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Specs */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FaBoxOpen className="text-rose-500" /> Storage Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {storage.storageSize && <div className="bg-slate-50 dark:bg-gray-950 rounded-xl p-4 text-center"><p className="text-xs text-gray-500 dark:text-white mb-1">Unit Size</p><p className="font-semibold text-gray-800 dark:text-white">{storage.storageSize}</p></div>}
                {storage.storagePriceDay > 0 && <div className="bg-blue-50 rounded-xl p-4 text-center"><p className="text-xs text-gray-500 dark:text-white mb-1">Daily Rate</p><p className="font-bold text-blue-700">{formatPrice(storage.storagePriceDay)}</p></div>}
                {storage.storagePriceMonth > 0 && <div className="bg-rose-50 rounded-xl p-4 text-center"><p className="text-xs text-gray-500 dark:text-white mb-1">Monthly Rate</p><p className="font-bold text-rose-700">{formatPrice(storage.storagePriceMonth)}</p></div>}
              </div>
            </div>

            {storage.description && <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800"><h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About this storage</h2><p className="text-gray-600 dark:text-white leading-relaxed whitespace-pre-line">{storage.description}</p></div>}
            {storage.storageFailurePolicy && <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5"><h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2"><FaInfoCircle /> Late Payment Policy</h3><p className="text-sm text-amber-800 leading-relaxed">{storage.storageFailurePolicy}</p></div>}
            {storage.storageTerms && storage.storageTerms !== storage.storageFailurePolicy && <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl p-5"><h3 className="font-semibold text-gray-800 dark:text-white mb-2">Terms & Conditions</h3><p className="text-sm text-gray-600 dark:text-white leading-relaxed whitespace-pre-line">{storage.storageTerms}</p></div>}
            {storage.storagePolicyDocUrl && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3"><FaFilePdf className="text-red-500 text-2xl flex-shrink-0" /><div><p className="font-semibold text-gray-900 dark:text-white text-sm">Policy Document</p><p className="text-xs text-gray-500 dark:text-white">Read before booking</p></div></div>
                <a href={storage.storagePolicyDocUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 underline">Open <FaExternalLinkAlt className="w-3 h-3" /></a>
              </div>
            )}
            {storageAddress && (
              <section className="overflow-hidden rounded-[2rem] border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center justify-between gap-4 p-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-500">Storage location</p>
                    <h2 className="mt-1 text-lg font-black text-gray-900 dark:text-white">Find this facility</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-white">{storageAddress}</p>
                  </div>
                  <FaMapMarkerAlt className="shrink-0 text-3xl text-rose-500" />
                </div>
                <div className="h-[320px] border-t border-slate-100 dark:border-gray-800 bg-slate-950 sm:h-[400px]">
                  <GoogleMapComponent address={storageAddress} title={storage.name} />
                </div>
              </section>
            )}
            <HelperComments helperId={id} helperType="service" onCommentCountChange={setCommentCount} />
          </div>

          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm font-medium text-slate-500">Storage from</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{duration === 'daily' && storage.storagePriceDay ? formatPrice(storage.storagePriceDay) : storage.storagePriceMonth ? formatPrice(storage.storagePriceMonth) : 'Ask for price'}</span>
                {estimate > 0 && <span className="text-sm text-slate-500">per {durationLabel.toLowerCase()}</span>}
              </div>
              {storage.storageSize && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Unit size: {storage.storageSize}</p>}
              {estimate > 0 && <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-gray-800 dark:text-slate-200">Estimated total for {durationLabel.toLowerCase()}: {formatPrice(total)}</p>}
              <button onClick={openBooking} className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2">Review &amp; reserve</button>
              <p className="mt-4 text-center text-xs text-slate-500">Final price and availability are confirmed with the provider.</p>
            </div>
          </aside>

          {/* Booking form is available from the booking popup below. */}
          <div className="hidden lg:col-span-1">
            <div className="sticky top-20">
              <form onSubmit={handleBook} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-5">
                  <div className="flex items-center gap-2 mb-1"><FaBoxOpen /><span className="font-semibold text-sm uppercase tracking-wide">Book Storage</span></div>
                  {storage.storagePriceMonth > 0 && <p className="text-3xl font-bold">{formatPrice(storage.storagePriceMonth)} <span className="text-base font-normal opacity-80">/month</span></p>}
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">Storage Duration *</label>
                    <select value={duration} onChange={(e)=>setDuration(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm">
                      {DURATION_OPTIONS.map((o)=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">What will you store?</label>
                    <p className="text-xs text-gray-500 dark:text-white mb-2">Tap items to quickly select them:</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {STORAGE_ITEM_OPTIONS.map((opt) => {
                        const isSelected = selectedStorageItems.includes(opt.label);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => toggleStorageItem(opt.label)}
                            className={`px-2.5 py-1 rounded-full border text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 ${
                              isSelected
                                ? 'bg-rose-500 text-white border-rose-500 shadow-sm ring-2 ring-rose-200'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white border-gray-200 dark:border-gray-800 hover:border-rose-300 hover:bg-rose-50/50'
                            }`}
                          >
                            <span>{opt.emoji}</span>
                            <span>{opt.label}</span>
                            {isSelected && <span className="ml-0.5 text-[10px]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    <textarea value={items} onChange={(e)=>setItems(e.target.value)} rows={2} placeholder="Add additional details or specific quantities (e.g. 2x chairs, king bed...)" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-semibold text-gray-600 dark:text-white mb-1">Your Name *</label><input required value={name} onChange={(e)=>setName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm" /></div>
                    <div><label className="block text-xs font-semibold text-gray-600 dark:text-white mb-1">Phone *</label><input required value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="0XX XXX XXXX" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm" /></div>
                  </div>
                  <div><label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">Your Address</label><input value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Collection/drop-off address" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm" /></div>
                  <div><label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">Notes</label><textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={2} placeholder="Any special requirements..." className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm resize-none" /></div>
                  {storage.storagePolicyDocUrl && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                      <a href={storage.storagePolicyDocUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-700 font-medium underline hover:text-blue-900"><FaFilePdf className="text-red-500" /> Open & read policy ↗</a>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" required checked={policyAck} onChange={(e)=>setPolicyAck(e.target.checked)} className="mt-0.5 w-4 h-4 accent-rose-500 flex-shrink-0" />
                        <span className="text-xs text-amber-800 font-medium leading-snug">I confirm I have read and agree to the policy document *</span>
                      </label>
                    </div>
                  )}
                  {estimate > 0 && (
                    <div className="border-t pt-3 space-y-1 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-white"><span>Estimate ({duration})</span><span>{formatPrice(estimate)}</span></div>
                      <div className="flex justify-between text-gray-600 dark:text-white"><span>Service fee (10%)</span><span>{formatPrice(fee)}</span></div>
                      <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-1 border-t"><span>Total</span><span>{formatPrice(total)}</span></div>
                    </div>
                  )}
                  <button type="submit" disabled={submitting} className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 active:scale-95 transition-all disabled:opacity-60">
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaWhatsapp className="text-xl" />} Book via WhatsApp
                  </button>
                  <p className="text-center text-xs text-gray-400">You will be taken to WhatsApp to confirm with the provider</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile booking action */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 dark:border-gray-800 bg-white/95 p-3 backdrop-blur sm:hidden safe-area-bottom mobile-booking-bar">
        <button onClick={openBooking} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 font-bold text-white shadow-lg transition hover:bg-black">
          <FaRegCalendarAlt /> Review &amp; reserve
        </button>
      </div>

      {/* Booking popup */}
      <AnimatePresence>
        {showBooking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-end bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" onClick={() => setShowBooking(false)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 320 }} onClick={(event) => event.stopPropagation()} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] bg-white dark:bg-gray-900 sm:rounded-[2rem]">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-5">
                <div><p className="text-xs font-black uppercase tracking-[0.18em] text-rose-500">Step {bookingStep} of 3</p><h2 className="text-xl font-black text-gray-900 dark:text-white">Reserve your space</h2></div>
                <button type="button" onClick={() => setShowBooking(false)} aria-label="Close booking" className="rounded-full bg-gray-100 dark:bg-gray-800 p-2 text-gray-600 dark:text-white hover:bg-gray-200"><FaTimes /></button>
              </div>
              <div className="px-6 pt-5" aria-label={`Booking progress, step ${bookingStep} of 3`}>
                <div className="flex gap-2">{[1, 2, 3].map((step) => <span key={step} className={`h-1.5 flex-1 rounded-full ${step <= bookingStep ? 'bg-rose-500' : 'bg-gray-200 dark:bg-gray-700'}`} />)}</div>
                <div className="mt-2 flex justify-between text-[11px] font-semibold text-gray-500 dark:text-gray-400"><span>Plan &amp; items</span><span>Your details</span><span>Review</span></div>
              </div>
              <div className="space-y-6 p-6">
                {bookingStep === 1 && <>
                  <div><h3 className="font-bold text-gray-900 dark:text-white">Choose your plan</h3><p className="mt-1 text-sm text-gray-500 dark:text-white">Select the billing period that fits your storage needs.</p><div className="mt-3 grid grid-cols-2 gap-3">
                    {DURATION_OPTIONS.map((option) => <button key={option.value} type="button" onClick={() => setDuration(option.value)} aria-pressed={duration === option.value} className={`rounded-2xl border p-4 text-left transition ${duration === option.value ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-100' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-rose-200'}`}><span className="block font-bold text-gray-900 dark:text-white">{option.label}</span><span className="mt-1 block text-xs text-gray-500 dark:text-white">{option.detail}</span></button>)}
                  </div></div>
                  <div><label className="mb-2 block text-sm font-bold text-gray-700 dark:text-white">What are you storing?</label><div className="flex flex-wrap gap-2">{STORAGE_ITEM_OPTIONS.map((option) => <button key={option.id} type="button" onClick={() => toggleStorageItem(option.label)} aria-pressed={selectedStorageItems.includes(option.label)} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${selectedStorageItems.includes(option.label) ? 'border-rose-500 bg-rose-500 text-white' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-white hover:border-rose-300'}`}>{option.emoji} {option.label}</button>)}</div><textarea value={items} onChange={(event) => setItems(event.target.value)} rows={2} placeholder="Add quantities or other items" className="mt-3 w-full rounded-xl border border-gray-200 dark:border-gray-800 p-3 text-sm focus:border-rose-500 focus:outline-none" /></div>
                  <div className="rounded-2xl bg-slate-900 p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-white/60">{durationLabel} estimate</p><p className="mt-1 text-3xl font-black">{formatPrice(total)}</p><p className="mt-1 text-xs text-white/65">Includes an estimated 10% service fee. Final cost is confirmed by the provider.</p></div>
                </>}
                {bookingStep === 2 && <>
                  <div><h3 className="font-bold text-gray-900 dark:text-white">Your contact details</h3><p className="mt-1 text-sm text-gray-500 dark:text-white">The provider will use these details to follow up on your request.</p></div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Name<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-3 text-sm font-normal dark:bg-gray-950" /></label><label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Phone number<input required autoComplete="tel" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-3 text-sm font-normal dark:bg-gray-950" /></label></div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Address or collection details <span className="font-normal text-gray-500">(optional)</span><input autoComplete="street-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Where should the provider meet you?" className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-3 text-sm font-normal dark:bg-gray-950" /></label>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Notes <span className="font-normal text-gray-500">(optional)</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Anything else the provider should know?" className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-3 text-sm font-normal dark:bg-gray-950" /></label>
                </>}
                {bookingStep === 3 && <>
                  <div><h3 className="font-bold text-gray-900 dark:text-white">Review your request</h3><p className="mt-1 text-sm text-gray-500 dark:text-white">Check the plan and contact details before continuing.</p></div>
                  <div className="space-y-3 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 text-sm">
                    <div className="flex justify-between gap-4"><span className="text-gray-500 dark:text-gray-400">Facility</span><span className="text-right font-semibold text-gray-900 dark:text-white">{storage.name}{storageAddress ? ` · ${storageAddress}` : ''}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-gray-500 dark:text-gray-400">Storage plan</span><span className="font-semibold text-gray-900 dark:text-white">{durationLabel}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-gray-500 dark:text-gray-400">Storage estimate</span><span className="font-semibold text-gray-900 dark:text-white">{formatPrice(estimate)}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-gray-500 dark:text-gray-400">Service fee (10%)</span><span className="font-semibold text-gray-900 dark:text-white">{formatPrice(fee)}</span></div>
                    <div className="flex justify-between gap-4 border-t border-gray-100 dark:border-gray-800 pt-3"><span className="font-bold text-gray-900 dark:text-white">Estimated total</span><span className="font-black text-gray-900 dark:text-white">{formatPrice(total)}</span></div>
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-3"><p className="text-gray-500 dark:text-gray-400">Contact</p><p className="mt-1 font-semibold text-gray-900 dark:text-white">{name} · {phone}</p>{address && <p className="mt-1 text-gray-600 dark:text-gray-300">{address}</p>}</div>
                    {(selectedStorageItems.length > 0 || items.trim()) && <div className="border-t border-gray-100 dark:border-gray-800 pt-3"><p className="text-gray-500 dark:text-gray-400">Items to store</p><p className="mt-1 text-gray-900 dark:text-white">{[...selectedStorageItems, items.trim()].filter(Boolean).join(', ')}</p></div>}
                    {notes.trim() && <div className="border-t border-gray-100 dark:border-gray-800 pt-3"><p className="text-gray-500 dark:text-gray-400">Notes</p><p className="mt-1 text-gray-900 dark:text-white">{notes}</p></div>}
                  </div>
                  {storage.storagePolicyDocUrl && <div className="space-y-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><a href={storage.storagePolicyDocUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold underline"><FaFilePdf className="text-red-500" />Read the storage policy</a><label className="flex cursor-pointer items-start gap-3"><input checked={policyAck} onChange={(event) => setPolicyAck(event.target.checked)} type="checkbox" className="mt-1 accent-rose-500" /><span>I have read and agree to the storage policy.</span></label></div>}
                  <p className="text-xs text-gray-500 dark:text-gray-400">This is a request. The provider will confirm availability and the final price.</p>
                </>}
                {bookingError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{bookingError}</p>}
                <div className="flex gap-3 border-t border-gray-100 dark:border-gray-800 pt-5">
                  {bookingStep > 1 && <button type="button" onClick={() => { setBookingError(''); setBookingStep((step) => step - 1); }} className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 font-semibold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">Back</button>}
                  {bookingStep < 3 ? <button type="button" onClick={() => { setBookingError(''); if (bookingStep === 2 && (!name.trim() || !phone.trim())) { setBookingError('Enter your name and phone number to continue.'); return; } setBookingStep((step) => step + 1); }} className="flex-1 rounded-xl bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-slate-800">Continue</button> : <button type="button" onClick={handleBook} disabled={submitting || (Boolean(storage.storagePolicyDocUrl) && !policyAck)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-3.5 font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <FaSpinner className="animate-spin" /> : <FaWhatsapp className="text-xl" />} Continue on WhatsApp</button>}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && images.length > 0 && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={()=>setLightbox(false)}>
            <button className="absolute top-4 right-4 text-white text-2xl" onClick={()=>setLightbox(false)}><FaTimes /></button>
            <button className="absolute left-4 text-white text-2xl p-2" onClick={(e)=>{e.stopPropagation();setActiveImg((activeImg-1+images.length)%images.length);}}><FaChevronLeft /></button>
            <img src={images[activeImg]} alt="" className="max-h-[85vh] max-w-full rounded-xl object-contain" onClick={(e)=>e.stopPropagation()} />
            <button className="absolute right-4 text-white text-2xl p-2" onClick={(e)=>{e.stopPropagation();setActiveImg((activeImg+1)%images.length);}}><FaChevronRight /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments slide-over */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',damping:25,stiffness:200}} className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white dark:bg-gray-900">
              <h3 className="font-bold text-gray-900 dark:text-white">Reviews</h3>
              <button onClick={()=>setShowComments(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white"><FaTimes /></button>
            </div>
            <div className="p-4"><HelperComments helperId={id} helperType="service" onCommentCountChange={setCommentCount} /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
