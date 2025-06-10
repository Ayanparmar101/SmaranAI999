
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop is a component that scrolls to the top of the page
 * when the route changes. It doesn't render any UI elements.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when the route changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Use 'auto' for instant scrolling without animation
    });
  }, [pathname]);

  // This component doesn't render anything
  return null;
};
