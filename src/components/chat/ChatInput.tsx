
import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { SendIcon, RefreshCcw, ImageIcon } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, image?: File) => void;
  onClearChat: () => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  onClearChat,
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || image) {
      onSendMessage(message.trim(), image || undefined);
      setMessage('');
      setImage(null);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative w-full">
        {image && (
          <div className="mb-2 p-2 border rounded-md bg-muted flex items-center justify-between">
            <span className="text-sm truncate max-w-[80%]">{image.name}</span>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => setImage(null)}
              className="h-7 px-2"
            >
              Remove
            </Button>
          </div>
        )}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={6}
          className="w-full resize-none pr-24"
          disabled={disabled}
        />
        <div className="absolute right-2 bottom-2 flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
            disabled={disabled}
          />
          <Button 
            type="button"
            size="icon"
            variant="outline"
            onClick={triggerFileInput}
            disabled={disabled}
            title="Upload image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button 
            size="icon"
            type="submit"
            disabled={(!message.trim() && !image) || disabled}
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between mt-2">
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearChat}
          disabled={disabled}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Clear Chat
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
