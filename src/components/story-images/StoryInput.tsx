
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Undo } from 'lucide-react';
import { NeoButton } from '@/components/NeoButton';

interface StoryInputProps {
  storyText: string;
  onStoryChange: (value: string) => void;
  onGeneratePrompt: () => void;
  onClear: () => void;
  loading: boolean;
}

const StoryInput: React.FC<StoryInputProps> = ({
  storyText,
  onStoryChange,
  onGeneratePrompt,
  onClear,
  loading
}) => {
  return (
    <div className="neo-card bg-white border-3 border-black rounded-md mb-6">
      <h2 className="text-xl font-bold mb-4">Write Your Story</h2>
      <p className="text-muted-foreground mb-4">
        Write a short story or describe a scene, and we'll generate an illustration for it!
      </p>
      
      <div className="mb-4">
        <Textarea
          placeholder="Once upon a time, there was a little rabbit who lived in a magical forest..."
          value={storyText}
          onChange={(e) => onStoryChange(e.target.value)}
          className="min-h-[150px] border-3 border-black focus:border-[#F59E0B] bg-white text-foreground shadow-neo-sm"
        />
      </div>
      
      <div className="flex space-x-3">
        <NeoButton
          variant="warning"
          onClick={onGeneratePrompt}
          loading={loading}
        >
          Create Prompt
        </NeoButton>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onClear}
          title="Clear story"
          className="border-3 border-black shadow-neo-sm hover:translate-y-1 hover:shadow-none"
        >
          <Undo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StoryInput;
