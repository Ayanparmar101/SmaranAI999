
import React from 'react';
import DoodleButton from '@/components/DoodleButton';

interface VoiceControlsProps {
  isListening: boolean;
  loading: boolean;
  startListening: () => void;
  stopListening: () => void;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  loading,
  startListening,
  stopListening
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <DoodleButton 
        onClick={startListening}
        disabled={isListening || loading}
        color="purple"
        className="w-full"
      >
        Start Recording
      </DoodleButton>
      
      <DoodleButton 
        onClick={stopListening}
        disabled={!isListening || loading}
        color="red"
        className="w-full"
      >
        Stop Recording
      </DoodleButton>
    </div>
  );
};

export default VoiceControls;
