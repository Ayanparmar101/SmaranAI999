import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, HelpCircle, RefreshCw, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import DoodleButton from '@/components/DoodleButton';
import ApiKeyInput from '@/components/ApiKeyInput';
import TTSButton from '@/components/TTSButton';
import openaiService from '@/services/openaiService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import DoodleDecoration from '@/components/DoodleDecoration';
import { useAuth } from '@/contexts/AuthContext';
import { saveMessage } from '@/utils/messageUtils';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { Progress } from '@/components/ui/progress';


const SocraticTutorPage = () => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Voice recognition state and handlers
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const handleTranscriptChange = useCallback((transcript: string) => {
    setVoiceTranscript(transcript);
    setQuestion(transcript); // Update the question field with live transcript
  }, []);

  const handleSpeechEnd = useCallback((finalTranscript: string) => {
    console.log('Speech ended with transcript:', finalTranscript);
    setVoiceTranscript('');
    setQuestion(finalTranscript);
  }, []);

  const { isListening, startListening, stopListening } = useVoiceRecognition({
    onTranscriptChange: handleTranscriptChange,
    onSpeechEnd: handleSpeechEnd
  });

  // Check for API key on component mount and when environment changes
  useEffect(() => {
    const checkApiKey = async () => {
      const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const serviceApiKey = await openaiService.getApiKey();
      const hasApiKey = !!(envApiKey || serviceApiKey);

      setIsApiKeySet(hasApiKey);
    };

    checkApiKey();

    // Check again after a short delay to ensure initialization is complete
    const timer = setTimeout(checkApiKey, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const scrollToBottom = () => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleApiKeyChange = async (key: string) => {
    try {
      await openaiService.setApiKey(key);
      setIsApiKeySet(!!key);
      toast.success('API key saved');
    } catch (error) {
      console.error('Failed to set API key:', error);
      toast.error('Failed to save API key');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (!isApiKeySet) {
      toast.error('Please set your OpenAI API key first');
      return;
    }

    const newUserMessage = { role: 'user' as const, content: question.trim() };
    setConversation(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const systemPrompt = `
        You are a Socratic tutor for English language students in grades 1-8. 
        Your goal is to help students learn by guiding them to discover answers themselves.
        
        Guidelines:
        1. NEVER give direct answers to questions. Instead, ask follow-up questions that lead students to discover insights.
        2. Use age-appropriate language based on the complexity of their questions.
        3. Break complex topics into smaller, manageable questions.
        4. Praise effort and good thinking.
        5. If they're stuck, provide small hints but still let them figure out the main point.
        6. Relate concepts to examples they would understand.
        7. Keep your responses concise and engaging.
        8. Use friendly, encouraging language.
        
        Remember: The goal is to develop their critical thinking skills while teaching English.
      `;

      const response = await openaiService.createCompletion(
        systemPrompt,
        question,
        { temperature: 0.7 }
      );

      setConversation(prev => [...prev, { role: 'assistant', content: response }]);
      
      if (user) {
        await saveMessage({
          text: question,
          userId: user.uid,
          aiResponse: response,
          chatType: 'socratic-tutor'
        });
      }
      
      setQuestion('');
    } catch (error) {
      console.error('Error getting response:', error);
      toast.error('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleVoiceSubmit = async () => {
    if (!voiceTranscript.trim()) return;

    const newUserMessage = { role: 'user' as const, content: voiceTranscript.trim() };
    setConversation(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setVoiceTranscript('');

    try {
      const systemPrompt = `
        You are a Socratic tutor for English language students in grades 1-8. 
        Your goal is to help students learn by guiding them to discover answers themselves.
        
        Guidelines:
        1. NEVER give direct answers to questions. Instead, ask follow-up questions that lead students to discover insights.
        2. Use age-appropriate language based on the complexity of their questions.
        3. Break complex topics into smaller, manageable questions.
        4. Praise effort and good thinking.
        5. If they're stuck, provide small hints but still let them figure out the main point.
        6. Relate concepts to examples they would understand.
        7. Keep your responses concise and engaging.
        8. Use friendly, encouraging language.
        
        Remember: The goal is to develop their critical thinking skills while teaching English.
      `;

      const response = await openaiService.createCompletion(
        systemPrompt,
        voiceTranscript,
        { temperature: 0.7 }
      );

      setConversation(prev => [...prev, { role: 'assistant', content: response }]);
      
      if (user) {
        await saveMessage({
          text: voiceTranscript,
          userId: user.uid,
          aiResponse: response,
          chatType: 'socratic-tutor'
        });
      }
      
      setVoiceTranscript('');
    } catch (error) {
      console.error('Error getting response:', error);
      toast.error('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          <div className="md:w-3/5">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Socratic Tutor
              </h1>
              <TTSButton 
                text="Welcome to the Socratic Tutor! Ask questions about English grammar, vocabulary, or writing by typing or using the microphone button, and I'll guide you to discover the answers yourself through thoughtful questions."
                className="ml-2"
              />
            </div>
            <p className="text-muted-foreground mb-4">
              Ask questions about English grammar, vocabulary, or writing by typing or using the microphone button. 
              Instead of giving you direct answers, the tutor will guide you to discover the answers yourself through thoughtful questions.
            </p>
          </div>
          <div className="md:w-2/5 bg-card/40 p-4 rounded-xl border border-kid-purple/20">
            <div className="flex items-start gap-2">
              <HelpCircle className="text-kid-purple mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-kid-purple">How it works:</h3>
                <p className="text-sm text-muted-foreground">
                  The Socratic method helps you learn by guiding you to find answers through questions rather than just telling you the answer directly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {!isApiKeySet && !import.meta.env.VITE_OPENAI_API_KEY && (
          <div className="mb-8 p-4 bg-yellow-950/20 border border-yellow-800/30 rounded-xl">
            <h3 className="font-bold text-yellow-400 mb-2">OpenAI API Key Required</h3>
            <p className="text-sm text-yellow-400/80 mb-4">
              To use the Socratic Tutor, you need to provide your OpenAI API key. This key remains in your browser and is never sent to our servers.
            </p>
            <ApiKeyInput onApiKeySubmit={handleApiKeyChange} />
          </div>
        )}

        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden mb-6 text-card-foreground">
          <ScrollArea className="h-[400px] p-4">
            {conversation.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <DoodleDecoration type="circle" color="purple" size="lg" className="mb-4 opacity-50" />
                <h3 className="text-xl font-medium text-muted-foreground mb-2">Your Socratic learning journey begins here</h3>
                <p className="text-muted-foreground max-w-md">
                  Ask any English-related question, and the tutor will guide you toward the answer through thoughtful questions.
                </p>
              </div>
            ) : (              <div className="space-y-4">
                {conversation.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div 
                        className={`p-3 rounded-xl ${
                          message.role === 'user'
                            ? 'bg-kid-blue text-white rounded-tr-none' 
                            : 'bg-muted text-foreground rounded-tl-none'
                        }`}
                      >
                        {message.content.split('\n').map((text, i) => (
                          <p key={i} className={i > 0 ? 'mt-2' : ''}>
                            {text}
                          </p>
                        ))}
                      </div>
                      <TTSButton 
                        text={message.content}
                        className={`mt-2 ${message.role === 'user' ? 'mr-1' : 'ml-1'}`}
                      />
                    </div>
                  </div>
                ))}
                <div ref={conversationEndRef} />
              </div>
            )}
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-4 border-t border-border">
            {/* Voice Recording Indicator */}
            {isListening && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-700">Recording...</span>
                </div>
                <Progress value={100} className="h-1 bg-red-200" />
                {voiceTranscript && (
                  <p className="text-sm text-red-600 mt-2 italic">
                    "{voiceTranscript}"
                  </p>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about English... or use the microphone to speak"
                  className="flex-1 min-h-12 bg-muted text-foreground pr-12"
                  disabled={isLoading || !isApiKeySet}
                />
                <DoodleButton
                  type="button"
                  color={isListening ? "red" : "purple"}
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 p-0"
                  onClick={toggleListening}
                  disabled={isLoading || !isApiKeySet}
                  icon={isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  aria-label={isListening ? "Stop recording" : "Start recording"}
                >
                  <span className="sr-only">{isListening ? "Stop" : "Mic"}</span>
                </DoodleButton>
              </div>
              <DoodleButton
                type="submit"
                color="purple"
                disabled={isLoading || !question.trim() || !isApiKeySet}
                loading={isLoading}
                icon={isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              >
                {isLoading ? "Thinking..." : "Ask"}
              </DoodleButton>
            </div>
          </form>
        </div>

        <div className="bg-muted p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-foreground">Example questions to ask:</h3>
            <TTSButton 
              text="Here are some example questions you can ask: What's the difference between their, there, and they're? How do I use past tense verbs correctly? Why do we use punctuation marks? How can I make my writing more interesting? What's the difference between adjectives and adverbs?"
            />
          </div>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center justify-between">
              <span>• What's the difference between "their", "there", and "they're"?</span>
              <TTSButton 
                text="What's the difference between their, there, and they're?"
                className="ml-2"
              />
            </li>
            <li className="flex items-center justify-between">
              <span>• How do I use past tense verbs correctly?</span>
              <TTSButton 
                text="How do I use past tense verbs correctly?"
                className="ml-2"
              />
            </li>
            <li className="flex items-center justify-between">
              <span>• Why do we use punctuation marks?</span>
              <TTSButton 
                text="Why do we use punctuation marks?"
                className="ml-2"
              />
            </li>
            <li className="flex items-center justify-between">
              <span>• How can I make my writing more interesting?</span>
              <TTSButton 
                text="How can I make my writing more interesting?"
                className="ml-2"
              />
            </li>
            <li className="flex items-center justify-between">
              <span>• What's the difference between adjectives and adverbs?</span>
              <TTSButton 
                text="What's the difference between adjectives and adverbs?"
                className="ml-2"
              />
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
};

export default SocraticTutorPage;
