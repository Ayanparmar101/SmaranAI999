import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
// Removed: import { ChapterPDFUploader } from '@/components/ChapterPDFUploader';
import ChapterSelector from './ChapterSelector';
import ChapterContent from './ChapterContent';
import QuestionAnswerSection from './QuestionAnswerSection';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useChapterPDF } from '@/hooks/useChapterPDF';
import { useTeacherQA } from '@/hooks/useTeacherQA';
import { useOpenAIKey } from '@/hooks/useOpenAIKey';
import { openaiService } from '@/services/openai';

const TeacherPageContainer: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string>("8");
  const [selectedBook, setSelectedBook] = useState<string>("ncert-honeydew");
  const [selectedChapter, setSelectedChapter] = useState<string>("ch01"); // Default to Chapter 1
  
  const [questionFromVoice, setQuestionFromVoice] = useState('');
  
  useOpenAIKey();

  const handleTranscriptChange = useCallback((transcript: string) => {
    setQuestionFromVoice(transcript);
  }, []);

  const handleSpeechEnd = useCallback((finalTranscript: string) => {
    console.log("Final transcript received in container:", finalTranscript);
    setQuestionFromVoice(finalTranscript);
  }, []);

  const { isListening, startListening, stopListening } = useVoiceRecognition({
    onTranscriptChange: handleTranscriptChange,
    onSpeechEnd: handleSpeechEnd
  });

  // handleFileUpload is no longer returned by useChapterPDF
  const { chapterContent, pdfUrl } = useChapterPDF(selectedBook, selectedChapter, 'english', selectedClass);
  const { answer, isLoading, askQuestion, answerRef } = useTeacherQA(user, selectedClass, selectedBook, selectedChapter, chapterContent);

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to access the teacher features');
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    console.log('[TeacherPageContainer] State Check:');
    console.log('  Selected Chapter:', selectedChapter);
    console.log('  Chapter Content Length:', chapterContent?.length);
    console.log('  Chapter Content Preview:', chapterContent?.substring(0, 200));
    console.log('  PDF URL:', pdfUrl);
    console.log('  API Key Set:', !!openaiService.getApiKey());
  }, [selectedChapter, chapterContent, pdfUrl]);

  useEffect(() => {
    console.log('[TeacherPageContainer] Answer state updated:', answer);
  }, [answer]);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">Teacher Tools</CardTitle>
          <CardDescription className="text-sm sm:text-base mt-1">
            Select class and chapter, then ask questions using text or voice.
            PDFs are loaded automatically from pre-configured sources.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 sm:pt-6">
          <ChapterSelector
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedBook={selectedBook}
            setSelectedBook={setSelectedBook}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
            subject="english"
          />

          {/* Removed ChapterPDFUploader section */}
          {/*
          <div className="mt-4 flex justify-end items-center">
              {selectedChapter && (
                <ChapterPDFUploader
                  onFileUpload={handleFileUpload} // This would cause an error as handleFileUpload is undefined
                  chapterId={`${selectedBook}-${selectedChapter}`}
                />
              )}
          </div>
          */}
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

export default TeacherPageContainer;
