
import React from 'react';

interface TranscriptDisplayProps {
  transcript: string;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript }) => {
  if (!transcript) return null;
  
  return (
    <div className="bg-muted p-3 rounded-lg mb-4 italic text-muted-foreground">
      "{transcript}"
    </div>
  );
};

export default TranscriptDisplay;
