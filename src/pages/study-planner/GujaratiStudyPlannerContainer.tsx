import React, { useState, useEffect } from 'react';
import ApiKeyInput from '@/components/ApiKeyInput';
import { openaiService } from '@/services/openai';
import StudyPlanDisplay from './StudyPlanDisplay';
import IntroCard from './IntroCard';
import ChapterSelectionCard from './ChapterSelectionCard';
import PDFDisplayCard from './PDFDisplayCard';
import { useChapterContent } from './useChapterContent';
import { useStudyPlanGenerator } from './useStudyPlanGenerator';
import { useAuth } from '@/contexts/AuthContext';
import { saveMessage } from '@/utils/messageUtils';
import { toast } from 'sonner';
import { useOpenAIKey } from '@/hooks/useOpenAIKey';

const GujaratiStudyPlannerContainer = () => {
  const [selectedClass, setSelectedClass] = useState<string>("8");
  const [selectedBook, setSelectedBook] = useState<string>("ncert-gujarati");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const { user } = useAuth();
  const [isPdfProcessing, setIsPdfProcessing] = useState<boolean>(false); 
  
  const { chapterContent, pdfUrl } = useChapterContent(selectedChapter, selectedBook, setIsPdfProcessing);
  
  const { studyPlan, setStudyPlan, isGenerating, progress, generateStudyPlan, handleStepCompletion } = useStudyPlanGenerator(selectedChapter, selectedBook);

  useOpenAIKey(); 
  
  const handleChapterSelect = (chapterId: string) => {
    console.log('[GujaratiStudyPlannerContainer] Chapter selected via dropdown:', chapterId);
    setSelectedChapter(chapterId);
  };

  const handleResetPDF = () => {
    console.log('[GujaratiStudyPlannerContainer] Resetting PDF and selected chapter.');
    setSelectedChapter(""); 
  };

  const verifyApiKey = async (): Promise<boolean> => {
    const apiKey = openaiService.getApiKey();
    if (!apiKey) {
      toast.error("Please enter your OpenAI API key first");
      return false;
    }
    if (!(apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-')) || apiKey.length < 20) {
      toast.error("Invalid API key format. OpenAI API keys should start with 'sk-' or 'sk-proj-'");
      return false;
    }
    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: headers
      });
      if (!response.ok) {
        throw new Error(`API verification failed: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('API key verification failed:', error);
      toast.error("Your OpenAI API key verification failed. Please check your internet connection and try again.");
      return false;
    }
  };

  const handleGenerateStudyPlan = async () => {
    console.log('[GujaratiStudyPlannerContainer] handleGenerateStudyPlan called for chapter:', selectedChapter, 'book:', selectedBook);
    if (!await verifyApiKey()) return;
    
    if (!selectedChapter || !selectedBook) {
      toast.error("Please ensure a chapter and book are selected before generating a plan.");
      return;
    }
    await generateStudyPlan(); 
  };
  
  const saveStudyPlan = async () => {
    if (!user) {
      toast.error("Please log in to save your study plan");
      return;
    }
    if (!studyPlan) {
      toast.error("No study plan to save");
      return;
    }
    console.log('[GujaratiStudyPlannerContainer] Saving study plan for user:', user.uid);
    try {
      const success = await saveMessage({
        text: `${selectedBook} - ${selectedChapter}`,
        userId: user.uid,
        aiResponse: JSON.stringify(studyPlan),
        chatType: 'study-planner' as any,
        additionalData: {
          chapter_id: selectedChapter,
          book_id: selectedBook,
          progress: progress,
          subject: 'gujarati'
        }
      });
      
      if (success) {
        toast.success("ગુજરાતી અભ્યાસ યોજના સફળતાપૂર્વક સાચવવામાં આવી!");
      } else {
        toast.error("અભ્યાસ યોજના સાચવવામાં નિષ્ફળ");
      }
    } catch (error: any) {
      console.error("Error saving study plan:", error);
      toast.error("અભ્યાસ યોજના સાચવવામાં નિષ્ફળ: " + error.message);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* API Key Input - Only show if no environment variable */}
      {!import.meta.env.VITE_OPENAI_API_KEY && (
        <ApiKeyInput onApiKeySubmit={(key) => openaiService.setApiKey(key)} />
      )}
      
      <IntroCard studyPlan={studyPlan} progress={progress} />
      
      <div className="grid grid-cols-1 gap-6">
        <ChapterSelectionCard
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          selectedBook={selectedBook}
          setSelectedBook={setSelectedBook}
          selectedChapter={selectedChapter}
          setSelectedChapter={handleChapterSelect} 
          generateStudyPlan={handleGenerateStudyPlan} 
          isGenerating={isGenerating}
          onSaveStudyPlan={saveStudyPlan}
          canSave={!!studyPlan && !!user && !isGenerating}
        />
        
        {selectedChapter && (
          <PDFDisplayCard 
            pdfUrl={pdfUrl} 
            chapterContent={chapterContent} 
            isLoading={isPdfProcessing} 
            onReset={handleResetPDF}
          />
        )}
        
        {studyPlan && (
          <StudyPlanDisplay 
            studyPlan={studyPlan} 
            onStepComplete={handleStepCompletion}
          />
        )}
      </div>
    </div>
  );
};

export default GujaratiStudyPlannerContainer;
