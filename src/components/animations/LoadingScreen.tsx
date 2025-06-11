import { useEffect, useState } from "react";
import { gsap } from "gsap";
import AnimatedText from "./AnimatedText";

interface LoadingScreenProps {
  onComplete?: () => void;
  duration?: number;
}

const LoadingScreen = ({ onComplete, duration = 3000 }: LoadingScreenProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content after a brief delay
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 200);

    // Complete loading after specified duration
    const completeTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, duration]);

  useEffect(() => {
    if (showContent) {
      // Animate the background
      gsap.fromTo(
        ".loading-bg",
        { 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
        },
        {
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          duration: 2,
          ease: "power2.inOut",
        }
      );

      // Animate the logo container
      gsap.fromTo(
        ".logo-container",
        { scale: 0, rotation: -180, opacity: 0 },
        { 
          scale: 1, 
          rotation: 0, 
          opacity: 1, 
          duration: 1, 
          ease: "back.out(1.7)",
          delay: 0.5 
        }
      );

      // Animate the progress bar
      gsap.fromTo(
        ".progress-fill",
        { width: "0%" },
        { 
          width: "100%", 
          duration: duration / 1000 - 0.5, 
          ease: "power2.out",
          delay: 1
        }
      );
    }
  }, [showContent, duration]);

  if (!showContent) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="loading-bg fixed inset-0 flex flex-col items-center justify-center z-50 text-white">
      {/* Logo Container */}
      <div className="logo-container mb-8">
        <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-2xl p-6 border-4 border-white">
          <img
            src="/android-chrome-192x192.png"
            alt="Smaran.ai Logo"
            className="w-full h-full object-contain bg-white rounded-lg"
          />
        </div>
      </div>

      {/* Main Title */}
      <div className="text-center mb-6">
        <AnimatedText
          text="Smaran.ai"
          className="text-5xl md:text-6xl font-bold mb-2"
          animationType="fadeUp"
          trigger="immediate"
          delay={1}
          stagger={0.1}
        />
        <AnimatedText
          text="AI-Powered Learning Platform"
          className="text-xl md:text-2xl font-light opacity-90"
          animationType="fadeIn"
          trigger="immediate"
          delay={2}
          stagger={0.05}
        />
      </div>

      {/* Loading Progress */}
      <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mb-4">
        <div className="progress-fill h-full bg-white rounded-full"></div>
      </div>

      {/* Loading Text */}
      <AnimatedText
        text="Initializing your learning experience..."
        className="text-sm opacity-75"
        animationType="fadeIn"
        trigger="immediate"
        delay={1.5}
        stagger={0.03}
      />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
