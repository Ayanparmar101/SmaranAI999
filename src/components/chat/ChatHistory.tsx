
import React, { useEffect, useRef } from 'react';
import { Message } from '../../types';
import ChatMessage from './ChatMessage';
import { ScrollArea } from '../ui/scroll-area';

interface ChatHistoryProps {
  messages: Message[];
  parseJsonResponse?: boolean; // Add the prop here
  enableTTS?: boolean; // New prop to enable TTS functionality
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, parseJsonResponse, enableTTS = false }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      setTimeout(() => {
        scrollElement.scrollTop = scrollElement.scrollHeight;
        console.log("Scrolling to bottom, messages length:", messages.length);
      }, 100);
    }
  }, [messages]);
  
  useEffect(() => {
    console.log("ChatHistory rendering messages:", messages);
  }, [messages]);
  
  return (
    <ScrollArea className="h-[60vh] pr-4" ref={scrollRef}>
      <div className="flex flex-col gap-4 py-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            કોઈ સંદેશ નથી, વાતચીત શરૂ કરો! (No messages yet. Start a conversation!)
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage 
              key={`${message.id || index}-${index}`} 
              message={message} 
              parseJsonResponse={parseJsonResponse} // Pass the prop down
              enableTTS={enableTTS} // Pass TTS prop down
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatHistory;
