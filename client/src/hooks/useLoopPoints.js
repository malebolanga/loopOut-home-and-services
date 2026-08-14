/**
 * useLoopPoints — LoopOut Loyalty Points Hook
 *
 * Rules:
 *  - 3.78 pts per booking (property reservation, service, event, helper)
 *  - 20,000 pts = 1 free service redemption
 *  - Points stored in localStorage keyed by user ID (client-side; sync to backend when available)
 */

import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

export const POINTS_PER_BOOKING = 3.78;
export const FREE_SERVICE_THRESHOLD = 20000;

const storageKey = (userId) => `loopout_points_${userId || 'guest'}`;

function readPoints(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { total: 0, history: [] };
    return JSON.parse(raw);
  } catch {
    return { total: 0, history: [] };
  }
}

function writePoints(userId, data) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(data));
  } catch {
    /* ignore storage errors */
  }
}

export function useLoopPoints() {
  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?._id || currentUser?.id;

  const [lastEarned, setLastEarned] = useState(null); // { amount, label } for toast

  /** Read current points snapshot */
  const getPoints = useCallback(() => {
    return readPoints(userId);
  }, [userId]);

  /**
   * Award points for a booking action.
   * @param {string} label - Display label e.g. "Property Booking", "Service Booking"
   * @param {number} [amount=POINTS_PER_BOOKING] - Override amount
   */
  const awardPoints = useCallback(
    (label = 'Booking', amount = POINTS_PER_BOOKING) => {
      const current = readPoints(userId);
      const rounded = Math.round(amount * 100) / 100;
      const newTotal = Math.round((current.total + rounded) * 100) / 100;

      const entry = {
        label,
        amount: rounded,
        total: newTotal,
        date: new Date().toISOString(),
      };

      const updated = {
        total: newTotal,
        history: [entry, ...(current.history || [])].slice(0, 50), // keep last 50
      };

      writePoints(userId, updated);
      setLastEarned({ amount: rounded, label, total: newTotal });

      return { earned: rounded, total: newTotal };
    },
    [userId]
  );

  /** Clear the toast notification */
  const clearLastEarned = useCallback(() => setLastEarned(null), []);

  /** How many free services has the user unlocked? */
  const getFreeServices = useCallback(() => {
    const { total } = readPoints(userId);
    return Math.floor(total / FREE_SERVICE_THRESHOLD);
  }, [userId]);

  /** Progress toward next free service (0–100) */
  const getProgress = useCallback(() => {
    const { total } = readPoints(userId);
    const remainder = total % FREE_SERVICE_THRESHOLD;
    return (remainder / FREE_SERVICE_THRESHOLD) * 100;
  }, [userId]);

  return {
    awardPoints,
    getPoints,
    getFreeServices,
    getProgress,
    lastEarned,
    clearLastEarned,
    POINTS_PER_BOOKING,
    FREE_SERVICE_THRESHOLD,
  };
}
