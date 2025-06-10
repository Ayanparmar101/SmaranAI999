
import React, { Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';

// Math Pages
import ArithmeticPage from '@/pages/math/ArithmeticPage';
import AlgebraPage from '@/pages/math/AlgebraPage';
import GeometryPage from '@/pages/math/GeometryPage';
import CalculusPage from '@/pages/math/CalculusPage';
import StatisticsPage from '@/pages/math/StatisticsPage';
import ProblemSolvingPage from '@/pages/math/ProblemSolvingPage'; // Added import

// Math page loader
const MathPageLoader = () => (
  <div className="container mx-auto p-6 space-y-6 animate-pulse">
    <div className="h-8 bg-muted rounded w-48"></div>
    <div className="grid gap-4">
      <div className="h-24 bg-muted rounded"></div>
      <div className="h-24 bg-muted rounded"></div>
    </div>
  </div>
);

// Helper function for math pages
const mathPageWrapper = (element: React.ReactNode) => (
  <Suspense fallback={<MathPageLoader />}>
    <PageTransition>
      {element}
    </PageTransition>
  </Suspense>
);

export const mathRoutes: RouteObject[] = [
  { path: '/math/arithmetic', element: mathPageWrapper(<ArithmeticPage />) },
  { path: '/math/algebra', element: mathPageWrapper(<AlgebraPage />) },
  { path: '/math/geometry', element: mathPageWrapper(<GeometryPage />) },
  { path: '/math/calculus', element: mathPageWrapper(<CalculusPage />) },
  { path: '/math/statistics', element: mathPageWrapper(<StatisticsPage />) },
  { path: '/math/problem-solving', element: mathPageWrapper(<ProblemSolvingPage />) }
];
