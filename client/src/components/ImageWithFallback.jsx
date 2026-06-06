import { useState } from 'react';

const FALLBACK_IMAGES = {
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800',
    default: ''
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
            if (type === 'avatar') {
                setImgSrc(FALLBACK_IMAGES.avatar);
            }
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
