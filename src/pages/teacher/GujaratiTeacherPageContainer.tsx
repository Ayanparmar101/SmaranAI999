import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import ChapterSelector from './ChapterSelector';
import ChapterContent from './ChapterContent';
import QuestionAnswerSection from './QuestionAnswerSection';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useChapterPDF } from '@/hooks/useChapterPDF';
import { useTeacherQA } from '@/hooks/useTeacherQA';
import { useOpenAIKey } from '@/hooks/useOpenAIKey';
import { openaiService } from '@/services/openai';

const GujaratiTeacherPageContainer: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string>("8");
  const [selectedBook, setSelectedBook] = useState<string>("ncert-gujarati");
  const [selectedChapter, setSelectedChapter] = useState<string>("ch01"); // Default to Chapter 1
  
  const [questionFromVoice, setQuestionFromVoice] = useState('');
  
  useOpenAIKey();

  const handleTranscriptChange = useCallback((transcript: string) => {
    setQuestionFromVoice(transcript);
  }, []);

  const handleSpeechEnd = useCallback((finalTranscript: string) => {
    console.log("Final transcript received in Gujarati container:", finalTranscript);
    setQuestionFromVoice(finalTranscript);
  }, []);

  const { isListening, startListening, stopListening } = useVoiceRecognition({
    onTranscriptChange: handleTranscriptChange,
    onSpeechEnd: handleSpeechEnd
  });

  const { chapterContent, pdfUrl } = useChapterPDF(selectedBook, selectedChapter, 'gujarati', selectedClass);

  const { answer, isLoading, askQuestion, answerRef } = useTeacherQA(user, selectedClass, selectedBook, selectedChapter, chapterContent);

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to access the teacher features');
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    console.log('[GujaratiTeacherPageContainer] State Check:');
    console.log('  Selected Chapter:', selectedChapter);
    console.log('  Chapter Content Length:', chapterContent?.length);
    console.log('  API Key Set:', !!openaiService.getApiKey());
  }, [selectedChapter, chapterContent]);

  useEffect(() => {
    console.log('[GujaratiTeacherPageContainer] Answer state updated:', answer);
  }, [answer]);

  const handleBack = () => {
    navigate('/gujarati');
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
          <span className="hidden sm:inline">ગુજરાતી પૃષ્ઠ પર પાછા જાઓ (Back to Gujarati)</span>
          <span className="sm:hidden">પાછા (Back)</span>
        </Button>
      </div>

      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-700 flex-shrink-0">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base sm:text-lg lg:text-xl">શિક્ષક સાધનો - ગુજરાતી શિક્ષણ અને સામગ્રી નિર્માણમાં મદદ માટેના સાધનો</CardTitle>
              <CardDescription className="text-sm sm:text-base mt-1">
                એનસીઈઆરટી કક્ષા 8 ગુજરાતી પ્રકરણો ઇન્ટરેક્ટિવ શિક્ષણ સહાયતા સાથે. એક પ્રકરણ પસંદ કરો અને ટેક્સ્ટ અથવા અવાજનો ઉપયોગ કરીને પ્રશ્નો પૂછો.
                <br />
                <span className="text-xs sm:text-sm text-muted-foreground italic">
                  (NCERT Class 8 Gujarati chapters with interactive teaching support. Select a chapter and ask questions using text or voice.)
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2 sm:pt-6">
          <ChapterSelector
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedBook={selectedBook}
            setSelectedBook={setSelectedBook}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
            subject="gujarati"
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

export default GujaratiTeacherPageContainer;
