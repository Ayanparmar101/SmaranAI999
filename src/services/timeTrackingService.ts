import { db } from '@/integrations/firebase/client';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface TimeTrackingData {
  totalTimeSpent: number; // Total time spent on the website (in seconds)
  dailyTimeSpent: number; // Time spent today (in seconds)
  weeklyTimeSpent: number; // Time spent this week (in seconds)
  monthlyTimeSpent: number; // Time spent this month (in seconds)
  lastActiveDate: string; // Last date the user was active (YYYY-MM-DD)
  lastActiveWeek: string; // Last week the user was active (YYYY-WW)
  lastActiveMonth: string; // Last month the user was active (YYYY-MM)
  createdAt?: any;
  updatedAt?: any;
}

class TimeTrackingService {
  private getDateString(date: Date = new Date()): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  private getWeekString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-${weekNumber.toString().padStart(2, '0')}`;
  }

  private getMonthString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  async getUserTimeData(userId: string): Promise<TimeTrackingData> {
    try {
      const docRef = doc(db, 'timeTracking', userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create initial document
        const initialData: TimeTrackingData = {
          totalTimeSpent: 0,
          dailyTimeSpent: 0,
          weeklyTimeSpent: 0,
          monthlyTimeSpent: 0,
          lastActiveDate: this.getDateString(),
          lastActiveWeek: this.getWeekString(),
          lastActiveMonth: this.getMonthString(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(docRef, initialData);
        return initialData;
      }

      const data = docSnap.data() as TimeTrackingData;
      
      // Reset counters if it's a new day/week/month
      const currentDate = this.getDateString();
      const currentWeek = this.getWeekString();
      const currentMonth = this.getMonthString();

      let needsUpdate = false;
      const updatedData = { ...data };

      if (data.lastActiveDate !== currentDate) {
        updatedData.dailyTimeSpent = 0;
        updatedData.lastActiveDate = currentDate;
        needsUpdate = true;
      }

      if (data.lastActiveWeek !== currentWeek) {
        updatedData.weeklyTimeSpent = 0;
        updatedData.lastActiveWeek = currentWeek;
        needsUpdate = true;
      }

      if (data.lastActiveMonth !== currentMonth) {
        updatedData.monthlyTimeSpent = 0;
        updatedData.lastActiveMonth = currentMonth;
        needsUpdate = true;
      }

      if (needsUpdate) {
        updatedData.updatedAt = serverTimestamp();
        await updateDoc(docRef, updatedData);
      }

      return updatedData;
    } catch (error) {
      console.error('Error getting user time data:', error);
      throw error;
    }
  }

  async updateTimeSpent(userId: string, sessionDuration: number): Promise<TimeTrackingData> {
    try {
      const docRef = doc(db, 'timeTracking', userId);
      const currentData = await this.getUserTimeData(userId);

      const updatedData: Partial<TimeTrackingData> = {
        totalTimeSpent: currentData.totalTimeSpent + sessionDuration,
        dailyTimeSpent: currentData.dailyTimeSpent + sessionDuration,
        weeklyTimeSpent: currentData.weeklyTimeSpent + sessionDuration,
        monthlyTimeSpent: currentData.monthlyTimeSpent + sessionDuration,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updatedData);

      return {
        ...currentData,
        ...updatedData,
      } as TimeTrackingData;
    } catch (error) {
      console.error('Error updating time spent:', error);
      throw error;
    }
  }

  async getTotalTimeAcrossAllUsers(): Promise<number> {
    // This would require a more complex query or aggregation
    // For now, we'll just return 0 as this is primarily for individual tracking
    return 0;
  }

  // Utility method to get time statistics
  async getTimeStatistics(userId: string): Promise<{
    totalHours: number;
    averageDailyMinutes: number;
    streakDays: number;
  }> {
    try {
      const data = await this.getUserTimeData(userId);
      const totalHours = Math.floor(data.totalTimeSpent / 3600);
      
      // For simplicity, we'll estimate average daily minutes based on total time
      // In a real implementation, you might want to track this more precisely
      const estimatedActiveDays = Math.max(1, Math.floor(data.totalTimeSpent / (30 * 60))); // Assume at least 30 min per active day
      const averageDailyMinutes = Math.floor(data.totalTimeSpent / (60 * estimatedActiveDays));
      
      // Streak calculation would require more complex logic with daily activity tracking
      const streakDays = data.dailyTimeSpent > 0 ? 1 : 0;

      return {
        totalHours,
        averageDailyMinutes,
        streakDays,
      };
    } catch (error) {
      console.error('Error getting time statistics:', error);
      return {
        totalHours: 0,
        averageDailyMinutes: 0,
        streakDays: 0,
      };
    }
  }
}

export const timeTrackingService = new TimeTrackingService();
