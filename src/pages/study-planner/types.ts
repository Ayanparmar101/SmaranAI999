
export interface StudyTask {
  name: string;
  duration: string;
  details: string;
  completed?: boolean;
}

export interface StudyDay {
  day: number;
  title: string;
  tasks: StudyTask[];
}

export interface StudyPlan {
  chapterTitle: string;
  approach: string;
  timeEstimate: string;
  keyTopics: { topic: string; importance: string }[];
  prerequisites: { topic: string; reason: string }[];
  steps: StudyDay[];
  tips: string[];
  completionPercentage: number;
}

// Add the StudyPlanStep type for the study steps components
export interface StudyPlanStep {
  title: string;
  description: string;
  timeAllocation: string;
  completed: boolean;
}
