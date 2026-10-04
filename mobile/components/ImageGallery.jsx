import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const FALLBACK_IMAGES = {
    property: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
    apartment: 'https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=800',
    rent: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
    sale: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
    office: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
    service: 'https://images.pexels.com/photos/4099467/pexels-photo-4099467.jpeg?auto=compress&cs=tinysrgb&w=800',
    helper: 'https://images.pexels.com/photos/3768914/pexels-photo-3768914.jpeg?auto=compress&cs=tinysrgb&w=800',
    event: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800',
    default: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800'
};

const ImageGallery = ({ imageUrls, alt, type, className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState(new Set());
  const [imageLoaded, setImageLoaded] = useState(false);

  // Filter out empty strings or failed URLs
  const validImages = imageUrls?.filter((url) => Boolean(url) && !failedUrls.has(url)) || [];
  
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
    } else {
      setImageLoaded(true);
    }
  };

  const fallbackImage = FALLBACK_IMAGES[type] || FALLBACK_IMAGES.default;
  const currentImage = validImages[currentIndex] || fallbackImage;

  return (
    <div className={`relative w-full h-full group ${className}`}>
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-0 rounded-[inherit]" />
      )}
      <img
        src={currentImage}
        alt={alt || "Image"}
        onError={(e) => {
          handleError();
          if (!validImages[currentIndex] && e.currentTarget.src !== FALLBACK_IMAGES.default) {
            e.currentTarget.src = FALLBACK_IMAGES.default;
          }
        }}
        onLoad={() => setImageLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-500 z-10 relative ${imageLoaded ? 'scale-100 opacity-100 group-hover:scale-105' : 'scale-105 opacity-0'}`}
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
