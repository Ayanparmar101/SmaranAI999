import { useState, useCallback, useEffect } from 'react';
import { Message } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { saveMessageToFirebase } from '@/services/firebaseMessageService';

/**
 * Custom hook to manage chat history with Firebase storage
 * @param chatType The type of chat for categorization
 * @returns Chat history state and operations
 */
export const useFirebaseChatHistory = (chatType: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string, imageUrl?: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      role,
      content,
      imageUrl,
      timestamp: new Date()
    };
    
    // Add message to local state immediately for responsive UI
    setMessages((prevMessages: Message[]) => {
      console.log("Adding message to Firebase chat history:", newMessage);
      const updatedMessages = [...prevMessages, newMessage];
      
      // Save to Firebase in the background (only for assistant responses or when user is logged in)
      if (user?.uid && (role === 'assistant' || role === 'user')) {
        saveMessageToFirebase({
          text: role === 'user' ? content : '', // Only save user text as "text"
          userId: user.uid,
          aiResponse: role === 'assistant' ? content : undefined,
          chatType: chatType,
          imageUrl: imageUrl
        }).catch(error => {
          console.error('Failed to save message to Firebase:', error);
        });
      }
      
      return updatedMessages;
    });
    
    return newMessage;
  }, [user?.uid, chatType]);

  const addUserMessage = useCallback((content: string, imageUrl?: string) => {
    return addMessage('user', content, imageUrl);
  }, [addMessage]);

  const addAssistantMessage = useCallback((content: string) => {
    return addMessage('assistant', content);
  }, [addMessage]);

  // Save a complete conversation (user message + AI response) to Firebase
  const saveConversation = useCallback(async (userText: string, aiResponse: string, imageUrl?: string) => {
    if (!user?.uid) return false;

    try {
      await saveMessageToFirebase({
        text: userText,
        userId: user.uid,
        aiResponse: aiResponse,
        chatType: chatType,
        imageUrl: imageUrl
      });
      return true;
    } catch (error) {
      console.error('Failed to save conversation to Firebase:', error);
      return false;
    }
  }, [user?.uid, chatType]);

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    setIsLoading,
    addMessage,
    addUserMessage,
    addAssistantMessage,
    saveConversation,
    clearHistory,
    isLoggedIn: !!user?.uid
  };
};
