/* eslint-disable react/prop-types */
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

  const handleBook = (e) => {
    e.preventDefault();
    if (storage?.storagePolicyDocUrl && !policyAck) {
      alert('Please confirm you have read the policy document before booking.');
      return;
    }
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
      <p className="text-gray-500 text-lg">{error || 'Storage unit not found.'}</p>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-rose-500 font-medium hover:underline"><FaArrowLeft /> Go back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-700 hover:text-rose-600 font-medium transition-colors">
          <FaArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="font-semibold text-gray-900 truncate max-w-xs">{storage.name}</span>
        <button onClick={() => setIsSaved(!isSaved)} className={`transition-colors ${isSaved ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'}`}>
          <FaHeart className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6 pb-20">
        {/* Gallery */}
        {images.length > 0 ? (
          <div className="relative -mx-4 mb-8 h-[330px] overflow-hidden bg-slate-900 sm:h-[440px] lg:h-[540px]">
            <div className="grid h-full grid-cols-1 gap-1.5 md:grid-cols-4 md:grid-rows-2">
              <button type="button" onClick={() => { setActiveImg(0); setLightbox(true); }} className="group relative h-full overflow-hidden text-left md:col-span-2 md:row-span-2">
                <img src={images[0]} alt={storage.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent md:hidden" />
              </button>
              {images.slice(1, 5).map((image, index) => (
                <button key={image} type="button" onClick={() => { setActiveImg(index + 1); setLightbox(true); }} className="group relative hidden overflow-hidden text-left md:block">
                  <img src={image} alt={`${storage.name} ${index + 2}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setLightbox(true)} className="absolute bottom-5 right-5 flex items-center gap-2 rounded-2xl border border-slate-200/60 bg-white/95 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-xl backdrop-blur transition hover:scale-105">
              <FaExpand /> Show all {images.length} photos
            </button>
          </div>
        ) : (
          <div className="mb-8 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 aspect-video flex items-center justify-center">
            <FaWarehouse className="w-24 h-24 text-slate-500" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-rose-600 font-semibold mb-1"><FaWarehouse /> Booking Storage</div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{storage.name}</h1>
                <button onClick={() => setShowBooking(true)} className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600">
                  <FaRegCalendarAlt /> Book storage
                </button>
              </div>
              {storageAddress && <p className="flex items-center gap-1 text-gray-500 text-sm"><FaMapMarkerAlt className="text-rose-400" /> {storageAddress}</p>}
              <div className="flex items-center gap-4 mt-3">
                {storage.rating && <span className="flex items-center gap-1 text-sm font-medium text-gray-700"><FaStar className="text-amber-400" /> {storage.rating}</span>}
                <button onClick={() => setShowComments(true)} className="text-sm text-rose-500 underline hover:text-rose-700">
                  {commentCount > 0 ? `${commentCount} reviews` : 'Reviews'}
                </button>
              </div>
            </div>

            {/* Specs */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><FaBoxOpen className="text-rose-500" /> Storage Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {storage.storageSize && <div className="bg-slate-50 rounded-xl p-4 text-center"><p className="text-xs text-gray-500 mb-1">Unit Size</p><p className="font-semibold text-gray-800">{storage.storageSize}</p></div>}
                {storage.storagePriceDay > 0 && <div className="bg-blue-50 rounded-xl p-4 text-center"><p className="text-xs text-gray-500 mb-1">Daily Rate</p><p className="font-bold text-blue-700">{formatPrice(storage.storagePriceDay)}</p></div>}
                {storage.storagePriceMonth > 0 && <div className="bg-rose-50 rounded-xl p-4 text-center"><p className="text-xs text-gray-500 mb-1">Monthly Rate</p><p className="font-bold text-rose-700">{formatPrice(storage.storagePriceMonth)}</p></div>}
              </div>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-3 gap-4">
              {[{icon:<FaShieldAlt className="text-rose-500"/>,label:'Secure',desc:'Monitored & locked'},{icon:<FaRegCalendarAlt className="text-blue-500"/>,label:'Flexible',desc:'Daily & monthly'},{icon:<FaLock className="text-emerald-500"/>,label:'Private',desc:'Your own unit'}].map((h)=>(
                <div key={h.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
                  <div className="text-xl mt-0.5">{h.icon}</div>
                  <div><p className="font-semibold text-gray-800 text-sm">{h.label}</p><p className="text-xs text-gray-500">{h.desc}</p></div>
                </div>
              ))}
            </div>

            {storage.description && <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"><h2 className="text-lg font-bold text-gray-900 mb-3">About this storage</h2><p className="text-gray-600 leading-relaxed whitespace-pre-line">{storage.description}</p></div>}
            {storage.storageFailurePolicy && <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5"><h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2"><FaInfoCircle /> Late Payment Policy</h3><p className="text-sm text-amber-800 leading-relaxed">{storage.storageFailurePolicy}</p></div>}
            {storage.storageTerms && <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5"><h3 className="font-semibold text-gray-800 mb-2">Terms & Conditions</h3><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{storage.storageTerms}</p></div>}
            {storage.storagePolicyDocUrl && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3"><FaFilePdf className="text-red-500 text-2xl flex-shrink-0" /><div><p className="font-semibold text-gray-900 text-sm">Policy Document</p><p className="text-xs text-gray-500">Read before booking</p></div></div>
                <a href={storage.storagePolicyDocUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 underline">Open <FaExternalLinkAlt className="w-3 h-3" /></a>
              </div>
            )}
            {storageAddress && (
              <section className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-4 p-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-500">Storage location</p>
                    <h2 className="mt-1 text-lg font-black text-gray-900">Find this facility</h2>
                    <p className="mt-1 text-sm text-gray-500">{storageAddress}</p>
                  </div>
                  <FaMapMarkerAlt className="shrink-0 text-3xl text-rose-500" />
                </div>
                <div className="h-[320px] border-t border-slate-100 bg-slate-950 sm:h-[400px]">
                  <GoogleMapComponent address={storageAddress} title={storage.name} />
                </div>
              </section>
            )}
            <HelperComments helperId={id} helperType="service" onCommentCountChange={setCommentCount} />
          </div>

          {/* Booking form is available from the booking popup below. */}
          <div className="hidden lg:col-span-1">
            <div className="sticky top-20">
              <form onSubmit={handleBook} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-5">
                  <div className="flex items-center gap-2 mb-1"><FaBoxOpen /><span className="font-semibold text-sm uppercase tracking-wide">Book Storage</span></div>
                  {storage.storagePriceMonth > 0 && <p className="text-3xl font-bold">{formatPrice(storage.storagePriceMonth)} <span className="text-base font-normal opacity-80">/month</span></p>}
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Storage Duration *</label>
                    <select value={duration} onChange={(e)=>setDuration(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm">
                      {DURATION_OPTIONS.map((o)=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">What will you store?</label>
                    <p className="text-xs text-gray-500 mb-2">Tap items to quickly select them:</p>
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
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
                            }`}
                          >
                            <span>{opt.emoji}</span>
                            <span>{opt.label}</span>
                            {isSelected && <span className="ml-0.5 text-[10px]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    <textarea value={items} onChange={(e)=>setItems(e.target.value)} rows={2} placeholder="Add additional details or specific quantities (e.g. 2x chairs, king bed...)" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Your Name *</label><input required value={name} onChange={(e)=>setName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm" /></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Phone *</label><input required value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="0XX XXX XXXX" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm" /></div>
                  </div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Your Address</label><input value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Collection/drop-off address" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm" /></div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label><textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={2} placeholder="Any special requirements..." className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm resize-none" /></div>
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
                      <div className="flex justify-between text-gray-600"><span>Estimate ({duration})</span><span>{formatPrice(estimate)}</span></div>
                      <div className="flex justify-between text-gray-600"><span>Service fee (10%)</span><span>{formatPrice(fee)}</span></div>
                      <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t"><span>Total</span><span>{formatPrice(total)}</span></div>
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
      </div>

      {/* Mobile booking action */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 p-3 backdrop-blur sm:hidden">
        <button onClick={() => setShowBooking(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 py-3.5 font-bold text-white shadow-lg shadow-rose-500/25">
          <FaRegCalendarAlt /> Choose a storage plan
        </button>
      </div>

      {/* Booking popup */}
      <AnimatePresence>
        {showBooking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-end bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" onClick={() => setShowBooking(false)}>
            <motion.form initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 320 }} onSubmit={handleBook} onClick={(event) => event.stopPropagation()} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] bg-white sm:rounded-[2rem]">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
                <div><p className="text-xs font-black uppercase tracking-[0.18em] text-rose-500">Secure storage</p><h2 className="text-xl font-black text-gray-900">Reserve your space</h2></div>
                <button type="button" onClick={() => setShowBooking(false)} aria-label="Close booking" className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"><FaTimes /></button>
              </div>
              <div className="space-y-6 p-6">
                <div><h3 className="font-bold text-gray-900">Choose your plan</h3><p className="mt-1 text-sm text-gray-500">Select the billing period that fits your storage needs.</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {DURATION_OPTIONS.map((option) => <button key={option.value} type="button" onClick={() => setDuration(option.value)} className={`rounded-2xl border p-4 text-left transition ${duration === option.value ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-100' : 'border-gray-200 bg-white hover:border-rose-200'}`}><span className="block font-bold text-gray-900">{option.label}</span><span className="mt-1 block text-xs text-gray-500">{option.detail}</span></button>)}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-900 p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-white/60">{durationLabel} estimate</p><p className="mt-1 text-3xl font-black">{formatPrice(total)}</p><p className="mt-1 text-xs text-white/65">Includes an estimated 10% service fee. Final cost is confirmed by the provider.</p></div>
                <div><label className="mb-2 block text-sm font-bold text-gray-700">What are you storing?</label><div className="flex flex-wrap gap-2">{STORAGE_ITEM_OPTIONS.map((option) => <button key={option.id} type="button" onClick={() => toggleStorageItem(option.label)} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${selectedStorageItems.includes(option.label) ? 'border-rose-500 bg-rose-500 text-white' : 'border-gray-200 text-gray-700 hover:border-rose-300'}`}>{option.emoji} {option.label}</button>)}</div><textarea value={items} onChange={(event) => setItems(event.target.value)} rows={2} placeholder="Add quantities or other items" className="mt-3 w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-rose-500 focus:outline-none" /></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="rounded-xl border border-gray-200 p-3 text-sm focus:border-rose-500 focus:outline-none" /><input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" className="rounded-xl border border-gray-200 p-3 text-sm focus:border-rose-500 focus:outline-none" /></div>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} placeholder="Notes for the provider (optional)" className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-rose-500 focus:outline-none" />
                {storage.storagePolicyDocUrl && <label className="flex gap-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><input required checked={policyAck} onChange={(event) => setPolicyAck(event.target.checked)} type="checkbox" className="mt-1 accent-rose-500" /><span>I have read and agree to the storage policy.</span></label>}
                <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-3.5 font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-green-700 disabled:opacity-60">{submitting ? <FaSpinner className="animate-spin" /> : <FaWhatsapp className="text-xl" />} Continue on WhatsApp</button>
              </div>
            </motion.form>
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
          <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',damping:25,stiffness:200}} className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-gray-900">Reviews</h3>
              <button onClick={()=>setShowComments(false)} className="text-gray-400 hover:text-gray-700"><FaTimes /></button>
            </div>
            <div className="p-4"><HelperComments helperId={id} helperType="service" onCommentCountChange={setCommentCount} /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
