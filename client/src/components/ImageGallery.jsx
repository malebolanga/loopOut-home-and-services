import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const FALLBACK_IMAGES = {
    property: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rent: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sale: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    office: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    service: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    helper: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    event: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80'
};

const ImageGallery = ({ imageUrls, alt, type, className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState(new Set());
  const [imageLoaded, setImageLoaded] = useState(false);

  // Filter out failed images
  const validImages = imageUrls?.filter((url) => !failedUrls.has(url)) || [];
  
  // Ensure we don't go out of bounds if validImages shrinks
  useEffect(() => {
    if (currentIndex >= validImages.length && validImages.length > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, validImages.length]);

  const handleNext = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (validImages.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
    setImageLoaded(false); // Reset load state for smooth transition
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (validImages.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    setImageLoaded(false); // Reset load state for smooth transition
  };

  const handleError = () => {
    if (validImages[currentIndex]) {
      setFailedUrls(prev => new Set(prev).add(validImages[currentIndex]));
    }
  };

  const currentImage = validImages[currentIndex] || FALLBACK_IMAGES[type] || FALLBACK_IMAGES.default;

  return (
    <div className={`relative w-full h-full group ${className}`}>
      {!imageLoaded && validImages.length > 0 && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-0 rounded-[inherit]" />
      )}
      <img
        src={currentImage}
        alt={alt}
        onError={handleError}
        onLoad={() => setImageLoaded(true)}
        className={`w-full h-full object-cover transition-transform duration-500 z-10 relative ${imageLoaded ? 'scale-100 group-hover:scale-105' : 'scale-105 opacity-0'}`}
        loading="lazy"
      />
      
      {/* Navigation Arrows - Only show if multiple valid images */}
      {validImages.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_2px_8px_rgba(0,0,0,0.12)] z-20"
          >
            <ChevronLeftIcon className="w-4 h-4 text-gray-800" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_2px_8px_rgba(0,0,0,0.12)] z-20"
          >
            <ChevronRightIcon className="w-4 h-4 text-gray-800" />
          </button>
          
          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {validImages.map((_, idx) => (
              <div 
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-2' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageGallery;
