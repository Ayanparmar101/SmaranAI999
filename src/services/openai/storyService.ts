
import { toast } from "sonner";
import { completionService } from "./completionService";
import { imageService } from "./imageService";

/**
 * Handles story-related operations using OpenAI services
 */
class StoryService {
  async generateStorySegments(storyText: string): Promise<string[]> {
    try {
      const systemPrompt = `You are a helpful assistant that divides stories into segments for illustration. 
      Given a story, divide it into exactly 4 segments of roughly equal length while ensuring each segment 
      has a clear event or scene that could be illustrated. The segments should flow naturally and maintain 
      the narrative structure. Return ONLY the 4 segments as a JSON array of strings, with no additional text.`;

      const result = await completionService.createCompletion(systemPrompt, storyText, { max_tokens: 2000 });
      
      try {
        // Try to parse as direct JSON
        return JSON.parse(result);
      } catch (e) {
        // If direct parsing fails, try to extract JSON from text
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse story segments");
        }
      }
    } catch (error) {
      console.error("Error generating story segments:", error);
      toast.error("Failed to divide story into segments. Please try again.");
      throw error;
    }
  }

  async generateConsistentImagePrompts(storyText: string, segments: string[]): Promise<string[]> {
    try {
      const systemPrompt = `You are a helpful assistant that creates consistent art prompts for children's story illustrations.
      Given a full story and its 4 segments, create 4 detailed prompts that will generate consistent illustrations.
      
      Important guidelines:
      1. Extract character descriptions, settings, and mood from the whole story.
      2. Ensure the same characters appear across all illustrations with consistent appearance.
      3. Use consistent art style, colors, and background elements throughout.
      4. Each prompt should focus on illustrating the key event in its corresponding segment.
      5. All prompts should specify "colorful children's book illustration with doodle style"
      6. Keep each prompt under 200 characters.
      
      Return ONLY the 4 prompts as a JSON array of strings with no additional text.`;

      const userPrompt = `Full Story: ${storyText}
      
      Segment 1: ${segments[0]}
      Segment 2: ${segments[1]}
      Segment 3: ${segments[2]}
      Segment 4: ${segments[3]}`;

      const result = await completionService.createCompletion(systemPrompt, userPrompt, { max_tokens: 2000 });
      
      try {
        // Try to parse as direct JSON
        return JSON.parse(result);
      } catch (e) {
        // If direct parsing fails, try to extract JSON from text
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse image prompts");
        }
      }
    } catch (error) {
      console.error("Error generating consistent image prompts:", error);
      toast.error("Failed to create consistent prompts. Please try again.");
      throw error;
    }
  }
}

export const storyService = new StoryService();
