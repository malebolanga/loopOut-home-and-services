import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CATEGORIES = [
  { key: 'punctuality', label: 'Punctuality', icon: '⏱️' },
  { key: 'quality', label: 'Work quality', icon: '✨' },
  { key: 'communication', label: 'Communication', icon: '💬' },
  { key: 'cleanliness', label: 'Cleanliness & organisation', icon: '🧹' },
  { key: 'respectfulness', label: 'Friendly & respectful', icon: '🤝' },
  { key: 'value', label: 'Value for money', icon: '💰' },
  { key: 'recommendation', label: 'Would recommend', icon: '⭐' }
];

export default function HelperRatingBreakdown({ ratings, reviewCount, onClose }) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    const onKeyDown = (event) => { if (event.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', onKeyDown); };
  }, []);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    setVisible(false);
    window.setTimeout(onClose, 260);
  };

  return (
    <div
      className={`fixed inset-0 z-[1250] flex justify-start bg-slate-950/45 transition-opacity duration-300 ${visible && !closing ? 'opacity-100' : 'opacity-0'}`}
      onMouseDown={(event) => { if (event.target === event.currentTarget) handleClose(); }}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="rating-breakdown-title"
        className={`transform relative flex h-full w-[88vw] max-w-md flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-gray-800 dark:bg-gray-950 ${visible && !closing ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-gray-800">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-600">Client ratings</p>
            <h2 id="rating-breakdown-title" className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Rating breakdown</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</p>
          </div>
          <button type="button" onClick={handleClose} aria-label="Close rating breakdown" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
          {CATEGORIES.map(({ key, label, icon }) => {
            const score = Number(ratings?.[key]) || 0;
            return (
              <div key={key} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 dark:border-gray-800">
                <span className="sr-only">{label}</span>
                <span className="text-2xl" role="img" aria-label={label}>{icon}</span>
                <span className="text-base font-bold tabular-nums text-slate-900 dark:text-white">{score ? `${score.toFixed(1)} / 5` : '— / 5'}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
