
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import AgeGroupsSection from '@/components/home/AgeGroupsSection';
import CallToActionSection from '@/components/home/CallToActionSection';

const Index = () => {
  return (
    <main className="flex-1">
      <HeroSection />
      <FeaturesSection />
      <AgeGroupsSection />
      <CallToActionSection />
    </main>
  );
};

export default Index;
