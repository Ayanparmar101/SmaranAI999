
import React from 'react';

interface HistoryItem {
  prompt: string;
  imageUrl: string;
  multipleImageUrls?: string[];
}

interface ImageHistoryProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
}

const ImageHistory: React.FC<ImageHistoryProps> = ({ history, onSelectHistory }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Your Recent Images</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {history.map((item, index) => (
          <div 
            key={index}
            className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer text-card-foreground"
            onClick={() => onSelectHistory(item)}
          >
            {item.multipleImageUrls ? (
              <div className="grid grid-cols-2 gap-1 h-48">
                {item.multipleImageUrls.slice(0, 4).map((url, imgIndex) => (
                  <div key={imgIndex} className="overflow-hidden">
                    <img 
                      src={url} 
                      alt={`Story part ${imgIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={`History item ${index}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{item.prompt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageHistory;
