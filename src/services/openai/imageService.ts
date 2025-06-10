
import { toast } from "sonner";
import { apiKeyManager } from "./apiKeyManager";
import { ImageGenerationOptions } from "./types";

/**
 * Handles image generation using OpenAI's API
 */
class ImageService {
  async generateImage(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<string> {
    const apiKey = await apiKeyManager.getApiKey();
    if (!apiKey) {
      throw new Error("API key not set");
    }

    const { size = "1024x1024", quality = "standard" } = options;

    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size,
          quality,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Error generating image");
      }

      const data = await response.json();
      return data.data[0].url;
    } catch (error) {
      console.error("Image generation error:", error);
      toast.error("Error generating image: " + (error instanceof Error ? error.message : "Unknown error"));
      throw error;
    }
  }

  async generateMultipleImages(prompts: string[]): Promise<string[]> {
    const apiKey = await apiKeyManager.getApiKey();
    if (!apiKey) {
      throw new Error("API key not set");
    }
    
    try {
      const imageUrls: string[] = [];
      
      for (const prompt of prompts) {
        const enhancedPrompt = prompt + ", children's book illustration style, colorful doodles, cute characters, happy mood";
        const imageUrl = await this.generateImage(enhancedPrompt);
        imageUrls.push(imageUrl);
      }
      
      return imageUrls;
    } catch (error) {
      console.error("Error generating multiple images:", error);
      toast.error("Failed to generate all images. Please try again.");
      throw error;
    }
  }
}

export const imageService = new ImageService();
