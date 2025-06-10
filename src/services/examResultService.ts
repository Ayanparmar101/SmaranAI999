import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { StudySession, ExamResult } from '@/types/flashcard';
import { v4 as uuidv4 } from 'uuid';

export class ExamResultService {
    /**
   * Save exam results as a study session to Firebase
   */
  async saveExamResults(
    flashcardSetId: string,
    userId: string,
    examResults: ExamResult[],
    score: number,
    totalTime: number,
    settings: {
      timePerQuestion: number;
      shuffleQuestions: boolean;
      showDifficulty: boolean;
      useAIEvaluation: boolean;
    },
    flashcardSetTitle?: string
  ): Promise<StudySession> {
    try {
      console.log('[ExamResultService] Saving exam results for user:', userId);
      
      if (!db) {
        throw new Error('Firestore database not initialized');
      }

      const correctAnswers = examResults.filter(r => r.isCorrect).length;
      const startTime = new Date(Date.now() - totalTime * 1000); // Calculate start time
      
      const studySession: Omit<StudySession, 'id'> = {
        flashcardSetId,
        userId,
        startTime,
        endTime: new Date(),
        cardsStudied: examResults.length,
        correctAnswers,
        sessionType: 'exam',
        timeLimit: settings.timePerQuestion,
        examResults
      };

      console.log('[ExamResultService] Prepared exam session for save:', studySession);

      // Prepare the data for Firestore
      const firestoreData = {
        ...studySession,
        startTime: Timestamp.fromDate(studySession.startTime),
        endTime: Timestamp.fromDate(studySession.endTime!),
        examResults: examResults.map(result => ({
          ...result,
          // No date conversion needed for exam results as they don't contain dates
        })),        // Add metadata about exam settings
        examSettings: settings,
        score: score,
        totalTime: totalTime,
        flashcardSetTitle: flashcardSetTitle || `Set ${flashcardSetId.slice(-6)}`
      };

      console.log('[ExamResultService] Attempting to save to Firestore collection "studySessions"...');
      const docRef = await addDoc(collection(db, 'studySessions'), firestoreData);

      const savedSession: StudySession = {
        ...studySession,
        id: docRef.id
      };

      console.log('[ExamResultService] Successfully saved exam results with ID:', docRef.id);
      return savedSession;

    } catch (error) {
      console.error('[ExamResultService] Error saving exam results:', error);
      throw error;
    }
  }

  /**
   * Load exam history for a user
   */
  async loadExamHistory(userId: string): Promise<StudySession[]> {
    try {
      console.log('[ExamResultService] Loading exam history for user:', userId);
      
      if (!db) {
        throw new Error('Firestore database not initialized');
      }

      // Query for exam sessions only
      const q = query(
        collection(db, 'studySessions'),
        where('userId', '==', userId),
        where('sessionType', '==', 'exam'),
        orderBy('endTime', 'desc')
      );

      console.log('[ExamResultService] Executing exam history query...');
      const querySnapshot = await getDocs(q);
      const examSessions: StudySession[] = [];

      console.log('[ExamResultService] Query returned', querySnapshot.size, 'exam sessions');

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('[ExamResultService] Processing exam session:', doc.id, data);
        
        const examSession: StudySession = {
          id: doc.id,
          flashcardSetId: data.flashcardSetId,
          userId: data.userId,
          startTime: data.startTime.toDate(),
          endTime: data.endTime ? data.endTime.toDate() : undefined,
          cardsStudied: data.cardsStudied,
          correctAnswers: data.correctAnswers,
          sessionType: data.sessionType,
          timeLimit: data.timeLimit,
          examResults: data.examResults || []
        };
        
        console.log('[ExamResultService] Processed exam session:', examSession);
        examSessions.push(examSession);
      });

