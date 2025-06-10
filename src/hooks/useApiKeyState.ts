import { useState, useEffect } from 'react';
import { apiKeyManager } from '@/services/openai/apiKeyManager';
import { toast } from 'sonner';
import { globalState } from '@/utils/globalState';

/**
 * Custom hook for managing API key state without duplicate initialization messages
 * This hook provides a clean interface for components that need API key management
 */
export function useApiKeyState() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get API key from centralized manager (now async)
    const initializeApiKey = async () => {
      try {
        const key = await apiKeyManager.getApiKey();

        if (key) {
          setApiKey(key);

          // Only show environment variable message once globally
          const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
          if (envApiKey && !globalState.hasShownEnvironmentMessage()) {
            toast.success('Using OpenAI API key from environment variables');
            globalState.markEnvironmentMessageShown();
          }
        }
      } catch (error) {
        console.warn('[useApiKeyState] Failed to get API key:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApiKey();
  }, []);

  const updateApiKey = async (newKey: string) => {
    try {
      await apiKeyManager.setApiKey(newKey);
      setApiKey(newKey);

      // Show success message for manually set keys
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        toast.success('API key saved successfully');
      }
    } catch (error) {
      console.error('[useApiKeyState] Failed to update API key:', error);
      toast.error('Failed to save API key');
    }
  };

  const clearApiKey = () => {
    setApiKey(null);
    localStorage.removeItem('openaiApiKey');
    localStorage.removeItem('openai-api-key');
  };

  const hasValidKey = async () => {
    return await apiKeyManager.isValidKeyFormat();
  };

  const isProjectKey = async () => {
    return await apiKeyManager.isProjectKey();
  };

  return {
    apiKey,
    isLoading,
    updateApiKey,
    clearApiKey,
    hasValidKey,
    isProjectKey
  };
}

/**
 * Simplified hook for components that just need to check if API key exists
 */
export function useHasApiKey() {
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const key = await apiKeyManager.getApiKey();
        setHasKey(!!key);
      } catch (error) {
        console.warn('[useHasApiKey] Failed to check API key:', error);
        setHasKey(false);
      }
    };

    checkApiKey();
  }, []);

  return hasKey;
}
