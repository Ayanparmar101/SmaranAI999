import React, { useState, useEffect } from 'react';
import { Image } from 'lucide-react';
import { toast } from 'sonner';
import openaiService from '@/services/openaiService';
import { useAuth } from '@/contexts/AuthContext';
import StoryInput from '@/components/story-images/StoryInput';
import PromptGenerator from '@/components/story-images/PromptGenerator';
import ImageDisplay from '@/components/story-images/ImageDisplay';
import MultiImageDisplay from '@/components/story-images/MultiImageDisplay';
import ImageHistory from '@/components/story-images/ImageHistory';
import { saveMessage } from '@/utils/messageUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StoryImagesPage = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [storyText, setStoryText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [multipleImageUrls, setMultipleImageUrls] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ prompt: string; imageUrl: string }>>([]);
  const [activeTab, setActiveTab] = useState<'single' | 'multiple'>('single');

  useEffect(() => {
    const initializeApiKey = async () => {
      try {
        const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (envApiKey) {
          setApiKey(envApiKey);
          await openaiService.setApiKey(envApiKey);
        } else {
          const savedApiKey = localStorage.getItem('openaiApiKey');
          if (savedApiKey) {
            setApiKey(savedApiKey);
            await openaiService.setApiKey(savedApiKey);
          }
        }
      } catch (error) {
        console.warn('[StoryImagesPage] Failed to initialize API key:', error);
      }
    };

    initializeApiKey();
  }, []);

  const handleApiKeySubmit = async (key: string) => {
    try {
      setApiKey(key);
      await openaiService.setApiKey(key);
      localStorage.setItem('openaiApiKey', key);
      toast.success('API key saved successfully');
    } catch (error) {
      console.error('[StoryImagesPage] Failed to set API key:', error);
      toast.error('Failed to save API key');
    }
  };

  const generatePrompt = async () => {
    const apiKey = await openaiService.getApiKey();
    if (!apiKey) {
      toast.error('Please enter your OpenAI API key first');
      return;
    }
    
    if (!storyText.trim()) {
      toast.error('Please write a story first');
      return;
    }
    
    setLoading(true);
    
    try {
      const systemPrompt = `You are a helpful AI that creates art prompts for children's stories. Given a story snippet, create a child-friendly, colorful, and engaging prompt that can be used to generate an illustration for the story. The prompt should be detailed yet simple, and should focus on creating a cheerful, colorful doodle-style illustration. Include specific details from the story, and describe the art style as "colorful children's book illustration with doodle style". Keep the prompt under 200 characters.`;
      
      const result = await openaiService.createCompletion(systemPrompt, storyText);
      setPrompt(result);

      if (user) {
        await saveMessage({
          text: storyText,
          userId: user.uid, // Use uid for Firebase compatibility
          aiResponse: result,
          chatType: 'story-images',
          toolType: 'prompt-generator'
        });
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast.error('Failed to generate a prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (!openaiService.getApiKey()) {
      toast.error('Please enter your OpenAI API key first');
      return;
    }
    
    if (!prompt.trim()) {
      toast.error('Please generate or write a prompt first');
      return;
    }
    
    setLoading(true);
    setActiveTab('single');
    
    try {
      const enhancedPrompt = prompt + ", children's book illustration style, colorful doodles, cute characters, happy mood";
      const imageUrl = await openaiService.generateImage(enhancedPrompt);
      
      setGeneratedImageUrl(imageUrl);
      
      if (user) {
        await saveMessage({
          text: `Generated image from prompt: ${prompt}`,
          userId: user.uid, // Use uid for Firebase compatibility
          chatType: 'story-images',
          imageUrl: imageUrl,
          toolType: 'image-generator'
        });
      }
      
      setHistory(prev => [{ prompt, imageUrl }, ...prev.slice(0, 5)]);
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate an image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateMultipleImages = async () => {
    if (!openaiService.getApiKey()) {
      toast.error('Please enter your OpenAI API key first');
      return;
    }
    
    if (!storyText.trim()) {
      toast.error('Please write a story first');
      return;
    }
    
    setLoading(true);
    setActiveTab('multiple');
    
    try {
      toast.info('Dividing your story into segments...', { duration: 3000 });
      
      const segments = await openaiService.generateStorySegments(storyText);
      
      toast.info('Creating consistent image prompts...', { duration: 3000 });
      const prompts = await openaiService.generateConsistentImagePrompts(storyText, segments);
      
      toast.info('Generating story illustrations...', { duration: 5000 });
      const imageUrls = await openaiService.generateMultipleImages(prompts);
      
      setMultipleImageUrls(imageUrls);
      
      if (user) {
        await saveMessage({
          text: `Generated story series from: ${storyText.substring(0, 100)}...`,
          userId: user.uid, // Use uid for Firebase compatibility
          chatType: 'story-images',
          imageUrl: imageUrls[0],
          toolType: 'story-series-generator',
          additionalData: {
            image_urls: imageUrls
          }
        });
      }
      
      setHistory(prev => [{
        prompt: `Story series: ${storyText.substring(0, 50)}...`,
        imageUrl: imageUrls[0],
        multipleImageUrls: imageUrls
      }, ...prev.slice(0, 5)]);
      
      toast.success('Story illustrations generated successfully!');
    } catch (error) {
      console.error('Error generating multiple images:', error);
      toast.error('Failed to generate story illustrations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = 'story-illustration.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadMultipleImage = (index: number) => {
    if (!multipleImageUrls || !multipleImageUrls[index]) return;
    
    const link = document.createElement('a');
    link.href = multipleImageUrls[index];
    link.download = `story-illustration-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearStory = () => {
    setStoryText('');
    setPrompt('');
  };

  const loadFromHistory = (item: { prompt: string; imageUrl: string; multipleImageUrls?: string[] }) => {
    setPrompt(item.prompt);
    
    if (item.multipleImageUrls) {
      setMultipleImageUrls(item.multipleImageUrls);
      setActiveTab('multiple');
    } else {
      setGeneratedImageUrl(item.imageUrl);
      setActiveTab('single');
    }
  };

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            <span className="flex items-center gap-2">
              <Image className="text-kid-yellow" />
              Story Image Generator
            </span>
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <StoryInput
              storyText={storyText}
              onStoryChange={setStoryText}
              onGeneratePrompt={generatePrompt}
              onClear={clearStory}
              loading={loading && !prompt}
            />
            
            <PromptGenerator
              prompt={prompt}
              onPromptChange={setPrompt}
              onGenerateImage={generateImage}
              onGenerateMultipleImages={generateMultipleImages}
              loading={loading}
            />
          </div>
          
          <div>
            {activeTab === 'single' ? (
              <ImageDisplay
                imageUrl={generatedImageUrl}
                onDownload={downloadImage}
              />
            ) : (
              <MultiImageDisplay
                imageUrls={multipleImageUrls}
                loading={loading}
                onDownload={downloadMultipleImage}
              />
            )}
          </div>
        </div>
        
        <ImageHistory 
          history={history}
          onSelectHistory={loadFromHistory}
        />
      </div>
    </main>
  );
};

export default StoryImagesPage;
