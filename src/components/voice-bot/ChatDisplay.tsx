
import React, { useRef } from 'react';

interface MessageProps {
  role: "user" | "bot";
  text: string;
}

interface ChatDisplayProps {
  messages: MessageProps[];
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="w-24 h-24 bg-kid-purple/10 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-kid-purple">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" x2="12" y1="19" y2="22"></line>
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Start a Conversation!</h3>
        <p className="text-muted-foreground max-w-md">
          Click the "Start Recording" button and speak, or type a message below to chat with the voice bot.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex ${
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
              msg.role === 'user'
                ? 'bg-kid-purple text-white rounded-tr-none'
                : 'bg-muted text-foreground rounded-tl-none'
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatDisplay;
