
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoodleButton from '@/components/DoodleButton';
import DoodleDecoration from '@/components/DoodleDecoration';

const HeroSection = () => {
  const navigate = useNavigate();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Ensure navigation is ready after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100); // Small delay to ensure everything is mounted

    return () => clearTimeout(timer);
  }, []);

  const handleNavigation = useCallback((path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Ensure navigation is ready before attempting to navigate
    if (!isNavigationReady) {
      console.warn('Navigation not ready yet, retrying...');
      setTimeout(() => navigate(path), 50);
      return;
    }

    console.log('Navigating to:', path);
    navigate(path);
  }, [navigate, isNavigationReady]);

  return (
    <section className="relative py-8 sm:py-12 md:py-20 overflow-hidden bg-background text-foreground">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="block">Learn English</span>
              <span className="gradient-text-animated-slow">
                The Fun Way!
              </span>
            </h1>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-muted-foreground leading-relaxed">
              Interactive lessons, story generators, and AI tutors to help students in grades 1-8 master English.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
              <DoodleButton
                color="blue"
                size="lg"
                onClick={handleNavigation("/subjects")}
                fullWidth={true}
                className="sm:w-auto"
                disabled={!isNavigationReady}
              >
                Get Started
              </DoodleButton>
              <DoodleButton
                color="purple"
                size="lg"
                variant="outline"
                onClick={handleNavigation("/grammar")}
                fullWidth={true}
                className="sm:w-auto"
                disabled={!isNavigationReady}
              >
                Explore Lessons
              </DoodleButton>
            </div>
          </div>
          <div className="md:w-1/2 relative flex justify-center mt-4 md:mt-0">
            <div className="relative w-4/5 sm:w-3/4 md:w-full max-w-md">
              <img
                alt="English learning illustration"
                src="/assets/EnglishIMG.png"
                className="rounded-3xl shadow-lg object-contain aspect-square w-full"
              />
              <div className="absolute -top-3 -right-3 sm:-top-6 sm:-right-6">
                <DoodleDecoration type="star" color="yellow" size="lg" />
              </div>
              <div className="absolute -bottom-3 -left-3 sm:-bottom-6 sm:-left-6">
                <DoodleDecoration type="heart" color="red" size="lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decorations (adjust opacity/colors for themes if needed) */}
      <div className="absolute top-20 left-10 opacity-10 dark:opacity-20 -z-10">
        <DoodleDecoration type="cloud" color="blue" size="lg" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-10 dark:opacity-20 -z-10">
        <DoodleDecoration type="circle" color="green" size="lg" />
      </div>
    </section>
  );
};

export default HeroSection;
