import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PlusCircleIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const steps = [
  {
    eyebrow: 'Discover nearby',
    title: 'One place for local finds.',
    description: 'LoopOut brings together places to stay, services, helpers, food, events, and items for sale.',
    detail: 'Start with search or browse the categories on the home page.',
    icon: SparklesIcon,
    tint: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300',
  },
  {
    eyebrow: 'Choose with confidence',
    title: 'Check the details first.',
    description: 'Open a listing to see its photos, price, location, reviews, and what is included.',
    detail: 'For questions, message the person offering it before you continue.',
    icon: MapPinIcon,
    tint: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300',
  },
  {
    eyebrow: 'Book or order',
    title: 'Follow the steps shown.',
    description: 'Send a booking request or place an order, depending on the listing. Review the price and details before confirming.',
    detail: 'Find your updates later in My LoopOut or My Orders.',
    icon: CalendarDaysIcon,
    tint: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
  },
  {
    eyebrow: 'Offer something',
    title: 'Share what you do or sell.',
    description: 'Sign in, tap Become, choose what you want to offer, then create a listing with your details and price.',
    detail: 'You can manage your listing and requests from your account.',
    icon: PlusCircleIcon,
    tint: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
];

const OnboardingGuide = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const current = steps[currentStep];
  const StepIcon = current.icon;

  useEffect(() => {
    if (location.pathname !== '/' || localStorage.getItem('hasSeenOnboardingGuide')) return undefined;
    const timer = window.setTimeout(() => setIsVisible(true), 3000);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  const closeGuide = () => {
    localStorage.setItem('hasSeenOnboardingGuide', 'true');
    setIsVisible(false);
  };

  useEffect(() => {
    if (!isVisible) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeGuide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const startExploring = () => {
    closeGuide();
    navigate('/search');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeGuide}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
        role="presentation"
      >
        <motion.section
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="loopout-intro-title"
          className="relative max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950"
        >
          <div className="h-1.5 bg-slate-100 dark:bg-gray-800">
            <motion.div
              className="h-full bg-rose-500"
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </div>
          <button
            type="button"
            onClick={closeGuide}
            aria-label="Close introduction"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="p-6 sm:p-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
              >
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${current.tint}`}>
                  <StepIcon className="h-7 w-7" aria-hidden="true" />
                </div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
                  {current.eyebrow}
                </p>
                <h2 id="loopout-intro-title" className="mt-2 max-w-md text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  {current.title}
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-600 dark:text-gray-300">
                  {current.description}
                </p>
                <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-slate-50 p-3.5 text-sm leading-6 text-slate-600 dark:bg-gray-900 dark:text-gray-300">
                  {currentStep === 1 ? (
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                  ) : currentStep === 0 ? (
                    <MagnifyingGlassIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                  ) : (
                    <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                  )}
                  <span>{current.detail}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-gray-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-gray-400" aria-live="polite">
                <span>{currentStep + 1} of {steps.length}</span>
                <span aria-hidden="true">·</span>
                <button type="button" onClick={() => { closeGuide(); navigate('/how-it-works'); }} className="underline underline-offset-2 hover:text-rose-600">
                  How LoopOut works
                </button>
              </div>
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
                    aria-label="Previous introduction step"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                )}
                {currentStep === steps.length - 1 ? (
                  <>
                    <button type="button" onClick={() => { closeGuide(); navigate('/become'); }} className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:px-4 sm:text-sm dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900">
                      Offer
                    </button>
                    <button type="button" onClick={startExploring} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-extrabold text-white transition hover:bg-rose-700">
                      Start exploring <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setCurrentStep((step) => Math.min(steps.length - 1, step + 1))} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-gray-200">
                    Next <ChevronRightIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingGuide;
