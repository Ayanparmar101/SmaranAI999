import React from 'react';

interface SmaranLogoProps {
  className?: string;
  size?: number;
}

const SmaranLogo: React.FC<SmaranLogoProps> = ({ className = "", size = 100 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Question mark */}
      <path
        d="M200 40 C220 40, 240 50, 250 70 C260 90, 250 110, 230 120 L220 125 C210 130, 205 135, 205 145 L205 155"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Question mark dot */}
      <circle
        cx="205"
        cy="175"
        r="6"
        fill="currentColor"
      />
      
      {/* Head circle */}
      <circle
        cx="200"
        cy="120"
        r="45"
        stroke="currentColor"
        strokeWidth="12"
        fill="none"
      />
      
      {/* Body */}
      <path
        d="M200 165 L200 320 C200 340, 185 355, 165 355 C145 355, 130 340, 130 320 L130 300"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Arms/Hands holding something */}
      <path
        d="M155 200 C140 190, 120 195, 115 210 C110 225, 125 235, 140 230 L155 225"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      <path
        d="M245 200 C260 190, 280 195, 285 210 C290 225, 275 235, 260 230 L245 225"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Heart or book shape in hands */}
      <path
        d="M170 210 C170 200, 180 195, 190 200 C200 195, 210 200, 210 210 C210 220, 200 230, 190 240 C180 230, 170 220, 170 210 Z"
        stroke="currentColor"
        strokeWidth="8"
        fill="none"
      />
    </svg>
  );
};

export default SmaranLogo;
