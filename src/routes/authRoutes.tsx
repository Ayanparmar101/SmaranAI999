
import React, { Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import AuthPage from '@/pages/AuthPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import LandingPage from '@/pages/LandingPage';

// Auth page loader
const AuthPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-muted rounded w-64"></div>
      <div className="h-8 bg-muted rounded w-48"></div>
    </div>
  </div>
);

// Helper function for auth pages
const authPageWrapper = (element: React.ReactNode) => (
  <Suspense fallback={<AuthPageLoader />}>
    <PageTransition>
      {element}
    </PageTransition>
  </Suspense>
);

export const authRoutes: RouteObject[] = [
  { path: '/', element: authPageWrapper(<LandingPage />) }, // Landing page for non-authenticated users
  { path: '/auth', element: authPageWrapper(<AuthPage />) },
  { path: '/auth-callback', element: authPageWrapper(<AuthCallbackPage />) }
];
