import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { openaiTTSService } from '@/services/openaiTTSService';

interface UseEnglishTTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  autoSetApiKey?: boolean;
}

export const useEnglishTTS = (options: UseEnglishTTSOptions = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { voice = 'alloy', autoSetApiKey = true } = options;

  // Initialize API key from localStorage if autoSetApiKey is true
  const initializeApiKey = useCallback(() => {
    if (autoSetApiKey) {
      const savedApiKey = localStorage.getItem('openai-api-key');
      if (savedApiKey && !openaiTTSService.getApiKey()) {
        openaiTTSService.setApiKey(savedApiKey);
      }
    }
  }, [autoSetApiKey]);  const checkApiKey = useCallback((): boolean => {
    initializeApiKey();
    const hasApiKey = !!openaiTTSService.getApiKey();
    if (!hasApiKey) {
      toast.error('Please set your OpenAI API key first');
    }
    return hasApiKey;
  }, [initializeApiKey]);  const speak = useCallback(async (text: string, userContext?: string): Promise<void> => {
    if (!checkApiKey()) return;

    if (!text.trim()) {
      toast.error('No text to speak');
      return;
    }

    setIsLoading(true);
    setIsPlaying(false);

    try {
      setIsPlaying(true);
      await openaiTTSService.generateAndPlayEnglishSpeech(text, userContext);
      toast.success('Speech completed');
    } catch (error) {
      console.error('TTS Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate speech');
    } finally {
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [checkApiKey]);

  const speakWord = useCallback(async (word: string, definition?: string): Promise<void> => {
    if (!checkApiKey()) return;

    setIsLoading(true);
    setIsPlaying(false);

    try {
      setIsPlaying(true);
      await openaiTTSService.pronounceWord(word, definition);
      toast.success(`Pronounced "${word}"`);
    } catch (error) {
      console.error('TTS Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to pronounce word');
    } finally {
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [checkApiKey]);

  const readText = useCallback(async (
    text: string, 
    textType: 'sentence' | 'paragraph' | 'story' | 'poem' = 'sentence'
  ): Promise<void> => {
    if (!checkApiKey()) return;

    setIsLoading(true);
    setIsPlaying(false);

    try {
      setIsPlaying(true);
      await openaiTTSService.readEnglishText(text, textType);
      toast.success(`Read ${textType} completed`);
    } catch (error) {
      console.error('TTS Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to read text');
    } finally {
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [checkApiKey]);

  const explainGrammar = useCallback(async (explanation: string): Promise<void> => {
    if (!checkApiKey()) return;

    setIsLoading(true);
    setIsPlaying(false);

    try {
      setIsPlaying(true);
      await openaiTTSService.explainGrammar(explanation);
      toast.success('Grammar explanation completed');
    } catch (error) {
      console.error('TTS Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to explain grammar');
    } finally {
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [checkApiKey]);

  const generateSpeechBlob = useCallback(async (
    text: string, 
    userContext?: string
  ): Promise<Blob | null> => {
    if (!checkApiKey()) return null;

    setIsLoading(true);

    try {
      const blob = await openaiTTSService.generateEnglishSpeechBlob(text, userContext, { voice });
      return blob;
    } catch (error) {
      console.error('TTS Blob Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate speech');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkApiKey, voice]);

  const setApiKey = useCallback((apiKey: string) => {
    openaiTTSService.setApiKey(apiKey);
    localStorage.setItem('openai-api-key', apiKey);
    toast.success('API key set successfully');
  }, []);

  const hasApiKey = useCallback((): boolean => {
    initializeApiKey();
    return !!openaiTTSService.getApiKey();
  }, [initializeApiKey]);

  return {
    // State
    isPlaying,
    isLoading,
    hasApiKey: hasApiKey(),

    // Methods
    speak,
    speakWord,
    readText,
    explainGrammar,
    generateSpeechBlob,
    setApiKey,
    checkApiKey
  };
};
