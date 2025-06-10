
import { saveMessageToFirebase } from '@/services/firebaseMessageService';
import { toast } from 'sonner';

export interface SaveMessageParams {
  text: string;
  userId: string;
  aiResponse?: string;
  chatType: 'story-images' | 'voice-bot' | 'socratic-tutor' | 'teacher' | 'gujarati-chatbot' | 'hindi-chatbot' | 'social-science-chatbot' | 'study-planner';
  imageUrl?: string;
  toolType?: string;
  additionalData?: Record<string, any>;
}

export const saveMessage = async ({
  text, userId, aiResponse, chatType, imageUrl, toolType, additionalData
}: SaveMessageParams): Promise<boolean> => {
  try {
    return await saveMessageToFirebase({
      text,
      userId,
      aiResponse,
      chatType,
      imageUrl,
      toolType,
      additionalData
    });
  } catch (error) {
    console.error('Error in saveMessage:', error);
    toast.error('Failed to save message to history');
    return false;
  }
};
