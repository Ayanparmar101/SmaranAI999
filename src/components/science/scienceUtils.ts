export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanations?: string[];
}

export interface ScienceLesson {
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

export const scienceTopics = {
  beginner: [
    'Living and Non-Living Things',
    'Animals and Their Homes',
    'Plants and Their Parts',
    'Weather and Seasons',
    'Our Five Senses',
    'Day and Night',
  ],
  intermediate: [
    'Life Cycles of Animals',
    'States of Matter',
    'Simple Machines',
    'Food Chains',
    'The Solar System',
    'Magnets and Forces',
  ],
  advanced: [
    'Ecosystems and Habitats',
    'Chemical vs Physical Changes',
    'Energy and Motion',
    'Human Body Systems',
    'Earth and Space',
    'Scientific Method',
  ],
};

export const generateFallbackQuestions = (count: number, topic: string, difficulty: 'easy' | 'medium' | 'hard'): QuizQuestion[] => {
  const fallbackQuestions: QuizQuestion[] = [];
  
  for (let i = 0; i < count; i++) {
    fallbackQuestions.push({
      question: `Science practice question ${i + 1} about ${topic}`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      explanations: ["This is correct", "This is incorrect", "This is incorrect", "This is incorrect"]
    });
  }
  
  return fallbackQuestions;
};

export const createFallbackLesson = (topic: string, questionCount: number, difficulty: 'easy' | 'medium' | 'hard'): ScienceLesson => {
  const fallbackLesson: ScienceLesson = {
    title: `Science Lesson: ${topic}`,
    content: `This is a basic science lesson about ${topic}. Let's explore and discover together!`,
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
