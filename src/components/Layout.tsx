
import React from 'react';
import NavBar from './NavBar';
import Footer from './Footer';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground w-full">
      <NavBar />
      <main className="flex-grow pt-1 sm:pt-2 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};
