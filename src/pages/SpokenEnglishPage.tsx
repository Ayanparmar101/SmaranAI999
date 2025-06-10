
import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { processEnglishConversation } from '../services/openaiEngService';
import ChatContainer from '../components/chat/ChatContainer';
import ApiKeyInput from '../components/ApiKeyInput';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { EnglishTTSButton } from '../components/english/EnglishTTSButton';

const SpokenEnglishPage = () => {
  const [apiKey, setApiKey] = useLocalStorage<string>('openai-api-key', '');
  const [activeTab, setActiveTab] = useState('conversation');

  // Function to process messages using OpenAI
  const processMessage = async (message: string): Promise<string> => {
    if (!apiKey) {
      throw new Error("Please add your OpenAI API key first");
    }
    
    return processEnglishConversation(message, { apiKey });
  };

  const renderApiKeyDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">API Key Settings</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>OpenAI API Key</DialogTitle>
          <DialogDescription>
            Enter your OpenAI API key to use the conversation features.
          </DialogDescription>
        </DialogHeader>
        <ApiKeyInput 
          onApiKeySubmit={setApiKey}
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Spoken English Practice</h1>
          <EnglishTTSButton 
            text="Welcome to Spoken English Practice! Here you can practice conversations and learn pronunciation tips."
            type="instruction"
            iconOnly
          />
        </div>
        {renderApiKeyDialog()}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="conversation">Conversation Practice</TabsTrigger>
          <TabsTrigger value="tips">Learning Tips</TabsTrigger>
        </TabsList>
        
        <TabsContent value="conversation" className="mt-6">
          <ChatContainer 
            title="English Conversation Practice" 
            storageKey="spoken-english-chat" 
            processingFunction={processMessage} 
            enableTTS={true}
          />
        </TabsContent>
        
        <TabsContent value="tips" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Speaking Practice Tips</CardTitle>
                    <CardDescription>Improve your spoken English</CardDescription>
                  </div>
                  <EnglishTTSButton 
                    text="Here are five important tips to improve your spoken English: Practice speaking English for at least 10 minutes every day. Record yourself speaking and listen for areas to improve. Learn common phrases and expressions, not just individual words. Don't be afraid to make mistakes - they are part of learning! Find a language exchange partner or join conversation groups."
                    type="instruction"
                    iconOnly
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="flex-1">• Practice speaking English for at least 10 minutes every day</p>
                  <EnglishTTSButton 
                    text="Practice speaking English for at least 10 minutes every day"
                    type="sentence"
                    iconOnly
                    className="ml-2"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="flex-1">• Record yourself speaking and listen for areas to improve</p>
                  <EnglishTTSButton 
                    text="Record yourself speaking and listen for areas to improve"
                    type="sentence"
                    iconOnly
                    className="ml-2"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="flex-1">• Learn common phrases and expressions, not just individual words</p>
                  <EnglishTTSButton 
                    text="Learn common phrases and expressions, not just individual words"
                    type="sentence"
                    iconOnly
                    className="ml-2"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="flex-1">• Don't be afraid to make mistakes - they are part of learning!</p>
                  <EnglishTTSButton 
                    text="Don't be afraid to make mistakes - they are part of learning!"
                    type="sentence"
                    iconOnly
                    className="ml-2"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="flex-1">• Find a language exchange partner or join conversation groups</p>
                  <EnglishTTSButton 
                    text="Find a language exchange partner or join conversation groups"
                    type="sentence"
                    iconOnly
                    className="ml-2"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Pronunciation Focus</CardTitle>
                    <CardDescription>Common challenges and solutions</CardDescription>
                  </div>
                  <EnglishTTSButton 
                    text="Here are five pronunciation tips: Pay attention to word stress and sentence intonation. Practice minimal pairs like ship and sheep, bet and bat. Watch English shows with subtitles to connect sounds to words. Use pronunciation apps to get feedback on your speech. Slow down when speaking difficult words or phrases."
                    type="instruction"
                    iconOnly
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="flex-1">• Pay attention to word stress and sentence intonation</p>
                  <EnglishTTSButton 
                    text="Pay attention to word stress and sentence intonation"
                    type="pronunciation"
                    iconOnly
                    className="ml-2"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="flex-1">• Practice minimal pairs (e.g., ship/sheep, bet/bat)</p>
                  <EnglishTTSButton 
                    text="Practice minimal pairs. For example: ship, sheep, bet, bat"
                    type="pronunciation"
                    iconOnly
                    className="ml-2"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="flex-1">• Watch English shows with subtitles to connect sounds to words</p>
                  <EnglishTTSButton 
                    text="Watch English shows with subtitles to connect sounds to words"
                    type="sentence"
                    iconOnly
                    className="ml-2"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="flex-1">• Use pronunciation apps to get feedback on your speech</p>
                  <EnglishTTSButton 
                    text="Use pronunciation apps to get feedback on your speech"
                    type="sentence"
                    iconOnly
                    className="ml-2"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="flex-1">• Slow down when speaking difficult words or phrases</p>
                  <EnglishTTSButton 
                    text="Slow down when speaking difficult words or phrases"
                    type="sentence"
                    iconOnly
                    className="ml-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpokenEnglishPage;
