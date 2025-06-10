import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Atom } from 'lucide-react';
import ChatContainer from '../components/chat/ChatContainer';
import { openaiService } from '@/services/openai';
import ApiKeyInput from '@/components/ApiKeyInput';
import { useOpenAIKey } from '@/hooks/useOpenAIKey';
import NeoBackButton from '@/components/NeoBackButton';

const ScienceChatbotPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Automatically load the API key from local storage when the component mounts
  useOpenAIKey();

  const handleReturn = () => {
    navigate('/science');
  };

  const handleProcessing = async (message: string, imageUrl?: string): Promise<string> => {
    // Add API key check before processing
    const apiKey = openaiService.getApiKey();
    if (!apiKey) {
      // Returning a specific error format might be better handled by the component
      // but for now, returning a user-facing message in the expected format.
      return JSON.stringify({ response: "Error: Please enter your OpenAI API key first." });
    }

    try {
      console.log("Processing Science message:", message, "Image URL:", imageUrl);      const systemPrompt = `You are a helpful Science chatbot and tutor. You are an expert in all areas of science including Physics, Chemistry, Biology, Earth Science, and Environmental Science. 

Your role is to:
- Explain scientific concepts clearly and engagingly
- Help students with science homework and questions
- Provide step-by-step explanations for scientific problems
- Use simple language appropriate for students
- Encourage scientific thinking and curiosity
- Provide examples and real-world applications
- Help with science experiments and lab work
- Explain scientific phenomena
- Guide students through the scientific method
- Support lab experiments and observations
- Foster scientific exploration and discovery

Always be encouraging, patient, and supportive. Make science fun and accessible. Encourage hands-on learning and experimentation. If you don't know something, admit it and suggest how to find the answer.

IMPORTANT: Your response MUST be a JSON object with a single key 'response' containing your helpful science explanation. Example: {"response": "Great question! Let me explain photosynthesis..."}`;

      let userPrompt = message;
      if (imageUrl) {
        userPrompt += `

User has uploaded an image. Please analyze the image and provide science-related insights or explanations based on what you see.`;
      }

      const response = await openaiService.createCompletion(systemPrompt, userPrompt);
      console.log("Received AI response:", response);

      return response.trim();

    } catch (error) {
      console.error("Error processing message:", error);
      return JSON.stringify({ response: "Sorry, there was an error processing your science question. Please try again." });
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <NeoBackButton 
        label="Back to Science" 
        color="blue" 
        onClick={handleReturn}
      />      <div className="flex items-center mb-8">
        <div className="bg-kid-blue p-3 rounded-full mr-4">
          <Atom className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          <span className="bg-gradient-to-r from-kid-blue to-blue-600 bg-clip-text text-transparent">
            Science Chatbot
          </span>
        </h1>
      </div>

      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-4">
          I'm your Science tutor, ready to help you explore the fascinating world of science! Ask me about physics, 
          chemistry, biology, earth science, or any scientific concepts you're curious about.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-kid-blue/10 p-4 rounded-lg border-2 border-kid-blue/30">
            <h3 className="font-bold mb-2">Example Questions:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>How does photosynthesis work?</li>
              <li>What are the states of matter?</li>
              <li>Can you explain Newton's laws of motion?</li>
              <li>How do chemical reactions occur?</li>
              <li>What causes earthquakes?</li>
              <li>How do plants grow and reproduce?</li>
            </ul>
          </div>
          
          <div className="bg-kid-green/10 p-4 rounded-lg border-2 border-kid-green/30">
            <h3 className="font-bold mb-2">Science Explorer Features:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>🧪 Lab Experiments guidance</li>
              <li>🔬 Physics Labs support</li>
              <li>🌱 Biology concepts explanation</li>
              <li>⚗️ Chemistry problem solving</li>
              <li>🌍 Earth Science exploration</li>
              <li>🔬 Scientific method guidance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* API Key Input */}
      <div className="mb-6">
        <ApiKeyInput onApiKeySubmit={(key) => openaiService.setApiKey(key)} />
      </div>
        {/* Chat Container */}
      <ChatContainer
        title="Chat with Science Bot"
        storageKey="science-chatbot"
        processingFunction={handleProcessing}
        parseJsonResponse={true}
        useFirebase={true}
        chatType="science-chatbot"
      />
    </div>
  );
};

export default ScienceChatbotPage;
