import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

type TimerStatus = 'stopped' | 'running' | 'paused';
type SessionType = 'focus' | 'shortBreak' | 'longBreak';

interface PomodoroState {
  duration: number;
  timeLeft: number;
  status: TimerStatus;
  sessionType: SessionType;
  sessionCount: number;
  startTime: number | null;
  lastUpdateTime: number | null;
}

interface PomodoroContextType {
  duration: number;
  timeLeft: number;
  status: TimerStatus;
  sessionType: SessionType;
  sessionCount: number;
  isRunning: boolean;
  isBreak: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  setDuration: (duration: number) => void;
  formatTime: (seconds: number) => string;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

const SHORT_BREAK_DURATION = 5; // 5 minutes short break
const LONG_BREAK_DURATION = 15; // 15 minutes long break
const SESSIONS_UNTIL_LONG_BREAK = 4; // Long break every 4 sessions
const STORAGE_KEY = 'pomodoro-state';

export const PomodoroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [duration, setDurationState] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [status, setStatus] = useState<TimerStatus>('stopped');
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [sessionCount, setSessionCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Reset to default state
  const resetToDefault = () => {
    setDurationState(25);
    setTimeLeft(25 * 60);
    setStatus('stopped');
    setSessionType('focus');
    setSessionCount(0);
    setStartTime(null);
    setLastUpdateTime(null);
  };

  // Handle timer completion
  const handleTimerComplete = useCallback((currentSessionType: SessionType, currentSessionCount: number) => {
    if (currentSessionType === 'focus') {
      // Focus session ended, determine break type
      const newSessionCount = currentSessionCount + 1;
      const isLongBreak = newSessionCount % SESSIONS_UNTIL_LONG_BREAK === 0;
      const breakType: SessionType = isLongBreak ? 'longBreak' : 'shortBreak';
      const breakDuration = isLongBreak ? LONG_BREAK_DURATION : SHORT_BREAK_DURATION;
      
      toast({
        title: "Focus session completed!",
        description: `Time for a ${isLongBreak ? 'long' : 'short'} break (${breakDuration} minutes).`,
      });
      
      setSessionType(breakType);
      setSessionCount(newSessionCount);
      setTimeLeft(breakDuration * 60);
      setStartTime(Date.now());
      setLastUpdateTime(Date.now());
    } else {
      // Break ended
      const breakTypeName = currentSessionType === 'longBreak' ? 'long break' : 'short break';
      toast({
        title: `${breakTypeName.charAt(0).toUpperCase() + breakTypeName.slice(1)} completed!`,
        description: "Ready for another focus session?",
      });
      
      setStatus('stopped');
      setSessionType('focus');
      setTimeLeft(duration * 60);
      setStartTime(null);
      setLastUpdateTime(null);
    }
  }, [toast, duration]);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed: PomodoroState = JSON.parse(savedState);
        setDurationState(parsed.duration);
        setSessionType(parsed.sessionType);
        setSessionCount(parsed.sessionCount || 0);
        
        if (parsed.status === 'running' && parsed.startTime && parsed.lastUpdateTime) {
          // Calculate how much time has passed since the timer was last active
          const now = Date.now();
          const elapsedSinceLastUpdate = Math.floor((now - parsed.lastUpdateTime) / 1000);
          const newTimeLeft = Math.max(0, parsed.timeLeft - elapsedSinceLastUpdate);
          
          if (newTimeLeft > 0) {
            setTimeLeft(newTimeLeft);
            setStartTime(parsed.startTime);
            setLastUpdateTime(now);
            setStatus('running'); // Set status to running to restart the timer
          } else {
            // Timer should have finished while away
            handleTimerComplete(parsed.sessionType, parsed.sessionCount || 0);
          }
        } else {
          setTimeLeft(parsed.timeLeft);
          setStartTime(parsed.startTime);
          setLastUpdateTime(parsed.lastUpdateTime);
          setStatus(parsed.status);
        }
      } catch (error) {
        console.error('Failed to parse saved pomodoro state:', error);
        resetToDefault();
      }
    }
  }, [handleTimerComplete]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state: PomodoroState = {
      duration,
      timeLeft,
      status,
      sessionType,
      sessionCount,
      startTime,
      lastUpdateTime
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [duration, timeLeft, status, sessionType, sessionCount, startTime, lastUpdateTime]);

  // Main timer effect
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        setLastUpdateTime(now);
        
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer reached zero
            clearInterval(timerRef.current as NodeJS.Timeout);
            handleTimerComplete(sessionType, sessionCount);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, sessionType, sessionCount, handleTimerComplete]);

  // Reset timer when duration changes (only if stopped and in focus mode)
  useEffect(() => {
    if (status === 'stopped' && sessionType === 'focus') {
      setTimeLeft(duration * 60);
    }
  }, [duration, status, sessionType]);

  const toggleTimer = () => {
    const now = Date.now();
    if (status === 'stopped' || status === 'paused') {
      if (status === 'stopped') {
        setStartTime(now);
      }
      setLastUpdateTime(now);
      setStatus('running');
    } else if (status === 'running') {
      setStatus('paused');
    }
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setStatus('stopped');
    setSessionType('focus');
    setTimeLeft(duration * 60);
    setStartTime(null);
    setLastUpdateTime(null);
  };

  const setDuration = (newDuration: number) => {
    setDurationState(newDuration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Computed values for backward compatibility
  const isRunning = status === 'running';
  const isBreak = sessionType !== 'focus';

  return (
    <PomodoroContext.Provider
      value={{
        duration,
        timeLeft,
        status,
        sessionType,
        sessionCount,
        isRunning,
        isBreak,
        toggleTimer,
        resetTimer,
        setDuration,
        formatTime,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
