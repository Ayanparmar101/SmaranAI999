import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface GradientAnimatedTextProps {
  text: string;
  className?: string;
  gradientClass?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  animationType?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale";
  trigger?: "scroll" | "immediate";
  stagger?: number;
  onComplete?: () => void;
}

const GradientAnimatedText = ({
  text,
  className = "",
  gradientClass = "gradient-text-animated-slow",
  delay = 0,
  duration = 0.8,
  ease = "power3.out",
  animationType = "fadeUp",
  trigger = "scroll",
  stagger = 0.1,
  onComplete,
}: GradientAnimatedTextProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Split text into characters manually
    const chars = text.split("").map((char, index) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char; // Non-breaking space
      span.style.display = "inline-block";
      span.style.willChange = "transform";
      // Don't set opacity for gradient text as it conflicts with -webkit-text-fill-color: transparent
      return span;
    });

    // Clear element and add character spans
    el.innerHTML = "";
    chars.forEach(char => el.appendChild(char));

    // Animation configurations - don't use opacity for gradient text
    const animations = {
      fadeUp: {
        from: { y: 50, rotationX: 90, scale: 0.8 },
        to: { y: 0, rotationX: 0, scale: 1 }
      },
      fadeIn: {
        from: { scale: 0.8 },
        to: { scale: 1 }
      },
      slideLeft: {
        from: { x: 100 },
        to: { x: 0 }
      },
      slideRight: {
        from: { x: -100 },
        to: { x: 0 }
      },
      scale: {
        from: { scale: 0, rotation: 180 },
        to: { scale: 1, rotation: 0 }
      }
    };

    const { from, to } = animations[animationType];

    const tl = gsap.timeline({
      delay,
      onComplete,
    });

    // Set initial state
    tl.set(chars, { ...from, force3D: true });

    if (trigger === "immediate") {
      // Immediate animation
      tl.to(chars, {
        ...to,
        duration,
        ease,
        stagger,
        force3D: true,
      });
    } else {
      // Scroll-triggered animation
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        toggleActions: "play none none none",
        once: true,
        onEnter: () => {
          gsap.to(chars, {
            ...to,
            duration,
            ease,
            stagger,
            force3D: true,
          });
        }
      });
    }

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.killTweensOf(chars);
    };
  }, [text, delay, duration, ease, animationType, trigger, stagger, onComplete]);

  return (
    <div
      ref={ref}
      className={`${gradientClass} ${className}`}
      style={{
        overflow: "hidden",
        display: "inline-block",
      }}
    />
  );
};

export default GradientAnimatedText;
