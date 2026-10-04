import { Capacitor } from '@capacitor/core';

/**
 * Utility to detect if running inside a native mobile app (Capacitor Android/iOS APK).
 */
export const isNativeApp = () => {
  if (typeof window === 'undefined') return false;
  try {
    if (Capacitor.isNativePlatform()) return true;
    const platform = Capacitor.getPlatform();
    if (platform === 'android' || platform === 'ios') return true;
  } catch (e) {
    // ignore
  }
  return (
    Boolean(window.Capacitor?.isNativePlatform?.()) ||
    Boolean(window.Capacitor?.platform && window.Capacitor.platform !== 'web') ||
    /Capacitor|AndroidApp|iOSApp|wv/i.test(navigator.userAgent || '')
  );
};
