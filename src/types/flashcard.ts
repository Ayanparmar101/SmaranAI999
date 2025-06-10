// Types for flashcard functionality
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
  createdAt: Date;
  lastReviewed?: Date;
  reviewCount?: number;
  correctCount?: number;
  source?: string; // PDF filename or source
}

export interface FlashcardSet {
  id: string;
  title: string;
  description?: string;
  flashcards: Flashcard[];
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  sourceFile?: string; // Original PDF filename
  totalCards: number;
}

export interface StudySession {
  id: string;
  flashcardSetId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  cardsStudied: number;
  correctAnswers: number;
  sessionType: 'practice' | 'test' | 'review' | 'exam';
  timeLimit?: number; // seconds per question for exam mode
  examResults?: ExamResult[];
}

export interface ExamResult {
  questionId: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // seconds spent on this question
  difficulty: 'easy' | 'medium' | 'hard';
  partialCredit?: number; // 0-1 scale for partial correctness from AI evaluation
  feedback?: string; // AI feedback about the answer
  explanation?: string; // AI explanation of why answer was correct/incorrect
}
