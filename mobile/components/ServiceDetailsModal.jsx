import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function ServiceDetailsModal({ service, isSelected, onClose, onSelect }) {
  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    if (service) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [service]);

  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative animate-in zoom-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-gray-100 rounded-full z-10 text-gray-500 transition-colors"
        >
          <FaTimes size={20} />
        </button>
        
        {/* Header / Image */}
        {service.image ? (
          <img src={service.image} alt={service.name} className="w-full h-56 object-cover bg-gray-100" />
        ) : (
          <div className="w-full h-40 bg-rose-50 flex items-center justify-center">
             <div className="text-5xl text-rose-300">{service.icon}</div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
           <div className="flex justify-between items-start mb-4">
              <div>
                {service.type && (
                  <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">
                    {service.type}
                  </span>
                )}
                <h3 className="text-2xl font-bold text-gray-900">{service.name}</h3>
              </div>
              {service.price && (
                <span className="text-xl font-bold text-gray-900">R{service.price}</span>
              )}
           </div>

           {service.description && (
             <p className="text-gray-600 mt-2 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
               {service.description}
             </p>
           )}

           {/* Action Button */}
           <div className="mt-8 pt-4 border-t border-gray-100">
              <button 
                onClick={() => {
                  onSelect(service.id);
                  onClose();
                }}
                className={`w-full py-4 px-4 rounded-xl font-bold text-center transition-all text-lg ${
                  isSelected 
                    ? 'bg-rose-50 text-rose-600 border-2 border-rose-200 hover:bg-rose-100'
                    : 'bg-rose-600 text-white hover:bg-rose-700 shadow-md hover:shadow-lg'
                }`}
              >
                {isSelected ? 'Remove Service' : 'Select Service'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
