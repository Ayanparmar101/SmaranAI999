import React from 'react';
import { useTimeTracking } from '@/contexts/AutoTimeTrackingContext';
import { Clock, Play, Pause } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const AutoTimeTrackingIndicator: React.FC = () => {
  const {
    getTotalFormatted,
    getSessionFormatted,
    currentSessionTime,
    isTracking
  } = useTimeTracking();

  return (
    <div className="space-y-4">
      {/* Status and Live Session Timer */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`}>
              {isTracking ? (
                <Play className="w-4 h-4 text-white" />
              ) : (
                <Pause className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {isTracking ? 'Auto-Tracking Active' : 'Paused (Inactive)'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isTracking ? 'Tracking your learning time automatically' : 'Move your mouse or type to resume'}
              </div>
            </div>
          </div>
          
          {/* Live Session Timer */}
          {isTracking && (
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-green-600 dark:text-green-400">
                {getSessionFormatted()}
              </div>
              <div className="text-xs text-gray-500">
                Current Session
              </div>
            </div>
          )}
        </div>
      </Card>      {/* Time Counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Time */}
        <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <Clock className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
          <div className="text-2xl font-mono font-bold text-green-700 dark:text-green-300 mb-1">
            {getTotalFormatted()}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">
            Total Time
          </div>
        </Card>

        {/* Current Session */}
        <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
          <div className="text-2xl font-mono font-bold text-blue-700 dark:text-blue-300 mb-1">
            {getSessionFormatted()}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">
            Current Session
          </div>
        </Card>
      </div>

      {/* Auto-tracking Info */}
      <Card className="p-3 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
        <div className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>🤖 Automatic Tracking:</strong> Your time is tracked automatically when you're active. 
          Tracking pauses after 3 minutes of inactivity to ensure accurate time recording.
        </div>
      </Card>
    </div>
  );
};
