import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCircle2, AlertCircle, MessageSquare, Calendar, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';

// Global helper function to trigger a top phone notification from anywhere in the app
export const pushPhoneNotification = (notificationData) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('trigger_top_notification', { detail: notificationData }));
  }
};

const PhoneNotificationManager = () => {
  const navigate = useNavigate();
  const [activeNotification, setActiveNotification] = useState(null);
  const [permissionState, setPermissionState] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
  );
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const audioRef = useRef(null);

  // Check permission on mount and trigger prompt if default
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
      if (Notification.permission === 'default') {
        const hasPrompted = sessionStorage.getItem('phone_notif_prompted');
        if (!hasPrompted) {
          const timer = setTimeout(() => setShowPermissionPrompt(true), 3000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, []);

  const requestPhonePermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPermissionState(permission);
        setShowPermissionPrompt(false);
        sessionStorage.setItem('phone_notif_prompted', 'true');
        
        if (permission === 'granted') {
          pushPhoneNotification({
            title: '🔔 Phone Notifications Enabled!',
            message: 'You will now receive instant push alerts on your phone screen.',
            type: 'success'
          });
        }
      } catch (err) {
        console.error('Permission request failed', err);
      }
    }
  };

  const dismissPermissionPrompt = () => {
    setShowPermissionPrompt(false);
    sessionStorage.setItem('phone_notif_prompted', 'true');
  };

  // Event listener for in-app top notification triggers
  useEffect(() => {
    const handleTrigger = (event) => {
      const detail = event.detail || {};
      const newNotif = {
        id: Date.now(),
        title: detail.title || 'loopOut Alert',
        message: detail.message || 'New notification received.',
        type: detail.type || 'info',
        link: detail.link || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setActiveNotification(newNotif);

      // Play subtle vibration if supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
      }

      // Also trigger native browser notification if granted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new window.Notification(newNotif.title, {
            body: newNotif.message,
            icon: '/favicon.ico'
          });
        } catch (e) {
          console.warn('Native notification failed', e);
        }
      }
    };

    window.addEventListener('trigger_top_notification', handleTrigger);
    return () => window.removeEventListener('trigger_top_notification', handleTrigger);
  }, []);

  // Auto-dismiss top banner after 5 seconds
  useEffect(() => {
    if (activeNotification) {
      const timer = setTimeout(() => {
        setActiveNotification(null);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [activeNotification]);

  const handleNotificationClick = () => {
    if (activeNotification?.link) {
      navigate(activeNotification.link);
    } else {
      navigate('/notifications');
    }
    setActiveNotification(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
      case 'booking':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-sky-400" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-amber-400" />;
      case 'warning':
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      default:
        return <Bell className="w-5 h-5 text-[#FF5A5F]" />;
    }
  };

  return (
    <>
      {/* 1. TOP PHONE NOTIFICATION BANNER (iOS/Android Dynamic Push Bar Style) */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ y: -80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed top-3 inset-x-3 sm:left-auto sm:right-4 sm:w-96 z-[9999] cursor-pointer touch-target select-none"
            onClick={handleNotificationClick}
          >
            <div className="bg-gray-950/90 backdrop-blur-2xl text-white rounded-3xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/15 flex items-start gap-3">
              {/* App Icon Container */}
              <div className="relative shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5A5F] via-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20 border border-white/20">
                  {getNotificationIcon(activeNotification.type)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-950" />
              </div>

              {/* Message Details */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 flex items-center gap-1">
                    <span>loopOut</span>
                    <span>•</span>
                    <span>{activeNotification.timestamp}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </div>
                <h4 className="text-xs font-black text-white truncate leading-snug">
                  {activeNotification.title}
                </h4>
                <p className="text-[11px] font-medium text-slate-300 line-clamp-2 leading-tight mt-0.5">
                  {activeNotification.message}
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveNotification(null);
                }}
                aria-label="Dismiss notification"
                className="p-1.5 text-slate-400 hover:text-white rounded-full active:scale-90 transition-transform"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. SYNC PHONE NOTIFICATIONS PROMPT BANNER */}
      <AnimatePresence>
        {showPermissionPrompt && permissionState === 'default' && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-2 inset-x-3 sm:left-auto sm:right-4 sm:w-96 z-[9998]"
          >
            <div className="bg-slate-900/95 backdrop-blur-2xl border border-rose-500/30 text-white rounded-3xl p-4 shadow-2xl flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-500/20 text-[#FF5A5F] rounded-2xl border border-rose-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">Enable Phone Alerts</h3>
                    <p className="text-[11px] text-slate-300 font-medium">Sync with your phone to receive instant booking and message alerts at the top of your screen.</p>
                  </div>
                </div>
                <button
                  onClick={dismissPermissionPrompt}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={requestPhonePermission}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#FF5A5F] to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md active:scale-95 transition-all text-center"
                >
                  Allow Phone Alerts
                </button>
                <button
                  onClick={dismissPermissionPrompt}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-2xl active:scale-95 transition-all"
                >
                  Later
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PhoneNotificationManager;
