
import React from 'react';
import { cn } from '@/lib/utils';

// Create props interface for the component
interface DoodleDecorationProps {
  type: 'star' | 'cloud' | 'heart' | 'circle' | 'squiggle';
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'pink' | 'orange';
  className?: string;
  animated?: boolean;
}

// Component for decorative doodle elements
const DoodleDecoration: React.FC<DoodleDecorationProps> = ({ 
  type, 
  size = 'md', 
  color = 'blue',
  className,
  animated = true 
}) => {
  // Size mapping
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  // Color mapping to tailwind kid color classes
  const colorClasses = {
    blue: 'text-kid-blue',
    green: 'text-kid-green',
    yellow: 'text-kid-yellow',
    red: 'text-kid-red',
    purple: 'text-kid-purple',
    pink: 'text-kid-pink',
    orange: 'text-kid-orange'
  };
  
  // Animation mapping
  const animationClass = animated ? 'animate-float' : '';
  
  // SVG paths for different doodle types
  const renderDoodle = () => {
    switch (type) {
      case 'star':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="https://www.w3.org/2000/svg" className={cn(sizeClasses[size], colorClasses[color], animationClass, className)}>
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'cloud':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="https://www.w3.org/2000/svg" className={cn(sizeClasses[size], colorClasses[color], animationClass, className)}>
            <path d="M18 10H16.74C16.3659 8.551 15.5783 7.26141 14.4688 6.3152C13.3594 5.36899 11.9848 4.8156 10.5496 4.74033C9.11436 4.66505 7.69147 5.07188 6.50061 5.89723C5.30974 6.72258 4.41894 7.921 3.9824 9.3C3.01909 9.39783 2.11298 9.8226 1.41799 10.5076C0.722993 11.1926 0.279612 12.0937 0.159288 13.0602C0.0389632 14.0267 0.248802 15.0074 0.754864 15.8435C1.26093 16.6796 2.03526 17.3258 2.94 17.68C2.97553 17.6939 3.01203 17.7046 3.05 17.7123C3.87738 18.0378 4.77095 18.0691 5.61534 17.8021C6.45973 17.535 7.21713 16.9845 7.78 16.24C8.2564 16.7215 8.83062 17.0964 9.46486 17.3427C10.0991 17.589 10.7788 17.701 11.46 17.67C12.1467 17.703 12.8329 17.5924 13.4737 17.346C14.1146 17.0996 14.6956 16.7223 15.178 16.237C15.6246 16.8281 16.2155 17.2935 16.8932 17.5892C17.5708 17.8849 18.312 18.001 19.048 17.9248C19.7841 17.8486 20.4871 17.583 21.0894 17.1537C21.6917 16.7243 22.1707 16.1461 22.475 15.4783C22.7793 14.8105 22.8983 14.0762 22.8194 13.3502C22.7404 12.6243 22.4661 11.9318 22.0253 11.3402C21.5844 10.7486 20.9934 10.2792 20.3131 9.97839C19.6328 9.67757 18.8856 9.55392 18.15 9.62C18.0986 9.62664 18.0494 9.64347 18.0066 9.66918C17.9638 9.69489 17.929 9.72873 17.905 9.77L18 10Z" fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'heart':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="https://www.w3.org/2000/svg" className={cn(sizeClasses[size], colorClasses[color], animationClass, className)}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'circle':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="https://www.w3.org/2000/svg" className={cn(sizeClasses[size], colorClasses[color], animationClass, className)}>
            <circle cx="12" cy="12" r="10" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'squiggle':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="https://www.w3.org/2000/svg" className={cn(sizeClasses[size], colorClasses[color], animationClass, className)}>
            <path d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="pointer-events-none">
      {renderDoodle()}
    </div>
  );
};

export default DoodleDecoration;
