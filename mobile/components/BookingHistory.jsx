import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { FaCheckCircle } from 'react-icons/fa';

export default function BookingHistory({ bookingSummary, providerName, providerType }) {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const handleAskReference = async (booker) => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    if (currentUser._id === booker._id) {
      alert("You cannot ask yourself for a reference.");
      return;
    }

    const typeStr = providerType ? providerType.toLowerCase() : 'service';
    const confirmRef = window.confirm(`Would you like to message ${booker.username} to ask for a reference about their booking with ${providerName || 'this professional'}?`);
    if (!confirmRef) return;

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: booker._id,
          content: `Hi ${booker.username}, I noticed that you've booked ${providerName || 'this professional'} for ${typeStr} services before. Would you recommend them? Thanks!`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/messages/${data.conversationId || data._id}`);
      } else {
        alert(data.message || 'Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation for reference:', error);
      alert('An error occurred. Please try again.');
    }
  };

  if (!bookingSummary || !bookingSummary.recentBookers || bookingSummary.recentBookers.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 md:mt-16 border-t border-slate-200/50 pt-10 md:pt-12">
  
      <p className="text-xs text-gray-500 mb-6 uppercase tracking-wider font-bold">
        Click on a past client below to ask for a direct reference about their experience.
      </p>
      <div className="py-4 px-[2px] overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 rounded-none">
        <Swiper
          spaceBetween={16}
          slidesPerView="auto"
          className="recent-bookers-swiper flex"
          breakpoints={{
            320: { slidesPerView: 1.2, spaceBetween: 12 },
            640: { slidesPerView: 2.2, spaceBetween: 16 },
            768: { slidesPerView: 3.2, spaceBetween: 20 },
            1024: { slidesPerView: 4.2, spaceBetween: 24 }
          }}
        >
          {bookingSummary.recentBookers.map((booker) => (
            <SwiperSlide key={booker._id} className="!w-[280px] px-[2px]">
              <div 
                onClick={() => handleAskReference(booker)}
                className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:shadow-md h-full w-[260px]"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={booker.avatar || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={booker.username}
                    className="w-12 h-12 rounded-full object-cover border border-slate-100 dark:border-slate-800 shadow-sm transition-transform duration-500 group-hover:scale-105"
                  />
                  {booker.isMutual && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900" title="Mutual connection found via contacts" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-xs text-slate-900 dark:text-white truncate">{booker.username}</h4>
                    {booker.isMutual && (
                      <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md flex-shrink-0">
                        Mutual
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate mt-0.5">
                    {booker.location || 'South Africa'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1.5 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all">
                    Ask Ref
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
