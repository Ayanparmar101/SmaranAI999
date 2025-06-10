import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import ChatContainer from '../components/chat/ChatContainer';
import { openaiService } from '@/services/openai';
import ApiKeyInput from '@/components/ApiKeyInput';
import { useOpenAIKey } from '@/hooks/useOpenAIKey';
import NeoBackButton from '@/components/NeoBackButton';

const HindiChatbotPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Automatically load the API key from local storage when the component mounts
  useOpenAIKey();

  const handleReturn = () => {
    navigate('/hindi');
  };

  const handleProcessing = async (message: string, imageUrl?: string): Promise<string> => {
    // Add API key check before processing
    const apiKey = openaiService.getApiKey();
    if (!apiKey) {
      return JSON.stringify({ response: "त्रुटि: कृपया पहले अपना OpenAI API कुंजी दर्ज करें। (Error: Please enter your OpenAI API key first.)" });
    }

    try {
      console.log("Processing message:", message, "Image URL:", imageUrl);

      const systemPrompt = `You are a helpful Hindi chatbot and language tutor. You are an expert in Hindi language, literature, grammar, and culture.

Your role is to:
- Help students learn Hindi language and grammar
- Explain Hindi literature and poetry concepts
- Assist with Hindi homework and writing
- Teach Hindi vocabulary and pronunciation
- Discuss Indian culture and traditions in Hindi
- Help with Hindi comprehension and composition
- Provide translations between Hindi and other languages
- Support students learning Hindi as a second language

Always respond in Hindi script (Devanagari). If the user sends a message in English, translate it to Hindi and then respond in Hindi. Be polite, helpful, engaging, patient, and encouraging. Make Hindi learning fun and accessible.

IMPORTANT: Your response MUST be a JSON object with a single key 'response' containing the Hindi text. Example: {"response": "नमस्ते! मैं आपकी हिंदी सीखने में सहायता करूंगा।"}`;

      let userPrompt = message;
      if (imageUrl) {
        userPrompt += `

User has uploaded an image. Please analyze the image and provide Hindi-related insights, translations, or cultural context based on what you see.`;
      }

      const response = await openaiService.createCompletion(systemPrompt, userPrompt);
      console.log("Received AI response:", response);

      return response.trim();

    } catch (error) {
      console.error("Error processing message:", error);
      return JSON.stringify({ response: "क्षमा करें, प्रतिक्रिया देने में त्रुटि हुई है। कृपया पुनः प्रयास करें। (Sorry, there was an error processing your request. Please try again.)" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <NeoBackButton 
        label="हिंदी पेज पर वापस जाएं (Back to Hindi)" 
        color="orange" 
        onClick={handleReturn}
      />

      <div className="flex items-center mb-8">
        <div className="bg-kid-orange p-3 rounded-full mr-4">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          <span className="gradient-text-animated">
            हिंदी चैटबॉट (Hindi Chatbot)
          </span>
        </h1>
      </div>

      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-4">
          हिंदी भाषा सीखने और समझने के लिए मैं आपकी सहायता करूंगा। आप मुझसे हिंदी व्याकरण, साहित्य, शब्दावली, 
          या किसी भी हिंदी संबंधित प्रश्न के बारे में पूछ सकते हैं।
          <br />
          <span className="text-sm text-gray-600 italic">
            (I will help you learn and understand the Hindi language. You can ask me about Hindi grammar, literature, vocabulary, or any Hindi-related questions.)
          </span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-kid-orange/10 p-4 rounded-lg border-2 border-kid-orange/30">
            <h3 className="font-bold mb-2">उदाहरण प्रश्न (Example Questions):</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>हिंदी व्याकरण के नियम क्या हैं? (What are the rules of Hindi grammar?)</li>
              <li>इस शब्द का अर्थ क्या है? (What does this word mean?)</li>
              <li>हिंदी में निबंध कैसे लिखें? (How to write an essay in Hindi?)</li>
              <li>हिंदी कविता के छंद क्या हैं? (What are the meters in Hindi poetry?)</li>
              <li>देवनागरी लिपि कैसे सीखें? (How to learn Devanagari script?)</li>
            </ul>
          </div>
          
          <div className="bg-kid-purple/10 p-4 rounded-lg border-2 border-kid-purple/30">
            <h3 className="font-bold mb-2">हिंदी भाषा सहायता (Hindi Language Support):</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>शुद्ध उच्चारण सिखाना (Teaching correct pronunciation)</li>
              <li>व्याकरण की समझ (Grammar understanding)</li>
              <li>साहित्य विश्लेषण (Literature analysis)</li>
              <li>शब्द भंडार वृद्धि (Vocabulary building)</li>
              <li>अनुवाद सहायता (Translation assistance)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* API Key Input - Only show if no environment variable */}
      {!import.meta.env.VITE_OPENAI_API_KEY && (
        <div className="mb-6">
          <ApiKeyInput onApiKeySubmit={(key) => openaiService.setApiKey(key)} />
        </div>
      )}
      
      {/* Chat Container */}
      <ChatContainer
        title="हिंदी चैटबॉट से बात करें (Chat with Hindi Bot)"
        storageKey="hindi-chatbot"
        processingFunction={handleProcessing}
        parseJsonResponse={true}
        useFirebase={true}
        chatType="hindi-chatbot"
      />
    </div>
  );
};

export default HindiChatbotPage;
