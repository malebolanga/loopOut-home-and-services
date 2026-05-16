import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

const OperatingSchedule = ({ operatingHours, isClosedToday, reason }) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  return (
    <div className="pb-8 border-b border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 rounded-2xl">
            <ClockIcon className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Operating Schedule</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Weekly availability window</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {days.map((day) => {
          const schedule = operatingHours?.[day] || { closed: true };
          const isToday = today === day;
          
          return (
            <div 
              key={day} 
              className={`flex items-center justify-between p-4 rounded-2xl border ${isToday ? 'border-rose-200 bg-rose-50/30' : 'border-gray-50 bg-gray-50/20'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black uppercase ${schedule.closed ? 'bg-gray-100 text-gray-400' : 'bg-rose-500 text-white shadow-sm'}`}>
                  {day.slice(0, 3)}
                </div>
                <span className={`text-sm font-bold capitalize ${isToday ? 'text-gray-900' : 'text-gray-600'}`}>
                  {day}
                  {isToday && <span className="ml-2 text-[8px] font-black text-rose-500 uppercase tracking-widest">Today</span>}
                </span>
              </div>
              
              <div className="text-right">
                {schedule.closed ? (
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Closed</span>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-bold ${isToday && isClosedToday ? 'text-rose-500' : 'text-gray-900'}`}>
                      {schedule.open} - {schedule.close}
                    </span>
                    {isToday && isClosedToday && (
                      <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-0.5">
                        {reason || 'Currently Closed'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OperatingSchedule;
