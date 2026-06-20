import { useState } from 'react';

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
    default: 'https://placehold.co/600x400/E0E0E0/333333?text=No+Image'
};

const ImageWithFallback = ({ src, alt, className = "", type = 'default', imageUrls, onLoad, ...props }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [fallbackIndex, setFallbackIndex] = useState(1);

    const handleError = () => {
        if (imageUrls && fallbackIndex < imageUrls.length) {
            setImgSrc(imageUrls[fallbackIndex]);
            setFallbackIndex(prev => prev + 1);
            setIsLoading(true);
        } else {
            setHasError(true);
            setImgSrc(FALLBACK_IMAGES[type] || FALLBACK_IMAGES.default);
            if (onLoad) onLoad();
        }
    };

    const handleLoad = () => {
        setIsLoading(false);
        if (onLoad) onLoad();
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {isLoading && !hasError && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse z-0 rounded-[inherit]" />
            )}
            <img loading="lazy"
                src={imgSrc || FALLBACK_IMAGES[type] || FALLBACK_IMAGES.default}
                alt={alt}
                className={`w-full h-full object-cover transition-opacity duration-500 z-10 relative ${isLoading && !hasError ? 'opacity-0' : 'opacity-100'}`}
                onError={handleError}
                onLoad={handleLoad}
                {...props}
            />
        </div>
    );
};

export default ImageWithFallback;
