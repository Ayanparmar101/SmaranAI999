import React from 'react';
import { useNavigate } from 'react-router-dom';
import DoodleButton from '@/components/DoodleButton';
import DoodleDecoration from '@/components/DoodleDecoration';
import { Flag } from 'lucide-react'; // Hindi icon

const HindiHeroSection = () => {
  const navigate = useNavigate();

  const scrollToTools = (e: React.MouseEvent) => {
    e.preventDefault();
    const toolsSection = document.getElementById('hindi-tools-section');
    toolsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-12 md:py-20 overflow-hidden bg-background">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="block text-foreground">हिंदी सीखें</span>
              <span className="gradient-text-animated-slow">
                मज़ेदार तरीके से!
              </span>
            </h1>
            <p className="text-xl mb-8 text-muted-foreground">
              इंटरैक्टिव पाठों और एआई ट्यूटर की मदद से हिंदी भाषा में महारत हासिल करें।
              (Master the Hindi language with interactive lessons and AI tutors.)
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <DoodleButton 
                color="orange" 
                size="lg" 
                onClick={scrollToTools} 
              >
                साधन देखें (Explore Tools)
              </DoodleButton>
            </div>
          </div>
          <div className="md:w-1/2 relative flex justify-center">
            <div className="relative w-3/4 md:w-full max-w-md">
              <img
                alt="Hindi learning illustration"
                src="/assets/SocialScienceIMG.png"
                className="rounded-3xl shadow-lg object-contain aspect-square"
              />
              <div className="absolute -top-6 -right-6">
                <DoodleDecoration type="star" color="yellow" size="lg" />
              </div>
              {/* Changed decoration to heart */}
              <div className="absolute -bottom-6 -left-6">
                <DoodleDecoration type="heart" color="red" size="lg" /> 
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-20 left-10 opacity-10 dark:opacity-20 -z-10">
        <DoodleDecoration type="dots" color="orange" size="xl" /> 
      </div>
      <div className="absolute bottom-20 right-10 opacity-10 dark:opacity-20 -z-10">
        <DoodleDecoration type="swirl" color="red" size="xl" />
      </div>
    </section>
  );
};

export default HindiHeroSection;
