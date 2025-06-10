import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, BookOpen, FileText, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ChapterSelector from './ChapterSelector';
import ChapterContent from './ChapterContent';
import QuestionAnswerSection from './QuestionAnswerSection';
import { useChapterPDF } from '@/hooks/useChapterPDF';
import { useTeacherQA } from '@/hooks/useTeacherQA';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useOpenAIKey } from '@/hooks/useOpenAIKey';
import { openaiService } from '@/services/openai';

const MathematicsTeacherPageContainer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState("8");
  const [selectedBook, setSelectedBook] = useState("ncert-mathematics");
  const [selectedChapter, setSelectedChapter] = useState("");
  
  const [questionFromVoice, setQuestionFromVoice] = useState('');
  
  useOpenAIKey();

  const handleTranscriptChange = useCallback((transcript: string) => {
    setQuestionFromVoice(transcript);
  }, []);
  const handleSpeechEnd = useCallback((finalTranscript: string) => {
    setQuestionFromVoice(finalTranscript);
  }, []);

  const { isListening, startListening, stopListening } = useVoiceRecognition({
    onTranscriptChange: handleTranscriptChange,
    onSpeechEnd: handleSpeechEnd
  });

  const { pdfUrl, chapterContent } = useChapterPDF(
    selectedBook,
    selectedChapter,
    "mathematics",
    selectedClass
  );

  const { answer, isLoading, askQuestion, answerRef } = useTeacherQA(user, selectedClass, selectedBook, selectedChapter, chapterContent);
  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to access the teacher features');
      navigate('/auth');
    }
  }, [user, navigate]);
  const handleGoBack = () => {
    navigate('/mathematics');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 dark:bg-background p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
            <button
              onClick={handleGoBack}
              className="neo-button bg-card hover:bg-muted text-card-foreground p-3 rounded-xl shadow-neo border-3 border-border transition-all duration-200 min-h-[48px] min-w-[48px]"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-950/30 rounded-xl border-3 border-border shadow-neo flex-shrink-0">
                <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Mathematics Teacher Tools</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">NCERT Class 8 Mathematics chapters with interactive teaching support. Select a chapter and ask questions using text or voice.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter Selector */}
        <div className="bg-card text-card-foreground rounded-2xl border-3 border-border shadow-neo p-4 sm:p-6 mb-4 sm:mb-6">
          <ChapterSelector
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedBook={selectedBook}
            setSelectedBook={setSelectedBook}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
            subject="mathematics"
          />
        </div>

        {/* Content and Q&A Section */}
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
    </div>
  );
};

export default MathematicsTeacherPageContainer;
