import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to fetch and evaluate booked dates and time slots for any listing, helper, service, or event.
 * Ensures duplicate bookings cannot occur and provides helper functions to gray out booked slots.
 */
export const useBookedSlots = (itemId) => {
  const [bookedDates, setBookedDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookedDates = useCallback(async () => {
    if (!itemId) {
      setBookedDates([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/booked-dates/${itemId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch availability');
      }
      const data = await res.json();
      setBookedDates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching booked dates for item', itemId, err);
      setError(err.message);
      setBookedDates([]);
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchBookedDates();
  }, [fetchBookedDates]);

  /**
   * Checks if a single calendar day is booked / occupied.
   * Useful for React-Calendar tileDisabled on hotel / guest house / room listings.
   */
  const isDateBooked = useCallback((date) => {
    if (!date || !bookedDates || bookedDates.length === 0) return false;
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return bookedDates.some((range) => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      const startDateOnly = new Date(start);
      startDateOnly.setHours(0, 0, 0, 0);
      const endDateOnly = new Date(end);
      endDateOnly.setHours(0, 0, 0, 0);

      // If booking spans multiple days (overnight stay)
      if (endDateOnly.getTime() > startDateOnly.getTime()) {
        return checkDate >= startDateOnly && checkDate < endDateOnly;
      }
      // Single day full-day booking
      return checkDate.getTime() === startDateOnly.getTime();
    });
  }, [bookedDates]);

  /**
   * Checks if a specific date & time slot is booked / occupied.
   * Defaults to a 60-minute window.
   */
  const isTimeSlotBooked = useCallback((dateStr, timeStr, durationMinutes = 60) => {
    if (!dateStr || !timeStr || !bookedDates || bookedDates.length === 0) return false;

    // Build target slot window in local time
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
      return false;
    }

    const slotStart = new Date(year, month - 1, day, hours, minutes, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

    return bookedDates.some((b) => {
      const bStart = new Date(b.start);
      let bEnd = new Date(b.end);

      // If bEnd <= bStart, treat booked slot as at least 60 mins
      if (bEnd.getTime() <= bStart.getTime()) {
        bEnd = new Date(bStart.getTime() + 60 * 60 * 1000);
      }

      // Overlap: slotStart < bEnd && slotEnd > bStart
      return slotStart < bEnd && slotEnd > bStart;
    });
  }, [bookedDates]);

  /**
   * Checks if an entire date has all default business hours slots booked.
   */
  const isDateFullyBooked = useCallback((dateStr, businessSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']) => {
    if (!dateStr || !bookedDates || bookedDates.length === 0) return false;
    // Check if every slot in businessSlots is booked
    return businessSlots.every((slot) => isTimeSlotBooked(dateStr, slot));
  }, [bookedDates, isTimeSlotBooked]);

  /**
   * Checks if an overnight date range [checkIn, checkOut] overlaps any existing booking.
   */
  const isDateRangeBooked = useCallback((checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate || !bookedDates || bookedDates.length === 0) return false;
    const reqStart = new Date(checkInDate);
    const reqEnd = new Date(checkOutDate);

    if (isNaN(reqStart.getTime()) || isNaN(reqEnd.getTime()) || reqEnd <= reqStart) {
      return false;
    }

    return bookedDates.some((b) => {
      const bStart = new Date(b.start);
      const bEnd = new Date(b.end);
      return reqStart < bEnd && reqEnd > bStart;
    });
  }, [bookedDates]);

  /**
   * Returns a friendly status message for a given date and time.
   */
  const getAvailabilityNotice = useCallback((dateStr, timeStr) => {
    if (!dateStr) return null;
    if (isDateFullyBooked(dateStr)) {
      return {
        available: false,
        message: 'This date is fully booked / occupied. Please select another date.'
      };
    }
    if (timeStr && isTimeSlotBooked(dateStr, timeStr)) {
      return {
        available: false,
        message: 'This time is not available (already booked). Please choose another time slot.'
      };
    }
    return {
      available: true,
      message: 'Time slot is available'
    };
  }, [isDateFullyBooked, isTimeSlotBooked]);

  return {
    bookedDates,
    isLoading,
    error,
    refetch: fetchBookedDates,
    isDateBooked,
    isTimeSlotBooked,
    isDateFullyBooked,
    isDateRangeBooked,
    getAvailabilityNotice
  };
};

export default useBookedSlots;
