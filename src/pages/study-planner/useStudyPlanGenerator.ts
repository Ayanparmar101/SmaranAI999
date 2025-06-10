
import { useState, useEffect } from 'react';
import { openaiService } from '@/services/openai';
import { toast } from 'sonner';
import { StudyPlan } from './types';
import { books } from '../teacher/ChapterSelector';

// The hook now only depends on the IDs of the selected chapter and book.
export const useStudyPlanGenerator = (currentSelectedChapterId: string, currentSelectedBookId: string) => {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [studyPlanForChapterId, setStudyPlanForChapterId] = useState<string | null>(null);

  useEffect(() => {
    console.log('[useStudyPlanGenerator] Checking if plan needs to be cleared. Current chapter:', currentSelectedChapterId, 'Plan for:', studyPlanForChapterId);
    if (!currentSelectedChapterId || !currentSelectedBookId) {
      if (studyPlan) {
        console.log('[useStudyPlanGenerator] No chapter/book selected, clearing study plan.');
        setStudyPlan(null);
        setProgress(0);
        setStudyPlanForChapterId(null);
      }
      return;
    }
    if (studyPlanForChapterId && currentSelectedChapterId !== studyPlanForChapterId) {
      console.log('[useStudyPlanGenerator] Selected chapter/book changed, clearing old study plan.');
      setStudyPlan(null);
      setProgress(0);
      setStudyPlanForChapterId(null);
    }
  }, [currentSelectedChapterId, currentSelectedBookId, studyPlan, studyPlanForChapterId]);

  const generateStudyPlan = async () => {
    if (!currentSelectedChapterId || !currentSelectedBookId) {
      toast.error("Please select a book and chapter first.");
      return;
    }

    const book = books.find(b => b.id === currentSelectedBookId);
    const chapter = book?.chapters.find(c => c.id === currentSelectedChapterId);

    if (!book || !chapter) {
      toast.error("Selected book or chapter details not found.");
      return;
    }

    const chapterName = chapter.name;
    const bookName = book.name;
    const grade = book.class || "Unknown";

    setStudyPlan(null);
    setProgress(0);
    setStudyPlanForChapterId(currentSelectedChapterId);
    setIsGenerating(true);
    toast.info(`Generating study plan for: ${chapterName} (${bookName})...`);

    // chapterContent and processedContent are no longer used for the prompt.
    const systemPrompt = `You are an expert educational consultant. Generate a structured, generic 3-day study plan for the given chapter, book, and grade. The response MUST be in JSON format.

    JSON Structure Required:
    {
      "chapterTitle": "${chapterName}",
      "bookName": "${bookName}",
      "grade": "${grade}",
      "duration": "3 Days",
      "structure": [
        {
          "day": Number,
          "title": "Focus for the day (e.g., Introduction & Key Concepts)",
          "tasks": [
            {
              "name": "Specific task name (e.g., Read section 1.1, Understand vocabulary)",
              "duration": "Estimated time (e.g., '45 mins')",
              "details": "General guidance for this type of task for the given chapter. Make it generic based on the chapter title, book, and grade.",
              "completed": false
            }
          ]
        }
      ],
      "tips": [
        "Practical study tip relevant to studying this chapter/subject/grade",
        ...
      ],
      "priorKnowledge": [
        "General concept or skill needed beforehand for this chapter/subject/grade",
        ...
      ],
      "completionPercentage": 0
    }
    
    Guidelines:
    1.  The plan should be generic for the chapter title, book, and grade provided.
    2.  Create a plan for 3 days.
    3.  Break down tasks logically for a typical chapter of this nature.
    4.  'details' should be general advice.
    5.  List 2-4 relevant general prerequisites.
    6.  Provide 3-5 actionable generic study tips.
    7.  Return ONLY the valid JSON object, no extra text or markdown.
    `;

    // User prompt no longer includes extracted PDF content.
    const userPrompt = `Please generate a 3-day study plan for:
    Book: ${bookName}
    Chapter: ${chapterName}
    Grade: ${grade}

    Follow the JSON structure and guidelines provided in the system prompt. The plan should be generic for this chapter, book, and grade.`;

    try {
      console.log("[useStudyPlanGenerator] Sending request to OpenAI with chapter details (no PDF content)...");
      const response = await openaiService.createCompletion(systemPrompt, userPrompt, { 
        max_tokens: 2000, // May need fewer tokens as we are not sending content
        temperature: 0.5 
      });
      
      console.log("[useStudyPlanGenerator] Raw response from OpenAI:", response.substring(0, 200) + "...");

      let parsedPlan: StudyPlan | null = null;
      try {
        const jsonStart = response.indexOf('{');
        const jsonEnd = response.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const jsonString = response.substring(jsonStart, jsonEnd + 1);
          parsedPlan = JSON.parse(jsonString) as StudyPlan;
          if (parsedPlan && parsedPlan.completionPercentage === undefined) {
            parsedPlan.completionPercentage = 0;
          }
           parsedPlan?.structure?.forEach(day => {
             day.tasks?.forEach(task => {
               if (task.completed === undefined) task.completed = false;
             });
           });
        } else {
          throw new Error("Valid JSON object not found in OpenAI response.");
        }
      } catch (parseError) {
        console.error("[useStudyPlanGenerator] Failed to parse study plan JSON:", parseError);
        console.error("[useStudyPlanGenerator] Raw OpenAI response causing error:", response); 
        toast.error("AI response was not in the expected format. Please try again.");
        setStudyPlanForChapterId(null);
        setIsGenerating(false);
        return;
      }

      setStudyPlan(parsedPlan);
      setProgress(parsedPlan?.completionPercentage || 0);
      toast.success("Study plan generated successfully!");

    } catch (error) {
      console.error("[useStudyPlanGenerator] Error generating study plan:", error);
      toast.error("An error occurred while generating the plan. Please check your API key and try again.");
      setStudyPlanForChapterId(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStepCompletion = (dayIndex: number, taskIndex: number) => {
    if (!studyPlan) return;
    const updatedPlan = JSON.parse(JSON.stringify(studyPlan)) as StudyPlan;
    const task = updatedPlan.structure?.[dayIndex]?.tasks?.[taskIndex];
    if (task) task.completed = !task.completed;

    let completedTasks = 0;
    let totalTasks = 0;
    updatedPlan.structure?.forEach(day => {
      day.tasks?.forEach(t => {
        totalTasks++;
        if (t.completed) completedTasks++;
      });
    });
    updatedPlan.completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    setStudyPlan(updatedPlan);
    setProgress(updatedPlan.completionPercentage);
  };

  return { studyPlan, setStudyPlan, isGenerating, progress, generateStudyPlan, handleStepCompletion };
};
