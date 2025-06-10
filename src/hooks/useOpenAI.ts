
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { saveMessage } from '@/utils/messageUtils';
import { sanitizeInput, validateApiKey, globalRateLimiter } from '@/utils/security';

interface Message {
  role: "user" | "bot";
  text: string;
}

export const useOpenAI = (apiKey: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  
  const addMessage = useCallback((text: string, role: "user" | "bot") => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  }, []);

  const fetchBotResponse = useCallback(async (message: string) => {
    // Input validation
    if (!apiKey || !validateApiKey(apiKey)) {
      toast.error('Valid API key is required');
      return;
    }

    const sanitizedMessage = sanitizeInput(message, 1000);
    if (!sanitizedMessage.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    // Rate limiting
    const userIdentifier = `openai_${user?.uid || 'anonymous'}`;
    if (!globalRateLimiter.isAllowed(userIdentifier)) {
      toast.error('Too many requests. Please wait before trying again.');
      return;
    }

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'Smaran.ai/1.0'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a friendly voice assistant for children learning English. Keep your responses simple, encouraging, and suitable for children. Limit your responses to 2-3 sentences.'
            },
            {
              role: 'user',
              content: sanitizedMessage
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to get response');
      }
      
      const data = await response.json();
      const botMessage = data.choices[0].message.content;
      addMessage(botMessage, 'bot');
      
      // Save to message history if user is logged in
      if (user) {
        await saveMessage({
          text: message,
          userId: user.uid,
          aiResponse: botMessage,
          chatType: 'voice-bot'
        });
      }
      
      // Text-to-speech for bot response using OpenAI TTS
      try {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            voice: 'nova', // Child-friendly voice
            input: botMessage,
            response_format: 'mp3',
            speed: 0.9 // Slightly slower for children
          }),
        });

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer();
          const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(blob);
          
          const audio = new Audio(audioUrl);
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
          };
          audio.play().catch(error => {
            console.error('Audio playback error:', error);
            // Fallback to browser TTS if OpenAI TTS fails
            if ('speechSynthesis' in window) {
              const speech = new SpeechSynthesisUtterance(botMessage);
              speech.rate = 0.9;
              speech.pitch = 1.1;
              window.speechSynthesis.speak(speech);
            }
          });
        } else {
          throw new Error('TTS request failed');
        }
      } catch (ttsError) {
        console.error('OpenAI TTS error:', ttsError);
        // Fallback to browser TTS if OpenAI TTS fails
        if ('speechSynthesis' in window) {
          const speech = new SpeechSynthesisUtterance(botMessage);
          speech.rate = 0.9; // Slightly slower for children
          speech.pitch = 1.1; // Slightly higher pitch
          window.speechSynthesis.speak(speech);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [apiKey, user, addMessage]);

  const handleUserMessage = useCallback(async (text: string) => {
    addMessage(text, 'user');
    await fetchBotResponse(text);
  }, [addMessage, fetchBotResponse]);

  return {
    messages,
    loading,
    handleUserMessage
  };
};
