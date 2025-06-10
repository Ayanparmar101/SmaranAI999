
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

interface ChatMessagesProps {
  messages: Message[];
  onPlayAudio: (url: string) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, onPlayAudio }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      // Scroll to bottom when messages change
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="mx-auto bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" x2="12" y1="19" y2="22"></line>
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Start a conversation</h3>
          <p className="text-muted-foreground mt-2">
            Press the "Start Speaking" button to begin talking with the voice assistant
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
      <div className="space-y-4 pt-2 pb-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`relative max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs opacity-70">
                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                </span>
                {message.role === 'assistant' && message.audioUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={() => onPlayAudio(message.audioUrl!)}
                  >
                    <Volume2 className="h-3 w-3" />
                    <span className="sr-only">Play audio</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
