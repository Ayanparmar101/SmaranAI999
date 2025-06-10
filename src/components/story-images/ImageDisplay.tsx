
import React from 'react';
import { Image, Download } from 'lucide-react';
import { NeoButton } from '@/components/NeoButton';

interface ImageDisplayProps {
  imageUrl: string | null;
  onDownload: () => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, onDownload }) => {
  return (
    <div className="neo-card bg-white border-3 border-black rounded-md h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Your Illustration</h2>
      
      {imageUrl ? (
        <div className="flex flex-col flex-grow">
          <div className="relative bg-muted rounded-md border-3 border-black overflow-hidden flex-grow flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Generated illustration"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          <div className="mt-4 flex justify-center">
            <NeoButton
              variant="destructive"
              onClick={onDownload}
              icon={<Download className="w-4 h-4" />}
            >
              Download Image
            </NeoButton>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center bg-muted rounded-md border-3 border-black p-8">
          <Image className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Your generated image will appear here.
            <br />
            Write a story and generate an image!
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;
