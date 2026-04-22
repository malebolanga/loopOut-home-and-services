import { useState } from 'react';

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

const ImageWithFallback = ({ src, alt, className, type = 'default', imageUrls, onLoad, ...props }) => {
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
            if (onLoad) onLoad(); // Trigger load when fallback sets to prevent infinite loading state
        }
    };

    const handleLoad = () => {
        setIsLoading(false);
        if (onLoad) onLoad();
    };

    return (
        <>
            {isLoading && !hasError && (
                <div className={`${className} bg-gray-200 animate-pulse`} />
            )}
            <img
                src={imgSrc || FALLBACK_IMAGES[type]}
                alt={alt}
                className={`${className} elite-image ${isLoading && !hasError ? 'hidden' : 'block'}`}
                onError={handleError}
                onLoad={handleLoad}
                {...props}
            />
        </>
    );
};

export default ImageWithFallback;
