export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanations?: string[];
}

export interface SocialScienceLesson {
  title: string;
  content: string;
  level: string;
  examples: string[];
  quiz: {
    easy: QuizQuestion[];
    medium: QuizQuestion[];
    hard: QuizQuestion[];
  };
}

export const socialScienceTopics = {
  beginner: [
    'My Family and Community',
    'Helpers in Our Community',
    'Rules and Safety',
    'Different Types of Homes',
    'Transportation',
    'Festivals and Celebrations',
  ],
  intermediate: [
    'Maps and Directions',
    'Countries and Continents',
    'Government and Leaders',
    'Natural Resources',
    'Culture and Traditions',
    'Past, Present, and Future',
  ],
  advanced: [
    'Ancient Civilizations',
    'Geography and Climate',
    'Democracy and Citizenship',
    'Economics and Trade',
    'Historical Events',
    'Global Connections',
  ],
};

export const generateFallbackQuestions = (count: number, topic: string, difficulty: 'easy' | 'medium' | 'hard'): QuizQuestion[] => {
  const fallbackQuestions: QuizQuestion[] = [];
  
  for (let i = 0; i < count; i++) {
    fallbackQuestions.push({
      question: `Social Science practice question ${i + 1} about ${topic}`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      explanations: ["This is correct", "This is incorrect", "This is incorrect", "This is incorrect"]
    });
  }
  
  return fallbackQuestions;
};

export const createFallbackLesson = (topic: string, questionCount: number, difficulty: 'easy' | 'medium' | 'hard'): SocialScienceLesson => {
  const fallbackLesson: SocialScienceLesson = {
    title: `Social Science Lesson: ${topic}`,
    content: `This is a basic social science lesson about ${topic}. Let's learn about our world together!`,
    level: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
    examples: ["Example 1", "Example 2", "Example 3"],
    quiz: {
      easy: [],
      medium: [],
      hard: []
    }
  };
  
  fallbackLesson.quiz[difficulty] = generateFallbackQuestions(questionCount, topic, difficulty);
  
  return fallbackLesson;
};
