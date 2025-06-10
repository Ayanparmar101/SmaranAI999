
// Common types used across the application
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string | number;
  imageUrl?: string; // Add optional imageUrl to the Message type
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  description: string;
  tasks: StudyTask[];
  createdAt: Date;
}

export interface StudyTask {
  id: string;
  title: string;
  completed: boolean;
  duration: number; // in minutes
}
