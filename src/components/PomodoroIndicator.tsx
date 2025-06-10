import React from 'react';
import { Timer, Clock, Bell } from 'lucide-react';
import { usePomodoro } from '@/contexts/PomodoroContext';
import { Badge } from '@/components/ui/badge';

const PomodoroIndicator = () => {
  const { timeLeft, status, sessionType, formatTime } = usePomodoro();

  if (status === 'stopped') {
    return null;
  }

  const getSessionIcon = () => {
    switch (sessionType) {
      case 'focus':
        return <Timer className="w-4 h-4 text-green-500" />;
      case 'shortBreak':
        return <Bell className="w-4 h-4 text-blue-500" />;
      case 'longBreak':
        return <Bell className="w-4 h-4 text-purple-500" />;
      default:
        return <Timer className="w-4 h-4 text-green-500" />;
    }
  };

  const getSessionLabel = () => {
    switch (sessionType) {
      case 'focus':
        return 'Focus';
      case 'shortBreak':
        return 'Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-full">
      {getSessionIcon()}
      <span className="text-sm font-mono font-medium">
        {formatTime(timeLeft)}
      </span>
      <Badge variant="outline" className="text-xs px-1 py-0">
        {getSessionLabel()}
      </Badge>
      {status === 'paused' && (
        <Badge variant="secondary" className="text-xs px-1 py-0">
          Paused
        </Badge>
      )}
    </div>
  );
};

export default PomodoroIndicator;
