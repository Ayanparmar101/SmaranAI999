
import React from 'react';
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface CircularTimerProps {
  timeLeft: number;
  totalTime: number;
  isBreak: boolean;
}

const CircularTimer: React.FC<CircularTimerProps> = ({ timeLeft, totalTime, isBreak }) => {
  // Calculate percentage of time remaining
  const percentage = (timeLeft / totalTime) * 100;
  
  // Determine color based on time remaining
  const getProgressColor = () => {
    if (isBreak) return "#4E9BF5"; // Blue for break time
    
    if (percentage > 60) return "#76D394"; // Green when > 60% time left
    if (percentage > 30) return "#F9CB40"; // Yellow when > 30% time left
    return "#F87171"; // Red when < 30% time left
  };

  // Calculate the stroke-dasharray and stroke-dashoffset for the SVG circle
  const circleRadius = 120;
  const circumference = 2 * Math.PI * circleRadius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-64 h-64 mx-auto mb-8">
      {/* SVG for the progress circle */}
      <svg className="w-full h-full -rotate-90 absolute" viewBox="0 0 256 256">
        {/* Background circle */}
        <circle
          cx="128"
          cy="128"
          r={circleRadius}
          fill="none"
          strokeWidth="8"
          className="stroke-gray-200 dark:stroke-gray-700"
        />
        
        {/* Progress circle */}
        <circle
          cx="128"
          cy="128"
          r={circleRadius}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          style={{
            stroke: getProgressColor(),
            strokeDasharray: circumference,
            strokeDashoffset: dashOffset,
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease'
          }}
        />
      </svg>
      
      {/* Inner circle with time display */}
      <div className="absolute flex flex-col items-center justify-center w-[75%] h-[75%] bg-card rounded-full border-3 border-black shadow-neo z-10">
        <Clock size={30} className="mb-2" />
        <div className="text-4xl font-bold font-mono tracking-wider">
          {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
          {(timeLeft % 60).toString().padStart(2, '0')}
        </div>
        <div className="text-sm font-medium text-muted-foreground mt-1">
          {Math.floor(percentage)}% remaining
        </div>
      </div>
    </div>
  );
};

export default CircularTimer;
