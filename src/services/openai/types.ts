
export interface OpenAICompletion {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  response_format?: { type: string }; // Add this to support JSON response format
}

export interface CompletionOptions {
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  onChunk?: (chunk: string) => void;
}

export interface TTSOptions {
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  speed?: number;
}

export interface ImageGenerationOptions {
  size?: "1024x1024" | "1024x1792" | "1792x1024";
  quality?: "standard" | "hd";
}
