import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = ''
}) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  // Check if animations should be disabled
  const shouldAnimate = useCallback(() => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }

    return true;
  }, []);

  useEffect(() => {
    // Trigger enter animation on mount
    setMounted(true);
  }, []);

  // Get CSS classes for fast transition
  const getTransitionClasses = () => {
    if (!shouldAnimate()) {
      return `opacity-100 ${className}`;
    }

    // Fast 150ms transition
    return mounted
      ? `opacity-100 translate-y-0 transition-all duration-150 ease-out ${className}`
      : `opacity-0 translate-y-2 transition-all duration-150 ease-out ${className}`;
  };

  return (
    <div
      className={getTransitionClasses()}
      style={{
        minHeight: '100%',
        width: '100%'
      }}
      key={location.pathname} // This ensures re-mount on route change
    >
      {children}
    </div>
  );
};

export default PageTransition;
