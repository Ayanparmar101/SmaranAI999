import { useRef, useEffect, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedText from "./AnimatedText";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedCardProps {
  title?: string;
  content?: string;
  children?: ReactNode;
  className?: string;
  delay?: number;
  animationType?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale";
  hoverEffect?: boolean;
  glowEffect?: boolean;
}

const AnimatedCard = ({
  title,
  content,
  children,
  className = "",
  delay = 0,
  animationType = "fadeUp",
  hoverEffect = true,
  glowEffect = false,
}: AnimatedCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Initial animation based on type
    const animations = {
      fadeUp: {
        from: { opacity: 0, y: 60, rotationX: 15 },
        to: { opacity: 1, y: 0, rotationX: 0 }
      },
      fadeIn: {
        from: { opacity: 0, scale: 0.8 },
        to: { opacity: 1, scale: 1 }
      },
      slideLeft: {
        from: { opacity: 0, x: 100, rotationY: 15 },
        to: { opacity: 1, x: 0, rotationY: 0 }
      },
      slideRight: {
        from: { opacity: 0, x: -100, rotationY: -15 },
        to: { opacity: 1, x: 0, rotationY: 0 }
      },
      scale: {
        from: { opacity: 0, scale: 0, rotation: 10 },
        to: { opacity: 1, scale: 1, rotation: 0 }
      }
    };

    const { from, to } = animations[animationType];

    // Set initial state
    gsap.set(card, { ...from, force3D: true });

    // Scroll-triggered animation
    ScrollTrigger.create({
      trigger: card,
      start: "top 85%",
      toggleActions: "play none none none",
      once: true,
      onEnter: () => {
        gsap.to(card, {
          ...to,
          duration: 0.8,
          ease: "power3.out",
          delay: delay,
          force3D: true,
        });
      }
    });

    // Hover effects
    if (hoverEffect) {
      const handleMouseEnter = () => {
        gsap.to(card, {
          y: -8,
          scale: 1.02,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          duration: 0.3,
          ease: "power2.out"
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          duration: 0.3,
          ease: "power2.out"
        });
      };

      card.addEventListener("mouseenter", handleMouseEnter);
      card.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        card.removeEventListener("mouseenter", handleMouseEnter);
        card.removeEventListener("mouseleave", handleMouseLeave);
        ScrollTrigger.getAll().forEach(st => st.kill());
      };
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [delay, animationType, hoverEffect]);

  return (
    <div
      ref={cardRef}
      className={`
        relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 
        shadow-lg border border-gray-200 dark:border-gray-700
        transition-all duration-300 cursor-pointer
        ${glowEffect ? 'hover:shadow-2xl hover:shadow-blue-500/20' : ''}
        ${className}
      `}
    >
      {/* Glow effect */}
      {glowEffect && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}

      {/* Decorative corner elements */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-tr-full" />

      {/* Content */}
      <div className="relative z-10 p-6">
        {title && (
          <AnimatedText
            text={title}
            className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-white"
            animationType="fadeIn"
            trigger="scroll"
            delay={delay + 0.2}
            stagger={0.05}
          />
        )}

        {content && (
          <AnimatedText
            text={content}
            className="text-gray-600 dark:text-gray-300 leading-relaxed"
            animationType="fadeIn"
            trigger="scroll"
            delay={delay + 0.4}
            stagger={0.02}
          />
        )}

        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>

      {/* Animated border */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10" 
           style={{ 
             background: 'linear-gradient(white, white) padding-box, linear-gradient(45deg, #3b82f6, #8b5cf6) border-box',
             backgroundClip: 'padding-box, border-box'
           }} />
    </div>
  );
};

export default AnimatedCard;
