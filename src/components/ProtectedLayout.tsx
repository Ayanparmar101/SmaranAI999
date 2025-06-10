
import React from 'react';
import { Layout } from './Layout';
import AuthGuard from './AuthGuard';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  return (
    <AuthGuard>
      <Layout>
        {children}
      </Layout>
    </AuthGuard>
  );
};

export default ProtectedLayout;
