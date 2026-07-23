import React, { useState } from 'react';
import { useCompare } from '../hooks/useCompare';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckBadgeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { LayoutGrid } from 'lucide-react';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import ImageGallery from './ImageGallery';

export default function CompareWidget() {
  const { compareList, toggleCompare, clearCompare } = useCompare();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (!compareList || compareList.length === 0) return null;

  return (
    <>
      {/* Floating Widget Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-6 z-50"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl hover:bg-gray-800 transition-colors border border-white/20 group"
            >
              <div className="relative">
                <LayoutGrid className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                  {compareList.length}
                </span>
              </div>
              <span className="font-bold tracking-tight">Compare</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 bg-white z-10 sticky top-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Compare Professionals</h2>
                  <p className="text-gray-500 text-sm mt-1">Side-by-side comparison of your selected experts.</p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      clearCompare();
                      setIsOpen(false);
                    }}
                    className="text-xs font-bold text-gray-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Grid Content */}
              <div className="flex-1 overflow-x-auto overflow-y-auto p-6 sm:p-8 bg-gray-50/50">
                <div className="flex gap-6 min-w-max md:min-w-0 md:grid md:grid-cols-2 lg:grid-cols-3">
                  {compareList.map((helper) => (
                    <div key={helper._id} className="w-[300px] md:w-auto bg-white rounded-3xl p-5 border border-gray-100 shadow-sm relative flex flex-col">
                      <button
                        onClick={() => {
                          toggleCompare(helper);
                          if (compareList.length === 1) setIsOpen(false);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 shadow-sm z-20"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>

                      <div className="h-48 rounded-2xl overflow-hidden mb-4 relative bg-gray-100">
                        <ImageGallery 
                          imageUrls={helper.imageUrls || []} 
                          type="helper" 
                          alt={helper.name} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest z-10">
                          {helper.type}
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-900 truncate">{helper.name}</h3>
                            <CheckBadgeIcon className="w-5 h-5 text-rose-500 shrink-0" />
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold">
                            <MapPinIcon className="w-3.5 h-3.5" />
                            <span className="truncate">{helper.address || 'Johannesburg'}</span>
                          </div>
                        </div>

                        <div className="flex items-end justify-between py-3 border-y border-gray-50">
                          <div>
                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Rate</span>
                            <span className="text-lg font-black text-gray-900">R{helper.regularPrice} <span className="text-sm font-normal text-gray-500">/hr</span></span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Rating</span>
                            <div className="flex items-center gap-1">
                              <StarIconSolid className="w-4 h-4 text-black" />
                              <span className="text-base font-bold text-gray-900">{helper.rating || 4.8}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</span>
                          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                            {helper.description || "No description provided."}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/helper/${helper._id}`);
                        }}
                        className="mt-6 w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold rounded-2xl transition-colors border border-gray-200"
                      >
                        View Full Profile
                      </button>
                    </div>
                  ))}
                  
                  {/* Empty State Fillers */}
                  {Array.from({ length: Math.max(0, 3 - compareList.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="hidden lg:flex w-full bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 items-center justify-center p-8 flex-col text-center">
                      <LayoutGrid className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Empty Slot</p>
                      <p className="text-xs text-gray-400 mt-2">Add another professional to compare</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
