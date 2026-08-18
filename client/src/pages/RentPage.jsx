/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useWishlist } from "../hooks/useWishlist";
import NeuralLoader from "../components/NeuralLoader";
import "swiper/css";
import "swiper/css/pagination";

import {
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  XMarkIcon,
  CheckCircleIcon,
  Squares2X2Icon,
  UserIcon,
  HomeModernIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import {
  FaWifi, FaParking, FaSwimmingPool, FaUtensils, FaFire, FaTv, FaWarehouse,
  FaShieldAlt, FaHotTub, FaDog, FaBolt, FaSnowflake, FaUserFriends, FaCoffee,
  FaCouch, FaWhatsapp, FaBed, FaBath,
} from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";

/* ─── Amenity config ─────────────────────────────────────────────────────── */
const AMENITY_MAP = {
  wifi:      { icon: FaWifi,        label: "WiFi" },
  parking:   { icon: FaParking,     label: "Free parking" },
  pool:      { icon: FaSwimmingPool,label: "Swimming pool" },
  kitchen:   { icon: FaUtensils,    label: "Kitchen" },
  stove:     { icon: FaFire,        label: "Stove" },
  tv:        { icon: FaTv,          label: "TV" },
  storage:   { icon: FaWarehouse,   label: "Storage" },
  security:  { icon: FaShieldAlt,   label: "Security" },
  hot:       { icon: FaHotTub,      label: "Hot water" },
  pets:      { icon: FaDog,         label: "Pets allowed" },
  prepaid:   { icon: FaBolt,        label: "Prepaid electricity" },
  fridge:    { icon: FaSnowflake,   label: "Refrigerator" },
  share:     { icon: FaUserFriends, label: "Shared space" },
  breakfast: { icon: FaCoffee,      label: "Breakfast included" },
  furnished: { icon: FaCouch,       label: "Furnished" },
};

/* ─── Full-screen gallery ────────────────────────────────────────────────── */
const GalleryOverlay = ({ images, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col"
    >
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <span className="text-white/60 text-sm font-bold tracking-widest uppercase">
          {idx + 1} / {images.length}
        </span>
        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
          <XMarkIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative px-16">
        <button onClick={prev} className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition">
          <ArrowLeftIcon className="w-6 h-6 text-white" />
        </button>
        <img src={images[idx]} alt="" className="max-h-full max-w-full object-contain rounded-2xl" />
        <button onClick={next} className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition rotate-180">
          <ArrowLeftIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto px-6 py-4 shrink-0" style={{ scrollbarWidth: "none" }}>
        {images.map((img, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${i === idx ? "border-white" : "border-transparent opacity-50"}`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

/* ─── Inquiry / WhatsApp modal ───────────────────────────────────────────── */
const InquiryModal = ({ listing, onClose }) => {
  const { currentUser } = useSelector((s) => s.user);
  const [form, setForm] = useState({
    name:          currentUser?.username || "",
    phone:         String(currentUser?.contact || ""),
    email:         currentUser?.email || "",
    inquiryType:   "Schedule a Viewing",
    viewingDate:   "",
    viewingTime:   "10:00",
    leaseDuration: "12 Months",
    occupants:     "1",
    message:       "Hi, I'm interested in this rental. Please get in touch!",
  });
  const [sent, setSent] = useState(false);

  const formatWA = (num) => {
    const d = String(num || "").replace(/\D/g, "");
    return d.startsWith("0") && d.length === 10 ? "27" + d.slice(1) : d;
  };

  const handleSend = (e) => {
    e.preventDefault();
    const host = listing?.contact || listing?.userRef?.contact || "";
    if (!host) { alert("Host contact not available"); return; }

    let msg =
      `*🏠 RENTAL INQUIRY & VIEWING*%0A%0A` +
      `*Property:* ${listing.name}%0A` +
      `*Address:* ${listing.address}%0A` +
      `*Price:* R${listing.regularPrice?.toLocaleString()}/month%0A%0A` +
      `*Name:* ${form.name}%0A` +
      `*Phone:* ${form.phone}%0A`;
    if (form.email) msg += `*Email:* ${form.email}%0A`;
    msg += `*Purpose:* ${form.inquiryType}%0A`;
    if (form.viewingDate) msg += `*Preferred Viewing Date:* ${form.viewingDate} at ${form.viewingTime}%0A`;
    msg += `*Target Lease Term:* ${form.leaseDuration}%0A`;
    msg += `*Occupants:* ${form.occupants}%0A%0A`;
    msg += `*Message:* ${form.message}`;

    window.open(`https://wa.me/${formatWA(host)}?text=${msg}`, "_blank");
    setSent(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
      >
        <div className="bg-gray-950 p-6 sm:p-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Contact Host</h2>
            <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">Property Inquiry & Viewing Schedule</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        {sent ? (
          <div className="p-10 flex flex-col items-center gap-4">
            <CheckCircleIcon className="w-16 h-16 text-green-500" />
            <p className="font-black text-gray-900 text-xl">Message Sent!</p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-6 sm:p-8 space-y-4 overflow-y-auto">
            {[
              { id: "name",  label: "Your Name",    type: "text",  placeholder: "John Doe" },
              { id: "phone", label: "Phone Number",  type: "tel",   placeholder: "082 123 4567" },
              { id: "email", label: "Email Address", type: "email", placeholder: "john@example.com" },
            ].map(({ id, label, type, placeholder }) => (
              <div key={id}>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
                <input
                  type={type} required value={form[id]}
                  onChange={(e) => setForm((p) => ({ ...p, [id]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-gray-900 outline-none font-medium transition text-sm"
                />
              </div>
            ))}

            {/* Inquiry Purpose */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Inquiry Purpose</label>
              <div className="grid grid-cols-2 gap-2">
                {['Schedule a Viewing', 'Rental Application', 'Price & Terms', 'General Question'].map(purpose => (
                  <button
                    key={purpose}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, inquiryType: purpose }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-center ${
                      form.inquiryType === purpose
                        ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {purpose}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Viewing Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Viewing Date (Optional)</label>
                <input
                  type="date"
                  value={form.viewingDate}
                  onChange={(e) => setForm(p => ({ ...p, viewingDate: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-gray-900 outline-none font-medium transition text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Viewing Time</label>
                <select
                  value={form.viewingTime}
                  onChange={(e) => setForm(p => ({ ...p, viewingTime: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-gray-900 outline-none font-medium transition text-xs"
                >
                  {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lease Duration & Occupants */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Target Lease</label>
                <select
                  value={form.leaseDuration}
                  onChange={(e) => setForm(p => ({ ...p, leaseDuration: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-gray-900 outline-none font-medium transition text-xs"
                >
                  <option value="Month-to-Month">Month-to-Month</option>
                  <option value="6 Months">6 Months</option>
                  <option value="12 Months">12 Months (Standard)</option>
                  <option value="24+ Months">24+ Months</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Occupants</label>
                <select
                  value={form.occupants}
                  onChange={(e) => setForm(p => ({ ...p, occupants: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-gray-900 outline-none font-medium transition text-xs"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={String(n)}>{n} {n === 1 ? 'Person' : 'People'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Message / Questions</label>
              <textarea
                rows={2} value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-gray-900 outline-none font-medium transition resize-none text-sm"
              />
            </div>
            <button type="submit"
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl uppercase tracking-widest flex items-center justify-center gap-3 transition active:scale-95 shadow-xl shadow-green-100 text-sm"
            >
              <FaWhatsapp size={20} /> Send via WhatsApp
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function RentPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [listing, setListing]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [showGallery, setShowGallery]   = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);
  const [showInquiry, setShowInquiry]   = useState(false);

  const { isFavorite, toggleFavorite } = useWishlist(listing, "listing");

  /* fetch */
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${id}`);
        if (!res.ok) throw new Error("Listing not found");
        setListing(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  /* recently viewed */
  useEffect(() => {
    if (!listing) return;
    try {
      const stored = localStorage.getItem("recentlyViewed");
      let history  = stored ? JSON.parse(stored) : [];
      history = history.filter((h) => h._id !== listing._id);
      history.unshift({ ...listing, itemType: "listing", viewedAt: new Date().toISOString() });
      localStorage.setItem("recentlyViewed", JSON.stringify(history.slice(0, 20)));
    } catch (_) { /* ignore */ }
  }, [listing]);

  const openGallery = (i = 0) => { setGalleryStart(i); setShowGallery(true); };

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: listing?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  const waLink = (contact) => {
    const d = String(contact || "").replace(/\D/g, "");
    const n = d.startsWith("0") && d.length === 10 ? "27" + d.slice(1) : d;
    return `https://wa.me/${n}`;
  };

  const amenities = listing
    ? Object.entries(AMENITY_MAP).filter(([key]) => listing[key])
    : [];

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
      <NeuralLoader text="Loading masterpiece..." />
    </div>
  );

  /* ── Error ── */
  if (error || !listing) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#FDFDFD]">
      <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center">
        <HomeModernIcon className="w-10 h-10 text-rose-300" />
      </div>
      <h2 className="text-2xl font-black text-gray-900">Property not found</h2>
      <p className="text-gray-400">{error}</p>
      <button onClick={() => navigate(-1)}
        className="px-8 py-4 bg-gray-950 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-rose-600 transition"
      >
        Go Back
      </button>
    </div>
  );

  const images = listing.imageUrls || [];
  const price  = listing.discountPrice > 0 ? listing.discountPrice : listing.regularPrice;
  const hasDiscount = listing.discountPrice > 0 && listing.discountPrice < listing.regularPrice;

  return (
    <div className="min-h-screen bg-[#FDFDFD]">

      {/* ── Top bar ── */}
      <div className="fixed top-0 left-0 right-0 z-[90] flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-black text-sm text-gray-900 hover:text-rose-600 transition group"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">For Rent</span>
        <div className="flex items-center gap-3">
          <button onClick={share} className="p-2.5 hover:bg-gray-100 rounded-full transition">
            <ShareIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={toggleFavorite} className="p-2.5 hover:bg-rose-50 rounded-full transition">
            {isFavorite
              ? <HeartIconSolid className="w-5 h-5 text-rose-500" />
              : <HeartIcon className="w-5 h-5 text-gray-600" />}
          </button>
        </div>
      </div>

      {/* ── Image gallery ── */}
      <div className="pt-[64px]">
        {images.length > 0 ? (
          <div className="relative">
            {/* Desktop 2+4 grid */}
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[520px] px-6 pt-4">
              <div
                className="col-span-2 row-span-2 rounded-[2rem] overflow-hidden cursor-pointer group"
                onClick={() => openGallery(0)}
              >
                <img src={images[0]} alt={listing.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              {images.slice(1, 5).map((img, i) => (
                <div key={i} className="rounded-[1.5rem] overflow-hidden cursor-pointer group relative"
                  onClick={() => openGallery(i + 1)}
                >
                  <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {i === 3 && images.length > 5 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-[1.5rem]">
                      <span className="text-white font-black text-2xl">+{images.length - 5}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => openGallery(0)}
              className="hidden md:flex absolute bottom-6 right-8 items-center gap-2 bg-white px-5 py-2.5 rounded-2xl shadow-lg font-black text-xs uppercase tracking-widest hover:shadow-xl transition"
            >
              <Squares2X2Icon className="w-4 h-4" /> Show all photos
            </button>

            {/* Mobile swiper */}
            <div className="md:hidden">
              <Swiper modules={[Pagination, Autoplay]} pagination={{ clickable: true }} autoplay={{ delay: 4000 }} className="h-72">
                {images.map((img, i) => (
                  <SwiperSlide key={i} onClick={() => openGallery(i)} className="cursor-pointer">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        ) : (
          <div className="h-72 bg-gray-100 flex items-center justify-center">
            <CameraIcon className="w-16 h-16 text-gray-300" />
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left — property details */}
        <div className="lg:col-span-2 space-y-10">

          {/* Title + location */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                {listing.name}
              </h1>
              <span className="shrink-0 px-5 py-2 bg-gray-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
                For Rent
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3 text-gray-500">
              <MdLocationOn className="text-rose-500 shrink-0" size={18} />
              <span className="font-medium text-sm">{listing.address}</span>
            </div>

            {/* Stat chips */}
            <div className="flex flex-wrap gap-3 mt-6">
              {listing.bedrooms > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700">
                  <FaBed className="text-rose-400" />
                  {listing.bedrooms} bed{listing.bedrooms > 1 ? "s" : ""}
                </div>
              )}
              {listing.bathrooms > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700">
                  <FaBath className="text-rose-400" />
                  {listing.bathrooms} bath{listing.bathrooms > 1 ? "s" : ""}
                </div>
              )}
              {listing.kind && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 capitalize">
                  <HomeModernIcon className="w-4 h-4 text-rose-400" />
                  {listing.kind.replace(/_/g, " ")}
                </div>
              )}
              {listing.period && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-2xl text-sm font-bold text-green-700">
                  <CalendarDaysIcon className="w-4 h-4" />
                  Available {listing.period}
                </div>
              )}
            </div>
          </div>

          {/* Host */}
          {(listing.host || listing.userRef) && (
            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-[2rem]">
              <div className="w-14 h-14 rounded-2xl bg-gray-200 overflow-hidden shrink-0">
                {listing.userRef?.avatar
                  ? <img src={listing.userRef.avatar} alt="" className="w-full h-full object-cover" />
                  : <UserIcon className="w-6 h-6 text-gray-400 m-auto mt-4" />}
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hosted by</p>
                <p className="text-lg font-black text-gray-900 mt-0.5">
                  {listing.host || listing.userRef?.username}
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4">About this rental</h2>
            <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-line">{listing.description}</p>
          </div>

          {/* Nearby */}
          {listing.near && (
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-4">What's nearby</h2>
              <p className="text-gray-600 leading-relaxed font-medium">{listing.near}</p>
            </div>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-6">What this place offers</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map(([key, { icon: Icon, label }]) => (
                  <div key={key} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                    <Icon className="text-rose-500 shrink-0" size={20} />
                    <span className="text-sm font-bold text-gray-700">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* House rules */}
          {listing.rules && (
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-4">House rules</h2>
              <div className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem]">
                <p className="text-gray-700 font-medium leading-relaxed">{listing.rules}</p>
              </div>
            </div>
          )}

          {/* Cancellation */}
          {listing.cancel && (
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-4">Cancellation policy</h2>
              <div className="flex items-start gap-4 p-6 bg-blue-50 border border-blue-100 rounded-[2rem]">
                <ShieldCheckIcon className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-gray-700 font-medium">{listing.cancel}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right — sticky booking card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.1)] overflow-hidden"
            >
              {/* Price */}
              <div className="bg-gray-950 p-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">R{price?.toLocaleString()}</span>
                  <span className="text-gray-400 font-bold text-sm">/month</span>
                </div>
                {hasDiscount && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="line-through text-gray-500 text-sm">
                      R{listing.regularPrice?.toLocaleString()}
                    </span>
                    <span className="bg-rose-500 text-white text-xs font-black px-2 py-0.5 rounded-lg">OFFER</span>
                  </div>
                )}
                <p className="mt-4 text-[10px] text-gray-400 font-black uppercase tracking-[0.25em]">
                  Available {listing.period || "now"}
                </p>
              </div>

              {/* Quick facts */}
              <div className="p-6 space-y-3">
                {[
                  listing.bedrooms  && { label: "Bedrooms",  value: listing.bedrooms },
                  listing.bathrooms && { label: "Bathrooms", value: listing.bathrooms },
                  listing.kind      && { label: "Type",      value: listing.kind.replace(/_/g, " ") },
                ].filter(Boolean).map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</span>
                    <span className="text-sm font-black text-gray-900 capitalize">{value}</span>
                  </div>
                ))}

                <button
                  onClick={() => setShowInquiry(true)}
                  className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl uppercase tracking-widest transition active:scale-95 mt-4 shadow-xl shadow-rose-100"
                >
                  Inquire Now
                </button>

                {listing.contact && (
                  <a
                    href={waLink(listing.contact)}
                    target="_blank" rel="noreferrer"
                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl uppercase tracking-widest transition active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-green-100"
                  >
                    <FaWhatsapp size={20} /> WhatsApp Host
                  </a>
                )}

                <p className="text-center text-[10px] text-gray-400 font-bold mt-2">
                  You won't be charged yet
                </p>
              </div>
            </motion.div>

            {/* Safety note */}
            <div className="mt-4 p-5 bg-gray-50 rounded-[1.5rem] flex items-start gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-gray-500 leading-relaxed">
                Always communicate through verified channels. Never transfer money without viewing the property first.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Overlays ── */}
      <AnimatePresence>
        {showGallery && (
          <GalleryOverlay images={images} startIndex={galleryStart} onClose={() => setShowGallery(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInquiry && <InquiryModal listing={listing} onClose={() => setShowInquiry(false)} />}
      </AnimatePresence>
    </div>
  );
}
