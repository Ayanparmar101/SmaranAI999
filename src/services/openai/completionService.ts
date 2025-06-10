
import { apiKeyManager } from './apiKeyManager';
import { toast } from 'sonner';

interface CompletionOptions {
  stream?: boolean;
  onChunk?: (chunk: string) => void;
  max_tokens?: number;
  temperature?: number;
  imageData?: string; // Add support for image data
}

class CompletionService {
  private openAIUrl = 'https://api.openai.com/v1/chat/completions';

  async createCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: CompletionOptions
  ): Promise<string> {
    const apiKey = await apiKeyManager.getApiKey();
    if (!apiKey) {
      console.error("API Key not found");
      toast.error('OpenAI API Key not set. Please configure it first.');
      throw new Error('API Key not set');
    }

    // Build the user message content
    let userMessageContent: any = userPrompt;
    
    // If image data is provided, format the message for vision
    if (options?.imageData) {
      userMessageContent = [
        {
          type: "text",
          text: userPrompt
        },
        {
          type: "image_url",
          image_url: {
            url: options.imageData
          }
        }
      ];
    }

    const requestBody = {
      model: options?.imageData ? "gpt-4o" : "gpt-4o-mini", // Use gpt-4o for vision
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessageContent } 
      ],
      max_tokens: options?.max_tokens ?? 1500, 
      temperature: options?.temperature ?? 0.7,
      stream: options?.stream ?? false
    };

    console.log("OpenAI Service: Request Body:", JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch(this.openAIUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errorBody = '';
        try {
          errorBody = await response.text(); 
        } catch (_) { /* Ignore */ }
        
        console.error(`OpenAI API request failed: ${response.status} ${response.statusText}`, errorBody);
        toast.error(`OpenAI request failed: ${response.status} ${response.statusText}`);

        if (response.status === 503) {
           throw new Error(`OpenAI Service Unavailable (503). Please try again later. Details: ${errorBody}`);
        } else if (response.status === 401) {
           throw new Error(`OpenAI Authentication Error (401). Check your API key. Details: ${errorBody}`);
        } else if (response.status === 429) {
            throw new Error(`OpenAI Rate Limit Exceeded (429). Please try again later. Details: ${errorBody}`);
        } else {
            throw new Error(`OpenAI API Error (${response.status}): ${response.statusText}. Details: ${errorBody}`);
        }
      }

      if (options?.stream && options.onChunk) {
        if (!response.body) {
          throw new Error('Response body is null');
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";
        
        console.log("Starting streaming completion...");

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("Stream finished.");
            break;
          }
          const chunkText = decoder.decode(value);
          // Corrected the split method with escaped newline character
          const lines = chunkText.split('\n').filter(line => line.trim() !== ''); 
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.substring(6);
              if (jsonStr === '[DONE]') {
                console.log("Stream marked DONE.");
                continue; 
              }
              try {
                const parsed = JSON.parse(jsonStr);
                const deltaContent = parsed.choices?.[0]?.delta?.content;
                if (deltaContent) {
                  accumulatedText += deltaContent;
                  options.onChunk(deltaContent);
                }
              } catch (e) {
                console.error('Error parsing stream chunk JSON:', e, 'Chunk:', jsonStr);
              }
            }
          }
        }
        console.log("Streaming completion finished processing.");
        return accumulatedText;

      } else {
        const data = await response.json();
        console.log("Completion received successfully (non-streaming).");
        return data.choices[0]?.message?.content || '';
      }

    } catch (error) {
      console.error("Error during OpenAI API call:", error);
      throw error; 
    }
  }
}

export const completionService = new CompletionService();
