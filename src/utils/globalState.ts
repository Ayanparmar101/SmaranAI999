/**
 * Global state manager for preventing duplicate messages and managing shared state
 */

class GlobalState {
  private static instance: GlobalState | null = null;
  private hasShownEnvMessage: boolean = false;
  private hasInitializedApiKey: boolean = false;

  private constructor() {
    // Log initialization for debugging
    console.log('[GlobalState] Initialized singleton instance');
  }

  static getInstance(): GlobalState {
    if (!GlobalState.instance) {
      GlobalState.instance = new GlobalState();
    }
    return GlobalState.instance;
  }

  /**
   * Check if environment variable message has been shown
   */
  hasShownEnvironmentMessage(): boolean {
    return this.hasShownEnvMessage;
  }

  /**
   * Mark environment variable message as shown
   */
  markEnvironmentMessageShown(): void {
    console.log('[GlobalState] Marking environment message as shown');
    this.hasShownEnvMessage = true;
  }

  /**
   * Check if API key has been initialized
   */
  hasInitializedApiKeyState(): boolean {
    return this.hasInitializedApiKey;
  }

  /**
   * Mark API key as initialized
   */
  markApiKeyInitialized(): void {
    this.hasInitializedApiKey = true;
  }

  /**
   * Reset all flags (useful for testing or development)
   */
  reset(): void {
    this.hasShownEnvMessage = false;
    this.hasInitializedApiKey = false;
  }
}

// Export singleton instance
export const globalState = GlobalState.getInstance();
