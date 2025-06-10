
import { RouteObject } from 'react-router-dom';
import { mainRoutes } from './mainRoutes';
import { mathRoutes } from './mathRoutes';
import { authRoutes } from './authRoutes';
import { createProtectedRoute } from './ProtectedRoute';

// Filter out the index route from main routes since we'll handle it separately
const filteredMainRoutes = mainRoutes.filter(route => route.path !== '/');

// Convert regular routes to protected routes (excluding the index route)
const protectedMainRoutes = filteredMainRoutes.map(route =>
  createProtectedRoute({ path: route.path!, element: route.element! })
);

const protectedMathRoutes = mathRoutes.map(route =>
  createProtectedRoute({ path: route.path!, element: route.element! })
);

// Combine all routes - authRoutes includes the landing page at '/'
export const appRoutes: RouteObject[] = [
  ...authRoutes, // This includes the landing page at '/' and auth routes
  ...protectedMainRoutes, // All protected main routes including /subjects
  ...protectedMathRoutes
];
