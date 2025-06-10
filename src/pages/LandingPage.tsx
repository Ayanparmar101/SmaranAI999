import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import LandingHeroSection from '@/components/landing/LandingHeroSection';
import LandingFeaturesSection from '@/components/landing/LandingFeaturesSection';
import LandingStatsSection from '@/components/landing/LandingStatsSection';
import LandingAuthSection from '@/components/landing/LandingAuthSection';
import LandingCallToAction from '@/components/landing/LandingCallToAction';

const LandingPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated, redirect to the main app
    if (!loading && isAuthenticated && user) {
      navigate('/subjects', { replace: true });
    }
  }, [user, isAuthenticated, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Only show landing page for non-authenticated users
  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl md:text-4xl font-bold gradient-text-animated">
                Smaran.ai
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => navigate('/auth')}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <LandingHeroSection />
        <LandingFeaturesSection />
        <LandingStatsSection />
        <LandingAuthSection />
        <LandingCallToAction />
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full">
        <div className="w-full max-w-none text-center">
          <p className="text-muted-foreground">
            © 2024 Smaran.ai. Empowering students with AI-powered learning tools.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
