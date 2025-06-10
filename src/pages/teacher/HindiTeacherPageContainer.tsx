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

const HindiTeacherPageContainer: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string>("8");
  const [selectedBook, setSelectedBook] = useState<string>("ncert-hindi");
  const [selectedChapter, setSelectedChapter] = useState<string>("ch01"); // Default to Chapter 1
  
  const [questionFromVoice, setQuestionFromVoice] = useState('');
  
  useOpenAIKey();

  const handleTranscriptChange = useCallback((transcript: string) => {
    setQuestionFromVoice(transcript);
  }, []);

  const handleSpeechEnd = useCallback((finalTranscript: string) => {
    console.log("Final transcript received in Hindi container:", finalTranscript);
    setQuestionFromVoice(finalTranscript);
  }, []);

  const { isListening, startListening, stopListening } = useVoiceRecognition({
    onTranscriptChange: handleTranscriptChange,
    onSpeechEnd: handleSpeechEnd
  });

  const { chapterContent, pdfUrl } = useChapterPDF(selectedBook, selectedChapter, 'hindi', selectedClass);
  const { answer, isLoading, askQuestion, answerRef } = useTeacherQA(user, selectedClass, selectedBook, selectedChapter, chapterContent);

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to access the teacher features');
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    console.log('[HindiTeacherPageContainer] State Check:');
    console.log('  Selected Chapter:', selectedChapter);
    console.log('  Chapter Content Length:', chapterContent?.length);
    console.log('  API Key Set:', !!openaiService.getApiKey());
  }, [selectedChapter, chapterContent]);

  useEffect(() => {
    console.log('[HindiTeacherPageContainer] Answer state updated:', answer);
  }, [answer]);

  const handleBack = () => {
    navigate('/hindi');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl"> 
      <div className="mb-6">
        <Button
          onClick={handleBack}
          variant="outline"
          className="mb-4 neo-button"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          हिंदी पृष्ठ पर वापस जाएं
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">हिंदी शिक्षक उपकरण</CardTitle>
              <CardDescription>
                एनसीईआरटी कक्षा 8 हिंदी अध्याय इंटरैक्टिव शिक्षण सहायता के साथ। एक अध्याय चुनें और टेक्स्ट या आवाज़ का उपयोग करके प्रश्न पूछें।
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChapterSelector
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedBook={selectedBook}
            setSelectedBook={setSelectedBook}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
            subject="hindi"
          />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-6"> 
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

export default HindiTeacherPageContainer;
