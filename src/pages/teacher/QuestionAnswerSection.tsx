
import React, { RefObject, useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import VoiceControlButtons from '@/components/voice-assistant/VoiceControlButtons';
import { NeoButton } from '@/components/NeoButton';
import { Skeleton } from '@/components/ui/skeleton';
import AnswerRenderer from '@/components/AnswerRenderer';
import { useDebouncedCallback } from '@/hooks/useDebounce';


interface QuestionAnswerSectionProps {
  question: string; 
  answer: string; 
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void; 
  askQuestion: (questionText: string) => void; 
  isLoading: boolean; 
  selectedChapter: string;
  answerRef: RefObject<HTMLDivElement>;
}

const QuestionAnswerSection: React.FC<QuestionAnswerSectionProps> = memo(({
  question,
  answer,
  isListening,
  startListening,
  stopListening,
  askQuestion,
  isLoading,
  selectedChapter,
  answerRef
}) => {
  const [inputValue, setInputValue] = useState<string>(question);

  // Debounced input change to prevent excessive re-renders
  const debouncedSetInput = useDebouncedCallback((value: string) => {
    setInputValue(value);
  }, 150);

  useEffect(() => {
    setInputValue(question);
  }, [question]);

  // Memoize handlers to prevent re-renders
  const handleStopSpeaking = useCallback(() => {
    // Implementation for stopping speech
  }, []);

  const handleReplay = useCallback(() => {
    // Implementation for replay
  }, []);

  const handleAskQuestionClick = useCallback(() => {
    if (inputValue.trim()) {
      askQuestion(inputValue);
    }
  }, [askQuestion, inputValue]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value); // Immediate update for UI responsiveness
  }, []);

  // Memoize loading skeleton to prevent re-renders
  const loadingSkeleton = useMemo(() => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  ), []);

  // Memoize placeholder text
  const placeholderText = useMemo(() =>
    isListening ? "Listening... speak your question." : "Type or record your question..."
  , [isListening]);

  // Memoize button state
  const isButtonDisabled = useMemo(() =>
    !selectedChapter || isLoading || isListening || !inputValue.trim()
  , [selectedChapter, isLoading, isListening, inputValue]);

  return (
    // Responsive card with mobile-optimized layout
    <Card className="flex flex-col neo-card">
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Ask Questions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden pt-2 sm:pt-4">
        {/* Answer Area with responsive height */}
        <div className="overflow-hidden mb-4 border-3 border-border rounded-md shadow-neo-sm">
          <ScrollArea className="h-[300px] sm:h-[350px] lg:h-[400px] w-full pr-2 sm:pr-4" ref={answerRef}>
            <div className="p-3 sm:p-4">
              {isLoading && !answer ? loadingSkeleton : answer ? (
                <AnswerRenderer content={answer} />
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  <p className="text-sm sm:text-base">Type or record your question below. The answer will appear here.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area with mobile optimization */}
        <div className="mt-auto space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t">
          {/* Voice Controls */}
          <div className="flex justify-center">
            <VoiceControlButtons
              isListening={isListening}
              isSpeaking={false}
              isProcessing={isLoading}
              hasAudioMessages={false}
              onStartListening={startListening}
              onStopListening={stopListening}
              onStopSpeaking={handleStopSpeaking}
              onReplayLastResponse={handleReplay}
              showPlaybackControls={false}
            />
          </div>

          {/* Text Input with mobile optimization */}
          <Textarea
            placeholder={placeholderText}
            value={inputValue}
            onChange={handleInputChange}
            className={`neo-input w-full min-h-[80px] sm:min-h-[60px] text-sm sm:text-base ${isListening ? 'border-purple-500 border-2' : ''}`}
            rows={3}
          />

          {/* Ask Button with mobile touch target */}
          <NeoButton
            onClick={handleAskQuestionClick}
            disabled={isButtonDisabled}
            className="w-full min-h-[48px] text-sm sm:text-base"
            variant="primary"
            loading={isLoading}
          >
            {isLoading ? "Thinking..." : "Ask Question"}
          </NeoButton>
        </div>
      </CardContent>
    </Card>
  );
});

QuestionAnswerSection.displayName = 'QuestionAnswerSection';

export default QuestionAnswerSection;
