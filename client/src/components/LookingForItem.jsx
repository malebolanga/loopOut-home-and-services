import React from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, ClockIcon, UserIcon, HeartIcon, ChatBubbleLeftEllipsisIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';

const LookingForItem = ({ request }) => {
  const [isLiked, setIsLiked] = useState(false);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'roommate': return '👤';
      case 'nanny': return '🍼';
      case 'pampering': return '💄';
      case 'household': return '🧹';
      default: return '✨';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="cursor-pointer flex flex-col h-full bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
    >
      {/* Header: User Info (Facebook style) */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 p-0.5">
            <img 
              src={request.userRef?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} 
              alt="user" 
              className="w-full h-full object-cover rounded-[0.9rem]" 
            />
          </div>
          <div>
            <h4 className="text-[13px] font-black text-gray-900 leading-tight">
              {request.userRef?.username || "Community Member"}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                {request.category}
              </span>
              <span className="w-1 h-1 bg-gray-200 rounded-full" />
              <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest leading-none">
                Live
              </span>
            </div>
          </div>
        </div>
        
        <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-xl shadow-inner">
           {getCategoryIcon(request.category)}
        </div>
      </div>

      <div className="flex-1 flex flex-col pt-2 pb-6">
        <h3 className="font-black text-gray-900 text-lg leading-tight mb-2 group-hover:text-rose-600 transition-colors">
          {request.title}
        </h3>
        
        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed font-medium">
          {request.description}
        </p>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <MapPinIcon className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-widest truncate">{request.location}</span>
          </div>
          <div className="text-[11px] font-black text-gray-900 bg-gray-50 px-3 py-1.5 rounded-full">
            {request.budget ? `R${request.budget.toLocaleString()}` : "OPEN BUDGET"}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
               <button className="flex items-center gap-1.5 text-gray-400 hover:text-rose-500 transition-colors">
                  <HandThumbUpIcon className="w-5 h-5" />
                  <span className="text-xs font-black">Like</span>
               </button>
               <button className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                  <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                  <span className="text-xs font-black">{request.comments?.length || 0} Comments</span>
               </button>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-gray-400 font-black uppercase tracking-widest">
             <ClockIcon className="w-3.5 h-3.5" />
             <span>Active</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LookingForItem;
