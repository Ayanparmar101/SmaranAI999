import { openaiService } from './openai';

class TextToSpeechService {
  private isPlaying = false;
  private currentAudio: HTMLAudioElement | null = null;

  async generateSpeech(text: string, voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy'): Promise<ArrayBuffer> {
    const apiKey = await openaiService.getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key not set');
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: voice,
        input: text,
        response_format: 'mp3',
        speed: 1.0
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS request failed: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  }

  async playText(text: string, voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy'): Promise<void> {
    try {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      this.isPlaying = true;
      const audioBuffer = await this.generateSpeech(text, voice);
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      
      this.currentAudio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        if (!this.currentAudio) {
          reject(new Error('Audio creation failed'));
          return;
        }

        this.currentAudio.onended = () => {
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        this.currentAudio.onerror = () => {
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };

        this.currentAudio.play().catch(reject);
      });
    } catch (error) {
      this.isPlaying = false;
      throw error;
    }
  }

  stopPlayback(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}

export const textToSpeechService = new TextToSpeechService();
export default textToSpeechService;
