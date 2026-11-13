import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ServiceComments from './ServiceComments';

const CommentsSidePanelService = ({ serviceId, onClose, totalComments = 0, categoryMode = 'service', title = 'Service reviews' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    const handleKeyDown = (event) => { if (event.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', handleKeyDown); };
  }, []);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setIsVisible(false);
    window.setTimeout(onClose, 260);
  };

  return (
    <div
      className={`fixed inset-0 z-[1200] flex justify-start bg-slate-950/55 p-0 backdrop-blur-[2px] transition-opacity duration-300 ${isVisible && !isClosing ? 'opacity-100' : 'opacity-0'}`}
      onMouseDown={(event) => { if (event.target === event.currentTarget) handleClose(); }}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-reviews-title"
        className={`flex h-full w-[92vw] max-w-xl transform flex-col overflow-hidden border-r border-slate-200 bg-white shadow-2xl transition-all duration-300 ease-out dark:border-gray-800 dark:bg-gray-950 ${isVisible && !isClosing ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-gray-800 sm:px-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-600">Client feedback</p>
            <h2 id="service-reviews-title" className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-gray-400">{totalComments} {totalComments === 1 ? 'completed booking review' : 'completed booking reviews'}</p>
          </div>
          <button type="button" onClick={handleClose} aria-label="Close reviews" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-7 sm:py-6">
          <ServiceComments serviceId={serviceId} showSummary cardStyle readOnly horizontalStyle categoryMode={categoryMode} maxComments={0} />
        </div>
      </section>
    </div>
  );
};

export default CommentsSidePanelService;
