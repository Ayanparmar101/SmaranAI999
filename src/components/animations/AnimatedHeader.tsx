import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedText from "./AnimatedText";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  animationType?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale";
  delay?: number;
  showBackground?: boolean;
}

const AnimatedHeader = ({
  title,
  subtitle,
  className = "",
  titleClassName = "",
  subtitleClassName = "",
  animationType = "fadeUp",
  delay = 0,
  showBackground = true,
}: AnimatedHeaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const background = backgroundRef.current;
    
    if (!container) return;

    // Animate container entrance
    gsap.fromTo(
      container,
      { 
        opacity: 0, 
        y: 50,
        scale: 0.9 
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        delay: delay,
      }
    );

    // Animate background if present
    if (background && showBackground) {
      gsap.fromTo(
        background,
        { 
          scaleX: 0,
          transformOrigin: "left center"
        },
        {
          scaleX: 1,
          duration: 1,
          ease: "power3.out",
          delay: delay + 0.3,
        }
      );
    }

    // Scroll-triggered animations
    ScrollTrigger.create({
      trigger: container,
      start: "top 90%",
      end: "bottom 10%",
      onEnter: () => {
        gsap.to(container, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out"
        });
      },
      onLeave: () => {
        gsap.to(container, {
          y: -20,
          opacity: 0.8,
          duration: 0.3,
          ease: "power2.out"
        });
      },
      onEnterBack: () => {
        gsap.to(container, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out"
        });
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [delay, showBackground]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Background decoration */}
      {showBackground && (
        <div
          ref={backgroundRef}
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg -z-10"
        />
      )}
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl -z-10" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-lg -z-10" />

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Main Title */}
        <AnimatedText
          text={title}
          className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${titleClassName}`}
          animationType={animationType}
          trigger="scroll"
          delay={delay + 0.5}
          stagger={0.08}
        />

        {/* Subtitle */}
        {subtitle && (
          <AnimatedText
            text={subtitle}
            className={`text-lg md:text-xl text-gray-600 dark:text-gray-300 ${subtitleClassName}`}
            animationType="fadeIn"
            trigger="scroll"
            delay={delay + 1}
            stagger={0.04}
          />
        )}

        {/* Animated underline */}
        <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform origin-left scale-x-0 animate-[scaleX_0.8s_ease-out_forwards] delay-1000" />
      </div>
    </div>
  );
};

export default AnimatedHeader;
