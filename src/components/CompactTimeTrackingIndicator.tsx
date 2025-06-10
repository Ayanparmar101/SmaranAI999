import React from 'react';
import { useTimeTracking } from '@/contexts/AutoTimeTrackingContext';
import { Clock, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const CompactTimeTrackingIndicator: React.FC = () => {
  const {
    getTotalFormatted,
    getSessionFormatted,
    isTracking
  } = useTimeTracking();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 px-3 py-2 ${
              isTracking 
                ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <Clock className="w-4 h-4" />            <span className="font-mono text-sm">
              {isTracking ? getSessionFormatted() : getTotalFormatted()}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-semibold mb-1">
              {isTracking ? 'Auto-Tracking Active' : 'Auto-Tracking Paused'}
            </div>            <div className="text-sm space-y-1">
              <div>Total: {getTotalFormatted()}</div>
              {isTracking && (
                <div>Session: {getSessionFormatted()}</div>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                {isTracking 
                  ? 'Automatically tracking your activity' 
                  : 'Move your mouse or type to resume'
                }
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
