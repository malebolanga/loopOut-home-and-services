import React from 'react';
import { Clock, AlertCircle, CheckCircle2, Ban } from 'lucide-react';

const DEFAULT_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00'
];

/**
 * BookingTimeSlots Component
 * Displays available and booked/occupied time slots for a given date.
 * Booked slots are grayed out, crossed out, and disabled to prevent duplicate bookings.
 */
export default function BookingTimeSlots({
  selectedDate,
  selectedTime,
  onSelectTime,
  isTimeSlotBooked,
  isDateFullyBooked,
  customSlots = DEFAULT_SLOTS,
  className = '',
  label = 'Available Time Slots'
}) {
  if (!selectedDate) {
    return (
      <div className={`p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 text-xs font-medium ${className}`}>
        <Clock className="w-4 h-4 mx-auto mb-1.5 text-slate-400 inline-block" />
        <p>Please choose a date to view available time slots.</p>
      </div>
    );
  }

  const isFull = isDateFullyBooked ? isDateFullyBooked(selectedDate, customSlots) : false;
  const isSelectedTimeTaken = selectedTime && isTimeSlotBooked ? isTimeSlotBooked(selectedDate, selectedTime) : false;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-rose-500" />
          {label}
        </label>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
          {selectedDate}
        </span>
      </div>

      {/* Date Fully Booked Alert */}
      {isFull && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs font-bold animate-fadeIn">
          <Ban className="w-4 h-4 shrink-0 text-rose-600" />
          <span>⚠️ This date is not available (fully booked). Please select another date.</span>
        </div>
      )}

      {/* Selected Time Taken Alert */}
      {isSelectedTimeTaken && !isFull && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-2.5 text-amber-800 text-xs font-bold animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>⚠️ This time is not available (already booked). Please choose an open slot below.</span>
        </div>
      )}

      {/* Time Slots Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {customSlots.map((slot) => {
          const booked = isTimeSlotBooked ? isTimeSlotBooked(selectedDate, slot) : false;
          const isSelected = selectedTime === slot;

          if (booked) {
            return (
              <div
                key={slot}
                title="This time slot is already booked and occupied"
                className="relative py-2.5 px-2 rounded-xl bg-gray-100/90 border border-dashed border-gray-300 text-gray-400 opacity-50 cursor-not-allowed select-none text-center flex flex-col items-center justify-center transition-all"
              >
                <span className="text-xs font-black line-through tracking-tight">{slot}</span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-rose-500 mt-0.5">Booked</span>
              </div>
            );
          }

          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSelectTime && onSelectTime(slot)}
              className={`py-2.5 px-2 rounded-xl text-center font-bold text-xs transition-all duration-200 flex flex-col items-center justify-center border active:scale-95 ${
                isSelected
                  ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20 font-black'
                  : 'bg-white text-gray-800 border-gray-200 hover:border-gray-900 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <span className="tracking-tight">{slot}</span>
              <span className={`text-[8px] font-bold uppercase tracking-wider mt-0.5 ${isSelected ? 'text-rose-100' : 'text-emerald-600'}`}>
                Open
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend & Summary */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <span>Booked / Occupied</span>
          </div>
        </div>
        {selectedTime && (
          <div className="text-gray-700 font-black">
            Selected: <span className={isSelectedTimeTaken ? 'text-rose-600 line-through' : 'text-emerald-600'}>{selectedTime}</span>
          </div>
        )}
      </div>
    </div>
  );
}
