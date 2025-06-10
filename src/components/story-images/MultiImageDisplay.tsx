
import React from 'react';
import { Image, Download, Loader2 } from 'lucide-react';
import { NeoButton } from '@/components/NeoButton';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import DoodleDecoration from '@/components/DoodleDecoration';

interface MultiImageDisplayProps {
  imageUrls: string[] | null;
  loading: boolean;
  onDownload: (index: number) => void;
}

const MultiImageDisplay: React.FC<MultiImageDisplayProps> = ({ 
  imageUrls, 
  loading, 
  onDownload 
}) => {
  if (loading) {
    return (
      <div className="neo-card bg-white border-3 border-black rounded-md h-full flex flex-col">
        <h2 className="text-xl font-bold mb-4">Your Illustrations</h2>
        <div className="flex-grow flex flex-col items-center justify-center bg-muted rounded-md border-3 border-black p-8">
          <Loader2 className="w-16 h-16 text-muted-foreground mb-4 animate-spin" />
          <p className="text-muted-foreground text-center">
            Generating your illustrations...
            <br />
            This may take a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-card bg-white border-3 border-black rounded-md h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        Your Story Illustrations
        <DoodleDecoration type="star" color="yellow" size="sm" className="ml-2" />
      </h2>
      
      {imageUrls && imageUrls.length > 0 ? (
        <div className="flex flex-col flex-grow">
          <div className="relative bg-muted rounded-md border-3 border-black overflow-hidden flex-grow flex items-center justify-center mb-4">
            <Carousel className="w-full h-full">
              <CarouselContent className="h-full">
                {imageUrls.map((url, index) => (
                  <CarouselItem key={index} className="h-full flex items-center justify-center">
                    <div className="relative h-full w-full flex items-center justify-center">
                      <img
                        src={url}
                        alt={`Story illustration ${index + 1}`}
                        className="max-w-full max-h-full object-contain"
                      />
                      <div className="absolute bottom-2 right-2">
                        <NeoButton
                          variant="destructive"
                          size="sm"
                          onClick={() => onDownload(index)}
                          icon={<Download className="w-4 h-4" />}
                        >
                          Save
                        </NeoButton>
                      </div>
                      <div className="absolute top-2 left-2 bg-black text-white font-bold py-1 px-3 rounded-full border-2 border-white">
                        {index + 1}/4
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 bg-white border-3 border-black" />
              <CarouselNext className="absolute right-2 bg-white border-3 border-black" />
            </Carousel>
          </div>
          
          <div className="flex justify-center gap-2">
            {imageUrls.map((_, index) => (
              <div 
                key={index}
                className="w-2 h-2 rounded-full bg-gray-300 border border-black"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center bg-muted rounded-md border-3 border-black p-8">
          <Image className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Your generated story illustrations will appear here.
            <br />
            Write a story and generate multiple images!
          </p>
        </div>
      )}
    </div>
  );
};

export default MultiImageDisplay;
