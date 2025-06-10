import React, { useState, useCallback, useMemo, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, Check, X, Star, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Flashcard, ExamResult } from '@/types/flashcard';
import FlashcardExamMode from './FlashcardExamMode';
import { examResultService } from '@/services/examResultService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onUpdateFlashcard?: (flashcard: Flashcard) => void;
  flashcardSetId?: string; // Add optional flashcard set ID for exam result saving
  flashcardSetTitle?: string; // Add optional title for context
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = memo(({
  flashcards,
  onUpdateFlashcard,
  flashcardSetId,
  flashcardSetTitle
}) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [examMode, setExamMode] = useState(false);

  // Memoize current card to prevent unnecessary re-renders
  const currentCard = useMemo(() => flashcards[currentIndex], [flashcards, currentIndex]);

  // Memoize navigation functions to prevent re-renders
  const nextCard = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setIsFlipped(false);
  }, [flashcards.length]);

  const prevCard = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setIsFlipped(false);
  }, [flashcards.length]);

  const flipCard = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  // Memoize handlers to prevent re-renders
  const handleCorrect = useCallback(() => {
    if (onUpdateFlashcard && currentCard) {
      const updatedCard = {
        ...currentCard,
        correctCount: (currentCard.correctCount || 0) + 1,
        reviewCount: (currentCard.reviewCount || 0) + 1,
        lastReviewed: new Date()
      };
      onUpdateFlashcard(updatedCard);
    }
    nextCard();
  }, [onUpdateFlashcard, currentCard, nextCard]);

  const handleIncorrect = useCallback(() => {
    if (onUpdateFlashcard && currentCard) {
      const updatedCard = {
        ...currentCard,
        reviewCount: (currentCard.reviewCount || 0) + 1,
        lastReviewed: new Date()
      };
      onUpdateFlashcard(updatedCard);
    }
    nextCard();
  }, [onUpdateFlashcard, currentCard, nextCard]);  const handleExamComplete = (results: ExamResult[], score: number, totalTime: number, settings: any) => {
    console.log('Exam completed with results:', results, 'Score:', score);
    // Save exam results to database
    if (user && flashcardSetId) {      examResultService.saveExamResults(
        flashcardSetId,
        user.uid,
        results,
        score,
        totalTime,
        settings,
        flashcardSetTitle
      )
      .then(() => {
        toast.success('Exam results saved successfully!');
      })
      .catch((error) => {
        console.error('Error saving exam results:', error);
        toast.error('Failed to save exam results. Please try again.');
      });
    }
  };

  const handleExamExit = () => {
    setExamMode(false);
  };

  // Memoize difficulty color calculation
  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-600';
    }
  }, []);
  if (!currentCard) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No flashcards available</p>
      </Card>
    );
  }

  // Render exam mode if active
  if (examMode) {
    return (
      <FlashcardExamMode
        flashcards={flashcards}
        onExamComplete={handleExamComplete}
        onExit={handleExamExit}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <h3 className="text-base sm:text-lg font-semibold">
            Card {currentIndex + 1} of {flashcards.length}
          </h3>
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(currentCard.difficulty)}>
              {currentCard.difficulty}
            </Badge>
            {currentCard.category && (
              <Badge variant="outline">{currentCard.category}</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStudyMode(!studyMode)}
            className="flex-1 sm:flex-none min-h-[44px] text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">{studyMode ? 'Exit Study Mode' : 'Study Mode'}</span>
            <span className="sm:hidden">{studyMode ? 'Exit Study' : 'Study'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExamMode(true)}
            className="flex-1 sm:flex-none min-h-[44px] text-xs sm:text-sm bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/50"
          >
            <Target className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Exam Mode</span>
            <span className="sm:hidden">Exam</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFlipped(false)}
            className="min-h-[44px] min-w-[44px] p-2"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Flashcard with 3D Flip Animation */}
      <div className="flashcard-container">
        <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`} onClick={flipCard}>
          {/* Front Face */}
          <Card className="flashcard-face flashcard-front bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 dark:border-green-700 hover:shadow-lg transition-shadow duration-300">
            <div className="p-4 sm:p-6 lg:p-8 min-h-[250px] sm:min-h-[300px] flex flex-col justify-center">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4">
                  Question
                </div>

                <div className="text-base sm:text-lg leading-relaxed px-2">
                  {currentCard.question}
                </div>

                <div className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
                  <span className="hidden sm:inline">Click to reveal answer</span>
                  <span className="sm:hidden">Tap to reveal answer</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Back Face */}
          <Card className="flashcard-face flashcard-back bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 dark:border-blue-700 hover:shadow-lg transition-shadow duration-300">
            <div className="p-4 sm:p-6 lg:p-8 min-h-[250px] sm:min-h-[300px] flex flex-col justify-center">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4">
                  Answer
                </div>

                <div className="text-base sm:text-lg leading-relaxed px-2">
                  {currentCard.answer}
                </div>

                {studyMode && (
                  <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 px-2">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIncorrect();
                      }}
                      className="w-full sm:w-auto min-h-[48px] text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/30"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Incorrect
                    </Button>
                    <Button
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCorrect();
                      }}
                      className="w-full sm:w-auto min-h-[48px] bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Correct
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={prevCard}
          disabled={flashcards.length <= 1}
          className="min-h-[44px] flex-1 sm:flex-none"
        >
          <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Button>

        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-[200px] sm:max-w-none">
          {flashcards.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all flex-shrink-0 ${
                index === currentIndex
                  ? 'bg-primary w-6 sm:w-8'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              onClick={() => {
                setCurrentIndex(index);
                setIsFlipped(false);
              }}
            />
          ))}
        </div>

        <Button
          variant="outline"
          onClick={nextCard}
          disabled={flashcards.length <= 1}
          className="min-h-[44px] flex-1 sm:flex-none"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="w-4 h-4 ml-1 sm:ml-2" />
        </Button>
      </div>

      {/* Card Info */}
      {currentCard.reviewCount && (
        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <span>Reviewed: {currentCard.reviewCount} times</span>
            {currentCard.correctCount && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                Accuracy: {Math.round((currentCard.correctCount / currentCard.reviewCount) * 100)}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default FlashcardViewer;
