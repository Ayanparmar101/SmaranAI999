
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanations?: string[];
}

export interface GrammarLesson {
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

export const grammarTopics = {
  beginner: [
    'Nouns and Pronouns',
    'Simple Present Tense',
    'Articles (a, an, the)',
    'Plural Nouns',
    'Common Adjectives',
    'Subject-Verb Agreement',
  ],
  intermediate: [
    'Present Continuous Tense',
    'Past Simple Tense',
    'Prepositions of Time and Place',
    'Comparative and Superlative Adjectives',
    'Adverbs of Frequency',
    'Modal Verbs (can, must)',
  ],
  advanced: [
    'Present Perfect Tense',
    'Past Continuous Tense',
    'Future Tenses',
    'Conditional Sentences',
    'Passive Voice',
    'Reported Speech',
  ],
};

export const generateFallbackQuestions = (count: number, topic: string, difficulty: 'easy' | 'medium' | 'hard'): QuizQuestion[] => {
  const fallbackQuestions: QuizQuestion[] = [];
  
  for (let i = 0; i < count; i++) {
    fallbackQuestions.push({
      question: `Practice question ${i + 1} about ${topic}`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      explanations: ["This is correct", "This is incorrect", "This is incorrect", "This is incorrect"]
    });
  }
  
  return fallbackQuestions;
};

export const createFallbackLesson = (topic: string, questionCount: number, difficulty: 'easy' | 'medium' | 'hard'): GrammarLesson => {
  const fallbackLesson: GrammarLesson = {
    title: `Lesson about ${topic}`,
    content: `This is a basic lesson about ${topic}. Let's learn together!`,
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
