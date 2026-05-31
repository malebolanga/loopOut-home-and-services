import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

export default function SellSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { listingId, type } = location.state || {};
  const { currentUser } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-rose-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white/40 p-12 max-w-lg w-full text-center shadow-[0_30px_100px_rgba(0,0,0,0.08)] relative z-10"
      >
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-rose-100 transform hover:rotate-12 transition-transform">
          <CheckCircleIcon className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Item Posted!</h1>
        <p className="text-lg font-medium text-gray-500 mb-10 leading-relaxed">
          Your item has been successfully posted and is now visible to interested buyers.
        </p>
        <div className="flex flex-col gap-4">
          {listingId && (
            <button
              onClick={() => {
                if (type === 'selling') {
                  navigate(`/sell-item/${listingId}`);
                } else {
                  navigate(`/listing/${listingId}`);
                }
              }}
              className="w-full px-8 py-5 bg-gray-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-rose-500 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <EyeIcon className="w-5 h-5" />
              <span className="text-[12px]">View Item</span>
            </button>
          )}
          <button
            onClick={() => navigate('/sell')}
            className="w-full px-8 py-5 bg-white border-2 border-gray-100 text-gray-900 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-sm"
          >
            <PlusIcon className="w-5 h-5 text-rose-500" />
            <span className="text-[12px]">Create Another Listing</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
