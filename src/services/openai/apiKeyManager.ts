
import { validateApiKey, sanitizeInput } from '@/utils/security';
import { secureStorage } from '@/utils/secureStorage';

/**
 * Manages the OpenAI API key storage and retrieval
 * Singleton pattern to prevent multiple initializations
 */
class ApiKeyManager {
  private static instance: ApiKeyManager | null = null;
  private apiKey: string | null = null;
  private hasInitialized: boolean = false;

  private constructor() {
    // Initialize asynchronously to avoid blocking
    this.loadApiKey().catch(error => {
      console.warn('[ApiKeyManager] Failed to initialize API key:', error);
    });
  }

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }
  
  // Load the API key from environment or secure storage
  private async loadApiKey(): Promise<void> {
    if (this.hasInitialized) return;

    // Try to get the API key from env
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (envApiKey && envApiKey.trim() !== '') {
      // Only set if it's a valid format
      if (validateApiKey(envApiKey)) {
        this.apiKey = envApiKey;
        console.log('[ApiKeyManager] Loaded API key from environment variables');
      } else {
        console.warn('[ApiKeyManager] Environment API key has invalid format');
      }
    } else {
      // If no key is set in env, try to get from secure storage as fallback
      try {
        const savedApiKey = await secureStorage.getApiKey();
        if (savedApiKey) {
          this.apiKey = savedApiKey;
          console.log('[ApiKeyManager] Loaded API key from secure storage');
        }
      } catch (error) {
        console.warn('[ApiKeyManager] Failed to load API key from secure storage:', error);

        // Try legacy localStorage as last resort
        const legacyApiKey = localStorage.getItem("openaiApiKey");
        if (legacyApiKey && validateApiKey(legacyApiKey)) {
          this.apiKey = legacyApiKey;
          console.log('[ApiKeyManager] Loaded API key from legacy localStorage');

          // Migrate to secure storage
          try {
            await secureStorage.setApiKey(legacyApiKey);
            localStorage.removeItem("openaiApiKey");
            console.log('[ApiKeyManager] Migrated API key to secure storage');
          } catch (migrationError) {
            console.warn('[ApiKeyManager] Failed to migrate API key to secure storage:', migrationError);
          }
        }
      }
    }

    this.hasInitialized = true;
  }

  async setApiKey(key: string): Promise<void> {
    // Handle empty or undefined keys gracefully
    if (!key || typeof key !== 'string' || key.trim() === '') {
      throw new Error('API key cannot be empty');
    }

    // Validate and sanitize the API key
    const sanitizedKey = sanitizeInput(key, 200);
    if (!validateApiKey(sanitizedKey)) {
      throw new Error('Invalid API key format. Expected format: sk-... or sk-proj-...');
    }

    this.apiKey = sanitizedKey;

    // Store using secure storage instead of localStorage
    try {
      await secureStorage.setApiKey(sanitizedKey);
    } catch (error) {
      console.error('Failed to store API key:', error);
      throw new Error('Failed to store API key securely');
    }
  }

  async getApiKey(): Promise<string | null> {
    // Always check env variable first in case it was updated
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (envApiKey && envApiKey.trim() !== '') {
      return envApiKey;
    }

    // Ensure we've tried to load the API key
    if (!this.hasInitialized) {
      await this.loadApiKey();
    }

    // Try to get from secure storage
    try {
      const storedKey = await secureStorage.getApiKey();
      if (storedKey) {
        this.apiKey = storedKey;
        return storedKey;
      }
    } catch (error) {
      console.error('Failed to retrieve API key from secure storage:', error);
    }

    // Fall back to in-memory key
    return this.apiKey;
  }

  // Clear stored API key
  clearApiKey(): void {
    this.apiKey = null;
    secureStorage.clearApiKey();
    // Also clear legacy localStorage keys for backward compatibility
    localStorage.removeItem("openaiApiKey");
    localStorage.removeItem("openai-api-key");
  }

  // Check if key appears to be valid format
  async isValidKeyFormat(): Promise<boolean> {
    const apiKey = await this.getApiKey();
    if (!apiKey) return false;

    return validateApiKey(apiKey);
  }

  // Check if the API key is a project key (starts with sk-proj-)
  async isProjectKey(): Promise<boolean> {
    const apiKey = await this.getApiKey();
    if (!apiKey) return false;

    return apiKey.startsWith('sk-proj-');
  }
  
  // Create headers for OpenAI API requests with proper authentication
  async createHeaders(): Promise<Record<string, string>> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error("API key not set");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    };

    // Add the beta header for project API keys
    if (await this.isProjectKey()) {
      headers['OpenAI-Beta'] = 'assistants=v1';
    }

    return headers;
  }
}

// Export singleton instance
export const apiKeyManager = ApiKeyManager.getInstance();
