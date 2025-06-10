// Local-First Time Tracking with Firebase Sync on Reload - Optimized for Performance
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { optimizedFirebaseService } from '@/services/optimizedFirebaseService';
import { requestCache } from '@/utils/requestCache';

interface LocalTimeData {
  totalTime: number;
  lastActiveDate: string;
  sessionStartTime: number | null;
}

interface TimeTrackingContextType {
  totalTime: number;
  currentSessionTime: number;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  getTotalFormatted: () => string;
  getSessionFormatted: () => string;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

// Local Storage Keys
const LOCAL_STORAGE_KEY = 'timeTracking';

// Utility functions
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Local Storage Functions
const saveToLocalStorage = (data: LocalTimeData) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    console.log('[LocalStorage] Saved:', data);
  } catch (error) {
    console.error('[LocalStorage] Save failed:', error);
  }
};

const loadFromLocalStorage = (): LocalTimeData | null => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as LocalTimeData;
      console.log('[LocalStorage] Loaded:', data);
      return data;
    }
  } catch (error) {
    console.error('[LocalStorage] Load failed:', error);
  }
  return null;
};

export const TimeTrackingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
    // State
  const [totalTime, setTotalTime] = useState(0);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [lastSavedSessionTime, setLastSavedSessionTime] = useState(0); // Track last saved session time
  
  // Refs for activity detection
  const lastActivityRef = useRef<number>(Date.now());
  const hasSyncedOnLoadRef = useRef(false);

  // Load from localStorage on mount and preload Firebase data
  useEffect(() => {
    const localData = loadFromLocalStorage();

    if (localData) {
      setTotalTime(localData.totalTime);
    }
  }, []);

  // Optimized Firebase sync on page load with caching
  useEffect(() => {
    if (isAuthenticated && user?.uid && !hasSyncedOnLoadRef.current) {
      // Preload user data with caching
      const preloadUserData = async () => {
        try {
          // Load time tracking data with caching
          const timeTrackingData = await optimizedFirebaseService.getDocument(
            'timeTracking',
            user.uid,
            {
              cache: true,
              dataType: 'timeTracking',
              priority: 'normal'
            }
          );

          if (timeTrackingData) {
            console.log('[Firebase] Preloaded time tracking data:', timeTrackingData);
            // Merge with local data if Firebase has newer data
            const localData = loadFromLocalStorage();
            if (!localData || timeTrackingData.totalTime > localData.totalTime) {
              setTotalTime(timeTrackingData.totalTime);
              saveToLocalStorage({
                totalTime: timeTrackingData.totalTime,
                lastActiveDate: timeTrackingData.lastActiveDate || getToday(),
                sessionStartTime: null
              });
            }
          }
        } catch (error) {
          console.error('[Firebase] Failed to preload user data:', error);
        }
      };

      preloadUserData();
      syncToFirebase();
      hasSyncedOnLoadRef.current = true;
    }
  }, [isAuthenticated, user]);

  // Debounced activity detection to reduce excessive function calls
  const handleActivity = useDebouncedCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    if (isAuthenticated && !isTracking) {
      console.log('[TimeTracking] Activity detected, starting tracking');
      setIsTracking(true);
      setSessionStartTime(now);
      setLastSavedSessionTime(0); // Reset saved session time for new session
    }
  }, 100); // Debounce activity detection by 100ms

  // Memoize event list to prevent recreation on every render
  const activityEvents = useMemo(() => ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'], []);

  // Set up activity listeners with proper cleanup
  useEffect(() => {
    if (!isAuthenticated) return;

    // Use passive listeners for better performance
    const addEventListeners = () => {
      activityEvents.forEach(event => {
        document.addEventListener(event, handleActivity, { passive: true });
      });
    };

    const removeEventListeners = () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };

    addEventListeners();

    // Auto-start on auth
    if (!isTracking) {
      const now = Date.now();
      setIsTracking(true);
      setSessionStartTime(now);
      setLastSavedSessionTime(0); // Reset saved session time for new session
      lastActivityRef.current = now;
    }

    return removeEventListeners;
  }, [isAuthenticated, handleActivity, activityEvents, isTracking]);

  // Memoize inactivity constants to prevent recreation
  const INACTIVITY_TIMEOUT = useMemo(() => 3 * 60 * 1000, []); // 3 minutes
  const INACTIVITY_CHECK_INTERVAL = useMemo(() => 30000, []); // 30 seconds

  // Auto-pause after 3 minutes of inactivity with optimized interval
  useEffect(() => {
    if (!isTracking) return;

    const checkInactivity = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;
      if (timeSinceActivity > INACTIVITY_TIMEOUT) {
        console.log('[TimeTracking] Auto-pausing due to inactivity');
        saveCurrentSession();
        setIsTracking(false);
        setSessionStartTime(null);
        setCurrentSessionTime(0);
        setLastSavedSessionTime(0); // Reset saved session time
      }
    }, INACTIVITY_CHECK_INTERVAL);

    return () => clearInterval(checkInactivity);
  }, [isTracking, INACTIVITY_TIMEOUT, INACTIVITY_CHECK_INTERVAL]);

  // Real-time session timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTracking && sessionStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const sessionSeconds = Math.floor((now - sessionStartTime) / 1000);
        setCurrentSessionTime(sessionSeconds);
      }, 1000);
    } else {
      setCurrentSessionTime(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, sessionStartTime]);  // Save session to localStorage every 60 seconds only
  useEffect(() => {
    let saveInterval: NodeJS.Timeout | null = null;
    
    if (isTracking && sessionStartTime) {
      // Save to localStorage every 60 seconds
      saveInterval = setInterval(() => {
        saveCurrentSession();
      }, 60000);
    }
    
    return () => {
      if (saveInterval) clearInterval(saveInterval);
    };
  }, [isTracking, sessionStartTime]);  // Save on page unload only
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isTracking) {
        saveCurrentSession();
        // Sync to Firebase on page unload
        if (user?.uid) {
          syncToFirebase().catch(error => {
            console.error('[Firebase] Failed to sync on page unload:', error);
          });
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isTracking) {
        // Page is being hidden (tab switch, minimize, etc.) - only save locally
        saveCurrentSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTracking, user]);const saveCurrentSession = () => {
    if (!sessionStartTime) return;
    
    const now = Date.now();
    const totalSessionSeconds = Math.floor((now - sessionStartTime) / 1000);
    
    // Only save the time since last save
    const newSessionTime = totalSessionSeconds - lastSavedSessionTime;
    
    if (newSessionTime < 1) return;
    
    const newTotalTime = totalTime + newSessionTime;
    
    setTotalTime(newTotalTime);
    setLastSavedSessionTime(totalSessionSeconds); // Update last saved session time
    
    // Save to localStorage immediately
    const localData: LocalTimeData = {
      totalTime: newTotalTime,
      lastActiveDate: getToday(),
      sessionStartTime: sessionStartTime // Keep original session start time
    };
    
    saveToLocalStorage(localData);
    
    console.log('[TimeTracking] Session saved to localStorage:', {
      newSessionTime,
      totalSessionSeconds,
      newTotalTime,
      sessionContinues: true
    });
  };  // Optimized Firebase sync with intelligent batching and caching
  const syncToFirebase = useDebouncedCallback(async () => {
    if (!user?.uid) return;

    try {
      console.log('[Firebase] Syncing data...');

      // Save current session before syncing to ensure all data is included
      if (isTracking && sessionStartTime) {
        const now = Date.now();
        const totalSessionSeconds = Math.floor((now - sessionStartTime) / 1000);
        const newSessionTime = totalSessionSeconds - lastSavedSessionTime;

        if (newSessionTime >= 1) {
          const newTotalTime = totalTime + newSessionTime;
          setTotalTime(newTotalTime);
          setLastSavedSessionTime(totalSessionSeconds);

          const localData: LocalTimeData = {
            totalTime: newTotalTime,
            lastActiveDate: getToday(),
            sessionStartTime: sessionStartTime
          };

          saveToLocalStorage(localData);
          console.log('[Firebase] Saved current session before sync:', {
            newSessionTime,
            newTotalTime
          });
        }
      }

      const localData = loadFromLocalStorage();
      if (!localData) return;

      const firebaseData = {
        totalTime: localData.totalTime,
        lastActiveDate: localData.lastActiveDate,
        updatedAt: serverTimestamp(),
      };

      // Use optimized Firebase service for batched operations
      await optimizedFirebaseService.batchWrite([
        {
          type: 'set',
          collection: 'timeTracking',
          docId: user.uid,
          data: firebaseData,
          priority: 'low' // Time tracking is not critical for immediate sync
        }
      ]);

      console.log('[Firebase] Data synced successfully');
    } catch (error) {
      console.error('[Firebase] Sync failed:', error);
    }
  }, 5000); // Debounce sync operations to reduce Firebase calls
  const startTracking = () => {
    const now = Date.now();
    setSessionStartTime(now);
    setIsTracking(true);
    setCurrentSessionTime(0);
    setLastSavedSessionTime(0); // Reset saved session time for new session
    lastActivityRef.current = now;
    console.log('[TimeTracking] Manually started');
  };
  const stopTracking = () => {
    if (isTracking) {
      saveCurrentSession();
    }
    setIsTracking(false);
    setSessionStartTime(null);
    setCurrentSessionTime(0);
    setLastSavedSessionTime(0); // Reset saved session time
    console.log('[TimeTracking] Manually stopped');
  };
  const getTotalFormatted = () => formatTime(totalTime);
  const getSessionFormatted = () => formatTime(currentSessionTime);

  // Memoize context value to prevent unnecessary re-renders
  const value: TimeTrackingContextType = useMemo(() => ({
    totalTime,
    currentSessionTime,
    isTracking,
    startTracking,
    stopTracking,
    getTotalFormatted,
    getSessionFormatted,
  }), [totalTime, currentSessionTime, isTracking, startTracking, stopTracking, getTotalFormatted, getSessionFormatted]);

  return (
    <TimeTrackingContext.Provider value={value}>
      {children}
    </TimeTrackingContext.Provider>
  );
};

export const useTimeTracking = () => {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
};
