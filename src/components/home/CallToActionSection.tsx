
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DoodleButton from '@/components/DoodleButton';

const CallToActionSection = () => {
  const navigate = useNavigate();
  
  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <section className="bg-gradient-to-r from-kid-blue/10 to-kid-purple/10 px-0 my-0 py-6 sm:py-8 md:py-[28px] mx-0">
      <div className="container mx-auto text-center py-0 px-4 sm:px-[16px]">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 leading-tight">Ready to Start Learning?</h2>
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
          Begin your English learning journey with our interactive and fun tools designed for students of all levels.
        </p>
        <DoodleButton
          color="purple"
          size="lg"
          onClick={handleNavigation("/subjects")}
          fullWidth={true}
          className="sm:w-auto max-w-xs mx-auto"
        >
          Get Started Now
        </DoodleButton>
      </div>
    </section>
  );
};

export default CallToActionSection;
