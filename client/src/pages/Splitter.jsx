import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Minus, 
  Share2, 
  Copy, 
  Check, 
  DollarSign, 
  Users, 
  Percent, 
  CreditCard,
  ArrowLeft,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

export default function Splitter() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Manual input fields if no booking selected
  const [itemName, setItemName] = useState("Cape Town Beachfront Villa");
  const [itemPrice, setItemPrice] = useState(3000);
  const [splitMethod, setSplitMethod] = useState("equal"); // "equal", "exact", "percent"

  // Guest list
  const [guests, setGuests] = useState([
    { name: "You", amount: 1000, percent: 33.33 },
    { name: "Sarah", amount: 1000, percent: 33.33 },
    { name: "John", amount: 1000, percent: 33.34 }
  ]);

  const [newGuestName, setNewGuestName] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  // Platform parameters
  const SERVICE_FEE_PCT = 0.05; // 5%
  const TOURISM_LEVY_PCT = 0.02; // 2%

  // Calculations
  // Use whichever price field the booking object contains
  const subtotal = selectedBooking
    ? Number(selectedBooking.totalPrice ?? selectedBooking.regularPrice ?? selectedBooking.price ?? selectedBooking.amount ?? 0)
    : parseFloat(itemPrice) || 0;
  const serviceFee = Number((subtotal * SERVICE_FEE_PCT).toFixed(2) || 0);
  const tourismLevy = Number((subtotal * TOURISM_LEVY_PCT).toFixed(2) || 0);
  const grandTotal = Number((subtotal + serviceFee + tourismLevy).toFixed(2) || 0);

  // Fetch bookings on mount if user is logged in
  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!currentUser) return;
      try {
        setLoadingBookings(true);
        const res = await fetch(`/api/bookings/user/${currentUser._id}`, { credentials: 'include' });
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filter to active/confirmed bookings
          setBookings(data.filter(b => b.status === 'confirmed' || b.status === 'approved' || b.status === 'pending'));
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchUserBookings();
  }, [currentUser?._id]);

  // Adjust splits when guests count, splitMethod, or price changes
  useEffect(() => {
    recalculateSplits();
  }, [guests.length, splitMethod, grandTotal]);

  const recalculateSplits = () => {
    if (splitMethod === "equal") {
      const share = grandTotal / guests.length;
      const pct = 100 / guests.length;
      setGuests(prev => prev.map(g => ({
        ...g,
        amount: parseFloat(share.toFixed(2)),
        percent: parseFloat(pct.toFixed(2))
      })));
    }
  };

  const handleAddGuest = () => {
    if (!newGuestName.trim()) return;
    const currentCount = guests.length;
    const newGuest = {
      name: newGuestName.trim(),
      amount: 0,
      percent: 0
    };
    setGuests(prev => [...prev, newGuest]);
    setNewGuestName("");
  };

  const handleRemoveGuest = (index) => {
    if (guests.length <= 1) return;
    setGuests(prev => prev.filter((_, i) => i !== index));
  };

  const handleAmountChange = (index, value) => {
    const numericValue = parseFloat(value) || 0;
    setGuests(prev => prev.map((g, i) => {
      if (i === index) {
        return {
          ...g,
          amount: numericValue,
          percent: parseFloat(((numericValue / grandTotal) * 100).toFixed(2))
        };
      }
      return g;
    }));
  };

  const handlePercentChange = (index, value) => {
    const numericValue = parseFloat(value) || 0;
    setGuests(prev => prev.map((g, i) => {
      if (i === index) {
        return {
          ...g,
          percent: numericValue,
          amount: parseFloat(((numericValue / 100) * grandTotal).toFixed(2))
        };
      }
      return g;
    }));
  };

  // Check if sum matches grand total
  const totalAllocated = guests.reduce((sum, g) => sum + g.amount, 0);
  const totalPercentage = guests.reduce((sum, g) => sum + g.percent, 0);
  const isSplitValid = splitMethod === "equal" || Math.abs(totalAllocated - grandTotal) < 1;

  const handleBookingSelect = (booking) => {
    setSelectedBooking(booking);
    // Determine item name
    let name = "LoopOut Booking";
    if (booking.listing) name = booking.listing.name;
    else if (booking.helper) name = `Service Helper: ${booking.helper.name}`;
    else if (booking.service) name = `Safety Service: ${booking.service.name}`;
    else if (booking.event) name = `Local Event: ${booking.event.name}`;

    setItemName(name);
  };

  const generateShareText = () => {
    let summary = `📍 *LoopOut Split Bill Summary: ${itemName}*\n`;
    summary += `💰 *Total Amount:* R${grandTotal.toFixed(2)} (Subtotal: R${subtotal.toFixed(2)})\n\n`;
    summary += `👥 *Splits Breakdown:*\n`;
    guests.forEach(g => {
      summary += `- *${g.name}:* R${g.amount.toFixed(2)} (${g.percent.toFixed(1)}%)\n`;
    });
    summary += `\n🔗 Open LoopOut to verify and settle up!`;
    return summary;
  };

  const copyToClipboard = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = () => {
    const text = generateShareText();
    if (navigator.share) {
      navigator.share({
        title: 'LoopOut Bill Split',
        text: text,
      }).then(() => {
        setShareStatus("Shared successfully!");
      }).catch(err => {
        console.error(err);
      });
    } else {
      copyToClipboard();
      setShareStatus("Copied to clipboard (Web Share not supported)");
      setTimeout(() => setShareStatus(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-white font-sans">
      {/* Premium Header */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent blur-[120px] -z-10" />
        <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-rose-500/10 to-transparent blur-[120px] -z-10" />
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-400">
              BILL <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">SPLITTER</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-xl">
              Split stay accommodations, event tickets, or helper service fees dynamically with your friends in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl text-emerald-400 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <CreditCard className="w-4 h-4" /> Fully Secure Escrow
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Inputs and Config */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Booking History Selector (If user has bookings) */}
          {currentUser && (
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-[2rem] shadow-xl">
              <h3 className="text-sm font-black text-white tracking-wider uppercase mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" /> Auto-Load Bookings
              </h3>
              
              {loadingBookings ? (
                <div className="flex items-center gap-2.5 py-4 text-slate-500 text-xs">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" /> Loading active reservations...
                </div>
              ) : bookings.length === 0 ? (
                <p className="text-xs text-slate-500 leading-relaxed">
                  No active stays or service bookings found in your history. You can use manual entry below to calculate any split!
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                  {bookings.map((b) => (
                    <button
                      key={b._id}
                      onClick={() => handleBookingSelect(b)}
                      className={`w-full p-3.5 rounded-xl border text-left flex justify-between items-center transition-all ${
                        selectedBooking?._id === b._id 
                          ? 'bg-emerald-500/10 border-emerald-500 text-white' 
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-black block text-white">
                          {b.listing?.name || b.helper?.name || b.service?.name || b.event?.name}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 block mt-0.5">
                          Status: <span className="uppercase font-black text-emerald-400">{b.status}</span>
                        </span>
                      </div>
                      <span className="text-xs font-black text-emerald-400">R{(b.totalPrice ?? b.regularPrice ?? b.price ?? b.amount ?? 0)}</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedBooking && (
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-[10px] font-black text-rose-400 hover:text-rose-300 uppercase tracking-widest mt-3.5 block transition-colors"
                >
                  Clear Booking Selection & Use Manual Custom Input →
                </button>
              )}
            </div>
          )}

          {/* Custom Bill Entry */}
          {!selectedBooking && (
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-[2rem] shadow-xl space-y-4">
              <h3 className="text-sm font-black text-white tracking-wider uppercase mb-2">
                ✏️ Custom Cost Calculator
              </h3>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Booking/Service Item Name</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Total Subtotal Price (ZAR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">R</span>
                  <input
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Group Split Members */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-[2rem] shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" /> Split Partners
              </h3>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{guests.length} People</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Partner Name (e.g. Sarah)"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                onClick={handleAddGuest}
                className="bg-emerald-500 hover:bg-emerald-600 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0"
              >
                Add Partner
              </button>
            </div>

            {/* Members List */}
            <div className="space-y-2.5 pt-2">
              {guests.map((g, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 bg-slate-950/80 border border-slate-900 p-3 rounded-xl justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-[10px] font-black uppercase text-emerald-400">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-white">{g.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Display input fields based on splitMethod */}
                    {splitMethod === "equal" ? (
                      <span className="text-xs font-black text-emerald-400 px-3 py-1.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                        R{g.amount.toFixed(2)}
                      </span>
                    ) : splitMethod === "exact" ? (
                      <div className="relative w-28 flex items-center">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600 text-[10px] font-bold">R</span>
                        <input
                          type="number"
                          value={g.amount}
                          onChange={(e) => handleAmountChange(index, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800/80 rounded-lg pl-6 pr-2 py-1 text-xs text-white text-right focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    ) : (
                      <div className="relative w-24 flex items-center">
                        <input
                          type="number"
                          value={g.percent}
                          onChange={(e) => handlePercentChange(index, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800/80 rounded-lg pl-2 pr-6 py-1 text-xs text-white text-right focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 text-[10px] font-bold">%</span>
                      </div>
                    )}

                    {index > 0 && (
                      <button
                        onClick={() => handleRemoveGuest(index)}
                        className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Total Summary and Shares */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-[2rem] shadow-xl space-y-6 sticky top-24">
            <h3 className="text-sm font-black text-white tracking-wider uppercase">
              📋 Summary Calculations
            </h3>

            {/* Split Method Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 border border-slate-900 rounded-xl">
              <button
                onClick={() => setSplitMethod("equal")}
                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors ${
                  splitMethod === "equal" ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Equally
              </button>
              <button
                onClick={() => setSplitMethod("exact")}
                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors ${
                  splitMethod === "exact" ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Custom Share
              </button>
              <button
                onClick={() => setSplitMethod("percent")}
                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors ${
                  splitMethod === "percent" ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Percentage
              </button>
            </div>

            {/* Calculation Breakdown */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Subtotal Booking Price</span>
                <span className="font-bold text-white">R{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="flex items-center gap-1">LoopOut Service Fee (5%) <Info className="w-3 h-3 text-slate-500" /></span>
                <span className="font-bold text-white">R{serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="flex items-center gap-1">Tourism Levy Tax (2%) <Info className="w-3 h-3 text-slate-500" /></span>
                <span className="font-bold text-white">R{tourismLevy.toFixed(2)}</span>
              </div>
              <div className="h-px bg-slate-800 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">Grand Total Cost</span>
                <span className="text-xl font-black text-emerald-400">R{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Custom split sum validation */}
            {splitMethod === "exact" && !isSplitValid && (
              <div className="bg-rose-950/40 border border-rose-500/30 p-3.5 rounded-2xl text-[10px] text-rose-400 leading-snug">
                <span className="font-bold text-rose-300">Sum Mismatch:</span> The allocations add up to <span className="font-bold">R{totalAllocated.toFixed(2)}</span> instead of <span className="font-bold text-white">R{grandTotal.toFixed(2)}</span>. Please adjust individual amounts.
              </div>
            )}

            {splitMethod === "percent" && Math.abs(totalPercentage - 100) > 0.1 && (
              <div className="bg-rose-950/40 border border-rose-500/30 p-3.5 rounded-2xl text-[10px] text-rose-400 leading-snug">
                <span className="font-bold text-rose-300">Percent Mismatch:</span> The allocations add up to <span className="font-bold">{totalPercentage.toFixed(1)}%</span> instead of <span className="font-bold text-white">100.0%</span>.
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                disabled={!isSplitValid}
                onClick={shareText}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 transition-colors rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 text-white shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
              >
                <Share2 className="w-4 h-4" /> Share Split With Friends
              </button>

              <button
                disabled={!isSplitValid}
                onClick={copyToClipboard}
                className="w-full py-4 bg-slate-900 hover:bg-slate-850 disabled:opacity-50 transition-colors border border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 text-slate-350"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" /> Copied Split Summary!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Split Details
                  </>
                )}
              </button>

              {shareStatus && (
                <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider">{shareStatus}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