      console.log('[ExamResultService] Successfully loaded', examSessions.length, 'exam sessions from Firebase');
      return examSessions;

    } catch (error) {
      console.error('[ExamResultService] Error loading exam history:', error);
      // If there's an error (like missing indexes), fall back to local storage
      console.log('[ExamResultService] Falling back to localStorage');
      const existingSessions = JSON.parse(localStorage.getItem('examSessions') || '[]');
      const userSessions = existingSessions.filter((session: StudySession) => 
        session.userId === userId && session.sessionType === 'exam'
      );
      console.log('[ExamResultService] Loaded', userSessions.length, 'exam sessions from localStorage');
      return userSessions;
    }
  }

  /**
   * Get exam results for a specific flashcard set
   */
  async getExamResultsForSet(flashcardSetId: string, userId: string): Promise<StudySession[]> {
    try {
      console.log('[ExamResultService] Loading exam results for set:', flashcardSetId);
      
      if (!db) {
        throw new Error('Firestore database not initialized');
      }

      const q = query(
        collection(db, 'studySessions'),
        where('userId', '==', userId),
        where('flashcardSetId', '==', flashcardSetId),
        where('sessionType', '==', 'exam'),
        orderBy('endTime', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const examSessions: StudySession[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const examSession: StudySession = {
          id: doc.id,
          flashcardSetId: data.flashcardSetId,
          userId: data.userId,
          startTime: data.startTime.toDate(),
          endTime: data.endTime ? data.endTime.toDate() : undefined,
          cardsStudied: data.cardsStudied,
          correctAnswers: data.correctAnswers,
          sessionType: data.sessionType,
          timeLimit: data.timeLimit,
          examResults: data.examResults || []
        };
        
        examSessions.push(examSession);
      });

      console.log('[ExamResultService] Successfully loaded', examSessions.length, 'exam results for set');
      return examSessions;

    } catch (error) {
      console.error('[ExamResultService] Error loading exam results for set:', error);
      return [];
    }
  }

  /**
   * Delete an exam session
   */
  async deleteExamSession(sessionId: string): Promise<void> {
    try {
      console.log('[ExamResultService] Deleting exam session:', sessionId);
      
      await deleteDoc(doc(db, 'studySessions', sessionId));
      console.log('[ExamResultService] Successfully deleted exam session');

    } catch (error) {
      console.error('[ExamResultService] Error deleting exam session:', error);
      throw error;
    }
  }

  /**
   * Get a specific exam session by ID
   */
  async getExamSession(sessionId: string): Promise<StudySession | null> {
    try {
      console.log('[ExamResultService] Getting exam session:', sessionId);
      
      const docRef = doc(db, 'studySessions', sessionId);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        return null;
      }

      const docData = docSnapshot.data();
      const examSession: StudySession = {
        id: docSnapshot.id,
        flashcardSetId: docData.flashcardSetId,
        userId: docData.userId,
        startTime: docData.startTime.toDate(),
        endTime: docData.endTime ? docData.endTime.toDate() : undefined,
        cardsStudied: docData.cardsStudied,
        correctAnswers: docData.correctAnswers,
        sessionType: docData.sessionType,
        timeLimit: docData.timeLimit,
        examResults: docData.examResults || []
      };

      return examSession;

    } catch (error) {
      console.error('[ExamResultService] Error getting exam session:', error);
      return null;
    }
  }

  /**
   * Calculate comprehensive exam statistics for a user
   */
  async getExamStatistics(userId: string): Promise<{
    totalExams: number;
    averageScore: number;
    bestScore: number;
    totalTimeSpent: number;
    averageTimePerExam: number;
    improvementTrend: number; // percentage change from first to last 5 exams
    difficultyBreakdown: { easy: number; medium: number; hard: number };
    recentExams: StudySession[];
  }> {
    try {
      const examHistory = await this.loadExamHistory(userId);
      
      if (examHistory.length === 0) {
        return {
          totalExams: 0,
          averageScore: 0,
          bestScore: 0,
          totalTimeSpent: 0,
          averageTimePerExam: 0,
          improvementTrend: 0,
          difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
          recentExams: []
        };
      }

      // Calculate basic statistics
      const scores = examHistory.map(session => 
        Math.round((session.correctAnswers / session.cardsStudied) * 100)
      );
      const totalTimeSpent = examHistory.reduce((sum, session) => {
        if (session.startTime && session.endTime) {
          return sum + (session.endTime.getTime() - session.startTime.getTime()) / 1000;
        }
        return sum;
      }, 0);

      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const bestScore = Math.max(...scores);
      const averageTimePerExam = totalTimeSpent / examHistory.length;

      // Calculate improvement trend (last 5 vs first 5 exams)
      let improvementTrend = 0;
      if (examHistory.length >= 5) {
        const recentAvg = scores.slice(0, 5).reduce((sum, score) => sum + score, 0) / 5;
        const oldAvg = scores.slice(-5).reduce((sum, score) => sum + score, 0) / 5;
        improvementTrend = ((recentAvg - oldAvg) / oldAvg) * 100;
      }

      // Calculate difficulty breakdown
      const difficultyBreakdown = { easy: 0, medium: 0, hard: 0 };
      examHistory.forEach(session => {
        session.examResults?.forEach(result => {
          if (result.isCorrect) {
            difficultyBreakdown[result.difficulty]++;
          }
        });
      });

      return {
        totalExams: examHistory.length,
        averageScore: Math.round(averageScore),
        bestScore,
        totalTimeSpent,
        averageTimePerExam,
        improvementTrend,
        difficultyBreakdown,
        recentExams: examHistory.slice(0, 10) // Most recent 10 exams
      };

    } catch (error) {
      console.error('[ExamResultService] Error calculating exam statistics:', error);
      throw error;
    }
  }

  /**
   * Get formatted exam history for UI display
   */
  async getExamHistory(userId: string, flashcardSetId?: string): Promise<{
    id: string;
    flashcardSetId: string;
    flashcardSetTitle: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    totalTime: number;
    avgTimePerQuestion: number;
    completedAt: Date;
    settings: {
      timePerQuestion: number;
      shuffleQuestions: boolean;
      showDifficulty: boolean;
      useAIEvaluation: boolean;
    };
  }[]> {
    try {
      console.log('[ExamResultService] Getting formatted exam history for user:', userId);
      
      // Load exam sessions
      let examSessions: StudySession[];
      if (flashcardSetId) {
        examSessions = await this.getExamResultsForSet(flashcardSetId, userId);
      } else {
        examSessions = await this.loadExamHistory(userId);
      }

      // Need to get flashcard set titles - for now, we'll use the flashcardSetId
      // In a real implementation, you might want to cache or fetch these separately
      const formattedHistory = examSessions.map(session => {
        const totalTime = session.endTime && session.startTime 
          ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000)
          : 0;
        
        const avgTimePerQuestion = session.cardsStudied > 0 
          ? Math.round(totalTime / session.cardsStudied)
          : 0;

        const score = session.cardsStudied > 0 
          ? Math.round((session.correctAnswers / session.cardsStudied) * 100)
          : 0;

        // Extract settings from the session data - with fallbacks
        const settings = {
          timePerQuestion: session.timeLimit || 60,
          shuffleQuestions: true, // Default, as this isn't stored in StudySession
          showDifficulty: false, // Default, as this isn't stored in StudySession  
          useAIEvaluation: session.examResults?.some(r => r.feedback) || false
        };        return {
          id: session.id,
          flashcardSetId: session.flashcardSetId,
          flashcardSetTitle: (session as any).flashcardSetTitle || `Flashcard Set ${session.flashcardSetId.slice(-6)}`,
          score,
          totalQuestions: session.cardsStudied,
          correctAnswers: session.correctAnswers,
          totalTime,
          avgTimePerQuestion,
          completedAt: session.endTime || new Date(),
          settings
        };
      });

      console.log('[ExamResultService] Successfully formatted', formattedHistory.length, 'exam history records');
      return formattedHistory;

    } catch (error) {
      console.error('[ExamResultService] Error getting formatted exam history:', error);
      throw error;
    }
  }
}

export const examResultService = new ExamResultService();
