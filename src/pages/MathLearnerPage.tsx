import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator } from 'lucide-react';
import { toast } from 'sonner';
import ApiKeyInput from '@/components/ApiKeyInput';
import openaiService from '@/services/openaiService';
import LevelSelector from '@/components/grammar/LevelSelector';
import DifficultySelector from '@/components/grammar/DifficultySelector';
import QuestionCountSelector from '@/components/grammar/QuestionCountSelector';
import TopicSelector from '@/components/grammar/TopicSelector';
import LoadingState from '@/components/grammar/LoadingState';
import LessonContent from '@/components/grammar/LessonContent';
import Quiz from '@/components/grammar/Quiz';
import {
  MathLesson,
  mathTopics,
  generateFallbackQuestions,
  createFallbackLesson
} from '@/components/math/mathUtils';

const MathLearnerPage = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [lesson, setLesson] = useState<MathLesson | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [numQuestions, setNumQuestions] = useState<number>(3);

  useEffect(() => {
    const initializeApiKey = async () => {
      try {
        // Check environment variable first
        const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (envApiKey && envApiKey.trim() !== '') {
          setApiKey(envApiKey);
          await openaiService.setApiKey(envApiKey);
        } else {
          // Check localStorage as fallback
          const savedApiKey = localStorage.getItem('openaiApiKey');
          if (savedApiKey && savedApiKey.trim() !== '') {
            try {
              setApiKey(savedApiKey);
              await openaiService.setApiKey(savedApiKey);
            } catch (error) {
              console.warn('[MathLearnerPage] Invalid API key in localStorage:', error);
              localStorage.removeItem('openaiApiKey');
              return;
            }
          }
        }
      } catch (error) {
        console.error('[MathLearnerPage] Failed to initialize API key:', error);
      }

      setLesson(null);
      setUserAnswers([]);
      setShowResults(false);
    };

    initializeApiKey();
  }, [navigate]);

  const handleApiKeySubmit = async (key: string) => {
    try {
      setApiKey(key);
      await openaiService.setApiKey(key);
    } catch (error) {
      console.error('[MathLearnerPage] Failed to set API key:', error);
      toast.error('Invalid API key format');
    }
  };

  const selectTopic = (topic: string) => {
    setSelectedTopic(topic);
    // Reset quiz state when selecting a new topic
    setLesson(null);
    setUserAnswers([]);
    setShowResults(false);

    if (apiKey) {
      generateLesson(topic);
    } else {
      toast.error('Please enter your OpenAI API key first');
    }
  };

  const generateLesson = async (topic: string) => {
    setLoading(true);
    setLesson(null);
    setUserAnswers([]);
    setShowResults(false);

    try {
      const promptLevel = selectedLevel === 'beginner' ? 'grades 1-2' :
                         selectedLevel === 'intermediate' ? 'grades 3-5' : 'grades 6-8';

      const difficultyLevel = selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);
      
      const questionCount = Math.max(1, Math.min(10, numQuestions));

      const systemPrompt = `You are an expert Math teacher for elementary school students. Create an engaging Math lesson about "${topic}" for ${promptLevel}. The lesson difficulty should be "${difficultyLevel}".
      
      Your response must follow this exact JSON format without any markdown formatting or extra text:
      {
        "title": "Lesson title",
        "content": "A clear, simple explanation of the math concept with step-by-step instructions (keep it concise)",
        "level": "${difficultyLevel}",
        "examples": ["Example 1 with solution", "Example 2 with solution", "Example 3 with solution"],
        "quiz": {
          "${selectedDifficulty}": [
            {
              "question": "Question text",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctIndex": 0,
              "explanations": ["Explanation for A", "Explanation for B", "Explanation for C", "Explanation for D"]
            }
          ]
        }
      }
      
      Important instructions:
      1. Generate EXACTLY ${questionCount} quiz questions for the "${selectedDifficulty}" difficulty.
      2. Keep the explanation and content brief and simple with clear math steps.
      3. Return only in strict JSON format with no extra text, markdown, or code blocks.
      4. Make sure all JSON is properly formatted and closed.
      5. Include numbers, calculations, and mathematical examples appropriate for the grade level.`;

      const result = await openaiService.createCompletion(systemPrompt, 'Generate a math lesson', {
        max_tokens: 3000,
        temperature: 0.7
      });
      
      try {
        let jsonStr = result
          .replace(/```json\n|\n```|```|\n/g, '')
          .trim();
          
        console.log("Raw JSON string length:", jsonStr.length);
        
        try {
          const parsedLesson = JSON.parse(jsonStr);
          
          const receivedQuestions = parsedLesson.quiz[selectedDifficulty]?.length || 0;
          console.log(`Received ${receivedQuestions} questions for ${selectedDifficulty} difficulty`);
          
          if (!parsedLesson.title || !parsedLesson.content || !parsedLesson.examples || 
              !parsedLesson.quiz || !parsedLesson.quiz[selectedDifficulty]) {
            throw new Error("Lesson data is missing required fields");
          }

          if (receivedQuestions < questionCount) {
            console.warn(`Received ${receivedQuestions} questions, but ${questionCount} were requested. Adding fallback questions.`);
            
            const fallbackQuestions = generateFallbackQuestions(
              questionCount - receivedQuestions,
              topic,
              selectedDifficulty
            );
            
            parsedLesson.quiz[selectedDifficulty] = [
              ...parsedLesson.quiz[selectedDifficulty],
              ...fallbackQuestions
            ];
          }
          
          if (receivedQuestions > questionCount) {
            parsedLesson.quiz[selectedDifficulty] = parsedLesson.quiz[selectedDifficulty].slice(0, questionCount);
          }

          setLesson(parsedLesson);
          setUserAnswers(new Array(parsedLesson.quiz[selectedDifficulty].length).fill(-1));
        } catch (jsonError) {
          console.error("JSON parsing error:", jsonError);
          
          if (jsonStr.length > 500) {
            console.log("JSON preview (first 500 chars):", jsonStr.substring(0, 500));
            console.log("JSON preview (last 100 chars):", jsonStr.substring(jsonStr.length - 100));
          }
          
          const fallbackLesson = createFallbackLesson(topic, questionCount, selectedDifficulty);
          setLesson(fallbackLesson);
          setUserAnswers(new Array(fallbackLesson.quiz[selectedDifficulty].length).fill(-1));
          toast.warning("Had trouble generating a perfect lesson, but created a simple version for you.");
        }
      } catch (error) {
        console.error("Error processing lesson content:", error);
        toast.error("Failed to parse lesson content. Please try a different topic or fewer questions.");
      }
    } catch (error) {
      console.error('Error generating lesson:', error);
      toast.error('Failed to generate lesson. Please try again with fewer questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (showResults) return;

    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleQuizSubmit = () => {
    if (!lesson) return;

    if (userAnswers.includes(-1)) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setShowResults(true);

    let correctAnswers = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === lesson.quiz[selectedDifficulty][index].correctIndex) {
        correctAnswers++;
      }
    });

    const percentage = Math.round((correctAnswers / lesson.quiz[selectedDifficulty].length) * 100);

    if (percentage >= 80) {
      toast.success(`Great job! You scored ${percentage}%`);
    } else if (percentage >= 60) {
      toast.info(`Good effort! You scored ${percentage}%`);
    } else {
      toast.info(`You scored ${percentage}%. Let's review the lesson and try again!`);
    }
  };

  const resetQuiz = () => {
    setUserAnswers(new Array(lesson?.quiz[selectedDifficulty].length || 0).fill(-1));
    setShowResults(false);
  };

  const handleNewPractice = () => {
    setShowResults(false);
    generateLesson(selectedTopic);
  };

  return (
    <div className="page-container">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          <span className="flex items-center justify-center gap-2">
            <Calculator className="text-kid-blue w-6 h-6 sm:w-8 sm:h-8" />
            <span>Math Learner</span>
          </span>
        </h1>
      </div>

      {/* API Key Input - Only show if no environment variable */}
      {!import.meta.env.VITE_OPENAI_API_KEY && (
        <div className="mb-6">
          <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
        </div>
      )}

      <LevelSelector 
        selectedLevel={selectedLevel} 
        onLevelChange={setSelectedLevel} 
      />

      <DifficultySelector
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={(difficulty) => {
          setSelectedDifficulty(difficulty);
          // Reset quiz state when difficulty changes
          setUserAnswers([]);
          setShowResults(false);
        }}
      />

      <QuestionCountSelector 
        numQuestions={numQuestions} 
        onNumQuestionsChange={setNumQuestions} 
      />

      <TopicSelector 
        topics={mathTopics[selectedLevel]} 
        selectedTopic={selectedTopic} 
        onTopicSelect={selectTopic} 
      />

      {loading ? (
        <LoadingState />
      ) : lesson ? (
        <div className="bg-white rounded-2xl p-6 shadow-neo border-3 border-black mb-8">
          <LessonContent 
            title={lesson.title}
            level={lesson.level}
            content={lesson.content}
            examples={lesson.examples}
          />
          
          <Quiz 
            questions={lesson.quiz[selectedDifficulty]}
            userAnswers={userAnswers}
            showResults={showResults}
            onAnswerSelect={handleAnswerSelect}
            onSubmitQuiz={handleQuizSubmit}
            onResetQuiz={resetQuiz}
            onNewPractice={handleNewPractice}
          />
        </div>
      ) : selectedTopic ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {apiKey ? "Click 'Generate Lesson' to start learning" : "Please enter your OpenAI API key to generate lessons"}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default MathLearnerPage;
