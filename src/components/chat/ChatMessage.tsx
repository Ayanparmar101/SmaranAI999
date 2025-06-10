
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Message } from '@/types';


interface ChatMessageProps {
  message: Message;
  parseJsonResponse?: boolean; // Prop to control parsing
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, parseJsonResponse }) => {
  console.log(`ChatMessage Rendering - ID: ${message.id}, Role: ${message.role}, ParseJSON: ${parseJsonResponse}`);
  console.log(`ChatMessage Content Type: ${typeof message.content}`, message.content);

  const isUser = message.role === 'user';
  const avatarLetter = isUser ? 'U' : 'A';
  
  const formatTimestamp = (timestamp: Date | string | number | undefined) => {
    try {
      if (!timestamp) return '';
      let date: Date;
      if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return '';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });
    } catch (error) {
      console.error("Error formatting timestamp:", error, "Input:", timestamp);
    }
    return '';
  };

  // Function to parse JSON and extract the 'response' key's value
  const getDisplayText = () => {
    console.log(`ChatMessage getDisplayText - Entering function for ID: ${message.id}`);
    if (!isUser && parseJsonResponse && typeof message.content === 'string') {
      console.log(`ChatMessage getDisplayText - Attempting JSON parse for ID: ${message.id}`);
      try {
        const parsed = JSON.parse(message.content);
        console.log(`ChatMessage getDisplayText - JSON Parsed successfully for ID: ${message.id}`, parsed);

        // ***MODIFIED LOGIC: Specifically look for 'response' key***
        if (parsed && typeof parsed === 'object' && parsed.response && typeof parsed.response === 'string') {
          console.log(`ChatMessage getDisplayText - Returning parsed.response for ID: ${message.id}`, parsed.response);
          return parsed.response; // Return the value of the 'response' key
        } else {
          console.warn(`ChatMessage getDisplayText - Parsed JSON missing 'response' key or it's not a string for ID: ${message.id}`, parsed);
        }
      } catch (e) {
        console.warn(`ChatMessage getDisplayText - Could not parse AI message content as JSON for ID: ${message.id}`, message.content, e);
      }
    } else {
      console.log(`ChatMessage getDisplayText - Not parsing JSON (isUser: ${isUser}, parseJsonResponse: ${parseJsonResponse}, isString: ${typeof message.content === 'string'}) for ID: ${message.id}`);
    }
    // Default: return the original content if not parsing, parse failed, or 'response' key not found
    console.log(`ChatMessage getDisplayText - Returning original content for ID: ${message.id}`);
    return message.content;
  };

  const displayText = getDisplayText();

  return (
    <div
      className={cn(
        'flex w-full gap-2 p-2',
        isUser ? 'justify-end pl-10' : 'justify-start pr-10',
      )}
    >
      {!isUser && (
        <Avatar className='self-end'>
          <AvatarFallback>{avatarLetter}</AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={cn(
          'flex flex-col max-w-[75%] rounded-lg p-3',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
        )}
      >
        {message.imageUrl && (
          <div className="mb-2">
            <img 
              src={message.imageUrl} 
              alt="User uploaded image" 
              className="max-w-full rounded-md max-h-64 object-contain"
            />
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          {/* Message text */}
          <p className={cn(
               "whitespace-pre-wrap break-words text-sm flex-1", // Use standard text styles
               !isUser && parseJsonResponse ? "text-base md:text-lg" : "" // Keep potential size adjustment
             )}>
            {displayText}
          </p>
        </div>
        <div className="text-xs opacity-70 text-right mt-1">
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
      
      {isUser && (
        <Avatar className='self-end'>
          <AvatarFallback>{avatarLetter}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
