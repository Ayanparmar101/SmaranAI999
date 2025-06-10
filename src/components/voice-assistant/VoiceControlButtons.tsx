
import React from 'react';
import { Mic, StopCircle, Volume2, VolumeX } from 'lucide-react';
import { NeoButton } from '@/components/NeoButton';
import { Progress } from '@/components/ui/progress';

interface VoiceControlButtonsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  hasAudioMessages: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  onReplayLastResponse: () => void;
  showPlaybackControls?: boolean;
}

const VoiceControlButtons: React.FC<VoiceControlButtonsProps> = ({
  isListening,
  isSpeaking,
  isProcessing,
  hasAudioMessages,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  onReplayLastResponse,
  showPlaybackControls = true,
}) => {
  // --- Add logging directly to the onClick handler --- 
  const handleReplayClick = () => {
    console.log("Replay Last Response BUTTON CLICKED in VoiceControlButtons");
    onReplayLastResponse(); // Call the prop function
  };
  // -----------------------------------------------------

  return (
    <div className="flex flex-col gap-3">
      <div className={`grid ${showPlaybackControls ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'} gap-3`}>
        {!isListening ? (
          <NeoButton
            variant="primary"
            icon={<Mic />}
            onClick={onStartListening} // Direct prop usage is fine here
            disabled={isProcessing}
            className={!showPlaybackControls ? 'col-span-1' : 'col-span-1 md:col-span-2'}
          >
            Start Speaking
          </NeoButton>
        ) : (
          <NeoButton
            variant="destructive"
            icon={<StopCircle />}
            onClick={onStopListening} // Direct prop usage is fine here
            className={`${!showPlaybackControls ? 'col-span-1' : 'col-span-1 md:col-span-2'} animate-pulse`}
          >
            Stop Speaking
          </NeoButton>
        )}
        
        {showPlaybackControls && (
          isSpeaking ? (
            <NeoButton
              variant="secondary"
              icon={<VolumeX />}
              onClick={onStopSpeaking} // Direct prop usage is fine here
              className="col-span-1 md:col-span-2"
            >
              Stop Playback
            </NeoButton>
          ) : (
            <NeoButton
              variant="secondary"
              icon={<Volume2 />}
              disabled={!hasAudioMessages}
              onClick={handleReplayClick} // Use the new handler with logging
              className="col-span-1 md:col-span-2"
            >
              Replay Last Response
            </NeoButton>
          )
        )}
      </div>
      
      {isListening && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="w-full">
              <Progress value={100} className="h-1.5 w-full bg-slate-200 animate-pulse" />
            </div>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-red-500 rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
              <div className="w-1 h-2 bg-red-500 rounded-full animate-[pulse_1s_ease-in-out_0.3s_infinite]"></div>
              <div className="w-1 h-3 bg-red-500 rounded-full animate-[pulse_1s_ease-in-out_0.5s_infinite]"></div>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-1">Recording your voice...</p>
        </div>
      )}
    </div>
  );
};

export default VoiceControlButtons;
