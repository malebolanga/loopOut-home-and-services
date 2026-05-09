import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon,
  HomeIcon,
  PlusCircleIcon,
  CalendarDaysIcon,
  SparklesIcon,
  MapIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const OnboardingGuide = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenOnboardingGuide');
    if (!hasSeenGuide) {
      // Small delay to let the initial splash screen finish
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps = [
    {
      title: "Welcome to loopOut",
      description: "Your immersive gateway to homes, services, and local experiences. Let's show you how to navigate the future of community commerce.",
      icon: <SparklesIcon className="w-12 h-12 text-rose-500" />,
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
      accent: "bg-rose-500"
    },
    {
      title: "Seamless Navigation",
      description: "Explore categories through our dynamic header. Switch between Homes, Services, and Events with a single tap. Use the 'Explore' tab to find hidden gems near you.",
      icon: <MapIcon className="w-12 h-12 text-indigo-500" />,
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
      accent: "bg-indigo-500"
    },
    {
      title: "Empower Your Skills",
      description: "Ready to share? Click 'Become a Host' or use the 'Create' button in your profile to list your space, service, or upcoming event. Our Neural guide will walk you through the setup.",
      icon: <PlusCircleIcon className="w-12 h-12 text-emerald-500" />,
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
      accent: "bg-emerald-500"
    },
    {
      title: "Master the Booking",
      description: "Found something perfect? Select your dates, review the details, and book instantly. You can track all your upcoming trips and bookings in your personal dashboard.",
      icon: <CalendarDaysIcon className="w-12 h-12 text-amber-500" />,
      image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=800",
      accent: "bg-amber-500"
    },
    {
      title: "Your Neural Identity",
      description: "Your profile is your hub. Manage listings, view mutual connections, and keep your preferences synced across the platform.",
      icon: <UserCircleIcon className="w-12 h-12 text-violet-500" />,
      image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=800",
      accent: "bg-violet-500"
    }
  ];

  const handleClose = () => {
    localStorage.setItem('hasSeenOnboardingGuide', 'true');
    setIsVisible(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative w-full max-w-4xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[80vh] md:h-[600px]"
          >
            {/* Image Side */}
            <div className="w-full md:w-1/2 h-1/3 md:h-full relative overflow-hidden bg-gray-900">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentStep}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.1, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  src={steps[currentStep].image}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                  alt="Onboarding"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8">
                <motion.div
                  key={currentStep}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-4"
                >
                  <div className={`w-1 h-12 ${steps[currentStep].accent} rounded-full`} />
                  <span className="text-white text-4xl font-black tracking-tighter">
                    0{currentStep + 1}
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-white">
              <button 
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>

              <div className="flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <div className="mb-2">
                       {steps[currentStep].icon}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-none tracking-tight">
                      {steps[currentStep].title}
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium">
                      {steps[currentStep].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="pt-8 flex items-center justify-between">
                <div className="flex gap-2">
                  {steps.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        idx === currentStep ? 'w-8 bg-gray-900' : 'w-2 bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-4">
                  {currentStep > 0 && (
                    <button
                      onClick={prevStep}
                      className="p-4 rounded-2xl border-2 border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600 transition-all"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className={`
                      px-8 py-4 rounded-2xl flex items-center gap-2 font-black uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95
                      ${currentStep === steps.length - 1 ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-gray-900 text-white shadow-gray-200'}
                    `}
                  >
                    {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingGuide;
