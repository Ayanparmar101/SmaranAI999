
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import ChatMessages from './ChatMessages';
import VoiceControlButtons from './VoiceControlButtons';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useVoicePlayback } from '@/hooks/useVoicePlayback';
import { useOpenAIVoiceChat } from '@/hooks/useOpenAIVoiceChat';

interface VoiceChatProps {
  userId?: string;
  saveMessage?: (message: string, response: string) => void;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ userId, saveMessage }) => {
  const [currentTranscript, setCurrentTranscript] = useState('');
  const { messages, isProcessing, processVoiceInput } = useOpenAIVoiceChat({ userId, saveMessage });
  const { isSpeaking, playAudio, stopAudio, replayLastResponse } = useVoicePlayback();
  
  const { isListening, startListening, stopListening } = useVoiceRecognition({
    onTranscriptChange: setCurrentTranscript,
    onSpeechEnd: async (text) => { // Use onSpeechEnd
      setCurrentTranscript(''); // Clear interim transcript display
      const audioUrl = await processVoiceInput(text);
      if (audioUrl) {
        playAudio(audioUrl);
      }
    }
  });

  // Add logging to this handler
  const handleReplayLastResponse = () => {
    console.log("handleReplayLastResponse called in VoiceChat. Calling hook...");
    replayLastResponse(messages);
  };

  return (
    <div className="flex flex-col h-[75vh]">
      <Card className="flex-grow mb-4 p-4 overflow-hidden flex flex-col">
        <ChatMessages 
          messages={messages} 
          onPlayAudio={playAudio} 
        />
      </Card>
      
      {currentTranscript && isListening && ( // Show transcript only while listening
        <div className="bg-muted p-3 rounded-lg mb-4 italic text-muted-foreground">
          "{currentTranscript}"
        </div>
      )}
      
      <VoiceControlButtons
        isListening={isListening}
        isSpeaking={isSpeaking}
        isProcessing={isProcessing} // Pass down processing state
        hasAudioMessages={messages.some(m => m.role === 'assistant' && m.audioUrl)} // Recalculate based on messages
        onStartListening={startListening}
        onStopListening={stopListening}
        onStopSpeaking={stopAudio}
        onReplayLastResponse={handleReplayLastResponse} // Pass the handler with log
        showPlaybackControls={true} // Ensure playback controls are shown here
      />
    </div>
  );
};

export default VoiceChat;
