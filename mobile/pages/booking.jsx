/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion, AnimatePresence } from "framer-motion";
import { useLoopPoints } from "../hooks/useLoopPoints";
import LoopPointsToast from "../components/LoopPointsToast";

export default function Booking({ listing = {} }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const { awardPoints, lastEarned, clearLastEarned } = useLoopPoints();

  const sendBookingInformation = async (userId, startDate, endDate, name, contact, unit) => {
    try {
      // Format the contact number of the host for WhatsApp
      // Uses listing contact/phone if available, otherwise falls back to a default number.
      const hostContact = listing?.contact || listing?.userRef?.phone || listing?.userRef?.contact || "27685601550";
      let cleanedHostContact = hostContact.toString().replace(/\D/g, "");
      if (cleanedHostContact.startsWith("0")) {
        cleanedHostContact = "27" + cleanedHostContact.substring(1);
      }

      // Format client contact for the Quick Actions reply links
      let cleanedClientContact = contact.toString().replace(/\D/g, "");
      if (cleanedClientContact.startsWith("0") && cleanedClientContact.length === 10) {
        cleanedClientContact = "27" + cleanedClientContact.substring(1);
      }

      const checkInDate = new Date(startDate).toLocaleDateString("en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
      const checkOutDate = new Date(endDate).toLocaleDateString("en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

      // Action Messages
      const unitTag = unit ? ` (${unit})` : "";
      const acceptMessage = `Accept the booking for ${name}, I accept your request for ${listing?.name || "the property"}${unitTag} on ${checkInDate}. See you then!`;
      const declineMessage = `Decline the booking for ${name}, I'm unable to accept the request for ${listing?.name || "the property"}${unitTag} on ${checkInDate}. Can we try another time?`;

      const verificationCode = Math.floor(100000 + Math.random() * 900000);

      const mapLink = listing?.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}` : '';

      // Create a beautifully formatted WhatsApp message using standard WhatsApp markdown (*bold*, _italic_)
      let message = `🏠 *PROPERTY INQUIRY* 📬\n\n`;
      message += `*━━━━━━━━━━━━━━━━━━━━*\n`;
      message += `📍 *PROPERTY OVERVIEW*\n`;
      message += `*━━━━━━━━━━━━━━━━━━━━*\n`;
      message += `🏠 *Property:* ${listing?.name || "loopOut Listing"}\n`;
      if (unit) {
        message += `🚪 *Apartment / Room:* ${unit}\n`;
      }
      if (listing?.address) {
        message += `📍 *Location:* ${listing.address}\n`;
        message += `🗺️ *View Map:* ${mapLink}\n`;
      }
      const selectedRoomObj = listing?.roomTypes?.find(r => r.name === unit);
      message += `💰 *Listed Price:* R${(selectedRoomObj?.price || listing?.regularPrice)?.toLocaleString() || "0"}\n`;
      message += `📋 *Offering:* ${listing?.type === 'rent' ? 'For Rent (Monthly)' : listing?.type === 'office' ? 'Room Per Hour' : 'Daily Stay'}\n\n`;

      message += `*👤 INQUIRER DETAILS*\n`;
      message += `• *Name:* ${name}\n`;
      message += `• *Contact:* ${contact}\n\n`;

      message += `*📅 STAY DETAILS*\n`;
      message += `• *Check-in:* ${checkInDate}\n`;
      message += `• *Check-out:* ${checkOutDate}\n\n`;

      message += `*━━━━━━━━━━━━━━━━━━━━*\n`;
      message += `⚡ *HOST QUICK ACTIONS:*\n`;
      message += `✅ *AVAILABLE:* https://wa.me/${cleanedClientContact}?text=${encodeURIComponent(acceptMessage)}\n`;
      message += `❌ *UNAVAILABLE:* https://wa.me/${cleanedClientContact}?text=${encodeURIComponent(declineMessage)}\n\n`;

      message += `*Verification Code:* ${verificationCode}\n`;
      message += `_Sent via loopOut Premium Platform_`;

      const whatsappUrl = `https://wa.me/${cleanedHostContact}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
    } catch (error) {
      console.error("Error generating WhatsApp booking request:", error);
      alert("An error occurred while creating the booking request.");
    }
  };

  if (!listing.type) {
    return <p className="text-gray-500 dark:text-white italic text-sm mt-4">Booking is unavailable for this listing.</p>;
  }

  // Only show for relevant listing types
  const isBookable = ["book", "over", "rent", "rent-short", "rent-long"].some(t => listing.type.includes(t));

  return (
    <div className="w-full">
      {isBookable && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCalendar(true)}
          className="w-full py-4 mt-6 bg-gradient-to-r from-rose-600 to-pink-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(225,29,72,0.3)] hover:shadow-[0_15px_30px_rgba(225,29,72,0.4)] transition-all flex items-center justify-center gap-2"
        >
          <span>Reserve Dates</span>
          <span>📅</span>
        </motion.button>
      )}

      <AnimatePresence>
        {showCalendar && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCalendar(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 m-auto w-[90%] max-w-md h-fit max-h-[90vh] bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl z-[9999] overflow-y-auto scrollbar-hide flex flex-col"
            >
              {/* Decorative Header Background */}
              <div className="relative h-24 bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center rounded-t-[2.5rem] shrink-0">
                <div className="absolute inset-0 bg-black/10 rounded-t-[2.5rem]" />
                <h2 className="relative z-10 text-xl font-black text-white uppercase tracking-widest">
                   Select Dates
                </h2>
              </div>

              <div className="p-6 md:p-8 flex flex-col gap-6">
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Check-in Date</h3>
                    <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                      <Calendar
                        onChange={(date) => {
                          setStartDate(date);
                          if (endDate && date > endDate) setEndDate(null);
                        }}
                        value={startDate}
                        minDate={new Date()}
                        className="w-full border-none p-2 !font-sans custom-calendar"
                      />
                    </div>
                  </div>

                  {startDate && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="origin-top"
                    >
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 mt-4">Check-out Date</h3>
                      <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                        <Calendar
                          onChange={(date) => setEndDate(date)}
                          value={endDate}
                          minDate={startDate}
                          className="w-full border-none p-2 !font-sans custom-calendar"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="w-full h-px bg-gray-100 dark:bg-gray-800 mt-2" />

                {/* Apartment or Room Unit Selection */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Select Apartment / Room (Optional)</h3>
                  {listing?.roomTypes && listing.roomTypes.length > 0 ? (
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-sm text-gray-900 dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="">✨ Any Available Unit</option>
                      {listing.roomTypes.map((r, i) => (
                        <option key={i} value={r.name}>
                          🚪 {r.name} {r.price ? `(R${Number(r.price).toLocaleString()})` : ''} {r.capacity ? `· Max ${r.capacity} Guests` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                      placeholder="e.g. Room 101, Apartment 2B"
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Your Details</h3>
                  <div>
                    <input
                      type="text"
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                      placeholder="Phone or WhatsApp Number"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-4 shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCalendar(false)}
                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-white rounded-xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (!name || !contact) {
                        alert("Please enter your name and contact information.");
                        return;
                      }
                      if (startDate && endDate) {
                        sendBookingInformation(
                          listing.userId,
                          startDate.toISOString(),
                          endDate.toISOString(),
                          name,
                          contact,
                          selectedUnit
                        );
                        // 🌟 Award LoopOut points
                        awardPoints('Property Booking');
                        setShowCalendar(false);
                      } else {
                        alert("Please select both check-in and check-out dates.");
                      }
                    }}
                    className="flex-1 py-4 bg-gray-950 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl"
                  >
                    Confirm
                  </motion.button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* LoopOut Points Toast */}
      {lastEarned && (
        <LoopPointsToast
          earned={lastEarned.amount}
          label={lastEarned.label}
          total={lastEarned.total}
          onDismiss={clearLastEarned}
        />
      )}
    </div>
  );
}
