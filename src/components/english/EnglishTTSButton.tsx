import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useEnglishTTS } from '@/hooks/useEnglishTTS';
import { cn } from '@/lib/utils';

interface EnglishTTSButtonProps {
  text: string;
  context?: string;
  type?: 'word' | 'sentence' | 'paragraph' | 'story' | 'poem' | 'grammar' | 'instruction' | 'question' | 'feedback' | 'explanation' | 'pronunciation' | 'content' | 'conversation';
  definition?: string; // For word pronunciation
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  showIcon?: boolean;
  iconOnly?: boolean;
}

const EnglishTTSButton: React.FC<EnglishTTSButtonProps> = ({
  text,
  context,
  type = 'sentence',
  definition,
  variant = 'outline',
  size = 'sm',
  className,
  children,
  disabled = false,
  showIcon = true,
  iconOnly = false
}) => {
  const { speak, speakWord, readText, explainGrammar, isLoading, isPlaying, hasApiKey } = useEnglishTTS();  const handleClick = async () => {
    if (!hasApiKey) {
      return; // Error toast is shown in the hook
    }

    try {
      switch (type) {
        case 'word':
          await speakWord(text, definition);
          break;
        case 'grammar':
          await explainGrammar(text);
          break;
        case 'sentence':
        case 'paragraph':
        case 'story':
        case 'poem':
          await readText(text, type);
          break;
        default:
          await speak(text, context);
      }
    } catch (error) {
      console.error('TTS operation failed:', error);
    }
  };

  const getButtonText = () => {
    if (iconOnly) return null;
    if (children) return children;
    
    if (isLoading) return 'Generating...';
    if (isPlaying) return 'Playing...';
    
    switch (type) {
      case 'word':
        return 'Pronounce';
      case 'grammar':
        return 'Explain';
      case 'sentence':
        return 'Read Sentence';
      case 'paragraph':
        return 'Read Paragraph';
      case 'story':
        return 'Read Story';
      case 'poem':
        return 'Read Poem';
      default:
        return 'Speak';
    }
  };

  const getIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (isPlaying) return <VolumeX className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || isLoading || !hasApiKey || !text.trim()}
      className={cn(
        "gap-2",
        iconOnly && "aspect-square p-0",
        className
      )}
      title={`${type === 'word' ? 'Pronounce' : 'Read'} "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`}
    >
      {showIcon && getIcon()}
      {getButtonText()}
    </Button>  );
};

export { EnglishTTSButton };
export default EnglishTTSButton;
