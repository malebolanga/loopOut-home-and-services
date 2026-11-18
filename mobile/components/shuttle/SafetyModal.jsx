import React from 'react';
import { 
  X, 
  ShieldCheck, 
  PhoneCall, 
  AlertTriangle, 
  Lock, 
  Share2, 
  FileText 
} from 'lucide-react';

const SafetyModal = ({ isOpen, onClose, shuttle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-teal-50/60 dark:bg-teal-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Shuttle safety information
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Important information before you travel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 overflow-y-auto max-h-[75vh]">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            <strong>LoopOut has not independently verified this driver’s identity, licence or vehicle documents.</strong> Check the driver and vehicle details before you travel. If anything does not match, do not board and contact local emergency services if you feel unsafe.
          </div>

          {/* Current Vehicle & Driver Details */}
          {shuttle && (
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Assigned Trip Vehicle
              </div>
              <div className="flex items-center justify-between font-semibold text-gray-900 dark:text-gray-100">
                <span>Driver: {shuttle.driverName}</span>
                <span className="text-teal-600 font-mono">{shuttle.plateNumber}</span>
              </div>
              <div className="text-gray-500">
                {shuttle.carType} • {shuttle.carColor || 'White'}
              </div>
            </div>
          )}

          {/* 24-Hour Approval Window Guarantee */}
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>24-Hour Payment & Approval Protection</span>
            </div>
            <p className="text-blue-800/80 dark:text-blue-300/80 text-[11px] leading-relaxed">
              You never pay before your driver accepts your trip. Once accepted, you have a 24-hour protected window to confirm your booking payment.
            </p>
          </div>

          {/* South Africa Emergency Contacts */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-red-600 mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>South Africa Emergency Rapid Assist</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="tel:10111"
                className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center justify-between hover:bg-red-100 transition"
              >
                <div>
                  <div className="font-bold">SAPS Police</div>
                  <div className="text-[11px] opacity-80">Call 10111</div>
                </div>
                <PhoneCall className="w-4 h-4 text-red-600" />
              </a>

              <a
                href="tel:112"
                className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center justify-between hover:bg-red-100 transition"
              >
                <div>
                  <div className="font-bold">Mobile Emergency</div>
                  <div className="text-[11px] opacity-80">Call 112</div>
                </div>
                <PhoneCall className="w-4 h-4 text-red-600" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 transition"
          >
            Close Safety Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyModal;
