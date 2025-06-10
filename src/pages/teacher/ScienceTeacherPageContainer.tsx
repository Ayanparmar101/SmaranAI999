import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Atom } from 'lucide-react';
import ScienceChapterSelector from './ScienceChapterSelector';
import ChapterContent from './ChapterContent';
import QuestionAnswerSection from './QuestionAnswerSection';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useChapterPDF } from '@/hooks/useChapterPDF';
import { useTeacherQA } from '@/hooks/useTeacherQA';
import { useOpenAIKey } from '@/hooks/useOpenAIKey';
import { openaiService } from '@/services/openai';

const ScienceTeacherPageContainer: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();  const [selectedClass, setSelectedClass] = useState<string>("8");
  const [selectedBook, setSelectedBook] = useState<string>("ncert-science");
  const [selectedChapter, setSelectedChapter] = useState<string>("ch01"); // Default to Chapter 1
  
  const [questionFromVoice, setQuestionFromVoice] = useState('');
  
  useOpenAIKey();

  const handleTranscriptChange = useCallback((transcript: string) => {
    setQuestionFromVoice(transcript);
  }, []);

  const handleSpeechEnd = useCallback((finalTranscript: string) => {
    console.log("Final transcript received in Science container:", finalTranscript);
    setQuestionFromVoice(finalTranscript);
  }, []);

  const { isListening, startListening, stopListening } = useVoiceRecognition({
    onTranscriptChange: handleTranscriptChange,
    onSpeechEnd: handleSpeechEnd
  });

  const { chapterContent, pdfUrl } = useChapterPDF(selectedBook, selectedChapter, 'science', selectedClass);
  const { answer, isLoading, askQuestion, answerRef } = useTeacherQA(user, selectedClass, selectedBook, selectedChapter, chapterContent);

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to access the teacher features');
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    console.log('[ScienceTeacherPageContainer] State Check:');
    console.log('  Selected Chapter:', selectedChapter);
    console.log('  Chapter Content Length:', chapterContent?.length);
    console.log('  API Key Set:', !!openaiService.getApiKey());
  }, [selectedChapter, chapterContent]);

  useEffect(() => {
    console.log('[ScienceTeacherPageContainer] Answer state updated:', answer);
  }, [answer]);

  const handleBack = () => {
    navigate('/science');
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
      <div className="mb-4 sm:mb-6">
        <Button
          onClick={handleBack}
          variant="outline"
          className="mb-4 neo-button min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Back to Science</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-700 flex-shrink-0">
              <Atom className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl">Science Teacher Tools</CardTitle>
              <CardDescription className="text-sm sm:text-base mt-1">
                NCERT Class 8 Science chapters with interactive teaching support. Select a chapter and ask questions using text or voice.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2 sm:pt-6">
          <ScienceChapterSelector
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedBook={selectedBook}
            setSelectedBook={setSelectedBook}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <ChapterContent
          chapterContent={chapterContent}
          pdfUrl={pdfUrl}
        />

        <QuestionAnswerSection
          question={questionFromVoice}
          answer={answer}
          isListening={isListening}
          startListening={startListening}
          stopListening={stopListening}
          askQuestion={askQuestion}
          isLoading={isLoading}
          selectedChapter={selectedChapter}
          answerRef={answerRef}
        />
      </div>
    </div>
  );
};

export default ScienceTeacherPageContainer;
