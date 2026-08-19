import React from 'react';
import { AlertTriangle, CheckCircle, Ban } from 'lucide-react';

/**
 * BookingDateNotice
 * Displays instant feedback when dates/times are occupied or available.
 */
export default function BookingDateNotice({
  isUnavailable = false,
  message = 'This date or time slot is already booked and not available.',
  successMessage = 'Selected dates are available for booking.',
  showSuccess = false,
  className = ''
}) {
  if (isUnavailable) {
    return (
      <div className={`p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold shadow-sm animate-fadeIn ${className}`}>
        <Ban className="w-5 h-5 shrink-0 text-rose-600" />
        <div>
          <p className="font-black text-[11px] uppercase tracking-wider text-rose-800">Date/Time Unavailable</p>
          <p className="mt-0.5 font-medium">{message}</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className={`p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-700 text-xs font-bold animate-fadeIn ${className}`}>
        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
        <span>{successMessage}</span>
      </div>
    );
  }

  return null;
}
