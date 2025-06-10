
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import openaiService from '@/services/openaiService';

export interface VoiceChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

interface UseOpenAIVoiceChatProps {
  userId?: string;
  saveMessage?: (message: string, response: string) => void;
}

export const useOpenAIVoiceChat = ({ userId, saveMessage }: UseOpenAIVoiceChatProps = {}) => {
  const [messages, setMessages] = useState<VoiceChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processVoiceInput = useCallback(async (text: string) => {
    try {
      setIsProcessing(true);
      
      // Add user message to chat
      const userMessage: VoiceChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: text,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Get AI response
      const response = await openaiService.createCompletion(
        'You are a friendly and helpful AI assistant for students. Keep your responses clear, accurate, and conversational. Limit your responses to 2-3 paragraphs at most, unless the student asks for more detailed information.',
        text,
        { temperature: 0.7, max_tokens: 300 }
      );
      
      // Add AI message to chat
      const assistantMessage: VoiceChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save to database if user is logged in
      if (userId && saveMessage) {
        saveMessage(text, response);
      }
      
      // Generate speech for AI response
      try {
        const audioData = await openaiService.generateSpeech(response, { voice: 'nova' });
        const blob = new Blob([audioData], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);
        
        // Update assistant message with audio URL
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id ? { ...msg, audioUrl } : msg
          )
        );
        
        return audioUrl;
      } catch (error) {
        console.error('Error generating speech:', error);
        toast.error('Could not generate speech. Showing text response only.');
        return null;
      }
      
    } catch (error) {
      toast.error('Error processing your request');
      console.error('Error:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [userId, saveMessage]);

  return {
    messages,
    isProcessing,
    processVoiceInput
  };
};
