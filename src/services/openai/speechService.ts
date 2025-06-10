
import { toast } from "sonner";
import { apiKeyManager } from "./apiKeyManager";
import { TTSOptions } from "./types";

/**
 * Handles text-to-speech using OpenAI's API
 */
class SpeechService {
  async generateSpeech(text: string, options: TTSOptions = {}): Promise<ArrayBuffer> {
    const apiKey = await apiKeyManager.getApiKey();
    if (!apiKey) {
      throw new Error("API key not set");
    }

    try {
      const { voice = "nova", speed = 1.0 } = options;
      
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "tts-1", // The OpenAI TTS model
          input: text,
          voice,
          speed,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Error generating speech");
      }

      const audioData = await response.arrayBuffer();
      return audioData;
    } catch (error) {
      console.error("Speech generation error:", error);
      toast.error("Error generating speech: " + (error instanceof Error ? error.message : "Unknown error"));
      throw error;
    }
  }
}

export const speechService = new SpeechService();
