
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

type DoodleCardProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  color?: 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'orange' | 'pink';
  to?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
  children?: React.ReactNode;
};

const colorClasses = {
  green: 'border-kid-green hover:shadow-kid-green/50',
  blue: 'border-kid-blue hover:shadow-kid-blue/50',
  red: 'border-kid-red hover:shadow-kid-red/50',
  yellow: 'border-kid-yellow hover:shadow-kid-yellow/50',
  purple: 'border-kid-purple hover:shadow-kid-purple/50',
  orange: 'border-kid-orange hover:shadow-kid-orange/50',
  pink: 'border-kid-pink hover:shadow-kid-pink/50'
};

const DoodleCard = ({
  title,
  description,
  icon,
  color = 'blue',
  to,
  onClick,
  className,
  children
}: DoodleCardProps) => {
  const navigate = useNavigate();
  
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      onClick(e);
      return;
    }
    
    if (to) {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <div
      className={cn(
        'card-doodle flex flex-col p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:scale-105 min-h-[120px] sm:min-h-[140px] text-center',
        colorClasses[color],
        className
      )}
      onClick={handleCardClick}
    >
      <div className="flex flex-col items-center mb-3 sm:mb-4">
        {icon && (
          <div className={`text-${color === 'yellow' ? 'kid-orange' : `kid-${color}`} mb-2 flex-shrink-0`}>
            {icon}
          </div>
        )}
        <h3 className="text-lg sm:text-xl font-bold leading-tight">{title}</h3>
      </div>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed flex-grow">{description}</p>
      {children}
    </div>
  );
};

export default DoodleCard;
