
import React from 'react';
import { RouteObject } from 'react-router-dom';
import ProtectedLayout from '@/components/ProtectedLayout';

interface ProtectedRouteProps {
  path: string;
  element: React.ReactNode;
}

export const createProtectedRoute = ({ path, element }: ProtectedRouteProps): RouteObject => {
  return {
    path,
    element: <ProtectedLayout>{element}</ProtectedLayout>
  };
};
