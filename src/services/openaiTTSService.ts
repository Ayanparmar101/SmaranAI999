import OpenAI from 'openai';

interface TTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  model?: 'tts-1' | 'tts-1-hd' | 'gpt-4o-realtime-preview' | 'gpt-4o-mini-realtime-preview' | 'gpt-4o-audio-preview' | 'gpt-4o-mini-audio-preview';
  instructions?: string;
}

class OpenAITTSService {
  private openai: OpenAI | null = null;
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
    this.openai = new OpenAI({
      apiKey: key,
      dangerouslyAllowBrowser: true
    });
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  async generateAndPlayEnglishSpeech(input: string, userContext?: string): Promise<void> {
    if (!this.openai || !this.apiKey) {
      throw new Error('OpenAI API key not set. Please set your API key first.');
    }

    if (!input.trim()) {
      throw new Error('Input text cannot be empty.');
    }

    // Enhanced instructions for English learning
    const instructions = `Accent/Affect: Warm, refined, and gently instructive, reminiscent of a friendly English teacher.

Tone: Calm, encouraging, and articulate, clearly enunciating each word with patience and care.

Pacing: Slow and deliberate, pausing appropriately between sentences and phrases to allow the listener to follow comfortably.

Emotion: Cheerful, supportive, and pleasantly enthusiastic; convey genuine enjoyment and appreciation for English language learning.

Pronunciation: Clearly articulate English vocabulary, grammar terms, and literary concepts with gentle emphasis. Use received pronunciation (RP) or neutral American accent.

Personality Affect: Friendly and approachable with educational sophistication; speak confidently and reassuringly, guiding students through English concepts patiently and warmly.

Context: ${userContext || 'General English language learning content for students grades 1-8. Focus on clarity and educational value.'}`;    try {
      console.log('Generating English TTS...');
      
      const response = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input,
      });

      console.log('TTS API response received, playing audio...');

      // Convert response to audio blob and play
      const audioBlob = new Blob([await response.arrayBuffer()], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      
      // Add event listeners for cleanup and error handling
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
      });
      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        URL.revokeObjectURL(audioUrl);
      });

      // Attempt to play
      try {
        await audio.play();
        console.log('Audio playback started successfully');
      } catch (playError) {
        console.error('Audio play() failed:', playError);
        URL.revokeObjectURL(audioUrl);
        throw new Error(`Audio playback failed: ${playError instanceof Error ? playError.message : 'Unknown audio error'}`);
      }
      
    } catch (error) {
      console.error('Error in English TTS generation:', error);
      throw new Error(`Failed to generate or play English speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateEnglishSpeechBlob(input: string, userContext?: string, options: TTSOptions = {}): Promise<Blob> {
    if (!this.openai || !this.apiKey) {
      throw new Error('OpenAI API key not set. Please set your API key first.');
    }

    if (!input.trim()) {
      throw new Error('Input text cannot be empty.');
    }    const {
      voice = 'alloy',
      model = 'tts-1',
      instructions: customInstructions
    } = options;

    // Default instructions for English learning if none provided
    const defaultInstructions = `Accent/Affect: Warm, refined, and gently instructive, reminiscent of a friendly English teacher.

Tone: Calm, encouraging, and articulate, clearly enunciating each word with patience and care.

Pacing: Slow and deliberate, pausing appropriately between sentences and phrases to allow the listener to follow comfortably.

Emotion: Cheerful, supportive, and pleasantly enthusiastic; convey genuine enjoyment and appreciation for English language learning.

Pronunciation: Clearly articulate English vocabulary, grammar terms, and literary concepts with gentle emphasis.

Personality Affect: Friendly and approachable with educational sophistication; speak confidently and reassuringly, guiding students through English concepts patiently and warmly.

Context: ${userContext || 'General English language learning content for students grades 1-8. Focus on clarity and educational value.'}`;

    const instructions = customInstructions || defaultInstructions;

    try {
      console.log('Generating English TTS blob for:', input.substring(0, 100) + '...');
        const response = await this.openai.audio.speech.create({
        model,
        voice,
        input,
      });

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      
      console.log('English TTS blob generated successfully');
      return blob;
      
    } catch (error) {
      console.error('Error in English TTS blob generation:', error);
      throw new Error(`Failed to generate English speech blob: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Method for quick pronunciation practice
  async pronounceWord(word: string, definition?: string): Promise<void> {
    const context = `Pronunciation practice for the English word "${word}"${definition ? ` which means: ${definition}` : ''}. Focus on clear articulation and proper pronunciation.`;
    const input = definition 
      ? `The word is "${word}". ${word}. This means ${definition}. Let me say it again slowly: ${word}.`
      : `The word is "${word}". ${word}. Let me repeat that: ${word}.`;
    
    await this.generateAndPlayEnglishSpeech(input, context);
  }

  // Method for reading sentences or paragraphs
  async readEnglishText(text: string, textType: 'sentence' | 'paragraph' | 'story' | 'poem' = 'sentence'): Promise<void> {
    const context = `Reading ${textType} for English language learners. Focus on natural flow, proper intonation, and clear pronunciation.`;
    await this.generateAndPlayEnglishSpeech(text, context);
  }

  // Method for grammar explanations
  async explainGrammar(explanation: string): Promise<void> {
    const context = 'Grammar explanation for English language learners. Use clear, educational tone with emphasis on key grammatical terms.';
    await this.generateAndPlayEnglishSpeech(explanation, context);
  }
}

// Create and export a singleton instance
export const openaiTTSService = new OpenAITTSService();
export default openaiTTSService;
