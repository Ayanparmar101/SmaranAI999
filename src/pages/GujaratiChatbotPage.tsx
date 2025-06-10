import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import ChatContainer from '../components/chat/ChatContainer';
import { openaiService } from '@/services/openai';
import ApiKeyInput from '@/components/ApiKeyInput';
import { useOpenAIKey } from '@/hooks/useOpenAIKey';
import NeoBackButton from '@/components/NeoBackButton';

const GujaratiChatbotPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Automatically load the API key from local storage when the component mounts
  useOpenAIKey();

  const handleReturn = () => {
    navigate('/gujarati');
  };

  const handleProcessing = async (message: string, imageUrl?: string): Promise<string> => {
    // Add API key check before processing
    const apiKey = await openaiService.getApiKey();
    if (!apiKey) {
      return JSON.stringify({
        response: "ભૂલ: કૃપા કરીને પહેલા તમારી OpenAI API કી દાખલ કરો। (Error: Please enter your OpenAI API key first.)"
      });
    }

    try {
      console.log("Processing Gujarati message:", message, "Image URL:", imageUrl);

      const systemPrompt = `You are a helpful Gujarati chatbot and language tutor. You are an expert in Gujarati language, literature, grammar, and culture.

Your role is to:
- Help students learn Gujarati language and grammar
- Explain Gujarati literature and poetry concepts
- Assist with Gujarati homework and writing
- Teach Gujarati vocabulary and pronunciation
- Discuss Gujarati culture and traditions
- Help with Gujarati comprehension and composition
- Provide translations between Gujarati and other languages
- Support students learning Gujarati as a second language

Always respond in Gujarati script. If the user sends a message in English, translate it to Gujarati and then respond in Gujarati. Be polite, helpful, engaging, patient, and encouraging. Make Gujarati learning fun and accessible.

IMPORTANT: Your response MUST be a JSON object with a single key 'response' containing the Gujarati text. Example: {"response": "નમસ્તે! હું તમારી ગુજરાતી શીખવામાં મદદ કરીશ।"}`;

      let userPrompt = message;
      if (imageUrl) {
        userPrompt += `

User has uploaded an image. Please analyze the image and provide Gujarati-related insights, translations, or cultural context based on what you see.`;
      }

      const response = await openaiService.createCompletion(systemPrompt, userPrompt);
      console.log("Received AI response for Gujarati:", response);

      return response.trim();
    } catch (error) {
      console.error("Error processing Gujarati message:", error);
      return JSON.stringify({
        response: "માફ કરશો, પ્રતિક્રિયા આપવામાં ભૂલ થઈ છે. કૃપા કરીને ફરી પ્રયાસ કરો. (Sorry, there was an error processing your request. Please try again.)"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <NeoBackButton 
        label="ગુજરાતી પૃષ્ઠ પર પાછા જાઓ (Back to Gujarati)" 
        color="green" 
        onClick={handleReturn}
      />

      <div className="flex items-center mb-8">
        <div className="bg-kid-green p-3 rounded-full mr-4">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          <span className="gradient-text-animated">
            ગુજરાતી ચેટબોટ (Gujarati Chatbot)
          </span>
        </h1>
      </div>

      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-4">
          ગુજરાતી ભાષા શીખવા અને સમજવા માટે હું તમારી સહાય કરીશ। તમે મને ગુજરાતી વ્યાકરણ, સાહિત્ય, શબ્દભંડોળ, 
          અથવા કોઈપણ ગુજરાતી સંબંધિત પ્રશ્નો વિશે પૂછી શકો છો।
          <br />
          <span className="text-sm text-gray-600 italic">
            (I will help you learn and understand the Gujarati language. You can ask me about Gujarati grammar, literature, vocabulary, or any Gujarati-related questions.)
          </span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-kid-green/10 p-4 rounded-lg border-2 border-kid-green/30">
            <h3 className="font-bold mb-2">ઉદાહરણ પ્રશ્નો (Example Questions):</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>ગુજરાતી વ્યાકરણના નિયમો શું છે? (What are the rules of Gujarati grammar?)</li>
              <li>આ શબ્દનો અર્થ શું છે? (What does this word mean?)</li>
              <li>ગુજરાતીમાં નિબંધ કેવી રીતે લખવો? (How to write an essay in Gujarati?)</li>
              <li>ગુજરાતી કાવ્યના છંદો શું છે? (What are the meters in Gujarati poetry?)</li>
              <li>ગુજરાતી લિપિ કેવી રીતે શીખવી? (How to learn Gujarati script?)</li>
            </ul>
          </div>
          
          <div className="bg-kid-blue/10 p-4 rounded-lg border-2 border-kid-blue/30">
            <h3 className="font-bold mb-2">ગુજરાતી ભાષા સહાય (Gujarati Language Support):</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>શુદ્ધ ઉચ્ચાર શીખવવું (Teaching correct pronunciation)</li>
              <li>વ્યાકરણની સમજ (Grammar understanding)</li>
              <li>સાહિત્ય વિશ્લેષણ (Literature analysis)</li>
              <li>શબ્દભંડોળ વૃદ્ધિ (Vocabulary building)</li>
              <li>અનુવાદ સહાય (Translation assistance)</li>
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
        title="ગુજરાતી ચેટબોટ સાથે વાત કરો (Chat with Gujarati Bot)"
        storageKey="gujarati-chatbot"
        processingFunction={handleProcessing}
        parseJsonResponse={true}
        useFirebase={true}
        chatType="gujarati-chatbot"
      />
    </div>
  );
};

export default GujaratiChatbotPage;
