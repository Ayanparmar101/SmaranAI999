// Simple Time Tracking Context - Automatic Activity-Based Tracking
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface TimeTrackingData {
  totalTimeSpent: number;
  todayTime: number;
  thisWeekTime: number;
  thisMonthTime: number;
  lastActiveDate: string;
  lastActiveWeek: string;
  lastActiveMonth: string;
  sessionStartTime: number | null;
  updatedAt?: any;
}

interface TimeTrackingContextType {
  // Display values
  todayTime: number;
  thisWeekTime: number;
  thisMonthTime: number;
  currentSessionTime: number;
  isTracking: boolean;
  
  // Actions
  startTracking: () => void;
  stopTracking: () => void;
  
  // Formatted display
  getTodayFormatted: () => string;
  getWeekFormatted: () => string;
  getMonthFormatted: () => string;
  getSessionFormatted: () => string;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

// Utility functions
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getToday = (): string => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
};

const getThisWeek = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000) + 1;
  const weekNumber = Math.ceil(dayOfYear / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};

const getThisMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

export const TimeTrackingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [todayTime, setTodayTime] = useState(0);
  const [thisWeekTime, setThisWeekTime] = useState(0);
  const [thisMonthTime, setThisMonthTime] = useState(0);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  
  // Load data when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      loadUserData();
    } else {
      // Reset when user logs out
      setTodayTime(0);
      setThisWeekTime(0);
      setThisMonthTime(0);
      setCurrentSessionTime(0);
      setIsTracking(false);
      setSessionStartTime(null);
    }
  }, [isAuthenticated, user]);

  // Timer effect for current session
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
  }, [isTracking, sessionStartTime]);

  // Auto-save every 30 seconds when tracking
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTracking && user?.uid) {
      interval = setInterval(() => {
        saveCurrentSession();
      }, 30000); // Save every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, user]);

  // Save on page unload/logout
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isTracking) {
        saveCurrentSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isTracking]);

  const loadUserData = async () => {
    if (!user?.uid) return;
    
    try {
      console.log('[SimpleTimeTracking] Loading data for user:', user.uid);
      const docRef = doc(db, 'timeTracking', user.uid);
      const docSnap = await getDoc(docRef);
      
      const today = getToday();
      const thisWeek = getThisWeek();
      const thisMonth = getThisMonth();
      
      if (docSnap.exists()) {
        const data = docSnap.data() as TimeTrackingData;
        
        // Check if we need to reset counters
        let resetTodayTime = data.lastActiveDate !== today;
        let resetWeekTime = data.lastActiveWeek !== thisWeek;
        let resetMonthTime = data.lastActiveMonth !== thisMonth;
        
        setTodayTime(resetTodayTime ? 0 : data.todayTime || 0);
        setThisWeekTime(resetWeekTime ? 0 : data.thisWeekTime || 0);
        setThisMonthTime(resetMonthTime ? 0 : data.thisMonthTime || 0);
        
        // If any resets happened, save the updated data
        if (resetTodayTime || resetWeekTime || resetMonthTime) {
          const updatedData: TimeTrackingData = {
            ...data,
            todayTime: resetTodayTime ? 0 : data.todayTime || 0,
            thisWeekTime: resetWeekTime ? 0 : data.thisWeekTime || 0,
            thisMonthTime: resetMonthTime ? 0 : data.thisMonthTime || 0,
            lastActiveDate: today,
            lastActiveWeek: thisWeek,
            lastActiveMonth: thisMonth,
            updatedAt: serverTimestamp(),
          };
          await setDoc(docRef, updatedData);
        }
        
        console.log('[SimpleTimeTracking] Data loaded:', {
          today: resetTodayTime ? 0 : data.todayTime || 0,
          week: resetWeekTime ? 0 : data.thisWeekTime || 0,
          month: resetMonthTime ? 0 : data.thisMonthTime || 0
        });
      } else {
        // Create initial document
        const initialData: TimeTrackingData = {
          totalTimeSpent: 0,
          todayTime: 0,
          thisWeekTime: 0,
          thisMonthTime: 0,
          lastActiveDate: today,
          lastActiveWeek: thisWeek,
          lastActiveMonth: thisMonth,
          sessionStartTime: null,
          updatedAt: serverTimestamp(),
        };
        
        await setDoc(docRef, initialData);
        console.log('[SimpleTimeTracking] Created initial document');
      }
    } catch (error) {
      console.error('[SimpleTimeTracking] Error loading data:', error);
    }
  };

  const saveCurrentSession = async () => {
    if (!user?.uid || !isTracking || !sessionStartTime) return;
    
    try {
      const now = Date.now();
      const sessionSeconds = Math.floor((now - sessionStartTime) / 1000);
      
      if (sessionSeconds < 1) return; // Don't save sessions less than 1 second
      
      const today = getToday();
      const thisWeek = getThisWeek();
      const thisMonth = getThisMonth();
      
      const docRef = doc(db, 'timeTracking', user.uid);
      const docSnap = await getDoc(docRef);
      
      let newTodayTime = todayTime + sessionSeconds;
      let newWeekTime = thisWeekTime + sessionSeconds;
      let newMonthTime = thisMonthTime + sessionSeconds;
      
      if (docSnap.exists()) {
        const data = docSnap.data() as TimeTrackingData;
        
        // Check if dates changed (reset logic)
        if (data.lastActiveDate !== today) {
          newTodayTime = sessionSeconds; // Reset daily counter
        }
        if (data.lastActiveWeek !== thisWeek) {
          newWeekTime = sessionSeconds; // Reset weekly counter
        }
        if (data.lastActiveMonth !== thisMonth) {
          newMonthTime = sessionSeconds; // Reset monthly counter
        }
      }
      
      const updatedData: TimeTrackingData = {
        totalTimeSpent: (docSnap.exists() ? (docSnap.data() as TimeTrackingData).totalTimeSpent || 0 : 0) + sessionSeconds,
        todayTime: newTodayTime,
        thisWeekTime: newWeekTime,
        thisMonthTime: newMonthTime,
        lastActiveDate: today,
        lastActiveWeek: thisWeek,
        lastActiveMonth: thisMonth,
        sessionStartTime: now, // Update session start time
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(docRef, updatedData);
      
      // Update local state
      setTodayTime(newTodayTime);
      setThisWeekTime(newWeekTime);
      setThisMonthTime(newMonthTime);
      setSessionStartTime(now); // Reset session timer
      
      console.log('[SimpleTimeTracking] Session saved:', {
        sessionSeconds,
        newTodayTime,
        newWeekTime,
        newMonthTime
      });
    } catch (error) {
      console.error('[SimpleTimeTracking] Error saving session:', error);
    }
  };

  const startTracking = () => {
    const now = Date.now();
    setSessionStartTime(now);
    setIsTracking(true);
    setCurrentSessionTime(0);
    console.log('[SimpleTimeTracking] Started tracking at:', new Date(now));
  };

  const stopTracking = async () => {
    if (isTracking) {
      await saveCurrentSession();
    }
    setIsTracking(false);
    setSessionStartTime(null);
    setCurrentSessionTime(0);
    console.log('[SimpleTimeTracking] Stopped tracking');
  };

  const getTodayFormatted = () => formatTime(todayTime);
  const getWeekFormatted = () => formatTime(thisWeekTime);
  const getMonthFormatted = () => formatTime(thisMonthTime);
  const getSessionFormatted = () => formatTime(currentSessionTime);

  const value: TimeTrackingContextType = {
    todayTime,
    thisWeekTime,
    thisMonthTime,
    currentSessionTime,
    isTracking,
    startTracking,
    stopTracking,
    getTodayFormatted,
    getWeekFormatted,
    getMonthFormatted,
    getSessionFormatted,
  };

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
