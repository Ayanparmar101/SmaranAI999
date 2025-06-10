import React, { memo, useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';
import { useAuth } from '@/contexts/AuthContext';

const TimeTrackingIndicator: React.FC = memo(() => {
  const { isActive, dailyTimeSpent, sessionStartTime } = useTimeTracking();
  const { isAuthenticated } = useAuth();
  const [currentSessionTime, setCurrentSessionTime] = useState(0);

  // Local timer for current session display (to avoid context re-renders)
  useEffect(() => {
    if (isActive && sessionStartTime) {
      const timer = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - sessionStartTime) / 1000);
        setCurrentSessionTime(elapsed);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setCurrentSessionTime(0);
    }
  }, [isActive, sessionStartTime]);
  if (!isAuthenticated) {
    return null;
  }

  // Format time locally to avoid context dependency
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const totalDailyTime = dailyTimeSpent + currentSessionTime;
  const dailyTimeFormatted = formatTime(totalDailyTime);

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-sm">
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
      <Clock className="w-4 h-4 text-muted-foreground" />      <span className="text-muted-foreground font-mono text-xs">
        {dailyTimeFormatted}
      </span>
      {isActive && (
        <span className="text-green-600 font-mono text-xs ml-1">
          LIVE
        </span>
      )}
    </div>  );
});

export default TimeTrackingIndicator;
