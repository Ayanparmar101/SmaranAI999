import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Timer, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  RotateCcw,
  AlertTriangle,
  Target,
  Zap,
  Brain
} from 'lucide-react';
import { Flashcard, ExamResult } from '@/types/flashcard';
import { toast } from 'sonner';
import { aiAnswerEvaluationService } from '@/services/aiAnswerEvaluationService';

interface FlashcardExamModeProps {
  flashcards: Flashcard[];
  onExamComplete: (results: ExamResult[], score: number, totalTime: number, settings: ExamSettings) => void;
  onExit: () => void;
  timePerQuestion?: number; // seconds, default 60
}

interface ExamSettings {
  timePerQuestion: number;
  shuffleQuestions: boolean;
  showDifficulty: boolean;
  useAIEvaluation: boolean;
}

const FlashcardExamMode: React.FC<FlashcardExamModeProps> = ({
  flashcards,
  onExamComplete,
  onExit,
  timePerQuestion = 60
}) => {
  // Exam state
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // Initialize with 60 seconds
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [examQuestions, setExamQuestions] = useState<Flashcard[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);  // Add state for evaluation loading
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [settings, setSettings] = useState<ExamSettings>({
    timePerQuestion: timePerQuestion,
    shuffleQuestions: true,
    showDifficulty: false,
    useAIEvaluation: true
  });
  // Current question
  const currentQuestion = examQuestions[currentQuestionIndex];
  const totalQuestions = examQuestions.length;
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;

  // Difficulty color helper
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-600';
    }
  };

  // Reset timer when question changes (only when currentQuestionIndex changes)
  useEffect(() => {
    if (!examStarted || examCompleted) return;
    
    const timerValue = settings.timePerQuestion || 60;
    console.log('Resetting timer to:', timerValue, 'for question:', currentQuestionIndex + 1);
    setTimeLeft(timerValue);
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex, examStarted]);

  // Timer countdown effect - separate from reset logic  
  useEffect(() => {
    if (!examStarted || examCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        console.log('Timer tick:', prev); // Debug log
        if (prev <= 1) {
          // Time's up - auto submit empty answer
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examCompleted]);

  const startExam = () => {
    let questions = [...flashcards];
    
    if (settings.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }
    
    console.log('Starting exam with timer:', settings.timePerQuestion); // Debug log
    setExamQuestions(questions);
    setExamStarted(true);
    // Timer will be set automatically by useEffect when examStarted changes
    toast.success('Exam started! Good luck!');
  };
  const handleTimeUp = useCallback(async () => {
    if (!currentQuestion) return;

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    
    let evaluation = {
      isCorrect: false,
      partialCredit: 0,
      feedback: 'Time expired - no answer provided',
      explanation: `Expected: ${currentQuestion.answer}`
    };    // If user provided an answer, evaluate it even though time is up
    if (userAnswer.trim() && settings.useAIEvaluation) {
      try {
        const aiEvaluation = await aiAnswerEvaluationService.evaluateAnswer(
          userAnswer.trim(),
          currentQuestion.answer,
          currentQuestion.question,
          currentQuestion.difficulty
        );
        
        evaluation = {
          isCorrect: aiEvaluation.isCorrect,
          partialCredit: aiEvaluation.partialCredit ?? (aiEvaluation.isCorrect ? 1 : 0),
          feedback: aiEvaluation.feedback ?? (aiEvaluation.isCorrect ? 'Correct!' : 'Incorrect'),
          explanation: aiEvaluation.explanation
        };
        
        // Override to indicate time expired but still evaluate the answer
        if (evaluation.isCorrect) {
          evaluation.feedback = `Time expired, but your answer was correct: ${evaluation.feedback}`;
        } else {
          evaluation.feedback = `Time expired: ${evaluation.feedback}`;
        }
      } catch (error) {
        console.error('AI evaluation failed during timeout:', error);
      }
    }

    const result: ExamResult = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      correctAnswer: currentQuestion.answer,
      userAnswer: userAnswer.trim() || '[No answer - Time expired]',
      isCorrect: evaluation.isCorrect,
      timeSpent,
      difficulty: currentQuestion.difficulty,
      partialCredit: evaluation.partialCredit,
      feedback: evaluation.feedback,
      explanation: evaluation.explanation
    };

    setExamResults(prev => [...prev, result]);
    moveToNextQuestion();
  }, [currentQuestion, userAnswer, questionStartTime, settings.useAIEvaluation]);
  const submitAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim()) {
      toast.error('Please provide an answer before submitting');
      return;
    }

    setIsEvaluating(true);
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    
    try {
      let evaluation;
        if (settings.useAIEvaluation) {
        // Use AI evaluation
        const aiEvaluation = await aiAnswerEvaluationService.evaluateAnswer(
          userAnswer.trim(),
          currentQuestion.answer,
          currentQuestion.question,
          currentQuestion.difficulty
        );
        
        evaluation = {
          isCorrect: aiEvaluation.isCorrect,
          partialCredit: aiEvaluation.partialCredit ?? (aiEvaluation.isCorrect ? 1 : 0),
          feedback: aiEvaluation.feedback ?? (aiEvaluation.isCorrect ? 'Correct!' : 'Incorrect'),
          explanation: aiEvaluation.explanation
        };
      } else {
        // Use simple string comparison
        const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase();
        evaluation = {
          isCorrect,
          partialCredit: isCorrect ? 1 : 0,
          feedback: isCorrect ? 'Correct!' : 'Incorrect',
          explanation: !isCorrect ? `Expected: ${currentQuestion.answer}` : undefined
        };
      }
      
      const result: ExamResult = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        correctAnswer: currentQuestion.answer,
        userAnswer: userAnswer.trim(),
        isCorrect: evaluation.isCorrect,
        timeSpent,
        difficulty: currentQuestion.difficulty,
        partialCredit: evaluation.partialCredit,
        feedback: evaluation.feedback,
        explanation: evaluation.explanation
      };

      setExamResults(prev => [...prev, result]);
      
      // Show feedback toast
      if (settings.useAIEvaluation && evaluation.feedback) {
        if (evaluation.isCorrect) {
          toast.success(evaluation.feedback);
        } else {
          toast.error(evaluation.feedback);
        }
      }
      
      moveToNextQuestion();
    } catch (error) {
      console.error('Answer evaluation failed:', error);
      toast.error('Error evaluating answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };
  const moveToNextQuestion = () => {
    if (currentQuestionIndex + 1 >= totalQuestions) {
      // Exam completed
      completeExam();
    } else {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      // Timer will be reset automatically by useEffect when currentQuestionIndex changes
    }
  };
  const completeExam = async () => {
    setExamCompleted(true);
    
    // Handle final question evaluation if needed
    let finalResults = [...examResults];
    if (examResults.length < totalQuestions && currentQuestion) {
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
      
      let evaluation;
        if (settings.useAIEvaluation && userAnswer.trim()) {
        try {
          const aiEvaluation = await aiAnswerEvaluationService.evaluateAnswer(
            userAnswer.trim(),
            currentQuestion.answer,
            currentQuestion.question,
            currentQuestion.difficulty
          );
          
          evaluation = {
            isCorrect: aiEvaluation.isCorrect,
            partialCredit: aiEvaluation.partialCredit ?? (aiEvaluation.isCorrect ? 1 : 0),
            feedback: aiEvaluation.feedback ?? (aiEvaluation.isCorrect ? 'Correct!' : 'Incorrect'),
            explanation: aiEvaluation.explanation
          };
        } catch (error) {
          console.error('AI evaluation failed during exam completion:', error);
          // Fallback to simple evaluation
          const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase();
          evaluation = {
            isCorrect,
            partialCredit: isCorrect ? 1 : 0,
            feedback: isCorrect ? 'Correct!' : 'Incorrect',
            explanation: !isCorrect ? `Expected: ${currentQuestion.answer}` : undefined
          };
        }
      } else {
        // Simple evaluation or no answer
        const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase();
        evaluation = {
          isCorrect,
          partialCredit: isCorrect ? 1 : 0,
          feedback: isCorrect ? 'Correct!' : 'Incorrect',
          explanation: !isCorrect ? `Expected: ${currentQuestion.answer}` : undefined
        };
      }
      
      finalResults.push({
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        correctAnswer: currentQuestion.answer,
        userAnswer: userAnswer.trim() || '[No answer]',
        isCorrect: evaluation.isCorrect,
        timeSpent,
        difficulty: currentQuestion.difficulty,
        partialCredit: evaluation.partialCredit,
        feedback: evaluation.feedback,
        explanation: evaluation.explanation
      });
    }
      // Calculate score based on actual correctness
    const correctAnswers = finalResults.filter(r => r.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const totalTime = finalResults.reduce((sum, r) => sum + r.timeSpent, 0);
    
    onExamComplete(finalResults, score, totalTime, settings);
    toast.success(`Exam completed! Score: ${score}%`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };
  const resetExam = () => {
    setExamStarted(false);
    setExamCompleted(false);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setTimeLeft(60); // Reset to 60 seconds
    setExamResults([]);
    setExamQuestions([]);
  };

  // Pre-exam settings screen
  if (!examStarted && !examCompleted) {
    return (
      <div className="space-y-6">
        <Card className="p-6 dark:bg-card dark:border-border">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2 dark:text-foreground">Exam Mode</h2>
            <p className="text-muted-foreground">
              Test your knowledge with a timed exam. Each question has a time limit and you cannot go back.
            </p>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-700 rounded-lg border">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{flashcards.length}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Questions</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-700 rounded-lg border">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{settings.timePerQuestion}s</div>
                <div className="text-sm text-orange-600 dark:text-orange-400">Per Question</div>
              </div>
            </div>

            <div className="space-y-3">              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Time per question (seconds)</label>
                <Input
                  type="number"
                  min="15"
                  max="120"
                  value={settings.timePerQuestion}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    timePerQuestion: parseInt(e.target.value) || 60 
                  }))}
                  className="w-20"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Shuffle questions</label>
                <Button
                  variant={settings.shuffleQuestions ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    shuffleQuestions: !prev.shuffleQuestions 
                  }))}
                >
                  {settings.shuffleQuestions ? 'Yes' : 'No'}
                </Button>
              </div>              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Show difficulty</label>
                <Button
                  variant={settings.showDifficulty ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    showDifficulty: !prev.showDifficulty 
                  }))}
                >
                  {settings.showDifficulty ? 'Yes' : 'No'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">AI-powered evaluation</label>
                  <Brain className="w-4 h-4 text-blue-500" />
                </div>
                <Button
                  variant={settings.useAIEvaluation ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    useAIEvaluation: !prev.useAIEvaluation 
                  }))}
                >
                  {settings.useAIEvaluation ? 'Yes' : 'No'}
                </Button>
              </div>
              
              {settings.useAIEvaluation && (
                <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 dark:border-blue-700 p-2 rounded border">
                  <div className="flex items-center gap-1 mb-1">
                    <Brain className="w-3 h-3" />
                    <span className="font-medium">AI Evaluation Features:</span>
                  </div>
                  <ul className="text-xs space-y-0.5 ml-4">
                    <li>• Accepts synonyms and alternative phrasings</li>
                    <li>• Tolerates minor spelling/grammar errors</li>
                    <li>• Provides detailed feedback on answers</li>
                    <li>• Considers partial correctness</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-center mt-6">
            <Button onClick={onExit} variant="outline">
              Cancel
            </Button>
            <Button onClick={startExam} className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800">
              <Zap className="w-4 h-4 mr-2" />
              Start Exam
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Results screen
  if (examCompleted) {
    const correctCount = examResults.filter(r => r.isCorrect).length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const totalTime = examResults.reduce((sum, r) => sum + r.timeSpent, 0);
    const avgTime = Math.round(totalTime / totalQuestions);

    return (
      <div className="space-y-6">
        <Card className="p-6 dark:bg-card dark:border-border">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-600 dark:from-green-600 dark:to-blue-700 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2 dark:text-foreground">Exam Results</h2>
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(score)}`}>
              {score}%
            </div>
            <p className="text-muted-foreground">
              {correctCount} out of {totalQuestions} questions correct
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-700 rounded-lg border">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatTime(totalTime)}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Total Time</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 dark:border-green-700 rounded-lg border">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{formatTime(avgTime)}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Avg. per Question</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-700 rounded-lg border">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round((correctCount / totalQuestions) * 100)}%
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Accuracy</div>
            </div>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            <h3 className="font-semibold">Question Review:</h3>
            {examResults.map((result, index) => (
              <Card key={result.questionId} className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Q{index + 1}</span>
                    {result.isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <Badge className={getDifficultyColor(result.difficulty)} variant="outline">
                      {result.difficulty}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(result.timeSpent)}
                  </div>
                </div>                <div className="text-sm space-y-1">
                  <p><strong>Q:</strong> {result.question}</p>
                  <p><strong>Correct:</strong> {result.correctAnswer}</p>
                  <p className={result.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    <strong>Your answer:</strong> {result.userAnswer}
                  </p>
                  {result.feedback && (
                    <p className="text-blue-600 dark:text-blue-400">
                      <strong>Feedback:</strong> {result.feedback}
                    </p>
                  )}
                  {result.explanation && (
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      <strong>Note:</strong> {result.explanation}
                    </p>
                  )}
                  {result.partialCredit !== undefined && result.partialCredit > 0 && result.partialCredit < 1 && (
                    <p className="text-yellow-600 dark:text-yellow-400 text-xs">
                      <strong>Partial Credit:</strong> {Math.round(result.partialCredit * 100)}%
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 justify-center mt-6">
            <Button onClick={onExit} variant="outline">
              Exit
            </Button>
            <Button onClick={resetExam}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Exam
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Exam in progress
  return (
    <div className="space-y-4">
      {/* Header with progress and timer */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </h3>
            {settings.showDifficulty && (
              <Badge className={getDifficultyColor(currentQuestion?.difficulty || 'medium')}>
                {currentQuestion?.difficulty}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${timeLeft <= 15 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
              <Timer className="w-4 h-4" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
            <Button onClick={onExit} variant="ghost" size="sm">
              Exit Exam
            </Button>
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
          {timeLeft <= 15 && (
          <div className="flex items-center justify-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Time running out!</span>
          </div>
        )}
      </Card>

      {/* Question Card */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground mb-4">Question</div>
            <div className="text-xl leading-relaxed mb-6">
              {currentQuestion?.question}
            </div>
            
            <div className="max-w-md mx-auto">
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="text-center text-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && userAnswer.trim()) {
                    submitAnswer();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
        </div>
      </Card>      {/* Submit button */}
      <div className="flex justify-center">
        <Button
          onClick={submitAnswer}
          disabled={!userAnswer.trim() || isEvaluating}
          size="lg"
          className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800"
        >
          {isEvaluating ? (
            <>
              <Brain className="w-4 h-4 mr-2 animate-pulse" />
              {settings.useAIEvaluation ? 'AI Evaluating...' : 'Evaluating...'}
            </>
          ) : (
            <>
              {currentQuestionIndex + 1 === totalQuestions ? 'Finish Exam' : 'Submit Answer'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FlashcardExamMode;
