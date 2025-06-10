import React, { useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { textToSpeechService } from '@/services/textToSpeechService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TTSButtonProps {
  text: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  iconOnly?: boolean;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}

const TTSButton: React.FC<TTSButtonProps> = ({ 
  text, 
  className,
  variant = 'ghost',
  size = 'sm',
  iconOnly = true,
  voice = 'alloy'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTTS = async () => {
    if (!text.trim()) {
      toast.error('No text to read');
      return;
    }

    if (isPlaying) {
      textToSpeechService.stopPlayback();
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoading(true);
      await textToSpeechService.playText(text, voice);
      setIsPlaying(false);
    } catch (error) {
      console.error('TTS Error:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        toast.error('Please set your OpenAI API key first');
      } else {
        toast.error('Failed to play audio');
      }
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = isLoading ? Loader2 : isPlaying ? VolumeX : Volume2;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleTTS}
      disabled={isLoading}
      className={cn(
        "transition-colors",
        isPlaying && "text-blue-600 hover:text-blue-700",
        className
      )}
      title={isPlaying ? "Stop reading" : "Read aloud"}
    >
      <Icon className={cn("w-4 h-4", isLoading && "animate-spin")} />
      {!iconOnly && (
        <span className="ml-2">
          {isLoading ? "Loading..." : isPlaying ? "Stop" : "Read"}
        </span>
      )}
    </Button>
  );
};

export { TTSButton };
export default TTSButton;
