
import { useEffect } from 'react';
import { openaiService } from '@/services/openai';
import { apiKeyManager } from '@/services/openai/apiKeyManager';

// Global flag to prevent multiple initializations
let hasInitialized = false;

export function useOpenAIKey() {
  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized) return;

    // Use the centralized API key manager (now async)
    const initializeApiKey = async () => {
      try {
        const apiKey = await apiKeyManager.getApiKey();
        if (apiKey) {
          await openaiService.setApiKey(apiKey);
          hasInitialized = true;
        }
      } catch (error) {
        console.warn('[useOpenAIKey] Failed to initialize API key:', error);
        // Don't throw error, just log it - the app should still work without API key
      }
    };

    initializeApiKey();
  }, []);
}
