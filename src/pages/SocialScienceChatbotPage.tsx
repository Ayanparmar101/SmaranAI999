import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { toast } from 'sonner';
import ChatContainer from '../components/chat/ChatContainer';
import { openaiService } from '@/services/openai';
import ApiKeyInput from '@/components/ApiKeyInput';
import { useOpenAIKey } from '@/hooks/useOpenAIKey';
import NeoBackButton from '@/components/NeoBackButton';

const SocialScienceChatbotPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Automatically load the API key from local storage when the component mounts
  useOpenAIKey();

  const handleReturn = () => {
    navigate('/social-science');
  };

  const handleProcessing = async (message: string, imageUrl?: string): Promise<string> => {
    // Add API key check before processing
    const apiKey = await openaiService.getApiKey();
    if (!apiKey) {
      // Returning a specific error format might be better handled by the component
      // but for now, returning a user-facing message in the expected format.
      return JSON.stringify({ response: "Error: Please enter your OpenAI API key first." });
    }

    try {
      console.log("Processing Social Science message:", message, "Image URL:", imageUrl);      const systemPrompt = `You are a helpful Social Science chatbot and tutor. You are an expert in all areas of social science including History, Geography, Civics, Political Science, Economics, Sociology, and Anthropology.

Your role is to:
- Explain historical events and their significance
- Help students understand geographical concepts and world knowledge
- Explain government systems, citizenship, and civic responsibilities
- Discuss economic principles and concepts
- Explore cultural and social phenomena
- Provide step-by-step explanations for social science problems
- Use simple language appropriate for students
- Encourage critical thinking about society and history
- Provide examples and real-world connections
- Help with social science homework and projects
- Guide through Geography exploration and map skills
- Support History timeline understanding
- Foster civic awareness and responsibility

Always be encouraging, patient, and supportive. Make social science engaging and relevant to students' lives. Present multiple perspectives when discussing complex issues. Encourage curiosity about the world and society. If you don't know something, admit it and suggest how to find reliable sources.

IMPORTANT: Your response MUST be a JSON object with a single key 'response' containing your helpful social science explanation. Example: {"response": "That's an excellent question about democracy! Let me explain..."}`;

      let userPrompt = message;
      if (imageUrl) {
        userPrompt += `

User has uploaded an image. Please analyze the image and provide social science-related insights, historical context, or geographical information based on what you see.`;
      }

      const response = await openaiService.createCompletion(systemPrompt, userPrompt);
      console.log("Received AI response:", response);

      return response.trim();

    } catch (error) {
      console.error("Error processing message:", error);
      return JSON.stringify({ response: "Sorry, there was an error processing your social science question. Please try again." });
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <NeoBackButton 
        label="Back to Social Science" 
        color="purple" 
        onClick={handleReturn}
      />

      <div className="flex items-center mb-8">
        <div className="bg-kid-purple p-3 rounded-full mr-4">
          <Globe className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          <span className="bg-gradient-to-r from-kid-purple to-purple-600 bg-clip-text text-transparent">
            Social Science Chatbot
          </span>
        </h1>
      </div>

      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-4">
          I'm your Social Science tutor, here to help you understand history, geography, civics, and the world around us! 
          Ask me about historical events, countries, governments, cultures, and how society works.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-kid-purple/10 p-4 rounded-lg border-2 border-kid-purple/30">
            <h3 className="font-bold mb-2">Example Questions:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>What caused World War II?</li>
              <li>How does democracy work?</li>
              <li>Where is the Amazon rainforest located?</li>
              <li>What are human rights?</li>
              <li>How do elections work in different countries?</li>
              <li>What are the seven continents?</li>
            </ul>
          </div>
          
          <div className="bg-kid-orange/10 p-4 rounded-lg border-2 border-kid-orange/30">
            <h3 className="font-bold mb-2">Learning Centers:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>🌍 Geography Explorer</li>
              <li>📚 History Timeline</li>
              <li>🏛️ Civics Center</li>
              <li>💰 Economics Basics</li>
              <li>🌐 Cultural Studies</li>
              <li>🗺️ Map Skills & World Knowledge</li>
            </ul>
          </div>
        </div>
      </div>

      {/* API Key Input - Only show if no environment variable */}
      {!import.meta.env.VITE_OPENAI_API_KEY && (
        <div className="mb-6">
          <ApiKeyInput onApiKeySubmit={async (key) => {
            try {
              await openaiService.setApiKey(key);
            } catch (error) {
              console.error('[SocialScienceChatbotPage] Failed to set API key:', error);
              toast.error('Invalid API key format');
            }
          }} />
        </div>
      )}
        {/* Chat Container */}
      <ChatContainer
        title="Chat with Social Science Bot"
        storageKey="social-science-chatbot"
        processingFunction={handleProcessing}
        parseJsonResponse={true} 
        useFirebase={true}
        chatType="social-science-chatbot"
      />
    </div>
  );
};

export default SocialScienceChatbotPage;
