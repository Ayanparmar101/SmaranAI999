import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  animationType?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale";
  trigger?: "scroll" | "immediate";
  stagger?: number;
  onComplete?: () => void;
}

const AnimatedText = ({
  text,
  className = "",
  delay = 0,
  duration = 0.8,
  ease = "power3.out",
  animationType = "fadeUp",
  trigger = "scroll",
  stagger = 0.1,
  onComplete,
}: AnimatedTextProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Split text into characters manually
    const chars = text.split("").map((char, index) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char; // Non-breaking space
      span.style.display = "inline-block";
      span.style.willChange = "transform, opacity";
      return span;
    });

    // Clear element and add character spans
    el.innerHTML = "";
    chars.forEach(char => el.appendChild(char));

    // Animation configurations
    const animations = {
      fadeUp: {
        from: { opacity: 0, y: 50, rotationX: 90 },
        to: { opacity: 1, y: 0, rotationX: 0 }
      },
      fadeIn: {
        from: { opacity: 0, scale: 0.8 },
        to: { opacity: 1, scale: 1 }
      },
      slideLeft: {
        from: { opacity: 0, x: 100 },
        to: { opacity: 1, x: 0 }
      },
      slideRight: {
        from: { opacity: 0, x: -100 },
        to: { opacity: 1, x: 0 }
      },
      scale: {
        from: { opacity: 0, scale: 0, rotation: 180 },
        to: { opacity: 1, scale: 1, rotation: 0 }
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
      className={`animated-text ${className}`}
      style={{
        overflow: "hidden",
        display: "inline-block",
      }}
    />
  );
};

export default AnimatedText;
