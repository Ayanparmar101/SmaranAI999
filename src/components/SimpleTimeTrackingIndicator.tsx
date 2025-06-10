// Simple Time Tracking Indicator - Focused on reliability
import React from 'react';
import { useTimeTracking } from '@/contexts/AutoTimeTrackingContext';
import { Clock, Play, Square } from 'lucide-react';

export const SimpleTimeTrackingIndicator: React.FC = () => {
  const {
    totalTime,
    currentSessionTime,
    isTracking,
    startTracking,
    stopTracking,
    getTotalFormatted,
    getSessionFormatted,
  } = useTimeTracking();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Time Tracking
        </h3>
        <button
          onClick={isTracking ? stopTracking : startTracking}
          className={`px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-colors ${
            isTracking
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isTracking ? (
            <>
              <Square className="h-4 w-4" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Start
            </>
          )}
        </button>
      </div>

      {/* Current Session */}
      {isTracking && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="text-sm text-blue-700 font-medium">Current Session</div>
          <div className="text-xl font-mono text-blue-900">{getSessionFormatted()}</div>
        </div>
      )}      {/* Time Counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-sm text-gray-600 font-medium">Total Time</div>
          <div className="text-lg font-mono text-gray-900">{getTotalFormatted()}</div>
          <div className="text-xs text-gray-500">{totalTime} seconds</div>
        </div>
        
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-sm text-gray-600 font-medium">Current Session</div>
          <div className="text-lg font-mono text-gray-900">{getSessionFormatted()}</div>
          <div className="text-xs text-gray-500">{currentSessionTime} seconds</div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`} />
        <span className="text-gray-600">
          {isTracking ? 'Tracking time...' : 'Not tracking'}
        </span>
      </div>
    </div>
  );
};
