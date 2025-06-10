import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DoodleButton from '@/components/DoodleButton';
import { BookOpen, Brain, Users, Zap } from 'lucide-react';
import { AnimatedText, AnimatedCard, ScrollReveal } from '@/components/animations';
import { gsap } from 'gsap';

const LandingHeroSection = () => {
  const navigate = useNavigate();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById('features-section');
    featuresSection?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const title = titleRef.current;
    const subtitle = subtitleRef.current;

    if (title && subtitle) {
      // Set initial state - make sure text is visible
      gsap.set([title, subtitle], { opacity: 1, y: 0 });

      // Simple fade in animation
      gsap.fromTo(title,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          delay: 0.5
        }
      );

      gsap.fromTo(subtitle,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          delay: 1.2
        }
      );
    }
  }, []);

  return (
    <section className="relative py-12 sm:py-16 md:py-24 overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-kid-blue/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-kid-purple/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-kid-green/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-kid-yellow/10 rounded-full blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-kid-blue/10 text-kid-blue rounded-full text-sm font-medium mb-4">
                🚀 AI-Powered Learning Platform
              </span>
            </div>
            
            <h1 ref={titleRef} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block text-foreground">Transform Your</span>
              <span className="gradient-text-animated-slow block">
                Learning Journey
              </span>
            </h1>

            <div ref={subtitleRef} className="text-lg sm:text-xl md:text-2xl mb-8 text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Unlock your potential with our comprehensive AI-powered educational platform.
              From interactive flashcards to personalized study plans, we make learning engaging and effective.
            </div>

            {/* Key Benefits */}
            <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-2 text-sm">
                <Brain className="w-5 h-5 text-kid-purple" />
                <span>AI-Powered Tutoring</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-5 h-5 text-kid-blue" />
                <span>Interactive Learning</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-5 h-5 text-kid-green" />
                <span>Teacher Tools</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-5 h-5 text-kid-yellow" />
                <span>Instant Results</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <DoodleButton
                color="blue"
                size="lg"
                onClick={handleGetStarted}
                className="min-w-[200px]"
              >
                Start Learning Free
              </DoodleButton>
              <DoodleButton
                color="purple"
                size="lg"
                variant="outline"
                onClick={handleLearnMore}
                className="min-w-[200px]"
              >
                Explore Features
              </DoodleButton>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">Trusted by students worldwide</p>
              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-kid-green rounded-full"></div>
                  <span>100+ Active Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-kid-blue rounded-full"></div>
                  <span>20+ Learning Tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-kid-purple rounded-full"></div>
                  <span>24/7 AI Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image/Illustration */}
          <div className="lg:w-1/2 relative">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Main illustration container */}
              <div className="relative bg-gradient-to-br from-kid-blue/10 to-kid-purple/10 rounded-3xl p-8 border-4 border-dashed border-kid-blue/30">
                <div className="grid grid-cols-2 gap-4">
                  {/* Feature preview cards */}
                  <AnimatedCard
                    className="border-2 border-kid-green p-4"
                    delay={2.5}
                    animationType="fadeUp"
                    hoverEffect={true}
                    glowEffect={true}
                  >
                    <BookOpen className="w-8 h-8 text-kid-green mb-2" />
                    <h4 className="font-bold text-sm text-foreground">Flashcards</h4>
                    <p className="text-xs text-muted-foreground">Smart learning</p>
                  </AnimatedCard>

                  <AnimatedCard
                    className="border-2 border-kid-purple p-4"
                    delay={2.7}
                    animationType="fadeUp"
                    hoverEffect={true}
                    glowEffect={true}
                  >
                    <Brain className="w-8 h-8 text-kid-purple mb-2" />
                    <h4 className="font-bold text-sm text-foreground">AI Tutor</h4>
                    <p className="text-xs text-muted-foreground">Personal guide</p>
                  </AnimatedCard>

                  <AnimatedCard
                    className="border-2 border-kid-yellow p-4"
                    delay={2.9}
                    animationType="fadeUp"
                    hoverEffect={true}
                    glowEffect={true}
                  >
                    <Users className="w-8 h-8 text-kid-yellow mb-2" />
                    <h4 className="font-bold text-sm text-foreground">Study Groups</h4>
                    <p className="text-xs text-muted-foreground">Collaborate</p>
                  </AnimatedCard>

                  <AnimatedCard
                    className="border-2 border-kid-red p-4"
                    delay={3.1}
                    animationType="fadeUp"
                    hoverEffect={true}
                    glowEffect={true}
                  >
                    <Zap className="w-8 h-8 text-kid-red mb-2" />
                    <h4 className="font-bold text-sm text-foreground">Quick Tests</h4>
                    <p className="text-xs text-muted-foreground">Instant feedback</p>
                  </AnimatedCard>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-kid-yellow rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-kid-green rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Reveal Section */}
        <div className="mt-24 text-center">
          <ScrollReveal
            element="h2"
            containerClassName="text-3xl md:text-4xl lg:text-5xl font-bold mb-8"
            textClassName="text-gray-900 dark:text-white"
            enableBlur={true}
            baseOpacity={0.2}
            baseRotation={3}
            blurStrength={4}
          >
            Experience the Future of Learning
          </ScrollReveal>

          <ScrollReveal
            element="p"
            containerClassName="text-lg md:text-xl max-w-3xl mx-auto"
            textClassName="text-muted-foreground"
            enableBlur={false}
            baseOpacity={0.3}
            baseRotation={-2}
          >
            Join thousands of students who are already transforming their educational journey with our AI-powered platform
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default LandingHeroSection;
