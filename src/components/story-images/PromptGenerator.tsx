
import React from 'react';
import { Send, ImagePlus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { NeoButton } from '@/components/NeoButton';
import { Toggle } from '@/components/ui/toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

interface PromptGeneratorProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerateImage: () => void;
  onGenerateMultipleImages: () => void;
  loading: boolean;
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({
  prompt,
  onPromptChange,
  onGenerateImage,
  onGenerateMultipleImages,
  loading
}) => {
  return (
    <div className="neo-card bg-white border-3 border-black rounded-md">
      <h2 className="text-xl font-bold mb-4">Image Prompt</h2>
      <p className="text-muted-foreground mb-4">
        Edit the prompt or use the generated one to create your image.
      </p>
      
      <div className="mb-4">
        <Textarea
          placeholder="The prompt will appear here..."
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="min-h-[100px] border-3 border-black focus:border-[#F97316] bg-white text-foreground shadow-neo-sm"
        />
      </div>
      
      <Tabs defaultValue="single" className="mb-4">
        <TabsList className="grid w-full grid-cols-2 border-3 border-black bg-muted">
          <TabsTrigger value="single" className="data-[state=active]:bg-[#4E9BF5] data-[state=active]:text-white">
            Single Image
          </TabsTrigger>
          <TabsTrigger value="multiple" className="data-[state=active]:bg-[#76D394] data-[state=active]:text-white">
            Story Series (4)
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="single" className="mt-4">
          <div className="flex gap-2">
            <NeoButton
              variant="accent"
              onClick={onGenerateImage}
              loading={loading && prompt !== ''}
              icon={<Send className="w-4 h-4" />}
              className="flex-grow"
            >
              Generate Image
            </NeoButton>
            
            <Toggle
              variant="neobrutalism"
              aria-label="Auto generate"
              className="data-[state=on]:bg-[#F97316] data-[state=on]:text-white"
            >
              Auto
            </Toggle>
          </div>
        </TabsContent>
        
        <TabsContent value="multiple" className="mt-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              Generates a series of 4 consistent illustrations from your story.
            </p>
          </div>
          
          <NeoButton
            variant="warning"
            onClick={onGenerateMultipleImages}
            loading={loading}
            icon={<ImagePlus className="w-4 h-4" />}
            className="w-full"
          >
            Generate Story Series
          </NeoButton>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromptGenerator;
