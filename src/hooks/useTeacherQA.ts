
import { useState, useRef, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import openaiService from '@/services/openaiService';
import { saveMessage } from '@/utils/messageUtils';
import { books } from '@/pages/teacher/ChapterSelector';

export function useTeacherQA(user: any, selectedClass: string, selectedBook: string, selectedChapter: string, chapterContent: string) {
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const answerRef = useRef<HTMLDivElement | null>(null);
  const streamingAnswerRef = useRef<string>(""); // Use ref for streaming to prevent excessive re-renders

  const saveToHistory = useCallback(async (text: string, isUserMessage: boolean, aiResponse?: string) => {
    if (!user) return;
    
    try {
      await saveMessage({
        text,
        userId: user.uid, // Use uid for Firebase compatibility
        aiResponse: isUserMessage ? undefined : aiResponse,
        chatType: 'teacher'
      });
    } catch (error) {
      console.error('Error in saveToHistory:', error);
      toast.error('Failed to save message history');
    }
  }, [user]);

  const askQuestion = useCallback(async (question: string) => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    if (!openaiService.getApiKey()) {
      toast.error('Please set your OpenAI API key first');
      return;
    }
    
    // Check if we have actual chapter content or just a placeholder
    const hasActualContent = chapterContent &&
      chapterContent.length > 50 &&
      !chapterContent.includes('PDF found and ready for viewing') &&
      !chapterContent.includes('Text extraction skipped due to CORS limitations');

    if (!hasActualContent) {
      // For Social Science and other subjects, we can still answer based on general knowledge
      // when PDF content is not available due to CORS limitations
      console.log('[useTeacherQA] No extracted text content, but PDF exists. Using general knowledge mode.');
    }

    if (!selectedChapter) {
        toast.error('Please select a chapter first.');
        return;
    }
    
    setIsLoading(true);
    setAnswer("");
    streamingAnswerRef.current = ""; // Reset streaming ref

    await saveToHistory(question, true);

    let fullResponse = '';
    try {
      const book = books.find(b => b.id === selectedBook);
      const chapter = book?.chapters.find(c => c.id === selectedChapter);

      // Create appropriate system prompt based on subject and content availability
      let systemPrompt = '';
      let userMessage = '';

      if (hasActualContent) {
        // We have extracted text content
        systemPrompt = `You are a helpful, educational assistant specializing in ${book?.subject || 'education'} for Class ${selectedClass} students.
        You will answer questions about the chapter "${chapter?.name || selectedChapter}" based on the provided content.

        GUIDELINES:
        1. Answer questions comprehensively based on the chapter content provided
        2. Use age-appropriate language for Class ${selectedClass} students
        3. Provide clear explanations with examples when helpful
        4. If the content doesn't contain specific information to answer a question, use your general knowledge of the subject
        5. Be encouraging and supportive in your responses

        Always aim to be helpful and educational, focusing on helping students understand the concepts.`;

        userMessage = `Chapter Content: ${chapterContent}

Question: ${question}`;
      } else {
        // No extracted content, use general knowledge mode
        const subjectName = book?.subject === 'socialscience' ? 'Social Science' :
                           book?.subject === 'science' ? 'Science' :
                           book?.subject === 'mathematics' ? 'Mathematics' :
                           book?.subject === 'hindi' ? 'Hindi' :
                           book?.subject === 'gujarati' ? 'Gujarati' :
                           book?.subject || 'the subject';

        systemPrompt = `You are a helpful, educational assistant specializing in ${subjectName} for Class ${selectedClass} students.
        You will answer questions about the chapter "${chapter?.name || selectedChapter}" based on your knowledge of the NCERT curriculum.

        GUIDELINES:
        1. Focus on the chapter "${chapter?.name || selectedChapter}" from Class ${selectedClass} ${subjectName}
        2. Provide comprehensive answers based on NCERT curriculum knowledge
        3. Use age-appropriate language for Class ${selectedClass} students
        4. Give examples and explanations that help students understand concepts
        5. Be encouraging and supportive in your responses
        6. If asked about topics beyond this chapter, still try to be helpful while noting the scope

        Note: I'm answering based on my knowledge of the NCERT curriculum since the PDF content extraction had technical limitations.`;

        userMessage = `Chapter: "${chapter?.name || selectedChapter}" from Class ${selectedClass} ${subjectName}

Question: ${question}`;
      }

      // Use throttled updates to reduce re-renders during streaming
      let updateTimeout: NodeJS.Timeout | null = null;

      await openaiService.createCompletion(
        systemPrompt,
        userMessage,
        {
          stream: true,
          onChunk: (chunk: string) => {
            if (chunk) { // Only process if chunk is not empty/null
              fullResponse += chunk;
              streamingAnswerRef.current += chunk;

              // Throttle UI updates to reduce re-renders (update every 100ms max)
              if (updateTimeout) {
                clearTimeout(updateTimeout);
              }

              updateTimeout = setTimeout(() => {
                setAnswer(streamingAnswerRef.current);

                // Scroll to bottom
                if (answerRef.current) {
                  requestAnimationFrame(() => {
                     if (answerRef.current) {
                        answerRef.current.scrollTop = answerRef.current.scrollHeight;
                     }
                  });
                }
              }, 50); // Update UI every 50ms instead of every chunk
            } // End if(chunk)
          }
        }
      );

      // Ensure final update
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      setAnswer(streamingAnswerRef.current);
      await saveToHistory(question, false, fullResponse);

    } catch (error) {
      console.error('Error getting answer:', error);
      toast.error('Failed to get answer. Please try again.');
      setAnswer("Error fetching answer. Please check the console."); 
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedClass, selectedBook, selectedChapter, chapterContent, answerRef, saveToHistory]);

  return { answer, isLoading, askQuestion, answerRef };
}
