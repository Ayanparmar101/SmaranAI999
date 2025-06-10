export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanations?: string[];
}

export interface MathLesson {
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

export const mathTopics = {
  beginner: [
    'Counting and Numbers 1-20',
    'Addition and Subtraction',
    'Basic Shapes',
    'Comparing Numbers',
    'Simple Patterns',
    'Telling Time (Hours)',
  ],
  intermediate: [
    'Multiplication Tables',
    'Division Basics',
    'Fractions Introduction',
    'Measurement (Length, Weight)',
    'Area and Perimeter',
    'Money and Coins',
  ],
  advanced: [
    'Decimals and Percentages',
    'Advanced Fractions',
    'Geometry and Angles',
    'Data and Graphs',
    'Problem Solving',
    'Basic Algebra',
  ],
};

export const generateFallbackQuestions = (count: number, topic: string, difficulty: 'easy' | 'medium' | 'hard'): QuizQuestion[] => {
  const fallbackQuestions: QuizQuestion[] = [];
  
  for (let i = 0; i < count; i++) {
    fallbackQuestions.push({
      question: `Math practice question ${i + 1} about ${topic}`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      explanations: ["This is correct", "This is incorrect", "This is incorrect", "This is incorrect"]
    });
  }
  
  return fallbackQuestions;
};

export const createFallbackLesson = (topic: string, questionCount: number, difficulty: 'easy' | 'medium' | 'hard'): MathLesson => {
  const fallbackLesson: MathLesson = {
    title: `Math Lesson: ${topic}`,
    content: `This is a basic math lesson about ${topic}. Let's solve problems together!`,
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
