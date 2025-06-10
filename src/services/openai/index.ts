
import { apiKeyManager } from "./apiKeyManager";
import { completionService } from "./completionService";
import { imageService } from "./imageService";
import { speechService } from "./speechService";
import { storyService } from "./storyService";
import { ImageGenerationOptions } from "./types";

/**
 * Unified OpenAI service that provides access to all OpenAI-related functionality
 */
class OpenAIService {
  // API key management
  async setApiKey(key: string): Promise<void> {
    return apiKeyManager.setApiKey(key);
  }

  async getApiKey(): Promise<string | null> {
    return apiKeyManager.getApiKey();
  }

  // Text completion
  createCompletion(systemPrompt: string, userPrompt: string, options = {}) {
    return completionService.createCompletion(systemPrompt, userPrompt, options);
  }

  // Image generation
  generateImage(prompt: string, size: ImageGenerationOptions['size'] = "1024x1024") {
    return imageService.generateImage(prompt, { size });
  }

  generateMultipleImages(prompts: string[]) {
    return imageService.generateMultipleImages(prompts);
  }

  // TTS
  generateSpeech(text: string, options = {}) {
    return speechService.generateSpeech(text, options);
  }

  // Story services
  generateStorySegments(storyText: string) {
    return storyService.generateStorySegments(storyText);
  }

  generateConsistentImagePrompts(storyText: string, segments: string[]) {
    return storyService.generateConsistentImagePrompts(storyText, segments);
  }
}

// Create and export a single instance
export const openaiService = new OpenAIService();

// Also export individual services for direct access if needed
export {
  apiKeyManager,
  completionService,
  imageService,
  speechService,
  storyService
};
