
import React, { useState, useCallback, memo, useMemo } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { useChatHistory } from '../../hooks/useChatHistory';
import { useFirebaseChatHistory } from '../../hooks/useFirebaseChatHistory';
import { handleApiError } from '../../utils/apiHelpers';

interface ChatContainerProps {
  title: string;
  storageKey: string;
  processingFunction: (message: string, imageUrl?: string) => Promise<string>;
  // New prop to control special AI message parsing
  parseJsonResponse?: boolean; 
  // New prop to enable TTS functionality
  enableTTS?: boolean;
  // New prop to use Firebase instead of localStorage
  useFirebase?: boolean;
  // Chat type for Firebase categorization
  chatType?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = memo(({
  title,
  storageKey,
  processingFunction,
  parseJsonResponse = false, // Default to false
  enableTTS = false, // Default to false
  useFirebase = false, // Default to localStorage
  chatType = 'default'
}) => {
  // Use Firebase or localStorage based on useFirebase prop
  const localStorageHook = useChatHistory(storageKey);
  const firebaseHook = useFirebaseChatHistory(chatType);

  // Memoize the hook selection to prevent unnecessary re-renders
  const chatHook = useMemo(() => {
    return useFirebase ? firebaseHook : { ...localStorageHook, saveConversation: null, isLoggedIn: false };
  }, [useFirebase, firebaseHook, localStorageHook]);

  const {
    messages,
    isLoading,
    setIsLoading,
    addMessage,
    clearHistory,
    saveConversation,
    isLoggedIn
  } = chatHook;
  
  // Memoize message handler to prevent re-renders
  const handleSendMessage = useCallback(async (message: string, image?: File) => {
    let messageContent = message;
    let imageUrl: string | undefined;

    if (image) {
      imageUrl = URL.createObjectURL(image);
      messageContent = message || "Image";
    }

    const userMessage = addMessage('user', messageContent, imageUrl);
    console.log("User message added to chat history with ID:", userMessage.id);

    setIsLoading(true);

    try {
      const response = await processingFunction(message, imageUrl);
      const aiMessage = addMessage('assistant', response);
      console.log("AI response added to chat history");

      // If using Firebase, save the complete conversation
      if (useFirebase && saveConversation && isLoggedIn) {
        await saveConversation(messageContent, response, imageUrl);
        console.log("Conversation saved to Firebase");
      }

    } catch (error) {
      handleApiError(error);
      addMessage('assistant', 'Sorry, I encountered an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    }
  }, [addMessage, setIsLoading, processingFunction, useFirebase, saveConversation, isLoggedIn]);

  // Memoize clear handler
  const handleClearChat = useCallback(() => {
    clearHistory();
    toast.success('Chat history cleared');
  }, [clearHistory]);
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          {useFirebase && (
            <span className="text-sm font-normal text-muted-foreground">
              {isLoggedIn ? '🔥 Firebase Storage' : '💾 Local Storage (Login to save)'}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Pass the prop down to ChatHistory */}
        <ChatHistory 
          messages={messages} 
          parseJsonResponse={parseJsonResponse} 
          enableTTS={enableTTS} 
        />
      </CardContent>
      
      <CardFooter>
        <ChatInput 
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
          disabled={isLoading}
        />
      </CardFooter>
    </Card>
  );
});

export default ChatContainer;
