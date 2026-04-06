import React, { useState, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBolt, 
  FaStar, 
  FaUserCheck, 
  FaCalendarCheck, 
  FaFireAlt,
  FaMapMarkerAlt
} from 'react-icons/fa';

const PulseItem = forwardRef(({ item }, ref) => {
  const getIcon = (type) => {
    switch (type) {
      case 'booking': return <FaCalendarCheck className="text-green-500" />;
      case 'review': return <FaStar className="text-yellow-500" />;
      case 'new': return <FaUserCheck className="text-blue-500" />;
      case 'trending': return <FaFireAlt className="text-rose-500" />;
      default: return <FaBolt className="text-gray-400" />;
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-gray-100 px-4 py-2 rounded-full shadow-sm whitespace-nowrap"
    >
      <div className="flex-shrink-0">{getIcon(item.type)}</div>
      <div className="text-sm">
        <span className="font-semibold text-gray-900">{item.user}</span>
        <span className="text-gray-500 ml-1">{item.action}</span>
        <span className="font-medium text-gray-800 ml-1">{item.target}</span>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-gray-400 border-l pl-2 ml-1">
        <FaMapMarkerAlt className="text-[8px]" />
        {item.location}
      </div>
    </motion.div>
  );
});

const LoopOutPulse = () => {
  const [items, setItems] = useState([
    { id: 1, user: 'Kgotso', action: 'booked', target: 'John\'s Sneaker Care', type: 'booking', location: 'Polokwane' },
    { id: 2, user: 'Sarah', action: 'reviewed', target: 'Deep Cleaning', type: 'review', location: 'Mankweng' },
    { id: 3, user: 'Mike', action: 'joined as', target: 'Verified Helper', type: 'new', location: 'Flora Park' },
    { id: 4, user: 'Event', action: 'is trending:', target: 'Jazz Night', type: 'trending', location: 'Central' },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Mock "Real-time" updates
  useEffect(() => {
    const names = ['Thabo', 'Lindiwe', 'Peter', 'Zanele', 'Blessing', 'Lerato'];
    const services = ['Car Wash', 'Tutor', 'Plumber', 'Electrician', 'Baker'];
    const locations = ['Seshego', 'Nirvana', 'Bendor', 'Polokwane', 'Mankweng'];
    const actions = [
      { action: 'booked', type: 'booking' },
      { action: 'reviewed', type: 'review' },
      { action: 'joined as', type: 'new' },
      { action: 'trending!', type: 'trending' }
    ];

    const interval = setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomService = services[Math.floor(Math.random() * services.length)];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];

      const newItem = {
        id: Date.now(),
        user: randomName,
        action: randomAction.action,
        target: randomAction.type === 'new' ? 'Verified Pro' : randomService,
        type: randomAction.type,
        location: randomLocation
      };

      setItems(prev => [newItem, ...prev.slice(0, 3)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden py-4">
      <div className="flex items-center gap-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex-shrink-0 flex items-center gap-2 bg-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
          <FaBolt />
          <span>LIVE PULSE</span>
        </div>
        
        <div className="flex gap-4">
          <AnimatePresence mode="wait">
            {items.slice(0, 1).map((item) => (
              <PulseItem key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Decorative Gradient Overlays */}
      <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-white to-transparent pointer-events-none" />
    </div>
  );
};

export default LoopOutPulse;
