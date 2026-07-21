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

const formatPrice = (n) => (n != null ? `R${Number(n).toLocaleString()}` : '-');

const DURATION_OPTIONS = [
  { value: '1 day', label: '1 Day' },
  { value: '3 days', label: '3 Days' },
  { value: '1 week', label: '1 Week' },
  { value: '1 month', label: '1 Month' },
  { value: '2 months', label: '2 Months' },
  { value: '3 months', label: '3 Months' },
  { value: '6 months', label: '6 Months' },
  { value: '12 months', label: '12 Months' },
  { value: 'Ongoing', label: 'Ongoing (month-to-month)' },
];

function computeEstimate(service, duration) {
  if (!service) return 0;
  const priceDay   = Number(service.storagePriceDay)   || 0;
  const priceMonth = Number(service.storagePriceMonth) || Number(service.price) || 0;
  if (duration.includes('day') || duration.includes('Day')) {
    const days = parseInt(duration) || 1;
    return priceDay * days;
  }
  if (duration === 'Ongoing') return priceMonth;
  const months = parseInt(duration) || 1;
  return priceMonth * months;
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
  const [duration, setDuration]         = useState('1 month');
  const [items, setItems]               = useState('');
  const [name, setName]                 = useState('');
  const [phone, setPhone]               = useState('');
  const [address, setAddress]           = useState('');
  const [notes, setNotes]               = useState('');
  const [policyAck, setPolicyAck]       = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  useEffect(() => {
    if (currentUser) { setName(currentUser.username || ''); setPhone(currentUser.phone || ''); }
  }, [currentUser]);

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
  const estimate = storage ? computeEstimate(storage, duration) : 0;
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
    let msg = `*STORAGE BOOKING REQUEST*\n\n`;
    msg += `*Facility:* ${storage.name}\n`;
    if (storage.location) msg += `*Location:* ${storage.location}\n\n`;
    msg += `*Name:* ${name}\n*Phone:* ${phone}\n\n`;
    if (storage.storageSize) msg += `*Size:* ${storage.storageSize}\n`;
    if (storage.storagePriceMonth) msg += `*Monthly Rate:* R${storage.storagePriceMonth}\n`;
    msg += `*Duration:* ${duration}\n`;
    if (items) msg += `*Items:* ${items}\n`;
    if (address) msg += `*Address:* ${address}\n`;
    if (notes) msg += `*Notes:* ${notes}\n`;
    msg += `\n*Estimated Total:* R${total}\n_(estimate only)_`;
    if (policyAck) msg += `\n\nCustomer has read and agreed to the storage policy.`;
    const url = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
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
          <div className="relative mb-8">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100 cursor-pointer" onClick={() => setLightbox(true)}>
              <img src={images[activeImg]} alt="Storage" className="w-full h-full object-cover" />
              <button className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full"><FaExpand className="w-4 h-4" /></button>
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">{activeImg + 1}/{images.length}</div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-rose-500' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{storage.name}</h1>
              {storage.location && <p className="flex items-center gap-1 text-gray-500 text-sm"><FaMapMarkerAlt className="text-rose-400" /> {storage.location}</p>}
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
            <HelperComments helperId={id} helperType="service" onCommentCountChange={setCommentCount} />
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
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
                    <textarea value={items} onChange={(e)=>setItems(e.target.value)} rows={2} placeholder="e.g. furniture, boxes, vehicle..." className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm resize-none" />
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
