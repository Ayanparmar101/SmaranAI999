
import React from 'react';
import ChatDisplay from '@/components/voice-bot/ChatDisplay';
import VoiceControls from '@/components/voice-bot/VoiceControls';
import MessageInput from '@/components/voice-bot/MessageInput';
import TranscriptDisplay from '@/components/voice-bot/TranscriptDisplay';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useOpenAI } from '@/hooks/useOpenAI';
import { useApiKeyState } from '@/hooks/useApiKeyState';
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';

const VoiceBotPage = () => {
  const { apiKey, updateApiKey, hasValidKey } = useApiKeyState();
  const { messages, loading, handleUserMessage } = useOpenAI(apiKey);
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition({
    onFinalTranscript: handleUserMessage
  });

  const handleApiKeyPrompt = () => {
    const key = prompt('Enter your OpenAI API key:');
    if (key && key.trim()) {
      updateApiKey(key.trim());
    }
  };

  return (
    <main className="flex-1 container mx-auto max-w-4xl p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-kid-purple">Voice Bot</h1>
        {!hasValidKey() && (
          <Button onClick={handleApiKeyPrompt} variant="outline" size="sm">
            <Key className="w-4 h-4 mr-2" />
            Set API Key
          </Button>
        )}
      </div>
      
      <div className="bg-card rounded-xl shadow-md p-4 mb-4 h-[60vh] overflow-y-auto text-card-foreground">
        <ChatDisplay messages={messages} />
      </div>
      
      <TranscriptDisplay transcript={transcript} />
      
      <VoiceControls 
        isListening={isListening}
        loading={loading}
        startListening={startListening}
        stopListening={stopListening}
      />
      
      <MessageInput 
        loading={loading}
        onSubmit={handleUserMessage}
      />
    </main>
  );
};

export default VoiceBotPage;
