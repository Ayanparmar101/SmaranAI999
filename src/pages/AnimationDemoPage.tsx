import React from 'react';
import {
  AnimatedText,
  AnimatedHeader,
  AnimatedCard,
  LoadingScreen,
  ScrollReveal
} from '@/components/animations';
import { BookOpen, Brain, Users, Zap, Star, Trophy, Target } from 'lucide-react';
import { useState } from 'react';

const AnimationDemoPage = () => {
  const [showLoadingDemo, setShowLoadingDemo] = useState(false);

  const handleLoadingDemo = () => {
    setShowLoadingDemo(true);
    setTimeout(() => setShowLoadingDemo(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {showLoadingDemo && (
        <LoadingScreen 
          onComplete={() => setShowLoadingDemo(false)} 
          duration={2500} 
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <AnimatedHeader
          title="GSAP Animation Showcase"
          subtitle="Experience smooth, professional animations powered by GSAP"
          className="mb-12"
          showBackground={true}
        />

        {/* Animation Types Demo */}
        <section className="mb-16">
          <AnimatedText
            text="Different Animation Types"
            className="text-2xl font-bold mb-8 text-center"
            animationType="fadeUp"
            trigger="scroll"
            stagger={0.1}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatedCard
              title="Fade Up Animation"
              content="This card animates with a smooth fade up effect, perfect for revealing content as users scroll."
              delay={0.1}
              animationType="fadeUp"
              hoverEffect={true}
            >
              <BookOpen className="w-8 h-8 text-blue-500 mt-4" />
            </AnimatedCard>

            <AnimatedCard
              title="Scale Animation"
              content="Watch this card scale in with a bouncy effect that draws attention to important content."
              delay={0.3}
              animationType="scale"
              hoverEffect={true}
              glowEffect={true}
            >
              <Brain className="w-8 h-8 text-purple-500 mt-4" />
            </AnimatedCard>

            <AnimatedCard
              title="Slide Left Animation"
              content="This card slides in from the right, creating a dynamic entrance effect."
              delay={0.5}
              animationType="slideLeft"
              hoverEffect={true}
            >
              <Users className="w-8 h-8 text-green-500 mt-4" />
            </AnimatedCard>

            <AnimatedCard
              title="Slide Right Animation"
              content="This card slides in from the left, perfect for alternating layouts."
              delay={0.7}
              animationType="slideRight"
              hoverEffect={true}
              glowEffect={true}
            >
              <Zap className="w-8 h-8 text-yellow-500 mt-4" />
            </AnimatedCard>

            <AnimatedCard
              title="Fade In Animation"
              content="A simple but elegant fade in effect that works great for subtle reveals."
              delay={0.9}
              animationType="fadeIn"
              hoverEffect={true}
            >
              <Star className="w-8 h-8 text-pink-500 mt-4" />
            </AnimatedCard>

            <AnimatedCard
              title="Interactive Hover"
              content="All cards feature smooth hover effects with GSAP-powered transforms."
              delay={1.1}
              animationType="fadeUp"
              hoverEffect={true}
              glowEffect={true}
            >
              <Trophy className="w-8 h-8 text-orange-500 mt-4" />
            </AnimatedCard>
          </div>
        </section>

        {/* Text Animation Demo */}
        <section className="mb-16">
          <AnimatedText
            text="Character-by-Character Text Animations"
            className="text-2xl font-bold mb-8 text-center"
            animationType="scale"
            trigger="scroll"
            stagger={0.08}
          />

          <div className="space-y-8 text-center">
            <AnimatedText
              text="This text animates character by character with a fade up effect"
              className="text-lg text-gray-600 dark:text-gray-300"
              animationType="fadeUp"
              trigger="scroll"
              stagger={0.05}
            />

            <AnimatedText
              text="Watch each letter scale in with perfect timing"
              className="text-xl font-semibold text-blue-600"
              animationType="scale"
              trigger="scroll"
              stagger={0.06}
            />

            <AnimatedText
              text="Slide animations create dynamic text reveals"
              className="text-lg text-purple-600"
              animationType="slideLeft"
              trigger="scroll"
              stagger={0.04}
            />
          </div>
        </section>

        {/* Loading Screen Demo */}
        <section className="mb-16">
          <AnimatedText
            text="Loading Screen Demo"
            className="text-2xl font-bold mb-8 text-center"
            animationType="fadeIn"
            trigger="scroll"
            stagger={0.1}
          />

          <div className="text-center">
            <button
              onClick={handleLoadingDemo}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Show Loading Animation
            </button>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              Click to see the full-screen loading animation with GSAP effects
            </p>
          </div>
        </section>

        {/* Performance Features */}
        <section className="mb-16">
          <AnimatedHeader
            title="Performance Optimized"
            subtitle="Built with GSAP for smooth 60fps animations"
            className="mb-8"
            delay={0.2}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatedCard
              title="Hardware Acceleration"
              content="All animations use force3D and will-change properties for optimal performance."
              delay={0.3}
              animationType="slideRight"
              hoverEffect={true}
            >
              <Target className="w-8 h-8 text-green-500 mt-4" />
            </AnimatedCard>

            <AnimatedCard
              title="Scroll-Triggered"
              content="Animations trigger when elements come into view, reducing unnecessary processing."
              delay={0.5}
              animationType="slideLeft"
              hoverEffect={true}
              glowEffect={true}
            >
              <Zap className="w-8 h-8 text-blue-500 mt-4" />
            </AnimatedCard>
          </div>
        </section>

        {/* Scroll Reveal Demo */}
        <section className="mb-16">
          <AnimatedText
            text="Scroll Reveal Effects"
            className="text-2xl font-bold mb-8 text-center"
            animationType="fadeUp"
            trigger="scroll"
            stagger={0.1}
          />

          <div className="space-y-12">
            <ScrollReveal
              containerClassName="text-4xl md:text-5xl lg:text-6xl font-bold text-center"
              textClassName="text-gray-900 dark:text-white"
              enableBlur={true}
              baseOpacity={0.2}
              baseRotation={5}
              blurStrength={6}
            >
              This text reveals with rotation and blur effects as you scroll
            </ScrollReveal>

            <ScrollReveal
              element="h3"
              containerClassName="text-3xl md:text-4xl font-semibold text-center"
              textClassName="text-blue-600 dark:text-blue-400"
              enableBlur={false}
              baseOpacity={0.1}
              baseRotation={-3}
            >
              This one uses only opacity and rotation without blur
            </ScrollReveal>

            <ScrollReveal
              element="p"
              containerClassName="text-xl md:text-2xl text-center max-w-4xl mx-auto"
              textClassName="text-purple-600 dark:text-purple-400"
              enableBlur={true}
              baseOpacity={0.3}
              baseRotation={2}
              blurStrength={3}
            >
              Each word animates individually creating a beautiful staggered reveal effect that responds to your scroll position in real-time
            </ScrollReveal>
          </div>
        </section>

        {/* Usage Instructions */}
        <section>
          <AnimatedText
            text="Easy to Use Components"
            className="text-2xl font-bold mb-8 text-center"
            animationType="fadeUp"
            trigger="scroll"
            stagger={0.1}
          />

          <AnimatedCard
            className="max-w-4xl mx-auto"
            delay={0.3}
            animationType="fadeUp"
            hoverEffect={false}
          >
            <div className="prose dark:prose-invert max-w-none">
              <h3>How to Use These Animations</h3>
              <ul>
                <li><strong>AnimatedText:</strong> For character-by-character text animations</li>
                <li><strong>AnimatedHeader:</strong> For page headers with background effects</li>
                <li><strong>AnimatedCard:</strong> For content cards with entrance animations</li>
                <li><strong>LoadingScreen:</strong> For full-screen loading experiences</li>
                <li><strong>ScrollReveal:</strong> For scroll-triggered word-by-word reveals with rotation and blur</li>
              </ul>
              <p>
                All components support customizable timing, easing, and animation types.
                They're optimized for performance and work seamlessly with your existing styles.
              </p>
            </div>
          </AnimatedCard>
        </section>
      </div>
    </div>
  );
};

export default AnimationDemoPage;
