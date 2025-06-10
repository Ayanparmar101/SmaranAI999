import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface TimeTrackingData {
  totalTimeSpent: number;
  dailyTimeSpent: number;
  weeklyTimeSpent: number;
  monthlyTimeSpent: number;
  lastActiveDate: string;
  lastActiveWeek: string;
  lastActiveMonth: string;
  createdAt?: any;
  updatedAt?: any;
}

interface TimeTrackingState {
  sessionStartTime: number | null;
  totalTimeSpent: number; // in seconds
  dailyTimeSpent: number; // in seconds
  weeklyTimeSpent: number; // in seconds
  monthlyTimeSpent: number; // in seconds
  currentSessionTime: number; // in seconds
  isActive: boolean;
}

interface TimeTrackingContextType extends TimeTrackingState {
  startSession: () => void;
  endSession: () => void;
  getTotalTimeFormatted: () => string;
  getDailyTimeFormatted: () => string;
  getWeeklyTimeFormatted: () => string;
  getMonthlyTimeFormatted: () => string;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export const TimeTrackingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [dailyTimeSpent, setDailyTimeSpent] = useState(0);
  const [weeklyTimeSpent, setWeeklyTimeSpent] = useState(0);
  const [monthlyTimeSpent, setMonthlyTimeSpent] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  // Helper functions for date formatting
  const getDateString = (date: Date = new Date()): string => {
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const getWeekString = (date: Date = new Date()): string => {
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    const year = localDate.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((localDate.getTime() - startOfYear.getTime()) / 86400000) + 1;
    const weekNumber = Math.ceil(dayOfYear / 7);
    return `${year}-${weekNumber.toString().padStart(2, '0')}`;
  };

  const getMonthString = (date: Date = new Date()): string => {
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    const year = localDate.getFullYear();
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };
  // Firebase data functions
  const getUserTimeData = async (userId: string): Promise<TimeTrackingData> => {
    try {
      console.log('[TimeTracking] Getting user time data for userId:', userId);
      
      // Ensure user is authenticated
      if (!user || !user.uid) {
        throw new Error('User not authenticated');
      }
      
      if (userId !== user.uid) {
        throw new Error('User ID mismatch');
      }

      const docRef = doc(db, 'timeTracking', userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log('[TimeTracking] Creating initial document for user:', userId);
        const initialData: TimeTrackingData = {
          totalTimeSpent: 0,
          dailyTimeSpent: 0,
          weeklyTimeSpent: 0,
          monthlyTimeSpent: 0,
          lastActiveDate: getDateString(),
          lastActiveWeek: getWeekString(),
          lastActiveMonth: getMonthString(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(docRef, initialData);
        return initialData;
      }      const data = docSnap.data() as TimeTrackingData;
      
      const currentDate = getDateString();
      const currentWeek = getWeekString();
      const currentMonth = getMonthString();

      console.log('[TimeTracking] Checking date reset conditions:', {
        currentDate,
        currentWeek,
        currentMonth,
        lastActiveDate: data.lastActiveDate,
        lastActiveWeek: data.lastActiveWeek,
        lastActiveMonth: data.lastActiveMonth,
        storedDaily: data.dailyTimeSpent,
        storedWeekly: data.weeklyTimeSpent,
        storedMonthly: data.monthlyTimeSpent
      });      let needsUpdate = false;
      const updatedData = { ...data };

      // Only reset if we have valid lastActive dates and they actually changed
      if (data.lastActiveDate && data.lastActiveDate !== currentDate) {
        console.log('[TimeTracking] Resetting daily time - date changed from', data.lastActiveDate, 'to', currentDate);
        updatedData.dailyTimeSpent = 0;
        updatedData.lastActiveDate = currentDate;
        needsUpdate = true;
      } else if (!data.lastActiveDate) {
        console.log('[TimeTracking] Setting initial lastActiveDate to', currentDate);
        updatedData.lastActiveDate = currentDate;
        needsUpdate = true;
      }

      if (data.lastActiveWeek && data.lastActiveWeek !== currentWeek) {
        console.log('[TimeTracking] Resetting weekly time - week changed from', data.lastActiveWeek, 'to', currentWeek);
        updatedData.weeklyTimeSpent = 0;
        updatedData.lastActiveWeek = currentWeek;
        needsUpdate = true;
      } else if (!data.lastActiveWeek) {
        console.log('[TimeTracking] Setting initial lastActiveWeek to', currentWeek);
        updatedData.lastActiveWeek = currentWeek;
        needsUpdate = true;
      }

      if (data.lastActiveMonth && data.lastActiveMonth !== currentMonth) {
        console.log('[TimeTracking] Resetting monthly time - month changed from', data.lastActiveMonth, 'to', currentMonth);
        updatedData.monthlyTimeSpent = 0;
        updatedData.lastActiveMonth = currentMonth;
        needsUpdate = true;
      } else if (!data.lastActiveMonth) {
        console.log('[TimeTracking] Setting initial lastActiveMonth to', currentMonth);
        updatedData.lastActiveMonth = currentMonth;
        needsUpdate = true;
      }if (needsUpdate) {
        console.log('[TimeTracking] Updating Firebase document with reset data:', updatedData);
        updatedData.updatedAt = serverTimestamp();
        await updateDoc(docRef, updatedData);
      } else {
        console.log('[TimeTracking] No date resets needed, returning existing data');
      }

      return updatedData;
    } catch (error) {
      console.error('[TimeTracking] Error getting user time data:', error);
      
      // If it's a permissions error, try to use cached data
      if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
        console.warn('[TimeTracking] Permission denied, falling back to cached data');
        const cacheKey = `timeTracking_${userId}`;
        const cachedData = localStorage.getItem(cacheKey);
        
        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData);
            console.log('[TimeTracking] Using cached data due to permission error:', parsed);
            return parsed;
          } catch (e) {
            console.error('[TimeTracking] Failed to parse cached data:', e);
          }
        }
        
        // Return default data if no cache available
        return {
          totalTimeSpent: 0,
          dailyTimeSpent: 0,
          weeklyTimeSpent: 0,
          monthlyTimeSpent: 0,
          lastActiveDate: getDateString(),
          lastActiveWeek: getWeekString(),
          lastActiveMonth: getMonthString(),
          createdAt: null,
          updatedAt: null,
        };
      }
      
      throw error;
    }
  };  const updateTimeSpent = async (userId: string, sessionDuration: number): Promise<TimeTrackingData> => {
    try {
      console.log('[TimeTracking] Starting updateTimeSpent:', { 
        userId, 
        sessionDuration, 
        currentUser: user?.uid,
        isAuthenticated,
        emailVerified: user?.emailVerified 
      });
      
      // Ensure user is authenticated and IDs match
      if (!user || !user.uid || userId !== user.uid) {
        const error = new Error(`User authentication failed or ID mismatch - user: ${user?.uid}, userId: ${userId}`);
        console.error('[TimeTracking]', error.message);
        throw error;
      }      // Temporary: Skip email verification check for debugging
      // const isEmailPasswordAuth = user.providerData.some(provider => provider.providerId === 'password');
      // if (isEmailPasswordAuth && !user.emailVerified) {
      //   const error = new Error('Email not verified for email/password authentication');
      //   console.error('[TimeTracking]', error.message);
      //   throw error;
      // }

      console.log('[TimeTracking] Getting current data from Firebase...');
      const docRef = doc(db, 'timeTracking', userId);
      const currentData = await getUserTimeData(userId);
      console.log('[TimeTracking] Current Firebase data:', currentData);

      const updatedData: Partial<TimeTrackingData> = {
        totalTimeSpent: currentData.totalTimeSpent + sessionDuration,
        dailyTimeSpent: currentData.dailyTimeSpent + sessionDuration,
        weeklyTimeSpent: currentData.weeklyTimeSpent + sessionDuration,
        monthlyTimeSpent: currentData.monthlyTimeSpent + sessionDuration,
        updatedAt: serverTimestamp(),
      };

      console.log('[TimeTracking] Attempting Firebase update with data:', {
        totalTimeSpent: updatedData.totalTimeSpent,
        dailyTimeSpent: updatedData.dailyTimeSpent,
        weeklyTimeSpent: updatedData.weeklyTimeSpent,
        monthlyTimeSpent: updatedData.monthlyTimeSpent
      });
      
      await updateDoc(docRef, updatedData);
      console.log('[TimeTracking] Firebase update successful');

      const finalData = {
        ...currentData,
        ...updatedData,
      } as TimeTrackingData;

      // Always cache the updated data for reliability
      const cacheKey = `timeTracking_${userId}`;
      const cacheData = {
        ...finalData,
        cacheDate: getDateString(),
        cacheTime: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('[TimeTracking] Updated data cached successfully:', cacheData);

      return finalData;
    } catch (error: any) {
      console.error('[TimeTracking] Error updating time spent:', error);
      console.error('[TimeTracking] Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // If Firebase fails, update local cache and continue
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        console.warn('[TimeTracking] Firebase permission denied, updating cache only');
        
        const cacheKey = `timeTracking_${userId}`;
        const cachedData = localStorage.getItem(cacheKey);
        
        let baseData: TimeTrackingData;
        if (cachedData) {
          try {
            baseData = JSON.parse(cachedData);
            console.log('[TimeTracking] Using existing cache as base:', baseData);
          } catch (e) {
            console.error('[TimeTracking] Failed to parse cached data, using defaults');
            baseData = {
              totalTimeSpent: 0,
              dailyTimeSpent: 0,
              weeklyTimeSpent: 0,
              monthlyTimeSpent: 0,
              lastActiveDate: getDateString(),
              lastActiveWeek: getWeekString(),
              lastActiveMonth: getMonthString(),
            };
          }
        } else {
          console.log('[TimeTracking] No cached data found, using defaults');
          baseData = {
            totalTimeSpent: 0,
            dailyTimeSpent: 0,
            weeklyTimeSpent: 0,
            monthlyTimeSpent: 0,
            lastActiveDate: getDateString(),
            lastActiveWeek: getWeekString(),
            lastActiveMonth: getMonthString(),
          };
        }

        // Update local data
        const updatedLocalData = {
          ...baseData,
          totalTimeSpent: baseData.totalTimeSpent + sessionDuration,
          dailyTimeSpent: baseData.dailyTimeSpent + sessionDuration,
          weeklyTimeSpent: baseData.weeklyTimeSpent + sessionDuration,
          monthlyTimeSpent: baseData.monthlyTimeSpent + sessionDuration,
          cacheDate: getDateString(),
          cacheTime: Date.now(),
          lastOfflineUpdate: Date.now()
        };

        localStorage.setItem(cacheKey, JSON.stringify(updatedLocalData));
        console.log('[TimeTracking] Updated cache-only data:', updatedLocalData);
        
        return updatedLocalData as TimeTrackingData;
      }
      
      throw error;
    }
  };// Session management functions
  const loadTimeData = async () => {
    if (!user) {
      console.log('[TimeTracking] No user found, skipping loadTimeData');
      return;
    }

    try {
      console.log('[TimeTracking] Loading time data for user:', user.uid);
      
      // First, always try to get cached data from localStorage
      const cacheKey = `timeTracking_${user.uid}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          const cacheDate = parsed.cacheDate;
          const currentDate = getDateString();
          const cacheTime = parsed.cacheTime || 0;
          const timeSinceCache = Date.now() - cacheTime;
          
          console.log('[TimeTracking] Found cached data:', {
            cacheDate,
            currentDate,
            timeSinceCache: Math.floor(timeSinceCache / 1000) + 's',
            hasOfflineUpdates: !!parsed.lastOfflineUpdate
          });
          
          // Use cached data if it's recent (within last 5 minutes) or from today
          if (cacheDate === currentDate && timeSinceCache < 300000) { // 5 minutes
            console.log('[TimeTracking] Using recent cached time data:', {
              total: parsed.totalTimeSpent,
              daily: parsed.dailyTimeSpent,
              weekly: parsed.weeklyTimeSpent,
              monthly: parsed.monthlyTimeSpent
            });
            
            setTotalTimeSpent(parsed.totalTimeSpent || 0);
            setDailyTimeSpent(parsed.dailyTimeSpent || 0);
            setWeeklyTimeSpent(parsed.weeklyTimeSpent || 0);
            setMonthlyTimeSpent(parsed.monthlyTimeSpent || 0);
            
            // Still try to sync with Firebase in background if there were offline updates
            if (parsed.lastOfflineUpdate) {
              console.log('[TimeTracking] Attempting background sync for offline updates');
              setTimeout(() => {
                syncOfflineData(user.uid);
              }, 2000);
            }
            
            return;
          } else if (cacheDate === currentDate) {
            // Use cache for today's data even if older, then sync with Firebase
            console.log('[TimeTracking] Using cached data from today, will sync with Firebase');
            setTotalTimeSpent(parsed.totalTimeSpent || 0);
            setDailyTimeSpent(parsed.dailyTimeSpent || 0);
            setWeeklyTimeSpent(parsed.weeklyTimeSpent || 0);
            setMonthlyTimeSpent(parsed.monthlyTimeSpent || 0);
          }
        } catch (e) {
          console.warn('[TimeTracking] Failed to parse cached data:', e);
        }
      }
      
      // Load from Firebase (with fallback to cache on error)
      try {
        console.log('[TimeTracking] Attempting to load from Firebase...');
        const timeData = await getUserTimeData(user.uid);
        
        console.log('[TimeTracking] Firebase data loaded successfully:', {
          total: timeData.totalTimeSpent,
          daily: timeData.dailyTimeSpent,
          weekly: timeData.weeklyTimeSpent,
          monthly: timeData.monthlyTimeSpent
        });
        
        setTotalTimeSpent(timeData.totalTimeSpent || 0);
        setDailyTimeSpent(timeData.dailyTimeSpent || 0);
        setWeeklyTimeSpent(timeData.weeklyTimeSpent || 0);
        setMonthlyTimeSpent(timeData.monthlyTimeSpent || 0);
        
        // Update cache with fresh Firebase data
        const cacheData = {
          ...timeData,
          cacheDate: getDateString(),
          cacheTime: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log('[TimeTracking] Fresh data cached successfully');
        
      } catch (firebaseError) {
        console.error('[TimeTracking] Firebase load failed, using cached data:', firebaseError);
        
        // If Firebase fails and we have cached data, use it
        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData);
            console.log('[TimeTracking] Using cached data due to Firebase error:', parsed);
            setTotalTimeSpent(parsed.totalTimeSpent || 0);
            setDailyTimeSpent(parsed.dailyTimeSpent || 0);
            setWeeklyTimeSpent(parsed.weeklyTimeSpent || 0);
            setMonthlyTimeSpent(parsed.monthlyTimeSpent || 0);
          } catch (parseError) {
            console.error('[TimeTracking] Failed to parse cached data fallback:', parseError);
            // Reset to defaults if everything fails
            resetToDefaults();
          }
        } else {
          console.log('[TimeTracking] No cached data available, resetting to defaults');
          resetToDefaults();
        }
      }
      
    } catch (error) {
      console.error('[TimeTracking] Error in loadTimeData:', error);
      resetToDefaults();
    }
  };

  const resetToDefaults = () => {
    setTotalTimeSpent(0);
    setDailyTimeSpent(0);
    setWeeklyTimeSpent(0);
    setMonthlyTimeSpent(0);
  };

  const syncOfflineData = async (userId: string) => {
    try {
      console.log('[TimeTracking] Attempting to sync offline data...');
      const cacheKey = `timeTracking_${userId}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (!cachedData) return;
      
      const parsed = JSON.parse(cachedData);
      if (!parsed.lastOfflineUpdate) return;
      
      // Try to sync with Firebase
      const docRef = doc(db, 'timeTracking', userId);
      await updateDoc(docRef, {
        totalTimeSpent: parsed.totalTimeSpent,
        dailyTimeSpent: parsed.dailyTimeSpent,
        weeklyTimeSpent: parsed.weeklyTimeSpent,
        monthlyTimeSpent: parsed.monthlyTimeSpent,
        updatedAt: serverTimestamp(),
      });
      
      // Remove offline update flag after successful sync
      delete parsed.lastOfflineUpdate;
      localStorage.setItem(cacheKey, JSON.stringify(parsed));
      console.log('[TimeTracking] Offline data synced successfully');
      
    } catch (error) {
      console.error('[TimeTracking] Failed to sync offline data:', error);
    }
  };
  const startSession = () => {
    if (!user) {
      console.log('[TimeTracking] No user found, cannot start session');
      return;
    }
    if (isActive) {
      console.log('[TimeTracking] Session already active');
      return;
    }
    
    const now = Date.now();
    setSessionStartTime(now);
    setIsActive(true);
    setCurrentSessionTime(0); // Reset current session time
    console.log('[TimeTracking] Session started at:', new Date(now));
  };
  const endSession = () => {
    if (!isActive || !sessionStartTime) {
      console.log('[TimeTracking] No active session to end');
      return;
    }
    
    console.log('[TimeTracking] Ending session...');
    updateCurrentSession();
    setSessionStartTime(null);
    setIsActive(false);
    setCurrentSessionTime(0); // Reset current session time
    console.log('[TimeTracking] Session ended');
  };
  const updateCurrentSession = async () => {
    if (!user || !sessionStartTime || !isActive) {
      console.log('[TimeTracking] Cannot update session - missing prerequisites');
      return;
    }

    const now = Date.now();
    const sessionDuration = Math.floor((now - sessionStartTime) / 1000); // in seconds
    
    if (sessionDuration < 5) {
      console.log('[TimeTracking] Session too short, skipping update');
      return; // Ignore very short sessions
    }

    try {
      console.log('[TimeTracking] Updating session, duration:', sessionDuration, 'seconds');
      const updatedData = await updateTimeSpent(user.uid, sessionDuration);
      
      // Update local state with the new data
      setTotalTimeSpent(updatedData.totalTimeSpent);
      setDailyTimeSpent(updatedData.dailyTimeSpent);
      setWeeklyTimeSpent(updatedData.weeklyTimeSpent);
      setMonthlyTimeSpent(updatedData.monthlyTimeSpent);
      
      // Reset session start time for continuous tracking
      setSessionStartTime(now);
      setCurrentSessionTime(0); // Reset current session time after saving
      
      console.log('[TimeTracking] Session updated successfully. New totals:', {
        total: updatedData.totalTimeSpent,
        daily: updatedData.dailyTimeSpent,
        weekly: updatedData.weeklyTimeSpent,
        monthly: updatedData.monthlyTimeSpent
      });
      
    } catch (error) {
      console.error('[TimeTracking] Error updating time data:', error);
      
      // Even if Firebase fails, we should continue the session locally
      // The updateTimeSpent function will handle caching for us
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        console.log('[TimeTracking] Continuing session despite Firebase error (data cached locally)');
        
        // Update local state with estimated values
        setTotalTimeSpent(prev => prev + sessionDuration);
        setDailyTimeSpent(prev => prev + sessionDuration);
        setWeeklyTimeSpent(prev => prev + sessionDuration);
        setMonthlyTimeSpent(prev => prev + sessionDuration);
        
        // Reset session start time for continuous tracking
        setSessionStartTime(now);
        setCurrentSessionTime(0);
      } else {
        // For other errors, we might want to stop the session
        console.error('[TimeTracking] Stopping session due to error:', error);
        endSession();
      }
    }
  };
  // Load time data when user authenticates
  useEffect(() => {
    const handleUserAuthentication = async () => {
      console.log('[TimeTracking] Authentication state change:', {
        isAuthenticated,
        hasUser: !!user,
        userId: user?.uid,
        emailVerified: user?.emailVerified,
        providerData: user?.providerData?.map(p => p.providerId)
      });      if (isAuthenticated && user) {
        console.log('[TimeTracking] User authenticated, starting session for:', user.uid);
        
        // Temporary: Skip email verification check for debugging
        // const isEmailPasswordAuth = user.providerData.some(provider => provider.providerId === 'password');
        // if (isEmailPasswordAuth && !user.emailVerified) {
        //   console.warn('[TimeTracking] Email not verified, skipping time tracking setup');
        //   return;
        // }
        
        try {
          await loadTimeData();
          console.log('[TimeTracking] Time data loaded, starting session...');
          startSession();
          console.log('[TimeTracking] Session started successfully');
        } catch (error) {
          console.error('[TimeTracking] Error during initialization:', error);
        }
      } else {
        console.log('[TimeTracking] User not authenticated, ending session');
        if (isActive) {
          endSession();
        }
      }
    };

    handleUserAuthentication();
  }, [isAuthenticated, user]);

  // Real-time session timer (updates every second)
  useEffect(() => {
    if (isActive && sessionStartTime) {
      const timer = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - sessionStartTime) / 1000);
        setCurrentSessionTime(elapsed);
      }, 1000); // Update every second

      return () => clearInterval(timer);
    } else {
      setCurrentSessionTime(0);
    }
  }, [isActive, sessionStartTime]);
  // Auto-save session data every minute
  useEffect(() => {
    console.log('[TimeTracking] Setting up auto-save interval - isActive:', isActive, 'sessionStartTime:', sessionStartTime);
    if (isActive && sessionStartTime) {
      const interval = setInterval(() => {
        console.log('[TimeTracking] Auto-save interval triggered');
        updateCurrentSession();
      }, 60000); // Update every minute

      return () => {
        console.log('[TimeTracking] Clearing auto-save interval');
        clearInterval(interval);
      };
    }
  }, [isActive, sessionStartTime]);

  // Periodic background sync for offline data (every 5 minutes)
  useEffect(() => {
    if (user) {
      const syncInterval = setInterval(() => {
        console.log('[TimeTracking] Background sync check...');
        syncOfflineData(user.uid);
      }, 300000); // 5 minutes

      return () => clearInterval(syncInterval);
    }
  }, [user]);

  // Cache data periodically to localStorage
  useEffect(() => {
    if (user) {
      const cacheInterval = setInterval(() => {
        const cacheKey = `timeTracking_${user.uid}`;
        const cacheData = {
          totalTimeSpent,
          dailyTimeSpent,
          weeklyTimeSpent,
          monthlyTimeSpent,
          lastActiveDate: getDateString(),
          lastActiveWeek: getWeekString(),
          lastActiveMonth: getMonthString(),
          cacheDate: getDateString(),
          cacheTime: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log('[TimeTracking] Background cache update completed');
      }, 30000); // Every 30 seconds

      return () => clearInterval(cacheInterval);
    }
  }, [user, totalTimeSpent, dailyTimeSpent, weeklyTimeSpent, monthlyTimeSpent]);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log('[TimeTracking] Visibility change - hidden:', document.hidden, 'isActive:', isActive);
      if (document.hidden) {
        // Page is hidden, pause tracking
        if (isActive) {
          console.log('[TimeTracking] Page hidden, updating session');
          updateCurrentSession();
        }
      } else {
        // Page is visible, resume tracking
        if (isAuthenticated && user && !isActive) {
          console.log('[TimeTracking] Page visible, starting session');
          startSession();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, isAuthenticated, user]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isActive) {
        console.log('[TimeTracking] Page unloading, updating session');
        updateCurrentSession();
        endSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive]);

  // Format time function
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
  const getTotalTimeFormatted = () => formatTime(totalTimeSpent + currentSessionTime);
  const getDailyTimeFormatted = () => formatTime(dailyTimeSpent + currentSessionTime);
  const getWeeklyTimeFormatted = () => formatTime(weeklyTimeSpent + currentSessionTime);
  const getMonthlyTimeFormatted = () => formatTime(monthlyTimeSpent + currentSessionTime);
  return (
    <TimeTrackingContext.Provider
      value={{
        sessionStartTime,
        totalTimeSpent,
        dailyTimeSpent,
        weeklyTimeSpent,
        monthlyTimeSpent,
        currentSessionTime,
        isActive,
        startSession,
        endSession,
        getTotalTimeFormatted,
        getDailyTimeFormatted,
        getWeeklyTimeFormatted,
        getMonthlyTimeFormatted,
      }}
    >
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