import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  quality?: number;
  priority?: boolean;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  srcSet?: string;
}

/**
 * Optimized image component with lazy loading, compression, and performance features
 */
const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  quality = 75,
  priority = false,
  lazy = true,
  onLoad,
  onError,
  sizes,
  srcSet
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, priority, isInView]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    setIsError(true);
    setIsLoaded(false);
    onError?.();
  }, [onError]);

  // Generate optimized src with quality parameter
  const optimizedSrc = useCallback((originalSrc: string) => {
    // If it's a Firebase Storage URL, add quality parameter
    if (originalSrc.includes('firebasestorage.googleapis.com')) {
      const url = new URL(originalSrc);
      url.searchParams.set('quality', quality.toString());
      if (width) url.searchParams.set('w', width.toString());
      if (height) url.searchParams.set('h', height.toString());
      return url.toString();
    }
    
    // For other URLs, return as-is
    return originalSrc;
  }, [quality, width, height]);

  // Generate responsive srcSet
  const generateSrcSet = useCallback((originalSrc: string) => {
    if (srcSet) return srcSet;
    
    if (!width || !originalSrc.includes('firebasestorage.googleapis.com')) {
      return undefined;
    }

    const sizes = [0.5, 1, 1.5, 2];
    return sizes
      .map((scale) => {
        const scaledWidth = Math.round(width * scale);
        const url = new URL(originalSrc);
        url.searchParams.set('w', scaledWidth.toString());
        url.searchParams.set('quality', quality.toString());
        return `${url.toString()} ${scaledWidth}w`;
      })
      .join(', ');
  }, [srcSet, width, quality]);

  // Preload critical images
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedSrc(src);
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, src, optimizedSrc]);

  const imageProps = {
    ref: imgRef,
    alt,
    className: `transition-opacity duration-300 ${
      isLoaded ? 'opacity-100' : 'opacity-0'
    } ${className}`,
    onLoad: handleLoad,
    onError: handleError,
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
    ...(width && { width }),
    ...(height && { height }),
    ...(sizes && { sizes }),
  };

  // Show skeleton while not in view or loading
  if (!isInView || (!isLoaded && !isError)) {
    return (
      <div 
        ref={!isInView ? imgRef : undefined}
        className={`relative ${className}`}
        style={{ width, height }}
      >
        {placeholder ? (
          <img
            src={placeholder}
            alt={alt}
            className={`absolute inset-0 w-full h-full object-cover filter blur-sm ${className}`}
            style={{ width, height }}
          />
        ) : (
          <Skeleton 
            className="w-full h-full"
            style={{ width, height }}
          />
        )}
        
        {isInView && (
          <img
            {...imageProps}
            src={optimizedSrc(src)}
            srcSet={generateSrcSet(src)}
            className={`absolute inset-0 w-full h-full object-cover ${imageProps.className}`}
          />
        )}
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-sm">Failed to load image</div>
        </div>
      </div>
    );
  }

  // Show loaded image
  return (
    <img
      {...imageProps}
      src={optimizedSrc(src)}
      srcSet={generateSrcSet(src)}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;

/**
 * Hook for preloading images
 */
export function useImagePreloader() {
  const preloadedImages = useRef(new Set<string>());

  const preloadImage = useCallback((src: string, priority: boolean = false) => {
    if (preloadedImages.current.has(src)) return;

    const img = new Image();
    img.src = src;
    
    if (priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    }

    preloadedImages.current.add(src);
  }, []);

  const preloadImages = useCallback((srcs: string[], priority: boolean = false) => {
    srcs.forEach(src => preloadImage(src, priority));
  }, [preloadImage]);

  return { preloadImage, preloadImages };
}

/**
 * Component for preloading critical images
 */
export const ImagePreloader: React.FC<{ images: string[] }> = memo(({ images }) => {
  useEffect(() => {
    images.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }, [images]);

  return null;
});

ImagePreloader.displayName = 'ImagePreloader';
