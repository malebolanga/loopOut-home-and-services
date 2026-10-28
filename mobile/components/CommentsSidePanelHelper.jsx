import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import HelperComments from './HelperComments';

const CommentsSidePanel = ({ helperId, onClose, onTotalComments, onRatingsChange, totalComments = 0, presentation = 'side' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const isBottomSheet = presentation === 'bottom';

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    const onKeyDown = (event) => {
      if (event.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setIsVisible(false);
    window.setTimeout(onClose, 260);
  };

  return (
    <div
      className={`fixed inset-0 z-[1200] flex ${isBottomSheet ? 'items-end justify-center' : 'justify-start'} bg-slate-950/55 p-0 backdrop-blur-[2px] transition-opacity duration-300 ${isVisible && !isClosing ? 'opacity-100' : 'opacity-0'}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="helper-comments-title"
        className={`transform flex flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300 ease-out dark:bg-gray-950 ${isBottomSheet ? `max-h-[90dvh] w-full max-w-3xl rounded-t-[28px] ${isVisible && !isClosing ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}` : `h-full w-[92vw] max-w-xl border-r border-slate-200 dark:border-gray-800 ${isVisible && !isClosing ? 'translate-x-0' : '-translate-x-full'}`}`}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-gray-800 sm:px-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-600">Client feedback</p>
            <h2 id="helper-comments-title" className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Guest comments</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-gray-400">{totalComments} {totalComments === 1 ? 'review' : 'reviews'} from clients</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close guest comments"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-7 sm:py-6">
          <HelperComments
            helperId={helperId}
            showSummary={true}
            cardStyle={true}
            maxComments={0}
            onTotalComments={onTotalComments}
            onRatingsChange={onRatingsChange}
          />
        </div>
      </section>
    </div>
  );
};

export default CommentsSidePanel;
